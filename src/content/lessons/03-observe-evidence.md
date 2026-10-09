---
title: "Browser evidence — write observe()"
description: Drive the real UI with Playwright and capture what actually happened, before and after reload.
order: 3
duration: "11 minutes (live 10:00–21:00)"
---

> Live segment **10:00–21:00**. First code edit. You turn
> `pnpm lab:exercise browser` from red to green.

## Outcome

`observe()` collects **independent evidence** from the running UI — the status
and email before and after reload, plus the confirmation text before and after
reload — using Playwright's auto-waiting assertions (no `sleep`s).

## The idea

The worker's claim ("done") is irrelevant here. We open a fresh browser
context, perform the user's actions, and **record what the UI actually shows**.
That record becomes the evidence every later step is tied to. Evidence is
collected independently and bound to the loaded content revision — it is not the
screenshot and not the worker's word.

## The file

Edit **`lab/exercises/observe.ts`** and implement:

```ts
export async function observe(page: Page): Promise<Observation>
```

The `page` is already loaded in a fresh context. `Observation` is all strings:

```ts
{
  initialStatus, submittedStatus, reloadedStatus,
  submittedEmail, reloadedEmail,
  confirmationBeforeReload, confirmationAfterReload
}
```

### UI contract (use exactly these)

- Email field: `page.getByLabel('Email', { exact: true })`
- Submit button: `page.getByRole('button', { name: 'Join waitlist', exact: true })`
- Status value: `page.getByTestId('status')` — strings are `none` or `waitlisted`
- Email value: `page.getByTestId('email')`
- Confirmation message: `page.getByRole('status')`

### What to do

1. Read the **initial** status (expect `none`).
2. Fill `Email` with `ada@example.test`, click **Join waitlist**.
3. Read the **submitted** status and email, and the confirmation message —
   this is `confirmationBeforeReload`.
4. `await page.reload()`.
5. Read the **reloaded** status and email, and the confirmation message again —
   this is `confirmationAfterReload`.

Import `expect` from `@playwright/test`. Use assertions (e.g. `await expect(locator).toHaveText(...)`) to wait
for readiness. **No fixed `sleep`s** — they flake and prove nothing.

## Run it

```bash
pnpm lab:exercise browser
```

### Expected observation

Before you edit, the starter fails closed (intentionally red). When `observe()`
is correct against the default app, the check passes. Representative output:

```
browser exercise: PASS
```

> **Memory-only is an observed failure, not a bug in your code.** If the app is
> built with `storage: 'memory'`, the record will *not* survive reload and
> `reloadedStatus` will come back `none`. That is a real finding your evidence
> should faithfully report — it is not an infrastructure error.

Confirm the reference behaves too:

```bash
pnpm lab:exercise browser --solution
```

The focused exercise check does not save a run. To inspect a saved packet, run `pnpm lab:check --scenario happy`; look under the printed `.lab-runs/<id>/` path. Your unfinished policy may still escalate. Screenshots **supplement** observations; they are never the proof on their own.

## Progressive hints

1. Start from the top of the function and follow the five steps literally —
   initial, submit, read, reload, read again.
2. Capture confirmation by reading `getByRole('status')` **twice**: once right
   after submit, once right after reload. Don't reuse the first value.
3. To wait for the post-submit UI without a sleep, assert on the thing you
   expect, e.g. `await expect(page.getByTestId('status')).toHaveText('waitlisted')`,
   then read the text you need.
4. Read a locator's text with `await locator.textContent()` (or
   `innerText()`); trim it before returning.
5. Still stuck? Compare your structure to `lab/solution/observe.ts`.

## Catch-up (preserves your edits)

If you're behind, **save your work first**, then copy the reference into place:

```bash
cp lab/solution/observe.ts lab/exercises/observe.ts
```

Or skip editing entirely without overwriting your file by adding `--solution`
to the commands. There is no reset command — your file is yours until you copy
over it.

## Discuss

- Why collect evidence in a **fresh context** instead of reusing the page the
  worker left behind?
- A screenshot shows pixels. Why isn't that enough to grade on?

## Stretch (optional)

Add a second observation that submits a malformed email and records whether the
UI rejects it. (Keep the required `Observation` fields unchanged so the grader
still passes.)
