# Workshop implementation contract

This is the build-time coordination reference. The README and lessons are the attendee entry points.

## Audience, identity, scope

JS/TS developers; no Playwright experience assumed. AIE, Nick Nisi & Zack Proser. WorkOS logo and branding, explicitly requested. Repository [workos/beyond-done](https://github.com/workos/beyond-done), currently private.

## The task

Fictional **Midnight Snack Lab**, a sold-out conference workshop with a **browser-local waitlist** at `lab/app/index.html`. Done means: the same email and status after reload; the confirmation says waitlist only, no guaranteed seat; it promises an email only if a place opens. The shipped app breaks the first (memory-only) and the second and third (“Your seat is confirmed”). `lab/solution/app/index.html` is the fixed reference. No real registration, email, or payment.

## The lever

`pnpm snack` (`lab/snack.ts`) is an app-specific CLI over the Chrome DevTools Protocol, modelled on pstack-style verification skills: tools over markdown, JSON out, errors with a `next` step, `help` everywhere, `doctor` first, `--dry-run` for destructive commands.

- `up` serves the app (re-read from disk on every request) and launches Chromium via `launchPersistentContext` with `--remote-debugging-port`. It records console, page errors, responses, and loads to `events.jsonl` and writes `session.json`. Other commands `connectOverCDP`, act on the first app page, and disconnect. `SNACK_DIR` relocates session files.
- Every served page carries `<meta name="snack-revision">`: the first 12 hex digits of the SHA-256 of the served HTML. `/__snack/revision` reports the current source revision. `doctor` compares the two (STALE: reload) and compares the last receipt's revision with the source (STALE: re-prove).
- `--bug NAME|random` serves the reference app with one string transform applied server-side (`lab/server.ts`): `memory-only`, `wrong-email`, `lost-confirmation`, `overpromise`, `console-error`, or `none`. Stopping `up` prints `{"reveal": …}`. Each transform must match the reference exactly once; tests enforce it.
- `prove` calls `prove(kit)` from `lab/exercises/prove.ts` (or `lab/solution/prove.ts` with `--solution`) in a fresh browser context. `kit = { page, email, check(name, actual, expected, hint?), storage() }`. `check` records and never throws; `storage()` reads localStorage over CDP (`DOMStorage.getDOMStorageItems`). The harness (`lab/proof.ts`) records page errors, the revision before and after, and a screenshot, then writes `receipt.json` (latest) and appends a copy under `receipts/`: `verdict` (PASS / FAIL / ERROR), `revision`, `app`, `at`, `checks`, `pageErrors`, `screenshot`, `next`. Exit 0 / 1 / 2. A thrown proof, no checks, or a revision change mid-run is ERROR, never PASS.
- `judge` runs its own fresh join → reload journey and asks Jev two `noul()` questions (unchanged from the earlier `questions.ts` reference) in one `systemOne()` request: both ≥ 0.9 PASS, either ≤ 0.2 FAIL, otherwise ASK A HUMAN. No key, a failed request, or an invalid probability exits 2 with no score.

## Learners edit

- `lab/exercises/prove.ts`: after the scaffold's join, reload and check status, saved email, confirmation (against `promised`), and that a storage value holds the email. `pnpm lab:exercise` runs it against the reference app (must PASS) and `memory-only`, `wrong-email`, `lost-confirmation` (must FAIL). The reference proof intentionally passes `overpromise` and `console-error`; the game's reveal depends on it.
- `lab/verify/features/waitlist.md`: two more gotchas.

Their own coding agent edits `lab/app/index.html`, guided by `lab/verify/SKILL.md`. Reset with `git checkout lab/app/index.html`.

## Exactly 60 minutes

0–10 hook, live failure, what you'd check, lever vs. paragraph; 10–18 drive with snack; 18–30 write `prove()` and read the receipt; 30–44 feature map, agent run, judge, stop rule; 44–55 saboteur vs. detective, reveal, stale-receipt boss; 55–60 transfer. Lesson durations sum to 60 (enforced by `lab/content.test.ts`). Preflight is outside the hour.

## Checks

- `pnpm lab:test`: bug transforms, revisions, reference proof verdicts per bug, the shipped app failing, ERROR paths, judge mapping with a fake transport, and the CLI end to end in headless Chromium (`up`, `doctor`, `join`, `storage`, `reload`, `console`, `prove`, unknown command, `down`).
- `pnpm test`, `pnpm build`, `pnpm slides:check`.

## Concepts to keep precise

A receipt belongs to one revision. “Can't tell” (exit 2) is not a product failure and never becomes a pass. `prove` covers only what it checks; the screenshot and judge exist for claims that aren't assertions. A Noul is the probability of yes, not proof. The revision hash is local provenance, not isolation from a shell-capable agent. One app and five bugs establish nothing about production reliability.
