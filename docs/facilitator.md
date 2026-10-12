# Facilitator run-of-show

**Beyond “Done”: Building Verification Loops for AI Agents**<br>
Nick Nisi & Zack Proser · AIE · JS/TS developers · **60 minutes**

## The promise

One app, one lever, one proof. Attendees use `pnpm snack`, a small CLI that drives the waitlist over the Chrome DevTools Protocol. They write the `prove()` that defines “done,” then hand the lever to their own coding agent and watch it **observe, fix, and prove** instead of saying “done.”

It isn't an agent-framework tutorial. The CLI gathers evidence, the proof decides what “done” means, and the receipt is the record.

Prepare with [preflight.md](preflight.md). Before the talk, start `pnpm snack up` (headed) in a visible terminal and leave it running for the whole hour. Keep the lesson site in a separate tab. Use large terminal text. WorkOS assets and both presenter portraits are bundled; no remote fonts or images are needed.

## Co-host rhythm

The shared intro is slide 3. Each instructor gets about 15 seconds: name and one real reason you care about supervising agent work, not a résumé. Suggested split: Nick plays the overconfident worker and drives the first browser demo; Zack calls the audience vote and watches for blocked pairs. Swap driver and room-reader at the agent run (slide 19). During the game, one keeps time and the other walks the room. Confirm these in rehearsal.

The deck has 34 slides. Slides 1–10 are the opening (incident, intros, repo QR, vote, live failure, Lauren Tan's quote, the two-afternoons comparison, Riker and the CTX walkthrough, glossary QR). Slides 11–27 build the right-hand lane from slide 8: the gap, the lever, the proof, the agent and its receipt, the game, and the final boss. Slides 28–31 are the four animated takeaways (a tool for your app, browser instruments, receipt history, verifier examples with the transfer exercise); 32–34 are the close, Q&A, and Booth 6.

The comparison on slide 8 takes 40 seconds: three advances contrast guessing with a repeatable check. Its clocks are invented illustrations, not benchmark data. The optional Slow UI mode shows a schematic DevTools trace.

The primary opening demo is the real attendee app in the browser `snack up` opened; slide 6 has a labelled illustration as fallback. Read [the opening script and primary sources](opening.md) before rehearsal. Advance through deletion AND recovery on slide 2. Don't imply our exercise would have prevented that incident.

## Timing and stage cues

| Clock | Slides | Your cue / visible checkpoint |
| --- | --- | --- |
| 0–0:45 | 2 | PocketOS founder excerpt, deletion animation, Railway recovery. Keep attribution visible. |
| 0:45–2:30 | 3–5 | Intros, repo QR so latecomers can clone, then “Ship it or hold it?” on the staged worker claim. |
| 2:30–4:30 | 6 | Submit and reload the real app. The record is gone. Let people notice the “seat is confirmed” copy, but don't dwell on it. |
| 4:30–5:30 | 7–8 | Credit Lauren Tan; three advances on the comparison. |
| 5:30–6 | 9 | Riker and CTX: one sentence each on how your tool treats a worker's “done.” |
| 6–7 | 10 | Glossary QR. `pnpm snack doctor`; pair anyone stuck. |
| 7–9 | 11 | “What do *you* do to check?” Click each line as the room calls it out. Last click: the agent has none of this. |
| 9–10 | 12 | Paragraph vs. lever. |
| 10–12 | 13 | Meet snack: the four groups and the agent-friendly rules. |
| 12–18 | 14 | Everyone drives it: `up`, `doctor`, `join`, `storage`, `reload`, `snapshot`. Reveal the empty storage. |
| 18–27 | 15 | Explain `prove()` (2 min), build (6), checkpoint (1). `pnpm lab:exercise` until PASS. |
| 27–28 | 16 | The proof bar. Plant “doctor first” for the final boss. |
| 28–30 | 17 | The receipt and the three exit codes. Have people run `pnpm snack prove`. |
| 30–34 | 18 | The feature map; attendees add two gotchas. Point at `lab/verify/SKILL.md`. |
| 34–40 | 19 | Live agent run with the three-sentence prompt. Fallback recording after 90 seconds. |
| 40–41 | 20 | Open the receipt: bind → observe → decide → append, on the real FAIL → PASS pair. Failed attempts stay in the history. |
| 41–43:30 | 21 | It persists, it also lies. `pnpm snack judge` live. Fix the copy; prove and judge again. |
| 43:30–44 | 22 | When to stop. |
| 44–45 | 23 | Pair up: Saboteur vs. Detective. |
| 45–50 | 24 | Two 2-minute rounds with the timer; swap roles between them. |
| 50–51:30 | 25 | Score it. Fish for who said “it works” and was wrong. |
| 51:30–53:30 | 26 | The reveal: overpromise and console-error got past `prove`. Every miss becomes a new line. |
| 53:30–55 | 27 | Final boss, live: a one-character edit, then `pnpm snack doctor` shows STALE. |
| 55–56:30 | 28–30 | Takeaways: a tool for your app (30s), browser instruments (30s), receipt history → evals → optional dataset (30–45s). Use the click cues; deeper setup stays in Lesson 07. |
| 56:30–58:45 | 31 | Verifier examples, then protect two minutes: one feature, check command, saved receipt, stop condition. |
| 58:45–60 | 32 | Close: Observe. Fix. Prove. Hear one example. |
| 60+ | 33–34 | Q&A with both QR codes up, then the Booth 6 invite. |

Hard stops: **18, 30, 44, 55**. Preflight is not charged against the hour. Protect the agent run and the transfer exercise; cut the second game round before either.

## Before you go on

```bash
git checkout lab/app/index.html          # the attendee app, broken as shipped
pnpm snack up                             # headed; leave this terminal visible
pnpm snack doctor                         # ok: true
```

Have the agent you'll use for slide 19 open in another terminal at the repo root, with permission to run `pnpm` and edit files. If you want `snack judge` live, `TYPESAFE_API_KEY` must be in `.env` or the shell.

## The agent run (slide 19)

Paste exactly:

```text
Read lab/verify/SKILL.md. Reproduce the reload bug in the waitlist with snack.
If it reproduces, fix it, and show me the receipt and the screenshot as proof.
```

In rehearsal, Claude Code took about 50 seconds and 12 turns. It ran `doctor`, reproduced with `join` / `storage` / `reload`, edited `lab/app/index.html` (persistence **and** the copy, because the map lists what done means), noticed the unfinished exercise proof was too weak, ran `prove --solution` (PASS, revision `4e8c43d6bc1e`), and opened the screenshot. The slide's fallback recording is that run. The receipts are in `public/materials/snack-receipts/`, with the fixed file beside them.

If your live agent also fixes the copy, say so on slide 21: it caught it by reading the map and the screenshot; `prove` alone passed it. The judge numbers on slide 21 come from `pnpm snack up --bug overpromise` (a working app with only the copy bug).

If an attendee's agent says PASS without fixing anything, their `prove.ts` is unfinished. That's the lesson, not a failure: “a weak proof calls a broken app done.”

## The judge (slide 21)

```bash
pnpm snack judge
```

One billable request. Rehearsal (jev-1.13.0): the overpromise copy with persistence working scored honest 0.01 / next step 0.02 (FAIL); the agent-fixed copy scored 0.98 / 0.98 (PASS). Narrate: **“The judge reports support for one narrow question. The verdict thresholds are code.”** No key or no network: judge as a human from the screenshot. Never present a recorded number as a new judgment.

## The game (slides 23–27)

Use [lesson 6](../src/content/lessons/06-break-it-quietly.md) and the [paper scorecard](../public/materials/game-scorecard.md).

1. Saboteur stops their `up` (Ctrl+C) and starts `pnpm snack up --bug NAME` while the detective looks away. `--bug random` works solo.
2. Detective uses snack only, no reading files. Writes down the answer and the output that proves it.
3. Saboteur stops `up`; it prints `{"reveal": "…"}`. Swap.

The bug is injected by the server into the reference app at load time, so it isn't in any file and every pair plays the same game. Two of the five bugs pass the reference proof on purpose: `overpromise` (only the screenshot or `judge` sees it) and `console-error` (it's in the receipt's `pageErrors`, but no check fails on it). That's the point of slide 26.

Points: named with output **+2**; “it works” and it did **+2**; “it works” and it didn't **−3**; blamed a bug that wasn't there **−1**; right bug without evidence **0**. Bragging rights only. Keep it about the system; never make an attendee the joke.

The timer on slide 24 starts only on a button press. Leaving the slide pauses it. No sound.

## The final boss (slide 27)

You need a passing receipt first: the agent run gives you one. Then make a one-character edit to `lab/app/index.html` (a space in the `<title>` works) and run `pnpm snack doctor`. Both `build` and `proof` report STALE. After the slide, `git checkout lab/app/index.html` resets the app, including the agent's fix.

## If ten minutes disappear

- On slide 14, drive it yourself on screen and have the room predict instead of typing.
- Shorten the build on slide 15 to four minutes and point stragglers at `--solution`.
- Keep the agent run. Use the fallback recording if the live run is slow.
- Play one game round, not two.
- Protect the final transfer exercise.

If thirty minutes disappear, this is no longer the promised hands-on workshop: switch to a demonstration and offer the full materials afterward.

## Takeaway cues

Slides 28–30 connect the finished lab to attendees' own work. Keep them to about 1 minute 30 seconds, then protect the two-minute exercise on slide 31. If behind, leave these diagrams as take-home reference and go straight to slide 31.

- **A tool for your app (28):** our actual CLI and a real saved receipt, applying Lauren Tan's pstack ideas. Its source link is the on-screen credit. No extra installation during class.
- **Browser instruments (29):** the trace is a schematic; don't call it a measured speedup. The Chrome DevTools MCP setup and first prompt live in Lesson 07.
- **Receipt history (30):** three real snack receipts provide the cards (the reload failure, the agent's fix, the game's console-error miss). The improvement loop and possible training dataset are a next step, not something this lab implements. Nick and Zack arrived at receipts independently in Riker and CTX.

## Questions to listen for

- “Why a CLI and not an MCP server?” Either works. A CLI is cheap to build and test, composes with the shell, and every agent already runs commands.
- “Isn't `prove` just a Playwright test?” Yes. The difference is the agent can run it on demand and read a receipt with next steps, plus the Look commands for debugging.
- “Can the agent edit the proof?” In this repo it has a shell, so yes; the skill tells it not to. Real isolation (a separate checkout, a read-only verifier) is a separate problem.
- “What about non-web apps?” Same shape, different wire: the simulator for iOS, a PTY for CLIs, HTTP for services.
- “Does a passing browser proof prove the backend?” No; this app has none. Add server-side checks to `prove` when that's your requirement.
- “Is Jev required?” No. It's one narrow check for meaning; without it, a human reads the screenshot.

## Closing handoff

[Transfer worksheet](../public/materials/transfer-worksheet.md), [take-home reference](take-home.md), and the code stay with attendees. The source repository is [nicknisi/beyond-done](https://github.com/nicknisi/beyond-done), currently private. Confirm attendee access before sharing it.
