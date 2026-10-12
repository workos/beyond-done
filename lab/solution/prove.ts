import { expect } from "@playwright/test";
import type { ProofKit } from "../proof.js";

export async function prove({ page, email, check, storage }: ProofKit) {
  const status = page.getByTestId("status");
  const savedEmail = page.getByTestId("email");
  const confirmation = page.getByRole("status");

  check("fresh visitor starts empty", await status.innerText(), "none");

  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByRole("button", { name: "Join waitlist", exact: true }).click();
  await expect(status).toHaveText("waitlisted"); // wait for the page, not a timer
  const promised = await confirmation.innerText();

  await page.reload();
  check("status survives reload", await status.innerText(), "waitlisted",
    "The record vanished on reload. Persist it (localStorage), then re-run: pnpm snack prove");
  check("email survives reload", await savedEmail.innerText(), email,
    "After reload, the saved email is not the one the visitor typed. Persist the address they entered.");
  check("confirmation survives reload", await confirmation.innerText(), promised,
    "The confirmation disappeared or changed after reload. Show it for a saved record too.");
  const saved = Object.values(await storage()).some(value => (value as { email?: string } | null)?.email === email);
  check("record is in localStorage", saved, true,
    "Nothing in localStorage holds the visitor's email. What the page shows is not what was saved.");
}
