import { createHash } from "node:crypto";
import { z } from "zod";
import type { Page } from "@playwright/test";
import type { NoulQuestion } from "@typesafe-ai/sdk";

export const candidateSchema = z.object({
  storage: z.enum(["memory", "local"]),
  confirmation: z.string().trim().min(1).max(700),
}).strict();
export type Candidate = z.infer<typeof candidateSchema>;
export const observationSchema = z.object({
  initialStatus: z.string(),
  submittedStatus: z.string(),
  reloadedStatus: z.string(),
  submittedEmail: z.string(),
  reloadedEmail: z.string(),
  confirmationBeforeReload: z.string(),
  confirmationAfterReload: z.string(),
}).strict();
export type Observation = z.infer<typeof observationSchema>;
export const probabilitiesSchema = z.object({
  honest: z.number().min(0).max(1),
  nextStep: z.number().min(0).max(1),
}).strict();
export type Probabilities = z.infer<typeof probabilitiesSchema>;
export type Thresholds = { repairBelow: number; acceptAt: number };
export const DEFAULT_THRESHOLDS: Thresholds = { repairBelow: 0.2, acceptAt: 0.9 };
export const TEST_EMAIL = "ada@example.test";
export const CONTRACT = {
  behavior: "A fresh visitor joins the browser-local waitlist. The same email and waitlisted status survive reload.",
  honest: "Both confirmations clearly say the visitor joined a waitlist and has no guaranteed seat; neither contradicts this.",
  nextStep: "Both confirmations explain that the organizer will email IF a place becomes available. No unconditional promise of a seat or email.",
  boundary: "This prototype does not enroll with a real organizer, send email, or charge money.",
};
export type Stamp = { runId: string; attempt: number; revision: string };
export type Evidence = Stamp & {
  loadedRevision: string | null;
  capturedAt: string;
  observation: Observation | null;
  error?: string;
};
export type Judgment = {
  mode: "fixture" | "live";
  evidenceHash: string;
  probabilities: Probabilities | null;
  model?: string;
  raw?: unknown;
  error?: string;
};
export type DecisionInput = {
  evidenceValid: boolean;
  hardPassed: boolean;
  probabilities: Probabilities | null;
  repairsUsed: number;
  thresholds: Thresholds;
};
export type Decision = { action: "accept" | "repair" | "escalate"; reasons: string[] };
export type Questions = { honest: NoulQuestion; nextStep: NoulQuestion };
export type Parts = {
  observe: (page: Page) => Promise<Observation>;
  buildQuestions: () => Questions;
  decide: (input: DecisionInput) => Decision;
};
export const hash = (value: unknown): string =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
export const revisionOf = (candidate: Candidate): string => hash(candidate);
