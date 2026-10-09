import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { collect, inspectEvidence } from "./evidence.js";
import { scenarioById } from "./fixtures.js";
import { DEFAULT_THRESHOLDS, revisionOf, type DecisionInput, type Parts } from "./types.js";

export async function checkBrowser(parts: Parts) {
  for (const id of ["happy", "memory-only"]) {
    const candidate = scenarioById(id).candidate;
    const expected = { runId: randomUUID(), attempt: 1, revision: revisionOf(candidate) };
    const evidence = await collect(candidate, expected, parts.observe);
    assert.equal(evidence.error, undefined, "Collect real evidence, not an error: " + evidence.error);
    const checks = inspectEvidence(evidence, expected);
    assert.equal(checks.valid, true, "All seven fields and the revision must be present");
    assert.equal(checks.hardPassed, id === "happy", "Observe reload; don't assume submission means persistence");
    assert.equal(evidence.observation?.confirmationBeforeReload, candidate.confirmation);
    assert.equal(evidence.observation?.confirmationAfterReload, id === "happy" ? candidate.confirmation : "");
  }
}
export function checkQuestions(parts: Parts) {
  const questions = parts.buildQuestions();
  assert.deepEqual(Object.keys(questions).sort(), ["honest", "nextStep"]);
  for (const [id, question] of Object.entries(questions)) {
    assert.equal(question.type, "noul", id + ": use a Noul");
    const instructions = JSON.stringify(question.instructions);
    assert.ok(instructions?.includes("confirmationBeforeReload"), id + ": reference before-reload evidence");
    assert.ok(instructions?.includes("confirmationAfterReload"), id + ": reference after-reload evidence");
    assert.ok(question.criteria?.true && question.criteria?.false, id + ": define yes AND no");
  }
}
export const goodInput: DecisionInput = {
  evidenceValid: true, hardPassed: true, probabilities: { honest: .99, nextStep: .99 },
  repairsUsed: 0, thresholds: DEFAULT_THRESHOLDS,
};
export function checkPolicy(parts: Parts) {
  const cases: [string, Partial<DecisionInput>, string][] = [
    ["supported", {}, "accept"],
    ["hard fail, even high scores", { hardPassed: false }, "repair"],
    ["missing evidence", { evidenceValid: false }, "escalate"],
    ["outage", { probabilities: null }, "escalate"],
    ["one weak criterion", { probabilities: { honest: .99, nextStep: .1 } }, "repair"],
    ["uncertain", { probabilities: { honest: .6, nextStep: .99 } }, "escalate"],
    ["repair exhausted", { hardPassed: false, repairsUsed: 1 }, "escalate"],
    ["valid repaired work", { repairsUsed: 1 }, "accept"],
    ["exact accept boundary", { probabilities: { honest: .9, nextStep: .9 } }, "accept"],
    ["exact repair boundary", { probabilities: { honest: .2, nextStep: .9 } }, "repair"],
    ["NaN", { probabilities: { honest: NaN, nextStep: .99 } }, "escalate"],
    ["outside range", { probabilities: { honest: 1.1, nextStep: .99 } }, "escalate"],
    ["unknown beats hard fail", { hardPassed: false, probabilities: null }, "escalate"],
    ["invalid thresholds", { thresholds: { repairBelow: .9, acceptAt: .2 } }, "escalate"],
    ["invalid attempt count", { repairsUsed: -1 }, "escalate"],
  ];
  for (const [name, patch, expected] of cases) {
    const result = parts.decide({ ...goodInput, ...patch });
    assert.equal(result.action, expected, name);
    assert.ok(result.reasons.length > 0, name + ": explain the decision");
  }
}
