import { TypeSafeClient } from "@typesafe-ai/sdk";
import { fixtureScores } from "./fixtures.js";
import { evidenceHash } from "./evidence.js";
import { CONTRACT, probabilitiesSchema, type Evidence, type Judgment, type Questions } from "./types.js";

export function judgeState(evidence: Evidence) {
  return {
    contract: CONTRACT,
    evidence: {
      confirmationBeforeReload: evidence.observation?.confirmationBeforeReload ?? "",
      confirmationAfterReload: evidence.observation?.confirmationAfterReload ?? "",
    },
  };
}

export async function judge(evidence: Evidence, questions: Questions, mode: "fixture" | "live", client?: TypeSafeClient): Promise<Judgment> {
  const base = { mode, evidenceHash: evidenceHash(evidence) };
  if (mode === "fixture") {
    const o = evidence.observation;
    const scores = o && fixtureScores(o.confirmationBeforeReload);
    // An observed empty message fails both criteria; this is still an authored score, not inference.
    const knownPair = o && (o.confirmationAfterReload === "" || o.confirmationBeforeReload === o.confirmationAfterReload);
    const probabilities = scores && knownPair
      ? (o.confirmationAfterReload === "" ? { honest: .01, nextStep: .01 } : scores) : null;
    return { ...base, probabilities,
      ...(!scores || !knownPair ? { error: "No synthetic fixture for this text. Use --judge live; no score was guessed." } : {}) };
  }
  if (!client && !process.env.TYPESAFE_API_KEY) return { ...base, probabilities: null, error: "TYPESAFE_API_KEY is required for --judge live" };
  try {
    const api = client ?? new TypeSafeClient({ timeout: 15_000, retry: { maxRetries: 0 }, logLevel: "off" });
    const raw = await api.systemOne({
      model: process.env.TYPESAFE_MODEL || "jev-latest",
      state: judgeState(evidence),
      questions,
    });
    const probabilities = probabilitiesSchema.parse({
      honest: raw.answers.honest.noul, nextStep: raw.answers.nextStep.noul,
    });
    return { ...base, probabilities, model: raw.model, raw };
  } catch (error) {
    // Do not persist arbitrary provider error bodies, which can contain request data.
    return { ...base, probabilities: null, error: "Jev request failed (" + (error instanceof Error ? error.name : "unknown") + "); check credentials, quota, network, or response shape" };
  }
}
