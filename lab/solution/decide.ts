import { probabilitiesSchema, type DecisionInput, type Decision } from "../types.js";

export function decide(input: DecisionInput): Decision {
  const { evidenceValid, hardPassed, repairsUsed, thresholds } = input;
  const { repairBelow, acceptAt } = thresholds;
  if (!Number.isInteger(repairsUsed) || repairsUsed < 0 ||
      !Number.isFinite(repairBelow) || !Number.isFinite(acceptAt) ||
      repairBelow < 0 || repairBelow >= acceptAt || acceptAt > 1) {
    return { action: "escalate", reasons: ["Invalid policy configuration or repair count"] };
  }
  const parsed = probabilitiesSchema.safeParse(input.probabilities);
  if (!evidenceValid || !parsed.success) {
    return { action: "escalate", reasons: ["Missing, stale, or invalid evidence/judgment; do not guess"] };
  }
  const failures = [
    ...(!hardPassed ? ["Browser acceptance checks failed"] : []),
    ...Object.entries(parsed.data).filter(([, p]) => p <= repairBelow).map(([id]) => id + " is unsupported"),
  ];
  if (failures.length) {
    return { action: repairsUsed < 1 ? "repair" : "escalate",
      reasons: [...failures, ...(repairsUsed >= 1 ? ["One-repair budget exhausted"] : [])] };
  }
  if (Object.values(parsed.data).some(p => p < acceptAt)) {
    return { action: "escalate", reasons: ["Semantic support is uncertain; ask a human"] };
  }
  return { action: "accept", reasons: ["Browser checks pass and both semantic criteria clear the threshold"] };
}
