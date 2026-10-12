import { expect } from "@playwright/test";
import type { ProofKit } from "../proof.js";

// BUILD (lesson 4): prove the waitlist works for a real visitor.
// You get a fresh visitor with the app loaded. Record facts with check().
// A missing record is a finding, not a crash: check it, don't throw.
export async function prove({ page, email, check, storage }: ProofKit) {
  const status = page.getByTestId("status");
  const savedEmail = page.getByTestId("email");
  const confirmation = page.getByRole("status");

  check("fresh visitor starts empty", await status.innerText(), "none");

  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Join waitlist", exact: true }).click();
  await expect(status).toHaveText("waitlisted"); // wait for the page, not a timer
  const promised = await confirmation.innerText();

  // Your turn. Reload like a user would, then check what survived:
  //   1. status       → still "waitlisted"?
  //   2. savedEmail   → still the email that was typed?
  //   3. confirmation → still the same message as `promised`?
  //   4. storage()    → does a saved value hold the email?
  // Give each check a hint that tells an agent what to fix.
  void [savedEmail, promised, storage];
}
