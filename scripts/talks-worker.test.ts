import assert from "node:assert/strict";
import test from "node:test";
import { PUBLIC_SECRET_CAPABILITY_HEADER } from "@workos/alto";
import { talksWorker, toCsv, type TalksEnv } from "../src/talks-worker.js";

const settings = { basePath: "/beyond-done", enabled: true, systemPrompt: "SYSTEM_PROMPT_SENTINEL" };
const site = "https://talks.workos.cloud";

function fixture(openRouter: () => Response = () => Response.json({ choices: [{ message: { content: "Use observe()." } }] })) {
  const inserted: unknown[][] = [];
  const pending: Promise<unknown>[] = [];
  const calls: string[] = [];
  let queried = false;
  const db = {
    prepare: () => ({
      bind: (...values: unknown[]) => ({ run: async () => { inserted.push(values); } }),
      all: async () => { queried = true; return { results: [] }; },
    }),
  } as unknown as D1Database;
  // Platform configuration Alto injects; a placeholder key set avoids a JWKS fetch.
  const env = { DB: db, WORKOS_APP_ID: "app_test", ALTO_API_URL: "https://alto.test", WORKOS_JWKS: '{"keys":[{"kty":"oct"}]}' } as TalksEnv;
  const ctx = { waitUntil: (promise: Promise<unknown>) => { pending.push(promise); }, passThroughOnException() {} } as unknown as ExecutionContext;
  const original = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    calls.push(url);
    if (url === "https://alto.test/v1/runtime/secrets/OPENROUTER_API_KEY") {
      assert.equal(new Headers(init?.headers).get("x-alto-identity"), "capability");
      return Response.json({ value: "test-key" });
    }
    if (url === "https://openrouter.ai/api/v1/chat/completions") {
      assert.match(String(init?.body), /SYSTEM_PROMPT_SENTINEL/);
      return openRouter();
    }
    throw new Error(`Unexpected fetch: ${url}`);
  }) as typeof fetch;
  const worker = talksWorker(settings);
  return {
    inserted, calls, queried: () => queried,
    fetch: (path: string, init: RequestInit = {}) => worker.fetch!(new Request(`${site}${path}`, init) as Request<unknown, IncomingRequestCfProperties>, env, ctx),
    settle: () => Promise.all(pending),
    restore: () => { globalThis.fetch = original; },
  };
}

const asked = (question: string) => ({
  method: "POST",
  headers: { "Content-Type": "application/json", [PUBLIC_SECRET_CAPABILITY_HEADER]: "capability" },
  body: JSON.stringify({ messages: [{ role: "user", content: "Hi" }, { role: "assistant", content: "Hello." }, { role: "user", content: question }] }),
});

test("chat status needs the feature and a readable key", async () => {
  const f = fixture();
  try {
    const status = async (headers: HeadersInit = {}) => (await (await f.fetch("/beyond-done/api/chat/status", { headers })).json());
    assert.deepEqual(await status({ [PUBLIC_SECRET_CAPABILITY_HEADER]: "capability" }), { enabled: true });
    assert.deepEqual(await status(), { enabled: false }, "no capability outside a public route");
    const disabled = talksWorker({ ...settings, enabled: false });
    const response = await disabled.fetch!(new Request(`${site}/beyond-done/api/chat`, asked("Hi")) as Request<unknown, IncomingRequestCfProperties>, {} as TalksEnv, {} as ExecutionContext);
    assert.equal(response.status, 404);
  } finally { f.restore(); }
});

test("every question is logged with its answer or error", async () => {
  const ok = fixture();
  try {
    const response = await ok.fetch("/beyond-done/api/chat", asked("How do I run the browser exercise?"));
    assert.deepEqual(await response.json(), { message: "Use observe()." });
    await ok.settle();
    assert.deepEqual(ok.inserted, [[2, "How do I run the browser exercise?", "Use observe().", null]]);
  } finally { ok.restore(); }

  const failing = fixture(() => new Response("upstream down", { status: 500 }));
  try {
    const response = await failing.fetch("/beyond-done/api/chat", asked("Is this logged?"));
    assert.equal(response.status, 502);
    await failing.settle();
    assert.equal(failing.inserted.length, 1);
    assert.deepEqual(failing.inserted[0].slice(0, 3), [2, "Is this logged?", null]);
    assert.match(String(failing.inserted[0][3]), /OpenRouter request failed \(500\)/);
  } finally { failing.restore(); }
});

test("the chat log requires a signed-in identity", async () => {
  const f = fixture();
  try {
    const response = await f.fetch("/chat-log?format=csv");
    assert.equal(response.status, 401);
    assert.equal(f.queried(), false);
    assert.equal((await f.fetch("/beyond-done/api/chat/other")).status, 404);
  } finally { f.restore(); }
});

test("CSV export escapes quotes and neutralizes spreadsheet formulas", () => {
  assert.equal(
    toCsv([{ id: 1, created_at: "2026-10-12T00:00:00.000Z", turn: 1, question: '=HYPERLINK("x")', answer: 'Say "done"', error: null }]),
    '"id","created_at","turn","question","answer","error"\r\n"1","2026-10-12T00:00:00.000Z","1","\'=HYPERLINK(""x"")","Say ""done""",""\r\n',
  );
});
