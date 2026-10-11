import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readCandidate } from "./candidate-file.js";

const PLAIN = 'Candidate file is invalid: "confirmation" must be 1–700 characters after trimming, ' +
  '"storage" must be "memory" or "local", and no other keys are allowed.';

test("participant candidate files use the same strict worker boundary", async () => {
  const directory = await mkdtemp(join(tmpdir(), "snack-challenge-"));
  const file = join(directory, "candidate.json");
  try {
    const candidate = { storage: "local", confirmation: "My new confirmation" };
    await writeFile(file, JSON.stringify(candidate));
    assert.deepEqual(await readCandidate(file), candidate);
    const invalid = [
      [{ ...candidate, policy: "accept" }, "unrecognized_keys"],
      [{ ...candidate, storage: "server" }, "invalid_value"],
      [{ ...candidate, confirmation: "   " }, "too_small"],
      [{ ...candidate, confirmation: "x".repeat(701) }, "too_big"],
    ] as const;
    for (const [value, code] of invalid) {
      await writeFile(file, JSON.stringify(value));
      await assert.rejects(readCandidate(file), (error: unknown) => {
        assert.ok(error instanceof Error);
        const [plain, ...details] = error.message.split("\n");
        assert.equal(plain, PLAIN);
        assert.match(details.join("\n"), new RegExp('"code": "' + code + '"'));
        return true;
      });
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
test("lab:app reports an invalid candidate in plain words before the diagnostics", async () => {
  const directory = await mkdtemp(join(tmpdir(), "snack-challenge-"));
  const file = join(directory, "candidate.json");
  try {
    await writeFile(file, JSON.stringify({ storage: "server", confirmation: "Joined" }));
    await assert.rejects(
      promisify(execFile)(process.execPath, ["--import", "tsx", "lab/cli.ts", "app", "--candidate", file], { timeout: 30_000 }),
      (error: unknown) => {
        const [plain, ...details] = ((error as Error & { stderr?: string }).stderr ?? "").split("\n");
        assert.equal(plain, PLAIN);
        assert.match(details.join("\n"), /"code": "invalid_value"/);
        return true;
      },
    );
  } finally { await rm(directory, { recursive: true, force: true }); }
});
