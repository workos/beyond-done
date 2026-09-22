import assert from "node:assert/strict";
import { execFile, execFileSync } from "node:child_process";
import { chmod, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const exec = promisify(execFile);
let mise: string | undefined;
try { mise = execFileSync("bash", ["-c", "command -v mise"], { encoding: "utf8" }).trim(); } catch { /* optional local tool */ }

async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), "companion-mise-"));
  const bin = join(directory, "bin");
  await mkdir(bin);
  await copyFile(resolve("mise.toml"), join(directory, "mise.toml"));
  await writeFile(join(bin, "pnpm"), `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.CALLS, JSON.stringify(args) + "\\n");
const receipt = args[args.indexOf("--receipt") + 1];
if (args.includes("provision")) {
  if (fs.existsSync(receipt)) { console.error("Receipt already exists"); process.exit(1); }
  fs.mkdirSync(require("node:path").dirname(receipt), { recursive: true });
  fs.writeFileSync(receipt, JSON.stringify({ hash: "fake-hash" }));
  console.log("fake-inference-secret");
} else if (args.includes("revoke")) {
  fs.writeFileSync(receipt, JSON.stringify({ hash: "fake-hash", revokedAt: "2026-01-01" }));
} else if (args.includes("bulk")) {
  const secrets = JSON.parse(fs.readFileSync(0, "utf8"));
  if (secrets.OPENROUTER_API_KEY !== "fake-inference-secret" || secrets.OPENROUTER_MODEL !== "test/model") process.exit(2);
  if (process.env.FAIL_INSTALL) process.exit(1);
} else if (args.includes("list")) {
  console.log(JSON.stringify(process.env.MISSING_SECRETS ? [] : [{ name: "OPENROUTER_API_KEY" }, { name: "OPENROUTER_MODEL" }]));
} else if (args.includes("build:workshop") && process.env.FAIL_BUILD) process.exit(1);
`);
  await chmod(join(bin, "pnpm"), 0o755);
  const env = {
    PATH: `${bin}:${dirname(process.execPath)}:/usr/bin:/bin`,
    HOME: directory,
    MISE_CONFIG_DIR: join(directory, "config"),
    MISE_DATA_DIR: join(directory, "data"),
    MISE_CACHE_DIR: join(directory, "cache"),
    MISE_SYSTEM_CONFIG_DIR: join(directory, "system"),
    MISE_TRUSTED_CONFIG_PATHS: directory,
    MISE_TASK_RUN_AUTO_INSTALL: "false",
    CALLS: join(directory, "calls.jsonl"),
    WORKSHOP_DIR: join(directory, "workshop with spaces"),
    WORKSHOP_SOURCE: join(directory, "workshop with spaces", "slides.md"),
    WORKSHOP_SLUG: "handoff",
    WORKSHOP_TITLE: "Handoff workshop",
    WORKER_NAME: "handoff-companion",
    OPENROUTER_MANAGEMENT_KEY: "fake-management-secret",
    OPENROUTER_MODEL: "test/model",
    CHAT_EXPIRES_AT: "2099-01-01T00:00:00Z",
  };
  return {
    run: (task: string, overrides = {}, args: string[] = []) => exec(mise!, ["-C", directory, "run", "--skip-tools", task, ...args], { cwd: bin, env: { ...env, ...overrides } }),
    calls: async () => (await readFile(env.CALLS, "utf8")).trim().split("\n").map(line => JSON.parse(line) as string[]),
    cleanup: () => rm(directory, { recursive: true, force: true }),
  };
}

test("mise tasks orchestrate scripts without live API calls", { skip: !mise }, async (t) => {
  await t.test("class tasks use the template commands", async () => {
    const f = await fixture();
    try {
      await f.run("generate");
      await f.run("deploy");
      assert.deepEqual(await f.calls(), [["glossary"], ["deploy"]]);
    } finally { await f.cleanup(); }
  });

  await t.test("standalone companion tasks preserve external configuration", async () => {
    const f = await fixture();
    try {
      await f.run("companion:generate", {}, ["--include", "materials with spaces"]);
      await f.run("companion:deploy");
      const calls = await f.calls();
      assert.equal(calls.length, 3);
      assert.deepEqual(calls[0].slice(-6), ["--slug", "handoff", "--title", "Handoff workshop", "--include", "materials with spaces"]);
      assert.equal(calls[1][1], "build:workshop");
      assert.equal(calls[1].at(-1), "--no-slides");
      assert.deepEqual(calls[2], ["exec", "wrangler", "deploy", "--name", "handoff-companion"]);
      await assert.rejects(f.run("companion:deploy", { FAIL_BUILD: "1" }));
      assert.equal((await f.calls()).length, 4, "failed build must not deploy");
    } finally { await f.cleanup(); }
  });

  await t.test("setup installs both secrets, blocks duplicates, and allows setup after revocation", async () => {
    const f = await fixture();
    try {
      const result = await f.run("chat:setup");
      assert.match(result.stdout, /both secrets verified/);
      assert.doesNotMatch(result.stdout + result.stderr, /fake-inference-secret|fake-management-secret/);
      await assert.rejects(f.run("chat:setup"), /Receipt already exists/);
      await f.run("chat:revoke");
      await f.run("chat:setup");
      const calls = await f.calls();
      assert.equal(calls.filter(args => args.includes("bulk")).length, 2);
      assert.equal(calls.filter(args => args.includes("revoke")).length, 1);
      assert.equal(calls.find(args => args.includes("provision"))?.includes("15"), true);
    } finally { await f.cleanup(); }
  });

  await t.test("failed secret installation revokes the new key", async () => {
    const f = await fixture();
    try {
      await assert.rejects(f.run("chat:setup", { FAIL_INSTALL: "1" }), /Revoking the newly created key/);
      assert.equal((await f.calls()).at(-1)?.includes("revoke"), true);
    } finally { await f.cleanup(); }
  });

  await t.test("missing credentials and failed verification cannot report success", async () => {
    const f = await fixture();
    try {
      await assert.rejects(f.run("chat:setup", { OPENROUTER_MANAGEMENT_KEY: "" }), /Set OPENROUTER_MANAGEMENT_KEY/);
      await assert.rejects(f.run("chat:setup", { MISSING_SECRETS: "1" }), /Chat secrets could not be verified/);
    } finally { await f.cleanup(); }
  });
});
