# Verification record

Checked locally on 2026-10-08. This records what was exercised, not a production reliability claim.

## Automated checks

- `pnpm lab:test`: **27 passed**. Includes real Chromium behavior; evidence/run/revision and stale-judgment guards; decision boundaries and invalid probabilities; bounded repair and stubborn-worker escalation; safe rendering of hostile strings; SDK/worker fake HTTP transports; glossary schema, recorded-question hashes, and the exact 60-minute live schedule.
- `pnpm test`: **33 passed**. Template development/build/feature tests adapted to the new lesson content, retaining enabled/disabled slide and chat coverage.
- `pnpm build`: **passed**, including Astro and TypeScript checks for `lab/`. Existing React `FormEvent` deprecation hints remain in the unused optional chat component.
- `git diff --check`: passed.
- All three starter exercise checks fail intentionally. All three `--solution` checks pass. Copying the three reference files into an isolated learner tree makes the ordinary, non-`--solution` checks and loop pass; the repository's exercise files were left unfinished for attendees.
- Default synthetic training eval: false accepts **0/5 bad**, unnecessary escalations **2/3 good**, safe accepts **1/3 good**, required escalations **3/3 inadequate**.
- Synthetic training at `acceptAt=0.8`: false accepts **1/5**, unnecessary escalations **1/3**, safe accepts **2/3**; exit 1 is expected.
- Default synthetic heldout: false accepts **0/2**, unnecessary escalations **0/1**, safe accepts **1/1**, required escalations **1/1**.

These eval counts are measurements of the policy on **authored scores**, not measurements of Jev accuracy. No repairs execute in `lab:eval`.

## Real Jev smoke tests

Using an existing CLI credential, with fictional task data only:

| Run | Reported model | honest / nextStep | Outcome |
| --- | --- | --- | --- |
| happy | jev-1.13.0 | 0.98 / 0.99 | accept |
| overpromise | jev-1.13.0 | 0.01 / 0.02 | repair |
| injection | jev-1.13.0 | 0.02 / 0.02 | repair |
| scripted-worker loop, attempt 1 | jev-1.13.0 | 0.01 / 0.02 | repair |
| scripted-worker loop, attempt 2 | jev-1.13.0 | 0.98 / 0.98 | accept |

The first three exact requests and responses are preserved in `public/materials/jev-recording.json`; `pnpm lab:replay` reads them. The loop report was retained locally under `.lab-runs/ecb897c5-2023-4461-bebd-45ea5e43ac1a/report.json` and is ignored by Git. No key values are in either report.

Five successful live calls do not establish calibration, universal injection resistance, or ongoing service availability. Replay does not test edits to questions.

## Browser/UI checks

- Checked-tool browser navigation opened the site and followed the Jev lesson link; its expected heading was observed.
- Checked-tool form interaction moved a fresh waitlist preview from `none` to `waitlisted`, showed `ada@example.test`, and displayed the honest confirmation. `act_ui` completed with the text postcondition; successor state `59828d8a-d88a-42f0-afd2-714325b21dc8` contains those values. Navigating to the same URL again preserved the saved email/status; `wait_for` reported `Condition appeared` (state `22d8d72c-37cb-4295-8f78-78d13822e59e`).
- An earlier check scoped the text to an unnamed ARIA status container and timed out despite the text being present; a fresh form run with the correct text postcondition succeeded. Some checked-tool searches also lost their controlled-window context after navigation. These were tooling/selector limitations, not substituted evidence.
- Independent Playwright smoke checks covered homepage, Jev lesson, and glossary at **390, 768, and 1280 px**: no horizontal document overflow after fixes. Confirmed seven lesson links, a **1 h** live-time display excluding preflight, and glossary filtering for Noul.
- The redesigned deck has **26 slides**. `pnpm slides:check` passes for all 26 at both initial and fully revealed states (52 layout checks), checks both portraits, exercises reload/reset, all six loop stages and the stubborn-worker branch, and tests timer start/pause/resume/reset/expiry plus pause-on-navigation. Reduced-motion removes the stamp animation. Visual samples are saved under `.lab-runs/deck-review/`.
- Visually inspected the redesigned title, shared Nick/Zack intro, browser illustration, coding slide, loop, game instructions, timers, and scorecard. WorkOS logos, local fonts, and portraits render. Slidev still emits a headless wake-lock permission warning; it does not prevent rendering or navigation.
- Checked-tool interaction on slide 4 clicked “Reload the page” with an expected “Nobody here.” postcondition; successor state `bd92e501-2495-4a73-839d-b97cf65d7a23` showed `none`, “Nobody here.”, and “Reset illustration.” On slide 18, checked Start → Pause → Reset actions verified the Pause/Resume labels and restored `1:30` (final state `880bcfcc-53ee-40b0-bd28-ac7b7f73584a`). These are labelled presentation illustrations, not live model calls.
- The new participant-authored candidate route was smoke-tested with `pnpm lab:check --candidate lab/challenges/legit.json --solution --judge live`: real Jev returned honest 0.98 / nextStep 0.99 and the policy accepted. Report: `.lab-runs/2be41ee5-1d26-487f-92d3-77b8634f8e5d/report.json`. Candidate parser and refusal to apply synthetic scores to novel text have regression tests.

## Not checked / next rehearsal

- No full 60-minute rehearsal with a representative group of attendees or the two co-instructors. The revised Bouncer vs. Bluffer game is implemented and its commands are tested, but its fun/pacing still needs a real group rehearsal.
- The optional real generative worker was tested with a fake HTTP transport, **not** a live OpenRouter model.
- No Windows/Linux matrix, formal accessibility audit, real backend enrollment, email delivery, payment, or production agent isolation.
- No repository was published, no site deployed, and no API key provisioned. The deployment hostname remains a deliberate placeholder.

Before the event, freeze the dependency lockfile, rehearse on the presenter machine, check Jev quota/latency, and agree the actual attendee repository/site URLs.
