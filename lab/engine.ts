import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { collect, inspectEvidence, evidenceHash } from "./evidence.js";
import { judge, judgeState } from "./judge.js";
import { candidateSchema, DEFAULT_THRESHOLDS, hash, revisionOf,
  type Candidate, type Decision, type DecisionInput, type Evidence, type Judgment, type Parts, type Stamp, type Thresholds } from "./types.js";
import type { Scenario } from "./fixtures.js";
import type { Worker } from "./worker.js";

export type Attempt = {
  expected: Stamp;
  candidate: Candidate;
  evidence: Evidence;
  judgeInput: ReturnType<typeof judgeState>;
  questions: ReturnType<Parts["buildQuestions"]>;
  questionHash: string;
  judgment: Judgment;
  checks: ReturnType<typeof inspectEvidence>;
  input: DecisionInput;
  decision: Decision;
};
export type Run = {
  runId: string;
  judgeMode: "fixture" | "live";
  workerMode: "scripted" | "live" | "scenario";
  thresholds: Thresholds;
  attempts: Attempt[];
  final: Decision;
  directory: string;
};
type Options = { parts: Parts; judgeMode: "fixture" | "live"; thresholds?: Thresholds; directory?: string };

export async function evaluate(candidateInput: Candidate, stamp: Stamp, options: Options, fault?: Scenario["fault"]): Promise<Attempt> {
  const candidate = candidateSchema.parse(candidateInput);
  const evidence = await collect(candidate, stamp, options.parts.observe,
    options.directory ? join(options.directory, "attempt-" + stamp.attempt + ".png") : undefined);
  if (fault === "missing") evidence.observation = null;
  if (fault === "stale") evidence.revision = "previous-revision";
  const checks = inspectEvidence(evidence, stamp);
  const questions = options.parts.buildQuestions();
  const judgment: Judgment = !checks.valid || fault === "judge-down"
    ? { mode: options.judgeMode, evidenceHash: evidenceHash(evidence), probabilities: null,
        error: fault === "judge-down" ? "Simulated judge outage" : "Skipped judgment: evidence invalid" }
    : await judge(evidence, questions, options.judgeMode);
  if (fault === "stale-judgment") judgment.evidenceHash = "previous-evidence-packet";
  const input = combineSignals(evidence, stamp, judgment, options.thresholds ?? DEFAULT_THRESHOLDS);
  return { expected: stamp, candidate, evidence, checks, judgment, input,
    judgeInput: judgeState(evidence), questions, questionHash: hash(questions), decision: options.parts.decide(input) };
}

export function combineSignals(evidence: Evidence, expected: Stamp, judgment: Judgment, thresholds: Thresholds): DecisionInput {
  const checks = inspectEvidence(evidence, expected);
  return {
    evidenceValid: checks.valid && judgment.evidenceHash === evidenceHash(evidence),
    hardPassed: checks.hardPassed, probabilities: judgment.probabilities,
    repairsUsed: expected.attempt - 1, thresholds,
  };
}

export async function createRun(options: Options, workerMode: Run["workerMode"]): Promise<Run> {
  const runId = randomUUID();
  const directory = options.directory ?? join(".lab-runs", runId);
  await mkdir(directory, { recursive: true });
  return { runId, directory, judgeMode: options.judgeMode, workerMode,
    thresholds: options.thresholds ?? DEFAULT_THRESHOLDS, attempts: [],
    final: { action: "escalate", reasons: ["No verified result"] } };
}
export async function saveRun(run: Run) {
  await writeFile(join(run.directory, "report.json"), JSON.stringify(run, null, 2) + "\n");
  if (run.final.action === "escalate") {
    await writeFile(join(run.directory, "human-review.md"), [
      "# Human review required", "",
      ...run.final.reasons.map(reason => "- " + reason), "",
      "Review report.json and attempt screenshots in this folder.",
      "Do not approve from the screenshot alone: inspect observed facts, candidate revision, source mode, questions, probabilities, and missing checks.",
      "Decide whether to gather new evidence, revise the task, or authorize a new bounded attempt. This run will not resume automatically.",
      "No real enrollment, email, or payment was performed.", "",
    ].join("\n"));
  }
}

export function checkScenario(scenario: Scenario, options: Options): Promise<Run> {
  return checkCandidate(scenario.candidate, options, scenario.fault);
}

export async function checkCandidate(input: Candidate, options: Options, fault?: Scenario["fault"]): Promise<Run> {
  const candidate = candidateSchema.parse(input);
  const run = await createRun(options, "scenario");
  const result = await evaluate(candidate,
    { runId: run.runId, attempt: 1, revision: revisionOf(candidate) },
    { ...options, directory: run.directory }, fault);
  run.attempts.push(result);
  run.final = result.decision;
  await saveRun(run);
  return run;
}

export async function runLoop(worker: Worker, options: Options, workerMode: "scripted" | "live" = "scripted"): Promise<Run> {
  const run = await createRun(options, workerMode);
  let previous: Attempt | undefined;
  // The harness enforces the attempt cap even if a learner's policy always requests repair.
  for (let attempt = 1; attempt <= 2; attempt++) {
    let candidate: Candidate;
    try {
      candidate = candidateSchema.parse(await worker(previous ? {
        previous: previous.candidate, reasons: previous.decision.reasons,
        browserFailures: previous.checks.failures, probabilities: previous.judgment.probabilities,
        observation: previous.evidence.observation,
      } : undefined));
    } catch {
      run.final = { action: "escalate", reasons: ["Worker unavailable or returned invalid candidate; no unvalidated patch applied"] };
      break;
    }
    const result = await evaluate(candidate, { runId: run.runId, attempt, revision: revisionOf(candidate) },
      { ...options, directory: run.directory });
    run.attempts.push(result);
    run.final = result.decision;
    if (result.decision.action !== "repair") break;
    if (attempt === 2) {
      run.final = { action: "escalate", reasons: ["Harness stopped after two attempts (one repair), regardless of policy"] };
      break;
    }
    previous = result;
  }
  await saveRun(run);
  return run;
}
