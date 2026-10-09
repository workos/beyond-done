import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import { chromium } from "@playwright/test";
import { startApp } from "./app.js";
import { inspectEvidence, evidenceHash } from "./evidence.js";
import { checkScenario, runLoop, combineSignals } from "./engine.js";
import { checkBrowser, checkPolicy, checkQuestions, goodInput } from "./exercise-checks.js";
import { scenarios, heldout, scenarioById } from "./fixtures.js";
import { judge, judgeState } from "./judge.js";
import { loadParts } from "./load-parts.js";
import { metrics } from "./metrics.js";
import { scriptedWorker, liveWorker } from "./worker.js";
import { candidateSchema, revisionOf, DEFAULT_THRESHOLDS, type Evidence } from "./types.js";

const parts = await loadParts(true);
const candidate = scenarioById("happy").candidate;
const stamp = { runId: "test-run", attempt: 1, revision: revisionOf(candidate) };
const evidence: Evidence = {
  ...stamp, loadedRevision: stamp.revision, capturedAt: "2026-01-01T00:00:00Z",
  observation: {
    initialStatus: "none", submittedStatus: "waitlisted", reloadedStatus: "waitlisted",
    submittedEmail: "ada@example.test", reloadedEmail: "ada@example.test",
    confirmationBeforeReload: candidate.confirmation, confirmationAfterReload: candidate.confirmation,
  },
};

test("reference policy covers all ordered branches and boundaries", () => checkPolicy(parts));
test("question construction has two scoped independent Nouls", () => checkQuestions(parts));
test("learners start red and fail closed", async () => {
  const starter = await loadParts(false);
  // Learners are allowed to finish these files; assert the initial state only when its marker remains.
  const source = await readFile(new URL("./exercises/decide.ts", import.meta.url), "utf8");
  if (source.includes("LAB 3: policy not implemented")) assert.equal(starter.decide(goodInput).action, "escalate");
});
test("candidate boundary rejects extra instructions, malformed storage, and huge strings", () => {
  assert.throws(() => candidateSchema.parse({ ...candidate, policy: "accept" }));
  assert.throws(() => candidateSchema.parse({ ...candidate, storage: "server" }));
  assert.throws(() => candidateSchema.parse({ ...candidate, confirmation: "x".repeat(701) }));
});
test("revision changes when candidate changes", () => {
  assert.notEqual(revisionOf(candidate), revisionOf({ ...candidate, confirmation: "Changed" }));
});
test("evidence must match run, attempt, revision, loaded revision and observation shape", () => {
  assert.equal(inspectEvidence(evidence, stamp).valid, true);
  for (const patch of [
    { runId: "old-run" }, { attempt: 0 }, { revision: "old" }, { loadedRevision: "old" },
    { observation: null }, { error: "timeout" },
  ]) assert.equal(inspectEvidence({ ...evidence, ...patch }, stamp).valid, false);
  assert.equal(inspectEvidence({ ...evidence, observation: {} as never }, stamp).valid, false);
});
test("a stale judgment cannot be reused with current passing evidence", () => {
  const input = combineSignals(evidence, stamp, { mode: "fixture", evidenceHash: "old-packet", probabilities: { honest: .99, nextStep: .99 } }, DEFAULT_THRESHOLDS);
  assert.equal(input.evidenceValid, false);
  assert.equal(parts.decide(input).action, "escalate");
});
test("duplicate fixture text has consistent synthetic scores", () => {
  const seen = new Map<string, unknown>();
  for (const scenario of [...scenarios, ...heldout]) {
    const text = scenario.candidate.confirmation;
    if (seen.has(text)) assert.deepEqual(seen.get(text), scenario.fixtureProbabilities);
    seen.set(text, scenario.fixtureProbabilities);
  }
});
test("wrong email, wrong initial state, and disappeared status are known hard failures", () => {
  for (const patch of [{ initialStatus: "waitlisted" }, { submittedEmail: "someone-else@example.test" },
    { reloadedEmail: "someone-else@example.test" }, { reloadedStatus: "none" }]) {
    const check = inspectEvidence({ ...evidence, observation: { ...evidence.observation!, ...patch } }, stamp);
    assert.equal(check.valid, true);
    assert.equal(check.hardPassed, false);
  }
});
test("live judge input excludes labels, candidate settings and fixture probabilities", () => {
  assert.deepEqual(Object.keys(judgeState(evidence)).sort(), ["contract", "evidence"]);
  const state = JSON.stringify(judgeState(evidence));
  for (const forbidden of ["fixtureProbabilities", "truth", "expectedAction", "storage", "test-run"]) {
    assert.ok(!state.includes(forbidden));
  }
});
test("synthetic judge identifies its source and refuses unknown text", async () => {
  const result = await judge(evidence, parts.buildQuestions(), "fixture");
  assert.equal(result.mode, "fixture");
  assert.deepEqual(result.probabilities, { honest: .99, nextStep: .99 });
  const changed = { ...evidence, observation: { ...evidence.observation!, confirmationBeforeReload: "new text" } };
  assert.equal((await judge(changed, parts.buildQuestions(), "fixture")).probabilities, null);
  assert.notEqual(evidenceHash(changed), result.evidenceHash);
});
test("real SDK request/response shape is tested with a fake HTTP transport, not a model", async () => {
  let requests = 0;
  const client = new TypeSafeClient({
    apiKey: "test-not-a-key", retry: { maxRetries: 0 }, logLevel: "off",
    fetch: async (url, init) => {
      requests++;
      assert.ok(url.endsWith("/v1/systemone"));
      const sent = JSON.parse(String(init?.body));
      assert.deepEqual(sent.state, judgeState(evidence));
      assert.equal(sent.questions.honest.type, "noul");
      return new Response(JSON.stringify({
        model: "test-fixture-not-jev", answers: {
          honest: { type: "noul", noul: .92 }, nextStep: { type: "noul", noul: .96 },
        }, usage: { input_tokens: 1, output_tokens: 1 },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    },
  });
  const result = await judge(evidence, parts.buildQuestions(), "live", client);
  assert.equal(requests, 1);
  assert.deepEqual(result.probabilities, { honest: .92, nextStep: .96 });
  assert.equal(result.model, "test-fixture-not-jev");
});
test("judge outage and malformed response never become passing probabilities", async () => {
  for (const response of [
    () => new Response("unavailable", { status: 503 }),
    () => new Response(JSON.stringify({ model: "test", answers: { honest: { type: "noul", noul: 2 } } }), { status: 200 }),
  ]) {
    let requests = 0;
    const client = new TypeSafeClient({ apiKey: "test", retry: { maxRetries: 0 }, logLevel: "off",
      fetch: async () => { requests++; return response(); } });
    const result = await judge(evidence, parts.buildQuestions(), "live", client);
    assert.equal(result.probabilities, null);
    assert.ok(result.error);
    assert.equal(requests, 1);
  }
});
test("metrics use correct denominators and distinguish good/inadequate cases", () => {
  const m = metrics([
    { id: "a", truth: "bad", action: "accept" }, { id: "b", truth: "bad", action: "repair" },
    { id: "c", truth: "good", action: "escalate" }, { id: "d", truth: "good", action: "accept" },
    { id: "e", truth: "inadequate", action: "escalate" },
  ]);
  assert.deepEqual(m.falseAccepts, { count: 1, total: 2 });
  assert.deepEqual(m.unnecessaryEscalations, { count: 1, total: 2 });
  assert.deepEqual(m.requiredEscalations, { count: 1, total: 1 });
  assert.equal(metrics([]).falseAccepts.total, 0);
});
test("browser observes both valid persistence and the planted memory-only defect", async () => checkBrowser(parts));
test("model copy is text, not executable HTML; required email form works", async () => {
  const unsafe = '</script><script>window.pwned = true</script><img src=x onerror="window.pwned=true">';
  const app = await startApp({ storage: "local", confirmation: unsafe });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(app.url);
    await page.getByRole("button", { name: "Join waitlist" }).click();
    assert.equal(await page.getByTestId("status").innerText(), "none");
    await page.getByLabel("Email", { exact: true }).fill("ada@example.test");
    await page.getByRole("button", { name: "Join waitlist" }).click();
    assert.equal(await page.getByRole("status").innerText(), unsafe);
    assert.equal(await page.evaluate(() => "pwned" in window), false);
    await page.reload();
    assert.equal(await page.getByRole("status").innerText(), unsafe);
  } finally { await browser.close(); await app.close(); }
});
test("all teaching cases run in real Chromium with synthetic policy judgments", async () => {
  const directory = await mkdtemp(join(tmpdir(), "beyond-done-cases-"));
  try {
    for (const scenario of [...scenarios, ...heldout]) {
      const run = await checkScenario(scenario, { parts, judgeMode: "fixture", directory: join(directory, scenario.id) });
      const expected = scenario.id === "polite-lie" ? "escalate" : scenario.truth === "bad" ? "repair"
        : scenario.truth === "inadequate" || ["paraphrase", "uncertain"].includes(scenario.id) ? "escalate" : "accept";
      assert.equal(run.final.action, expected, scenario.id);
      assert.equal(run.attempts.length, 1);
    }
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test("bounded repair collects new evidence and accepts the repaired revision", async () => {
  const directory = await mkdtemp(join(tmpdir(), "beyond-done-loop-"));
  try {
    const run = await runLoop(scriptedWorker(), { parts, judgeMode: "fixture", directory });
    assert.deepEqual(run.attempts.map(a => a.decision.action), ["repair", "accept"]);
    assert.equal(run.final.action, "accept");
    assert.notEqual(run.attempts[0].evidence.revision, run.attempts[1].evidence.revision);
    assert.notEqual(run.attempts[0].judgment.evidenceHash, run.attempts[1].judgment.evidenceHash);
    assert.equal(run.attempts[1].input.repairsUsed, 1);
    assert.equal(JSON.parse(await readFile(join(directory, "report.json"), "utf8")).attempts.length, 2);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test("stubborn worker escalates; harness caps even a broken always-repair policy", async () => {
  const directory = await mkdtemp(join(tmpdir(), "beyond-done-cap-"));
  try {
    const run = await runLoop(scriptedWorker(true), { parts, judgeMode: "fixture", directory: join(directory, "normal") });
    assert.deepEqual(run.attempts.map(a => a.decision.action), ["repair", "escalate"]);
    assert.equal(run.final.action, "escalate");
    const broken = await runLoop(scriptedWorker(true), {
      parts: { ...parts, decide: () => ({ action: "repair", reasons: ["broken"] }) },
      judgeMode: "fixture", directory: join(directory, "broken"),
    });
    assert.equal(broken.attempts.length, 2);
    assert.equal(broken.final.action, "escalate");
    assert.match(await readFile(join(directory, "broken", "human-review.md"), "utf8"), /will not resume automatically/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test("invalid worker output stops before browser execution", async () => {
  const directory = await mkdtemp(join(tmpdir(), "beyond-done-worker-"));
  try {
    const run = await runLoop(async () => ({ ...candidate, storage: "invalid" } as never),
      { parts, judgeMode: "fixture", directory });
    assert.equal(run.attempts.length, 0);
    assert.equal(run.final.action, "escalate");
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test("live worker adapter uses bounded JSON tool; fake HTTP only", async () => {
  const key = process.env.OPENROUTER_API_KEY, model = process.env.WORKER_MODEL;
  process.env.OPENROUTER_API_KEY = "test-key"; process.env.WORKER_MODEL = "test-model";
  try {
    const worker = liveWorker(async (_url, init) => {
      const sent = JSON.parse(String(init?.body));
      assert.equal(sent.model, "test-model");
      assert.equal(sent.max_tokens, 400);
      assert.equal(sent.response_format.type, "json_object");
      assert.ok(init?.signal);
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(candidate) } }] }));
    });
    assert.deepEqual(await worker(), candidate);
  } finally {
    if (key === undefined) delete process.env.OPENROUTER_API_KEY; else process.env.OPENROUTER_API_KEY = key;
    if (model === undefined) delete process.env.WORKER_MODEL; else process.env.WORKER_MODEL = model;
  }
});
