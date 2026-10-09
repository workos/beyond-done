import { readFile } from "node:fs/promises";
import { candidateSchema } from "./types.js";

export async function readCandidate(path: string) {
  const text = await readFile(path, "utf8");
  if (Buffer.byteLength(text) > 4096) throw new Error("Candidate JSON must be at most 4 KB");
  return candidateSchema.parse(JSON.parse(text));
}
