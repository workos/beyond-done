# Opening: incident → live failure → verification

Keep this sequence inside the first six minutes. The excerpt and animation are local, so the opener does not depend on X, a video player, or conference Wi-Fi.

## 0:00–0:45 — PocketOS

Slide 1 is the title. Leave it up while the room settles; advancing to the incident starts the clock.

Slide 2 quotes five words from Jer Crane's [original April 25, 2026 account](https://x.com/lifeofjer/status/2048103471019434248): “It took 9 seconds.” He reported that a Cursor agent using Claude Opus 4.6 deleted production data through Railway's API. The duration is his report, not our measurement. First advance shows deletion; second shows recovery.

[Railway's April 29 follow-up](https://blog.railway.com/p/your-ai-wants-to-nuke-your-database) confirms that an agent used a locally stored token to delete a production volume. It also says Railway recovered the database and changed the API deletion path. Include that recovery in the spoken account. The animation explains the sequence; it is not footage or a recreation of the real UI. Do not repeat the initial claim that every backup was permanently destroyed or treat a model's post-hoc explanation as a forensic record.

Suggested bridge: **“Agents can act faster than we can inspect. Production safety needs enforced permissions and recovery. Today we're working on a related question: what evidence lets us accept an agent's result?”**

Our browser-local exercise does not simulate production infrastructure or establish that a semantic judge would have prevented this incident.

## 0:45–2:30 — Introductions, repo, and a smaller claim

Introduce both hosts on slide 3. Put the repo QR up on slide 4 (1:15–1:45) so anyone who skipped prework can clone before the next demo asks them to run `pnpm snack up`. Then ask the room to vote on the staged completion report. “Let's start with something we can actually break in this room.” The report is a teaching prop, not an actual worker transcript.

## 2:30–4:30 — Run the actual app

Before the session, start this in a separate terminal and leave it running for the whole hour. It opens a Chrome window on the attendee app:

```bash
pnpm snack up
```

1. Show the initial `none` status.
2. Submit `ada@example.test` through the visible form.
3. Point to `waitlisted` and the saved email.
4. Reload the actual page. Point to `none`, `—`, and the empty confirmation.
5. Ask which acceptance criterion the original completion report omitted.

The confirmation says “Your seat is confirmed.” Don't point it out yet; slide 20 pays it off.

Slide 6's illustration is only the fallback if the app cannot start. Name it as such.

## 4:30–5:30 — Lauren Tan's thesis

Slide 7 credits the short quote from [pstack Part 2](https://x.com/poteto/status/2097732320606507506). Explain that checking one's work means driving the actual product and preserving evidence. Asking the same model whether it is finished is insufficient.

[Part 1](https://x.com/poteto/status/2094457600259842065) develops reusable verification tools (“build the lever”: give agents a small CLI rather than markdown), rich debugging runtimes such as the Chrome DevTools Protocol, and feature maps. The second half of the workshop is a small version of that approach: `snack`, a feature map, a proof bar, and `doctor` first. The new slides don't name pstack; this quote and the take-home link are the credit. At the close, participants plan the same lever for their own app.

## 5:30–6:00 — Our own tools

Slide 9 shows that the hosts live by this rule. Nick: Riker's status comes from records, not model prose: it runs the job's check itself and keeps the command, exit code, commit and output hash. Zack: CTX ignores bare executor claims; only its evaluators close a node, from receipts bound to the exact revision. Keep it to one sentence each. Both repositories are private, so don't promise links or access. The receipt and final-boss slides have callbacks in their presenter notes.

## 6:00–10:00 — Follow along

The repo QR already appeared on slide 4; slide 10 adds the interactive glossary. Source lives at `github.com/nicknisi/beyond-done`, currently private. Confirm attendee access before the workshop. Setup instructions remain in README; use `pnpm snack doctor` as the smoke test. Pair people who are blocked.

The glossary QR is generated from the class hostname by `pnpm slides:qr` (also run by `pnpm build` and `pnpm slides`). The template hostname deliberately produces no glossary QR. Once the public destination is agreed, update `class.config.json`, regenerate, deploy through the normal workshop workflow, and check `/glossary/` from an attendee device. Deployment requires an agreed destination and is separate from editing the deck.

The repository QR is available immediately. Both codes use a white background, a four-module quiet zone, and visible text links. For local rehearsal, `pnpm dev` serves `/glossary/`; do not encode localhost for attendees' phones.

## Sources for the second half

- [pstack verification skill source](https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md): launch, doctor, drive, evidence, cleanup, and a feature map with four headings. `lab/verify/` follows that shape.
- [TypeSafe: System One models and Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev): fast structured judgments, used by `snack judge` for one narrow meaning check. Speed and schema validity don't establish semantic correctness.
- [Anthropic: harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps): a planner/generator/evaluator architecture with an evaluator driving the app.
