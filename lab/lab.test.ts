import test from "node:test";
import assert from "node:assert/strict";
import { execFile, spawn } from "node:child_process";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { TypeSafeClient } from "@typesafe-ai/sdk";
import { chromium } from "@playwright/test";
import { BUGS, render, startApp, type AppOptions } from "./server.js";
import { runProof, type Prove, type Receipt } from "./proof.js";
import { prove } from "./solution/prove.js";
import { judge } from "./judge.js";

async function proofFor(options: AppOptions, proof: Prove = prove): Promise<Receipt> {
  const app = await startApp(options);
  const browser = await chromium.launch();
  try { return await runProof(browser, app.url, proof); } finally { await browser.close(); await app.close(); }
}
const failed = (receipt: Receipt) => receipt.checks.filter(check => !check.pass).map(check => check.name);
const root = fileURLToPath(new URL("..", import.meta.url));
// Attendees fix lab/app/index.html during the workshop; the shipped-scaffold test only applies to the committed copy.
const scaffoldEdited = await promisify(execFile)("git", ["diff", "--quiet", "HEAD", "--", "lab/app/index.html"], { cwd: root })
  .then(() => false, (error: { code?: number }) => error.code === 1);

test("every game bug applies once, changes the revision, and the page carries its revision", async () => {
  const reference = await render({ app: "solution" });
  assert.match(reference.html, new RegExp(`<meta name="snack-revision" content="${reference.revision}">`));
  const revisions = new Set([reference.revision]);
  for (const bug of Object.keys(BUGS) as (keyof typeof BUGS)[]) revisions.add((await render({ bug })).revision);
  assert.equal(revisions.size, Object.keys(BUGS).length + 1);
});

test("reference proof passes the correct app and fails the bugs it is responsible for", async () => {
  assert.equal((await proofFor({ app: "solution" })).verdict, "PASS");
  assert.deepEqual(failed(await proofFor({ bug: "memory-only" })),
    ["status survives reload", "email survives reload", "confirmation survives reload", "record is in localStorage"]);
  assert.deepEqual(failed(await proofFor({ bug: "wrong-email" })), ["email survives reload", "record is in localStorage"]);
  assert.deepEqual(failed(await proofFor({ bug: "lost-confirmation" })), ["confirmation survives reload"]);
});

test("the game's two misses pass the proof; the console error is still in the receipt", async () => {
  assert.equal((await proofFor({ bug: "overpromise" })).verdict, "PASS");
  const receipt = await proofFor({ bug: "console-error" });
  assert.equal(receipt.verdict, "PASS");
  assert.deepEqual(receipt.pageErrors, ["track is not defined"]);
});

test("the attendee app ships broken: it forgets the visitor and promises a seat", {
  skip: scaffoldEdited && "lab/app/index.html has your edits; this checks the shipped scaffold (git checkout lab/app/index.html restores it)",
}, async () => {
  const receipt = await proofFor({ app: "exercise" });
  assert.equal(receipt.verdict, "FAIL");
  assert.ok(failed(receipt).includes("status survives reload"));
  assert.match(await readFile(new URL("./app/index.html", import.meta.url), "utf8"), /Your seat is confirmed/);
});

test("a proof that throws or records nothing is ERROR (can't tell), never PASS", async () => {
  const thrown = await proofFor({ app: "solution" }, async () => { throw new Error("no such element"); });
  assert.equal(thrown.verdict, "ERROR");
  assert.match(thrown.error ?? "", /no such element/);
  const empty = await proofFor({ app: "solution" }, async () => {});
  assert.equal(empty.verdict, "ERROR");
  assert.match(empty.next[0], /no checks/);
});

test("a proof whose screenshot can't be saved is ERROR, not PASS", async () => {
  const app = await startApp({ app: "solution" });
  const browser = await chromium.launch();
  try {
    const receipt = await runProof(browser, app.url, prove, tmpdir()); // a directory: the write fails
    assert.equal(receipt.verdict, "ERROR");
    assert.match(receipt.error ?? "", /screenshot/);
    assert.equal(receipt.screenshot, undefined);
  } finally { await browser.close(); await app.close(); }
});

const fakeJudge = (honest: unknown, nextStep: unknown, status = 200) => new TypeSafeClient({
  apiKey: "test-not-a-key", retry: { maxRetries: 0 }, logLevel: "off",
  fetch: async () => new Response(JSON.stringify({
    model: "test-fixture-not-jev", answers: { honest: { type: "noul", noul: honest }, nextStep: { type: "noul", noul: nextStep } },
    usage: { input_tokens: 1, output_tokens: 1 },
  }), { status, headers: { "Content-Type": "application/json" } }),
});
const copy = { confirmationBeforeReload: "x", confirmationAfterReload: "x" };

test("judge maps probabilities to PASS / FAIL / ASK A HUMAN and never invents a score", async () => {
  assert.equal((await judge(copy, fakeJudge(.98, .97))).verdict, "PASS");
  assert.equal((await judge(copy, fakeJudge(.01, .99))).verdict, "FAIL");
  assert.equal((await judge(copy, fakeJudge(.55, .95))).verdict, "ASK A HUMAN");
  await assert.rejects(judge(copy, fakeJudge(2, .9)), /invalid probability/);
  await assert.rejects(judge(copy, fakeJudge(.9, .9, 503)));
  const key = process.env.TYPESAFE_API_KEY;
  delete process.env.TYPESAFE_API_KEY;
  try { await assert.rejects(judge(copy), /No TYPESAFE_API_KEY/); } finally { if (key !== undefined) process.env.TYPESAFE_API_KEY = key; }
});

test("snack CLI: up, doctor, drive, look, prove, and down against a real Chrome over CDP", async () => {
  const dir = await mkdtemp(join(tmpdir(), "snack-"));
  const env = { ...process.env, SNACK_DIR: dir };
  const cli = fileURLToPath(new URL("./snack.ts", import.meta.url));
  const run = async (...args: string[]) => {
    const result = await promisify(execFile)("npx", ["tsx", cli, ...args], { env }).catch(error => error);
    return { code: result.code ?? 0, json: JSON.parse(result.stdout || result.stderr) };
  };
  // memory-only fails like the shipped app, but doesn't depend on the attendee's working copy.
  const up = spawn("npx", ["tsx", cli, "up", "--headless", "--bug", "memory-only"], { env, stdio: "ignore" });
  try {
    for (let i = 0; i < 100 && !existsSync(join(dir, "session.json")); i++) await new Promise(resolve => setTimeout(resolve, 100));
    const second = await run("up", "--headless");
    assert.equal(second.code, 2);
    assert.match(second.json.error, /Already running/);
    const doctor = await run("doctor");
    assert.equal(doctor.json.ok, true, JSON.stringify(doctor.json));
    assert.equal(doctor.json.proof.status, "none yet");
    assert.equal((await run("join", "ada@example.test")).json.status, "waitlisted");
    assert.deepEqual((await run("storage")).json.localStorage, {});
    assert.equal((await run("reload")).json.status, "none");
    assert.ok((await run("console")).json.entries.some((entry: { type: string }) => entry.type === "load"));
    const proof = await run("prove", "--solution");
    assert.equal(proof.code, 1);
    assert.equal(proof.json.verdict, "FAIL");
    assert.ok(existsSync(proof.json.screenshot));
    assert.equal((await readdir(join(dir, "receipts"))).length, 1, "every receipt is appended to the history");
    assert.match((await run("doctor")).json.proof.status, /^FAIL for the current source/);
    const unknown = await run("frobnicate");
    assert.equal(unknown.code, 2);
    assert.match(unknown.json.next, /pnpm snack help/);
    assert.equal((await run("down")).json.ok, true);
    assert.equal(existsSync(join(dir, "session.json")), false);
    assert.match((await run("doctor")).json.checks.at(-1).next, /pnpm snack up/);
  } finally {
    up.kill("SIGTERM");
    await rm(dir, { recursive: true, force: true });
  }
});

test("snack up: a held lock refuses a second start, and a failed start exits and cleans up", async () => {
  const dir = await mkdtemp(join(tmpdir(), "snack-"));
  const cli = fileURLToPath(new URL("./snack.ts", import.meta.url));
  const run = async (env: NodeJS.ProcessEnv) => {
    const result = await promisify(execFile)("npx", ["tsx", cli, "up", "--headless"], { env: { ...process.env, SNACK_DIR: dir, ...env }, timeout: 20_000 })
      .catch(error => error);
    return { code: result.code ?? 0, killed: Boolean(result.killed), json: JSON.parse(result.stdout || result.stderr) };
  };
  try {
    await writeFile(join(dir, "up.lock"), String(process.pid)); // a live owner
    const locked = await run({});
    assert.equal(locked.code, 2);
    assert.match(locked.json.error, /Another up/);
    assert.equal(await readFile(join(dir, "up.lock"), "utf8"), String(process.pid), "someone else's lock is left alone");
    await rm(join(dir, "up.lock"));
    const failed = await run({ PLAYWRIGHT_BROWSERS_PATH: join(dir, "no-browsers") }); // Chromium can't launch
    assert.equal(failed.killed, false, "a failed start exits instead of hanging on the app server");
    assert.equal(failed.code, 2);
    assert.equal(existsSync(join(dir, "up.lock")), false);
    assert.equal(existsSync(join(dir, "session.json")), false);
    // A leftover session whose pid now belongs to someone else (here: this test runner) is stale, never signalled.
    await writeFile(join(dir, "session.json"), JSON.stringify({ pid: process.pid, appUrl: "http://127.0.0.1:9", cdpUrl: "http://127.0.0.1:9" }));
    const down = await promisify(execFile)("npx", ["tsx", cli, "down"], { env: { ...process.env, SNACK_DIR: dir } }).catch(error => error);
    assert.equal(down.code, 2);
    assert.match(JSON.parse(down.stderr).error, /no longer running/);
    assert.equal(existsSync(join(dir, "session.json")), false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
