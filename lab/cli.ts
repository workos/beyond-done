import { parseArgs } from "node:util";
import { readFile, writeFile } from "node:fs/promises";
import { loadEnvFile } from "node:process";
import { join } from "node:path";
import { chromium } from "@playwright/test";
import { startApp } from "./app.js";
import { readCandidate } from "./candidate-file.js";
import { scenarios, heldout, scenarioById } from "./fixtures.js";
import { createRun, checkScenario, checkCandidate, runLoop, type Run } from "./engine.js";
import { loadParts } from "./load-parts.js";
import { liveWorker, scriptedWorker } from "./worker.js";
import { metrics, type ScoredCase } from "./metrics.js";
import { DEFAULT_THRESHOLDS } from "./types.js";

try { loadEnvFile(".env"); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    solution: { type: "boolean", default: false },
    scenario: { type: "string", default: "happy" },
    candidate: { type: "string" },
    judge: { type: "string", default: "fixture" },
    worker: { type: "string", default: "scripted" },
    suite: { type: "string", default: "training" },
    "accept-at": { type: "string" },
    "repair-below": { type: "string" },
    stubborn: { type: "boolean", default: false },
  },
});
const command = positionals[0] ?? "help";
const judgeMode = values.judge;
const workerMode = values.worker;
if (judgeMode !== "fixture" && judgeMode !== "live") throw new Error("--judge must be fixture or live");
if (workerMode !== "scripted" && workerMode !== "live") throw new Error("--worker must be scripted or live");
if (values.suite !== "training" && values.suite !== "heldout") throw new Error("--suite must be training or heldout");
if (workerMode === "live" && judgeMode !== "live") throw new Error("Live worker needs --judge live: fixture scores cannot evaluate new generated text.");
const thresholds = {
  repairBelow: values["repair-below"] === undefined ? DEFAULT_THRESHOLDS.repairBelow : Number(values["repair-below"]),
  acceptAt: values["accept-at"] === undefined ? DEFAULT_THRESHOLDS.acceptAt : Number(values["accept-at"]),
};
if (!Number.isFinite(thresholds.repairBelow) || !Number.isFinite(thresholds.acceptAt) ||
  thresholds.repairBelow < 0 || thresholds.repairBelow >= thresholds.acceptAt || thresholds.acceptAt > 1) {
  throw new Error("Thresholds require 0 <= repair-below < accept-at <= 1");
}
const parts = await loadParts(values.solution);
const options = { parts, judgeMode, thresholds } as const;

function summarize(run: Run) {
  for (const attempt of run.attempts) {
    console.log("Attempt", attempt.expected.attempt, "→", attempt.decision.action.toUpperCase(),
      "| browser:", attempt.checks.valid ? (attempt.checks.hardPassed ? "pass" : "fail") : "unknown",
      "| scores:", JSON.stringify(attempt.judgment.probabilities));
    for (const reason of [...attempt.checks.failures, ...attempt.decision.reasons]) console.log("  -", reason);
    if (attempt.evidence.error) console.log("  Collector:", attempt.evidence.error);
    if (attempt.judgment.error) console.log("  Judge:", attempt.judgment.error);
  }
  console.log("Final:", run.final.action.toUpperCase(), "—", run.final.reasons.join("; "));
  console.log("Evidence:", join(run.directory, "report.json"));
  if (run.final.action === "escalate") console.log("Handoff:", join(run.directory, "human-review.md"));
}
try {
  if (values.candidate && !["check", "app"].includes(command)) throw new Error("--candidate is only supported by lab:check and lab:app");
  if (values.candidate && process.argv.some(arg => arg === "--scenario" || arg.startsWith("--scenario="))) throw new Error("Choose either --candidate or --scenario, not both");
  if (values.candidate && command === "check" && judgeMode !== "live") throw new Error("New candidate text requires --judge live. No key? Use lab:app --candidate FILE for peer review; fixture scores cannot judge your changes.");
  if (command === "replay") {
    const recording = JSON.parse(await readFile(new URL("../public/materials/jev-recording.json", import.meta.url), "utf8"));
    console.log(recording.kind + ". " + recording.note);
    for (const capture of recording.captures) console.log(capture.scenario, capture.response.model, capture.response.answers, capture.decision.action);
    console.log("Exact inputs/questions/responses: public/materials/jev-recording.json");
  } else if (command === "doctor") {
    if (Number(process.versions.node.split(".")[0]) < 24) throw new Error("Node 24+ is required");
    const browser = await chromium.launch(); await browser.close();
    const app = await startApp(scenarioById("happy").candidate); await app.close();
    console.log("PASS: Node, Chromium, and localhost listener. Offline lab needs no keys.");
    console.log("Jev key:", process.env.TYPESAFE_API_KEY ? "present (not tested)" : "absent (optional)");
    console.log("Live worker:", process.env.OPENROUTER_API_KEY && process.env.WORKER_MODEL ? "configured (not tested)" : "not configured (optional)");
  } else if (command === "app") {
    const candidate = values.candidate ? await readCandidate(values.candidate) : scenarioById(values.scenario).candidate;
    const app = await startApp(candidate);
    console.log("Browser-local prototype:", app.url, "— candidate:", values.candidate ?? values.scenario, "— Ctrl+C to stop");
    process.once("SIGINT", async () => { await app.close(); });
    process.once("SIGTERM", async () => { await app.close(); });
  } else if (["check", "loop", "eval"].includes(command)) {
    console.log(judgeMode === "fixture"
      ? "SYNTHETIC POLICY FIXTURES — no model called. Editing questions does NOT change these scores."
      : "LIVE JEV — paid external API; fictional confirmation text + task sent to TypeSafe. No silent fallback.");
    console.log(values.solution ? "Using reference solution." : "Using YOUR exercise files.");
    if (command === "loop") console.log("worker: " + workerMode);
    if (command === "check") summarize(values.candidate
      ? await checkCandidate(await readCandidate(values.candidate), options)
      : await checkScenario(scenarioById(values.scenario), options));
    if (command === "loop") summarize(await runLoop(
      workerMode === "live" ? liveWorker() : scriptedWorker(values.stubborn), options, workerMode));
    if (command === "eval") {
      const suite = values.suite === "heldout" ? heldout : scenarios;
      console.log("Single-candidate decisions, NO repairs executed. Suite:", values.suite);
      const group = await createRun(options, "scenario");
      const rows: ScoredCase[] = [];
      for (const scenario of suite) {
        const run = await checkScenario(scenario, { ...options, directory: join(group.directory, scenario.id) });
        rows.push({ id: scenario.id, truth: scenario.truth, action: run.final.action });
      }
      const result = { source: judgeMode, suite: values.suite, thresholds, rows, metrics: metrics(rows) };
      console.table(rows);
      for (const [name, { count, total }] of Object.entries(result.metrics)) {
        console.log(name + ": " + count + "/" + total + (total ? "" : " (n/a)"));
      }
      await writeFile(join(group.directory, "evaluation.json"), JSON.stringify(result, null, 2) + "\n");
      console.log("Report:", join(group.directory, "evaluation.json"));
      console.log("These small teaching sets do not estimate production reliability. Freeze policy before revealing heldout.");
      if (result.metrics.falseAccepts.count || result.metrics.requiredEscalations.count < result.metrics.requiredEscalations.total) process.exitCode = 1;
    }
  } else {
    console.log("Commands: lab:doctor, lab:app, lab:check, lab:loop, lab:eval. See README.md.");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Lab failed");
  process.exitCode = 1;
}
