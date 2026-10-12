# Facilitator run-of-show

**Beyond “Done”: Building Verification Loops for AI Agents**<br>
Nick Nisi & Zack Proser · AIE · JS/TS developers · **60 minutes**

## The promise

Three small edits, one witnessed repair, and a portable way to answer:
**What did we observe? What did we infer? Why did we stop?**

Not an agent-framework tutorial. The worker proposes a tiny app configuration.
Playwright gathers evidence, Jev judges meaning, and code owns the decision.

Prepare with [preflight.md](preflight.md). Keep the lesson site and demo app in separate tabs. Use large terminal text. WorkOS assets and both presenter portraits are bundled; no remote fonts/images are needed.

## Co-host rhythm

The shared intro is slide 3. Each instructor gets about 15 seconds: name and one real reason you care about supervising agent work, not a résumé. Suggested split: Nick plays the overconfident worker and drives the first browser demo; Zack calls the audience vote and watches for blocked pairs. Swap driver/room-reader for the Jev segment or policy exercise. During the game, one keeps time and the other collects one useful counterexample. These are suggestions to confirm in rehearsal, not invented job descriptions.

The deck has 40 slides within the same 60-minute schedule: a title slide, then an incident animation, the repo QR right after the intros, a glossary QR handoff, actual saved evidence, a 30-second look at the hosts' own tools (Riker and CTX), a short architecture bridge, three animated takeaways (app CLI, browser traces, run history), a closing Q&A slide, and a Booth 6 invite to leave up as people pack up.

The verification comparison on slide 8 takes 40 seconds inside the opening: three advances contrast guessing with a repeatable check. Its clocks are invented illustrations, not benchmark data. The optional Slow UI mode shows a schematic DevTools trace; it is not part of the lab.

The primary opening demo is the real memory-only app; slide 6 has a labelled illustration as fallback. Read [the opening script and primary sources](opening.md) before rehearsal. Advance through deletion AND recovery on slide 2. Do not imply our exercise would have prevented that incident.

## Timing and stage cues

| Clock | Mode | Your cue / visible checkpoint |
| --- | --- | --- |
| 0–0:45 | Real incident | PocketOS founder excerpt, deletion animation, Railway recovery. Keep attribution visible. |
| 0:45–2:30 | Intro + repo + vote | Nick + Zack, then the repo QR on slide 4 so latecomers can clone, then “Ship it or hold it?” Vote on the staged worker claim. |
| 2:30–4:30 | Live failure | Submit and reload the actual memory-only app. Show the lost record. |
| 4:30–5:30 | Thesis + comparison | Credit Lauren Tan, then three advances on slide 8: guesses multiply, evidence narrows the repair, and the verified clock stops. |
| 5:30–6 | Our tools | Riker (Nick) and CTX (Zack): one sentence each on how your tool treats a worker's “done.” |
| 6–7 | Glossary + smoke test | Glossary QR on slide 10 (repo QR was slide 4). README → lessons → exercises. `pnpm lab:doctor`; pair anyone stuck. |
| 7–10 | Contract | Same identity after reload; honest waitlist/no seat; conditional email. Explain browser-local boundary and three editable files. |
| 10–13 | Explain | Role/label locators, fresh context, explicit transition, observation versus assumption. |
| 13–19 | Build | Attendees write `observe()`. Offer hints, not the whole solution first. |
| 19–21 | Checkpoint | `pnpm lab:exercise browser`. Copy one reference file if needed. |
| 21–23 | Contrast | Browser evidence and semantic judgment answer different questions. Give the System 1/2 analogy, then name Jev and its yes/no primitive. |
| 23–28 | Build | Two independent questions: honest status; conditional next step. Run construction check. |
| 28–32 | Real Jev | Happy/overpromise with attendee questions or your reference. Predict scores, then inspect actual inputs/results. |
| 32–33 | Checkpoint | “What did this number NOT prove?” Move on. |
| 33–36 | Policy | Walk the ordered table. Missing evidence first; no averaging hard gates. |
| 36–40 | Build | Implement `decide()`; run focused policy check. |
| 40–42 | Payoff | Scripted loop repairs once then accepts; stubborn version escalates. On slide 24, reveal identity → observation → decision → fresh attempt. Failed attempts stay in the receipt history. Last 15 seconds: the thesis slide; say “‘Done’ is a claim. Ask for the receipt.” |
| 42–43 | Questions | “Questions before the game?” Take one or two; park the rest for the closing Q&A slide. |
| 43–44 | Pair up | Bouncer vs. Bluffer. Freeze the verifier; keep human labels out of JSON. |
| 44–47 | Round 1 | 90 seconds to write the polite lie; 90 seconds to judge and inspect. |
| 47–50 | Round 2 | Swap roles. 90 seconds to write a valid paraphrase; 90 seconds to judge. |
| 50–52 | Score + share | Reward caught defects AND accepted good work. Spotlight one useful counterexample. |
| 52–54 | Trade-off | Project the 0.9/0.8 fixture table. Do not mix synthetic counts with live game results. |
| 54–55 | Final boss | Stale-evidence shared check; explain why perfect but old proof cannot approve this revision. Last 30 seconds: the thesis slide again; tie it back to the three builds. |
| 55–56:45 | Takeaways | App-specific CLI (30s), Chrome traces (30s), receipt history → evals → optional dataset (45s). Use the click cues; deeper setup stays in Lesson 07. |
| 56:45–58:45 | Transfer | Protect two minutes: name one feature, check command, saved receipt and stop condition. Finish the longer worksheet after class. |
| 58:45–60 | Close | Hear one example. Repeat the three closing questions. |
| 60+ | Q&A | Slide 39: repo and glossary QRs stay up while you take questions, for as long as the session allows. Then slide 40: invite people to Booth 6. |

Hard stops: **21, 33, 43, 55**. Preflight is not charged against the hour. Participant-authored bluff + valid-paraphrase rounds take priority over repeated fixture runs. Holdout evaluation is now take-home so the game fits. Do not sacrifice the transfer exercise.

## Hook commands

```bash
pnpm lab:app --scenario memory-only
# In a fresh private window: submit ada@example.test, then reload.
# Stop that app before switching:
pnpm lab:app --scenario overpromise
```

The “agent says done” report is a staged teaching claim, not a transcript of a production incident. Don't assert fabricated test results or invent a personal anecdote. The app's visible behaviors are real.

The sourced production incident is already in the opening. Keep the room moving into the reproducible toy app. The saved opening report on slide 15 is a real local browser observation with synthetic judge scores, not a live response.

## Jev segment: real by default, honest fallback

```bash
pnpm lab:check --scenario happy --solution --judge live
pnpm lab:check --scenario overpromise --solution --judge live
```

These evaluate reference questions. Attendees omit `--solution` to evaluate theirs, after completing the observer. Their policy still escalates because it is unfinished; focus on the scores and report fields.

Narrate: **“The model reports support for this question, given this evidence. Our code still decides.”**

If live fails, run `pnpm lab:replay` and read the captured request beside the response. Say **“recorded, not new feedback.”** Synthetic fixtures ignore the question wording entirely; never use them as evidence that a prompt is good.

Included live captures used Jev 1.13.0 on 2026-10-08. They're three selected examples, not an accuracy study or proof of injection immunity.

## The repair payoff

```bash
pnpm lab:loop --solution
pnpm lab:loop --solution --stubborn
```

Name the source: **scripted worker, synthetic scores**. It is a controlled experiment to test orchestration. Every attempt still runs a real browser.

Open `report.json`. Show:
- worker candidate versus independent observations;
- `expected.revision` and `evidence.loadedRevision`;
- raw probabilities versus policy reasons;
- second attempt and new evidence hash;
- final decision and human handoff when exhausted.

If time allows, `--judge live` replaces only the judge. Keep real generative-worker latency and variability outside the required hour.

## Bouncer vs. Bluffer

Use [lesson 6](../src/content/lessons/06-red-team.md) and the [paper scorecard](../public/materials/bouncer-scorecard.md). This is an authored challenge, not a fixture scavenger hunt.

1. **The polite lie:** edit `lab/challenges/bluff.json`, keeping storage local. Introduce one plausible false promise. Agree the violated criterion before the model call.
2. **The unfair rejection:** swap roles; edit `lab/challenges/legit.json` into an unusual but valid paraphrase. Pirate/poet/maître d’ voices are optional; clarity is mandatory.
3. Run `pnpm lab:check --candidate FILE --solution --judge live`. Two calls per pair maximum. Human labels never enter candidate JSON or the model input.

Without keys, use `pnpm lab:app --candidate FILE` and a human peer. For a less leading human round, the author chooses either file without revealing its name; the defender commits a decision before the label is revealed. The point is evidence and rubric clarity, not a claim about model accuracy. Keep human and model scoreboards separate.

Bouncer points: bad→repair **+2**; good→accept **+2**; bad→accept **−3**; good→repair/escalate **−1**; bad→escalate **0**. Outage, invalid JSON, or disputed label is no contest. Escalate-everything scores −1. A fully correct two-case defense scores 4.

Timers on slides 27/29 start only on a button press. Pause/reset is available; leaving a slide pauses it. No automatic music or sound. The six-stage illustration on slide 23 uses arrow-key reveals; its stubborn-worker checkbox demonstrates the alternate ending.

Celebrate one useful discovery: Best Polite Lie or Most Unfairly Rejected, with bragging rights only. Do not promise physical prizes. If nobody fools the model, compare which wording was hardest to label—the absence of an exploit is not a failed activity. Make it playful without turning another attendee into the joke.

## The trade-off, not “escalate everything”

Use the slide’s prepared table to protect the game time. If ahead, project two runs:

```bash
pnpm lab:eval --solution
pnpm lab:eval --solution --accept-at 0.8
```

Expected synthetic results:
- At **0.9**: false accepts **0/5 bad**; unnecessary escalation **2/3 good**.
- At **0.8**: false accepts **1/5 bad**; unnecessary escalation **1/3 good**.

The lower threshold admits both a valid paraphrase and the polite lie. The second command intentionally exits 1. No repair is performed in this eval.

Use invented costs on paper: bad acceptance 10, unnecessary escalation 1, unnecessary repair 1. Which policy wins? What if you change those costs? Required escalation on inadequate evidence is a separate invariant.

After class, freeze a threshold and pass it explicitly to `--suite heldout --accept-at YOUR_VALUE`. This set is tiny and inspectable; don’t pretend it proves production reliability. Results need not get worse. Avoid tuning again and calling the same cases unseen.

## If ten minutes disappear

- Read the reference collector together instead of typing it.
- Keep the real/recorded Jev comparison; it is central to the promise.
- Have pairs edit only policy.
- Keep one authored bluff and one valid paraphrase. Human peer review works if the API does not.
- Use the published comparison table rather than three repeated evals.
- Protect the final five-minute transfer exercise.

If thirty minutes disappear, this is no longer the promised hands-on workshop: explicitly switch to a demonstration and offer the full materials afterward.

## Questions to listen for

- “Why two models?” Different jobs: worker generates a proposal; judge assesses narrow support. Diversity alone does not make it reliable.
- “Why not exact text?” Use a template if exact text is the requirement. Here valid paraphrases are intentionally allowed.
- “Can the agent change tests?” Not through this JSON interface. A shell-capable agent needs real isolation and permission design.
- “Is 0.9 safe?” Not universally. Measure representative labeled cases and the cost of each kind of error.
- “Why not retry an outage?” A production harness might retry transient failures separately. This hour's policy escalates them so worker repair cannot hide infrastructure failure.
- “Does a passing browser test prove the backend?” No; this app has none. Add independent server observations when that is your actual requirement.

## Takeaway cues

Slides 34–36 connect the finished lab to attendees’ own work. Keep them to 1 minute 45 seconds, then protect the two-minute worksheet on slide 37. If behind, leave these diagrams as take-home reference and go straight to the worksheet.

- **App tool:** this is our actual CLI and saved browser observation, applying Lauren Tan’s pstack ideas. No extra installation during class.
- **Browser instruments:** the trace is a schematic; avoid calling it a measured speedup. The Chrome DevTools setup and first prompt live in Lesson 07.
- **Run history:** two actual saved runs provide the cards. The improvement loop and possible training dataset are a next step, not capabilities implemented by this lab. Synthetic eval scores test policy wiring, not prompt/model quality. Nick and Zack arrived independently at receipts in Riker and CTX.

## Closing handoff

[Transfer worksheet](../public/materials/transfer-worksheet.md), [take-home reference](take-home.md), and the code stay with attendees. The source repository is [nicknisi/beyond-done](https://github.com/nicknisi/beyond-done), currently private. Confirm attendee access or an agreed source bundle before sharing it. Announce a hosted materials URL only after it has been deployed and checked.
