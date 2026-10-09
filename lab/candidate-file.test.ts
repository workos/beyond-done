import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readCandidate } from "./candidate-file.js";

test("participant candidate files use the same strict worker boundary", async () => {
  const directory = await mkdtemp(join(tmpdir(), "snack-challenge-"));
  const file = join(directory, "candidate.json");
  try {
    const candidate = { storage: "local", confirmation: "My new confirmation" };
    await writeFile(file, JSON.stringify(candidate));
    assert.deepEqual(await readCandidate(file), candidate);
    for (const value of [{ ...candidate, policy: "accept" }, { ...candidate, storage: "server" }, { ...candidate, confirmation: "" }]) {
      await writeFile(file, JSON.stringify(value));
      await assert.rejects(readCandidate(file));
    }
    await writeFile(file, "{bad json");
    await assert.rejects(readCandidate(file));
    await writeFile(file, " ".repeat(4097));
    await assert.rejects(readCandidate(file), /at most 4 KB/);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test("new participant copy cannot silently receive synthetic scores", async () => {
  await assert.rejects(
    promisify(execFile)(process.execPath, ["--import", "tsx", "lab/cli.ts", "check", "--candidate", "lab/challenges/bluff.json", "--solution"]),
    (error: unknown) => error instanceof Error && /requires --judge live/.test((error as Error & { stderr?: string }).stderr ?? ""),
  );
});
