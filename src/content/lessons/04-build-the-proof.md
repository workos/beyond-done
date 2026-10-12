---
title: "Build the proof — write prove()"
description: Write the one function that defines “done” for the waitlist, then read the receipt your agent will act on.
order: 4
duration: "12 minutes (live 18:00–30:00)"
---

> Live segment **18:00–30:00**. The one coding exercise. You turn `pnpm lab:exercise` from red to green.

## Outcome

`prove()` drives a fresh visitor through the real user path, reloads, and records what survived. It passes a correct app and fails each broken one it's responsible for. Run through snack, it produces a receipt with a verdict, a revision, each check, next steps, and a screenshot.

## The file

Edit **`lab/exercises/prove.ts`**. snack calls it with a kit:

| Field | What it is |
| --- | --- |
| `page` | A fresh visitor (no storage) with the app already loaded |
| `email` | `ada@example.test` |
| `check(name, actual, expected, hint?)` | Records one fact. **Never throws.** The hint tells an agent what to fix |
| `storage()` | The app's localStorage, read over CDP |

The scaffold already checks that the visitor starts empty, fills the form, clicks **Join waitlist**, waits for `waitlisted`, and keeps the confirmation text in `promised`.

**Your turn:** reload like a user would, then `check()` four things:

1. Status is still `waitlisted`.
2. The saved email is still the one that was typed.
3. The confirmation is still the same as `promised`.
4. A value in `storage()` holds the email.

## Check your work

```bash
pnpm lab:exercise
```

It runs your proof against a correct app and three broken ones (`memory-only`, `wrong-email`, `lost-confirmation`). **Success:** four ✓ lines and `prove exercise: PASS`. Each ✗ line names the broken app your proof let through and what to check.

Then run it through snack against your running app:

```bash
pnpm snack prove
```

The attendee app is broken, so a finished proof says `FAIL`, with your hints under `next`.

## Hints

- Read values **again** after `page.reload()`. Values from before the reload prove nothing about after.
- Record a missing record with `check()`. Don't use `expect()` after the reload: it throws, and a thrown proof means “can't tell”, not “broken”.
- Compare the confirmation to `promised`, not to an exact string. The copy isn't this check's job.
- No sleeps. Playwright's locators wait for the page.

## The proof bar

1. **Use the user's path.** The form, the button, a reload. Never an internal shortcut.
2. **Check side effects.** What's in storage. What survives the reload.
3. **One run, start to finish.** The trigger and the end state in the same receipt.
4. **Doctor first.** Evidence for the wrong build is no evidence.

## Read the receipt

`pnpm snack prove` prints the receipt, writes it to `.lab-runs/snack/receipt.json`, and appends a copy to `.lab-runs/snack/receipts/` so failures stay in the history:

- `verdict`: `PASS`, `FAIL`, or `ERROR`.
- `revision`: a fingerprint of the exact code that was served. The proof belongs to that code only.
- `checks`: each fact, expected and actual.
- `next`: what to do. Your hints show up here.
- `pageErrors`: anything that threw in the page, even if no check failed.
- `screenshot`: the page at the end of the run.

Exit codes: **0** PASS · **1** FAIL, fix the app · **2** can't tell, fix the setup. “Can't tell” never becomes a pass, and it's never a reason to change the app.

## Catch-up

Save your file, then `cp lab/solution/prove.ts lab/exercises/prove.ts`, or add `--solution` to `snack prove` and `lab:exercise`.

## Stretch

The receipt lists `pageErrors` but no check fails on them. Should one? You'll find out in lesson 6.
