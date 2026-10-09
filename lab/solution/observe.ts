import { expect, type Page } from "@playwright/test";
import type { Observation } from "../types.js";

export async function observe(page: Page): Promise<Observation> {
  const status = page.getByTestId("status");
  const email = page.getByTestId("email");
  const confirmation = page.getByRole("status");
  const initialStatus = await status.innerText();
  await page.getByLabel("Email", { exact: true }).fill("ada@example.test");
  await page.getByRole("button", { name: "Join waitlist", exact: true }).click();
  // Wait for the interaction to finish, not for a fixed number of milliseconds.
  await expect(status).toHaveText("waitlisted");
  const submittedStatus = await status.innerText();
  const submittedEmail = await email.innerText();
  const confirmationBeforeReload = await confirmation.innerText();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Midnight Snack Lab", exact: true })).toBeVisible();
  return {
    initialStatus, submittedStatus, submittedEmail, confirmationBeforeReload,
    reloadedStatus: await status.innerText(),
    reloadedEmail: await email.innerText(),
    confirmationAfterReload: await confirmation.innerText(),
  };
}
