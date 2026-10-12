# Instructor preflight

Send attendees [lesson 1](../src/content/lessons/01-preflight.md) before the event. Installation and key setup are outside the 60 minutes.

## Rehearse the exact commands

```bash
pnpm install
pnpm exec playwright install chromium
pnpm lab:doctor
pnpm lab:test
pnpm test
pnpm build
pnpm slides:check
pnpm lab:loop --solution
pnpm lab:loop --solution --stubborn
pnpm lab:replay
```

- `pnpm dev` serves materials. `pnpm lab:app --scenario memory-only` serves the demo app.
- Close prior demo tabs and use a fresh private window. Automated checks create fresh contexts themselves.
- Verify display size, terminal font, and projected contrast. Zoom the lesson site if needed.
- Don't install Chromium or debug corporate certificates on stage. Pair a stuck attendee after two minutes.

## Jev: core demonstration at minute 28

Use a server-side/CLI `TYPESAFE_API_KEY`, with billing/quota checked before class. Do not display `.env`. Attendees may bring their own keys, but the workshop does not promise credits.

Run happy, overpromise, and injection with `--solution --judge live`. Confirm source mode, actual model name, scores, and latency. Store your own resulting reports for rehearsal. The included recording is a fallback, not an evergreen promise about the model.

If live mode stalls, stop at the 15-second request timeout and use `pnpm lab:replay`. Say **“recorded response; this does not evaluate your changes.”** Do not switch to synthetic scores and claim the questions worked.

The optional real worker needs `OPENROUTER_API_KEY` and `WORKER_MODEL`; leave it out of the required hour.

## Prepare the two-host game

Nick and Zack share the intro slide. Confirm the supplied existing portraits are the ones you want to use. Rehearse the driver/room-reader handoff; suggested roles are in the facilitator guide.

Print or share `public/materials/bouncer-scorecard.md`. Test both `lab/challenges/*.json` starters and the `--candidate` CLI route. Budget no more than two live calls per pair. Without attendee keys, use human peer review for the room and one selected live example on the projector.

Test the slide 6 reload illustration, slide 8 verification comparison (three advances, reverse, and both examples), slide 23 click-driven loop + stubborn toggle, and both Bouncer vs. Bluffer round timers. Timers start manually, pause on navigation, and require no backend. Arrow keys reveal teaching steps; control buttons do not advance the slide. The staged illustrations are not live model calls.

## Failure plans

| Failure | What you do |
| --- | --- |
| One attendee cannot run Chromium | Pair them with someone green; they become evidence reader/attacker. |
| Room Wi-Fi or model outage | Continue local browser/policy work; replay captured Jev comparison. |
| Jev unexpectedly approves bad copy | Keep it on screen. Read exact input, score, and criteria; it is a verifier failure worth teaching. |
| SDK/model name changed | Fix and rehearse before class; freeze the lockfile and record actual model name. |
| Exercise runs long | Offer one-file catch-up or `--solution`; preserve edits. |
| Threshold demo exits 1 | Expected when it admits a bad case; point to the false-accept row. |

## Before public release

The source is hosted privately at [nicknisi/beyond-done](https://github.com/nicknisi/beyond-done); clone it with `gh repo clone nicknisi/beyond-done` after confirming GitHub access. Confirm how attendees will receive access or an agreed source bundle, and test that path with an attendee account before class. A working instructor clone does not prove attendee access. Agree the event details and deployment destination with Nick; `class.config.json` still has a placeholder hostname. Do not publish `.env`, private examples, or `.lab-runs/`. The public Jev recording contains only fictional task text and responses.

The shipped tests do not prove every Windows/Linux setup or any production deployment. Rehearse on the same machine/network used on stage and time a full learner pass.
