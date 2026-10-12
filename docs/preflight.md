# Instructor preflight

Send attendees [lesson 1](../src/content/lessons/01-preflight.md) before the event. Installation and key setup are outside the 60 minutes.

## Rehearse the exact commands

```bash
pnpm install
pnpm exec playwright install chromium
pnpm snack doctor
pnpm lab:exercise --solution
pnpm lab:test
pnpm test
pnpm build
pnpm slides:check
```

Then walk the room's path once on the presentation machine:

```bash
git checkout lab/app/index.html
pnpm snack up                         # headed, own terminal, leave it running
pnpm snack doctor
pnpm snack join ada@example.test
pnpm snack storage                    # {}
pnpm snack reload                     # status: none
pnpm snack prove --solution           # FAIL, exit 1
pnpm snack judge                      # needs TYPESAFE_API_KEY; one billable call
```

- `pnpm dev` serves the materials. `pnpm snack up` serves the attendee app and opens the Chrome window snack drives.
- Verify display size, terminal font, and projected contrast. Zoom the lesson site if needed.
- Don't install Chromium or debug corporate certificates on stage. Pair a stuck attendee after two minutes.

## Rehearse the agent run

Run slide 19's prompt with the agent you'll use on stage, against a clean `lab/app/index.html`. Time it. Confirm it can run `pnpm` and edit files without stopping for approval mid-demo. In rehearsal, Claude Code finished in about 50 seconds. Afterwards: `git checkout lab/app/index.html`.

Also rehearse the final boss: with a PASS receipt, make a one-character edit and run `pnpm snack doctor`. Both `build` and `proof` should report STALE.

## Jev: one check at minute 40

Use a server-side/CLI `TYPESAFE_API_KEY`, with billing and quota checked before class. Don't display `.env`. Attendees may bring their own keys, but the workshop doesn't promise credits.

Confirm the model name and both verdicts: the attendee copy fails, the fixed copy passes. If live mode stalls past the 15-second timeout, say so and judge the screenshot as a human. Never present a rehearsal number as a new judgment.

## Prepare the game

Print or share `public/materials/game-scorecard.md`. Try each bug once: `pnpm snack up --bug <name>` for `memory-only`, `wrong-email`, `lost-confirmation`, `overpromise`, `console-error`, `none`; stopping `up` prints the reveal. Confirm `overpromise` and `console-error` pass `prove --solution` (they're meant to).

Test the slide 6 reload illustration, the slide 8 comparison (three advances, reverse, and both examples), slide 11's six click reveals, slide 19's fallback recording, slide 20's receipt walkthrough, slide 26's reveal, the takeaways on 28–31, and the round timer on slide 24. The timer starts manually, pauses on navigation, and needs no backend. Arrow keys reveal teaching steps; control buttons don't advance the slide.

## Failure plans

| Failure | What you do |
| --- | --- |
| One attendee can't run Chromium | Pair them with someone green; they read the JSON and call the next command. |
| `snack up` says it's already running | Use the running one, or `pnpm snack down` first. |
| `doctor` says STALE | `pnpm snack reload`. |
| The live agent stalls or goes off track | After 90 seconds, click through the fallback recording on slide 19. Say it's a recorded run. |
| Room Wi-Fi or model outage | Everything except `judge` is local. Judge the copy as a human from the screenshot. |
| Jev unexpectedly approves bad copy | Keep it on screen. Read the exact copy and scores; a verifier failure is worth teaching. |
| The exercise runs long | `--solution` on `snack prove` and `lab:exercise`, or copy `lab/solution/prove.ts` after saving. |

## Before public release

The source is hosted privately at [nicknisi/beyond-done](https://github.com/nicknisi/beyond-done). Confirm how attendees will receive access and test that path with an attendee account before class. A working instructor clone doesn't prove attendee access. Don't publish `.env` or `.lab-runs/`. The committed receipts and Jev recording contain only fictional text.

The shipped tests don't prove every Windows/Linux setup. `snack up` defaults to a headed browser; on a Linux machine without a display it falls back to headless. Rehearse on the machine and network used on stage, and time a full learner pass.
