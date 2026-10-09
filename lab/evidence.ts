import { chromium } from "@playwright/test";
import { startApp } from "./app.js";
import { hash, observationSchema, revisionOf, TEST_EMAIL, type Candidate,
  type Evidence, type Parts, type Stamp } from "./types.js";

export async function collect(candidate: Candidate, stamp: Stamp, observe: Parts["observe"], screenshotPath?: string): Promise<Evidence> {
  const evidence: Evidence = { ...stamp, loadedRevision: null, capturedAt: new Date().toISOString(), observation: null };
  const app = await startApp(candidate);
  try {
    const browser = await chromium.launch();
    try {
      const context = await browser.newContext();
      const page = await context.newPage();
      page.setDefaultTimeout(2500);
      await page.goto(app.url, { waitUntil: "load", timeout: 5000 });
      evidence.loadedRevision = await page.locator("html").getAttribute("data-revision");
      evidence.observation = observationSchema.parse(await observe(page));
      // Bind to what was actually served before AND after the interaction.
      const afterRevision = await page.locator("html").getAttribute("data-revision");
      if (afterRevision !== evidence.loadedRevision || afterRevision !== revisionOf(candidate)) {
        evidence.error = "Loaded candidate changed during evidence collection";
      }
      if (screenshotPath) await page.screenshot({ path: screenshotPath, fullPage: true });
      evidence.capturedAt = new Date().toISOString();
    } finally { await browser.close(); }
  } catch (error) {
    evidence.error = error instanceof Error ? error.message.slice(0, 1200) : "Browser evidence collection failed";
  } finally { await app.close(); }
  return evidence;
}

export function inspectEvidence(evidence: Evidence, expected: Stamp) {
  const parsed = observationSchema.safeParse(evidence.observation);
  const valid = !evidence.error && parsed.success &&
    evidence.runId === expected.runId && evidence.attempt === expected.attempt &&
    evidence.revision === expected.revision && evidence.loadedRevision === expected.revision;
  if (!valid || !parsed.success) return { valid: false, hardPassed: false, failures: ["Evidence missing, invalid, or bound to another attempt/revision"] };
  const o = parsed.data;
  const checks = {
    "Visitor starts unenrolled": o.initialStatus === "none",
    "Submission is waitlisted": o.submittedStatus === "waitlisted",
    "Submitted identity matches": o.submittedEmail === TEST_EMAIL,
    "Waitlist survives reload": o.reloadedStatus === "waitlisted",
    "Same identity survives reload": o.reloadedEmail === TEST_EMAIL,
  };
  const failures = Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name);
  return { valid: true, hardPassed: failures.length === 0, failures };
}
export const evidenceHash = (evidence: Evidence): string => hash(evidence);
