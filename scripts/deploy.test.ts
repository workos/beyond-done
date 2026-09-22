import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { classConfig } from "../src/class-config.js";
import { deploy } from "./deploy.js";
import { setupChat } from "./setup-chat.js";

async function fixture() {
  const cwd = process.cwd();
  const originalEnv = { ...process.env };
  const directory = await mkdtemp(join(tmpdir(), "deploy-wizard-"));
  const config = { ...classConfig, slug: "test-class", hostname: "test-class.typevoid.com", features: { ...classConfig.features, chat: true } };
  await mkdir(join(directory, "bin"));
  await mkdir(join(directory, ".class-build"));
  await writeFile(join(directory, "class.config.json"), JSON.stringify(config));
  await writeFile(join(directory, ".class-build/wrangler.json"), JSON.stringify({ name: config.slug }));
  const pnpm = join(directory, "bin/pnpm");
  await writeFile(pnpm, `#!${process.execPath}
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync("calls.jsonl", JSON.stringify(args) + "\\n");
if (args[0] === "build" && process.env.FAIL_BUILD) process.exit(1);
if (args.includes("list")) console.log(fs.existsSync("secrets.json") ? fs.readFileSync("secrets.json", "utf8") : "[]");
if (args.includes("bulk")) {
  const secrets = JSON.parse(fs.readFileSync(0, "utf8"));
  if (!secrets.OPENROUTER_API_KEY || !secrets.OPENROUTER_MODEL) process.exit(2);
  if (process.env.FAIL_INSTALL) process.exit(1);
  fs.writeFileSync("secrets.json", JSON.stringify(Object.keys(secrets).map(name => ({ name }))));
}
`);
  await chmod(pnpm, 0o755);
  process.chdir(directory);
  Object.assign(process.env, {
    PATH: `${join(directory, "bin")}:${process.env.PATH}`,
    OPENROUTER_MANAGEMENT_API_KEY: "fake-management-key", OPENROUTER_API_KEY: "",
    CHAT_BUDGET_USD: "5", CHAT_EXPIRES_AT: "2099-01-01",
  });
  delete process.env.OPENROUTER_MANAGEMENT_KEY;
  return {
    config,
    calls: async () => (await readFile("calls.jsonl", "utf8")).trim().split("\n").map(line => JSON.parse(line) as string[]),
    receipt: async () => JSON.parse(await readFile("generated/openrouter-chat-key.json", "utf8")),
    cleanup: async () => { process.chdir(cwd); process.env = originalEnv; await rm(directory, { recursive: true, force: true }); },
  };
}

function keyApi(calls: string[]) {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    assert.match(String(input), /^https:\/\/openrouter.ai\/api\/v1\/keys/);
    calls.push(init?.method ?? "GET");
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer fake-management-key");
    if (init?.method === "DELETE") return new Response(null, { status: 204 });
    assert.deepEqual(JSON.parse(String(init?.body)), {
      name: "test-class-chat", limit: 5, limit_reset: null, expires_at: "2099-01-01T00:00:00.000Z", include_byok_in_limit: true,
    });
    return Response.json({ key: "fake-inference-key", data: { hash: "fake-hash", created_at: "2026-01-01" } });
  }) as typeof fetch;
}

test("deploy wizard reuses installed secrets and never persists key material", async t => {
  const f = await fixture();
  const api: string[] = [];
  t.mock.method(globalThis, "fetch", keyApi(api));
  try {
    await deploy();
    delete process.env.OPENROUTER_MANAGEMENT_API_KEY;
    await deploy();
    assert.deepEqual(api, ["POST"]);
    const calls = await f.calls();
    assert.equal(calls.filter(args => args.includes("bulk")).length, 1);
    assert.equal(calls.filter(args => args.includes("deploy")).length, 2);
    assert.deepEqual(calls[0], ["build"]);
    assert.doesNotMatch(JSON.stringify(await f.receipt()), /fake-inference-key|fake-management-key/);
    assert.doesNotMatch(JSON.stringify(calls), /fake-inference-key|fake-management-key/);
    assert.ok(calls.filter(args => args.includes("wrangler")).every(args => args.includes(".class-build/wrangler.json")));
  } finally { await f.cleanup(); }
});

test("failed secret installation revokes the created key and a retry recovers", async t => {
  const f = await fixture();
  const api: string[] = [];
  t.mock.method(globalThis, "fetch", keyApi(api));
  try {
    process.env.FAIL_INSTALL = "1";
    await assert.rejects(setupChat(f.config, process.env), /failed/);
    assert.ok((await f.receipt()).revokedAt);
    delete process.env.FAIL_INSTALL;
    await setupChat(f.config, process.env);
    await setupChat(f.config, process.env);
    assert.deepEqual(api, ["POST", "DELETE", "POST"]);
    assert.equal((await f.receipt()).revokedAt, undefined);
  } finally { await f.cleanup(); }
});

test("an interrupted setup revokes its orphan key before creating a replacement", async t => {
  const f = await fixture();
  const api: string[] = [];
  t.mock.method(globalThis, "fetch", keyApi(api));
  try {
    await setupChat(f.config, process.env);
    await rm("secrets.json");
    await setupChat(f.config, process.env);
    assert.deepEqual(api, ["POST", "DELETE", "POST"]);
  } finally { await f.cleanup(); }
});

test("no credentials leaves chat unconfigured; a failed build never deploys", async t => {
  const f = await fixture();
  t.mock.method(globalThis, "fetch", async () => { throw new Error("No API call expected"); });
  try {
    delete process.env.OPENROUTER_MANAGEMENT_API_KEY;
    assert.equal(await setupChat(f.config, process.env), false);
    process.env.FAIL_BUILD = "1";
    await assert.rejects(deploy(), /failed/);
    assert.equal((await f.calls()).some(args => args.includes("deploy") || args.includes("bulk")), false);
  } finally { await f.cleanup(); }
});
