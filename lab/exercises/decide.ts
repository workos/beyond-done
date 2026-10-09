import type { DecisionInput, Decision } from "../types.js";

// LAB 3: implement the ordered decision table from lesson 5.
// Missing/invalid -> escalate; known failure -> at most one repair;
// uncertain -> escalate; all checks passed -> accept. Never average gates.
export function decide(_input: DecisionInput): Decision {
  return { action: "escalate", reasons: ["LAB 3: policy not implemented"] };
}
