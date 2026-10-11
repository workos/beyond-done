import { readFile } from "node:fs/promises";
import { candidateSchema } from "./types.js";

const CANDIDATE_RULES = 'Candidate file is invalid: "confirmation" must be 1–700 characters after trimming, ' +
  '"storage" must be "memory" or "local", and no other keys are allowed.';

export async function readCandidate(path: string) {
  const text = await readFile(path, "utf8");
  if (Buffer.byteLength(text) > 4096) throw new Error("Candidate JSON must be at most 4 KB");
  const result = candidateSchema.safeParse(JSON.parse(text));
  if (!result.success) throw new Error(CANDIDATE_RULES + "\nDetails:\n" + result.error.message, { cause: result.error });
  return result.data;
}
