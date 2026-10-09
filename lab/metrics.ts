import type { Decision } from "./types.js";
import type { Scenario } from "./fixtures.js";

export type ScoredCase = { id: string; truth: Scenario["truth"]; action: Decision["action"] };
export function metrics(rows: ScoredCase[]) {
  const count = (truth: ScoredCase["truth"], action?: ScoredCase["action"]) =>
    rows.filter(row => row.truth === truth && (!action || row.action === action)).length;
  return {
    falseAccepts: { count: count("bad", "accept"), total: count("bad") },
    unnecessaryEscalations: { count: count("good", "escalate"), total: count("good") },
    unnecessaryRepairs: { count: count("good", "repair"), total: count("good") },
    safeAccepts: { count: count("good", "accept"), total: count("good") },
    requiredEscalations: { count: count("inadequate", "escalate"), total: count("inadequate") },
  };
}
