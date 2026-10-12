---
name: verify-snack
description: Drive and prove the Midnight Snack Lab waitlist (lab/app/index.html) in a real Chrome over CDP with the snack CLI. Use to reproduce a waitlist bug, verify a change to lab/app, or show proof that it works.
---

# Verify the waitlist

`pnpm snack` drives the real app in a real Chrome through the DevTools protocol. Commands print JSON on stdout; errors say what to do next. `pnpm snack help` lists every command.

## The loop

1. **Doctor.** Run `pnpm snack doctor`. Done when `ok` is true. No app running: start one and leave it running with `pnpm snack up` (in the background if no human is watching). Build STALE: `pnpm snack reload`.
2. **Read the map.** Open [features/waitlist.md](features/waitlist.md): what exists, how a user reaches it, how to drive it, the contract, and what usually lies.
3. **Reproduce.** Drive the user path (`join`, `reload`) and look (`snapshot`, `storage`, `console`). Done when you can name the observation that breaks the contract, such as "status is none after reload; storage is empty".
4. **Fix** `lab/app/index.html`. The app reads the file on every load; `pnpm snack reload` shows your edit.
5. **Prove.** Run `pnpm snack prove` (`--solution` uses the reference proof). Done when the verdict is PASS for the current revision. FAIL lists what to fix. Exit 2 means the evidence is missing, so fix the environment, not the app.
6. **Read the screenshot** named in the receipt. The checks cover only what they check. When the copy might break the contract, run `pnpm snack judge` (needs `TYPESAFE_API_KEY`) or show a human.
7. **Report** the receipt: verdict, revision, checks, screenshot path, and judge result if any.

## Proof bar

- Exercise the user path: the form, the button, a reload. Use `eval` only to read state after the path ran.
- Check side effects as well as pixels: what is in storage, and what survives a reload.
- Evidence belongs to one revision. After any edit, the old receipt proves nothing; `doctor` reports it as STALE.
- The proof files (`lab/exercises/prove.ts`, `lab/solution/prove.ts`, `lab/proof.ts`) and the map define done. If one looks wrong, report it and stop; the fix belongs in the app.

## When to stop

- PASS for the current revision, screenshot read, copy honest: done. Report the receipt.
- The same check still fails after two fixes: stop and hand a human the receipt and what you tried.
- `doctor` red or `prove` exit 2: fix the environment or ask. Missing evidence is "can't tell", never "probably fine".
- `judge` says ASK A HUMAN: show a human the screenshot and the contract.

When you're finished, leave `up` running if a human started it; stop only what you started (`pnpm snack down`). Receipts and screenshots stay in `.lab-runs/snack/`.
