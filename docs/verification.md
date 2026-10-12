# Verification record

Checked locally on 2026-10-12 after the slide 11+ rework (`pi/verification-lever`), rebased onto main with #14 integrated. This records what was exercised, not a production reliability claim.

## Automated checks

- `pnpm lab:test`: **11 passed**. Covers every game bug applying exactly once and changing the revision; the reference proof's verdict per bug (PASS on the correct app, FAIL on `memory-only`, `wrong-email`, `lost-confirmation`, PASS on `overpromise` and `console-error` with the page error recorded); the shipped attendee app failing; a throwing or empty proof becoming ERROR; judge verdict mapping and failure handling with a fake HTTP transport; the snack CLI end to end in headless Chromium (`up`, `doctor`, `join`, `storage`, `reload`, `console`, `prove` and its appended receipt history, an unknown command, `down`); lesson timings summing to 60; and the Jev recording using the same questions as `snack judge`.
- `pnpm test`: **35 passed**.
- `pnpm build`: **passed**, including Astro and TypeScript checks for `lab/`.
- `pnpm slides:check`: **passed for all 34 slides** at initial and fully revealed states, plus #14's checks (the CTX walkthrough's links, images and overlays; the receipt walkthrough forward and back on the snack receipts; the four takeaways forward, back and in reduced motion), the comparison clocks and modes, portraits, incident recovery, QR, reload reveal, the agent-run fallback reveals, the game reveal, the 120-second timer, and reduced motion. Visual samples: `.lab-runs/deck-review/`. The first run after a config change timed out on a cold dev server; the rerun passed.
- `pnpm lab:exercise --solution`: PASS. `pnpm lab:exercise` on the unfinished scaffold: the correct app passes and the three broken apps are reported as let through, as intended.

The earlier glossary assertions in `lab/content.test.ts` (an exact term count and six quiz questions) were already failing on main after the glossary refresh; they now check that the glossary parses with terms and questions.

## Manual CLI checks

Against a headless and a headed session: `doctor` before and after `up`; `join`, `storage` (empty on the attendee app), `reload` (status `none`), `snapshot` with the accessibility tree, `console`, `network`, `screenshot`, `eval`, `reset --dry-run`, `prove` (scaffold PASS, `--solution` FAIL with hints), `down`. A source edit made `doctor` report the page and the receipt as STALE. `--bug console-error` showed `track is not defined` in `console --errors` and in the receipt's `pageErrors` while `prove` passed. Stopping a game session printed the reveal.

## Real agent run

Claude Code (`claude -p`, allowed tools: Bash for `pnpm`, Read, Edit) with slide 19's prompt against a clean attendee app and a running `snack up`: 12 turns, about 50 seconds, $0.33. It ran `doctor`, reproduced with `join` / `storage` / `reload` / `snapshot`, edited `lab/app/index.html` to persist to localStorage and to rewrite the copy (it cited the map's contract), noticed the exercise proof was unfinished, ran `prove --solution` (PASS, revision `4e8c43d6bc1e`), and opened the screenshot. Receipts and the fixed file: `public/materials/snack-receipts/`.

## Real Jev calls

Three `pnpm snack judge` calls with jev-1.13.0, fictional copy only:

| App | honest / nextStep | Verdict |
| --- | --- | --- |
| Attendee app as shipped (confirmation empty after reload) | 0.01 / 0.01 | FAIL |
| `--bug overpromise` (persists; “Your seat is confirmed”) | 0.01 / 0.02 | FAIL |
| The agent-fixed app | 0.98 / 0.98 | PASS |

Three calls don't establish calibration or availability.

## Not verified

- Codex, Cursor, and pi against the skill (only Claude Code was run).
- Windows, and Linux with a display.
- The deployed site. Nothing was deployed.
- The glossary. `generated/glossary.json` still describes the old exercises and slide numbers; it needs `pnpm glossary` and a review.
- #14's external links in Lesson 07, the worksheet and take-home.md weren't re-checked. Their content was kept; only old-lab commands and receipt fields were changed to snack.
