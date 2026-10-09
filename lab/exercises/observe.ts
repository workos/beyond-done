import type { Page } from "@playwright/test";
import type { Observation } from "../types.js";

// LAB 1: the harness gives you a loaded page in a fresh browser context.
// Use labels/roles. Capture before submit, after submit, and after reload.
// Return all seven fields; a known bad value is different from absent evidence.
export async function observe(_page: Page): Promise<Observation> {
  throw new Error("LAB 1: collect the submit-and-reload observations");
}
