# Beyond “Done”: Building Verification Loops for AI Agents

A **60-minute AIE workshop** by **Nick Nisi & Zack Proser**, for JS/TS developers. Built from [nicknisi/template-workshop](https://github.com/nicknisi/template-workshop), with **WorkOS branding**.

An agent says “done.” Your code decides whether the evidence agrees.

## One task, three edits

The fictional **Midnight Snack Lab** is sold out. Its browser-local waitlist must preserve the same email/status after reload and explain: **waitlist only, no guaranteed seat, email if a place opens**.

Attendees build the supervisor, not another agent framework:

1. **Observe** with Playwright — `lab/exercises/observe.ts`.
2. **Judge evidence** with Jev — `lab/exercises/questions.ts`.
3. **Accept, repair once, or escalate** — `lab/exercises/decide.ts`.

Then play **Bouncer vs. Bluffer**: write a convincing lie, swap roles, and write an unusual truth. Test your own JSON candidates against Jev (or a human peer without a key). Points reward catching bad work **and** letting good work through. Stale evidence is the final boss.

This is a **browser-local prototype**, not real organizer registration, email delivery, or payment. The worker's tool only proposes validated `{storage, confirmation}` JSON. It cannot edit the verifier through that interface. It is not an OS security sandbox.

## Start here

Node 24 and pnpm 12.4.1 are pinned in `mise.toml`. Installation happens **before** the workshop hour.

This repository is private; your GitHub account must have access.

```bash
gh repo clone nicknisi/beyond-done
cd beyond-done
pnpm install
pnpm exec playwright install chromium
pnpm lab:doctor
pnpm lab:loop --solution
```

Expect **REPAIR → ACCEPT** and a `.lab-runs/<id>/report.json` path. No key required.

```bash
pnpm dev                              # lesson site + glossary + slides
pnpm lab:app --scenario memory-only    # separate, deliberately broken app
pnpm slides                           # optional presenter view
```

Use each printed URL. Linux may need `pnpm exec playwright install --with-deps chromium`.

## The hour

| Minutes | Activity | Result |
| --- | --- | --- |
| 0–5 | Vote: is this “done”? | A shallow green check fails the user |
| 5–10 | Smoke test + contract | Know what evidence must show |
| 10–21 | Playwright collector | One submit/reload observation |
| 21–33 | Two Jev questions + live comparison | Distinguish support from confident wording |
| 33–43 | Policy + bounded repair | Witness repair → accept and repair → escalate |
| 43–55 | Bouncer vs. Bluffer: two authored challenges | Catch lies without rejecting good paraphrases |
| 55–60 | Transfer exercise | A verification plan for your own project |

[Lessons](src/content/lessons/) · [Facilitator guide](docs/facilitator.md) · [Preflight](docs/preflight.md) · [Take-home](docs/take-home.md)

## Three sources of scores — do not confuse them

| Mode | What it does | What it cannot establish |
| --- | --- | --- |
| Default `--judge fixture` | Uses hand-authored scores to test policy reproducibly | Jev accuracy or your question quality |
| `--judge live` | Sends the task and observed confirmation text to Jev | General reliability from a handful of examples |
| `pnpm lab:replay` | Displays actual recorded Jev requests/responses | New feedback on edited questions |

**Real Jev is part of lesson 4**, using attendees' keys or the facilitator's projected comparison. The fixture path keeps coding exercises runnable without keys. During an outage, use the explicitly labeled recording.

The default **worker is scripted** so everyone sees a repair within the hour. The optional real generative worker is an after-class extension.

## Jev setup

Copy `.env.example` to `.env` and set `TYPESAFE_API_KEY`. The CLI loads it; existing environment variables take precedence. Get a key from [TypeSafe](https://console.typesafe.ai/); event credits are not assumed.

```bash
pnpm lab:check --scenario happy --solution --judge live
pnpm lab:check --scenario overpromise --solution --judge live
pnpm lab:loop --solution --judge live
```

These make billable external API calls with fictional task/confirmation text. No worker case IDs, human labels, expected actions, or synthetic scores are sent to Jev.

The adapter uses `@typesafe-ai/sdk` 0.6.0, `TypeSafeClient`, and two `noul()` questions in one `systemOne()` request. Default model: `jev-latest`; override with `TYPESAFE_MODEL`. Timeout: 15 seconds; SDK retries disabled. Live failure escalates; **never silently falls back**.

Real Jev was smoke-tested against happy, overpromise, injection, and the repair loop. [Captured examples](public/materials/jev-recording.json) include exact inputs, questions, model version, and responses. They are examples, **not a benchmark**. Automated tests use fake HTTP transports, not paid model calls.

## Exercise checks and catch-up

```bash
pnpm lab:exercise browser
pnpm lab:exercise questions
pnpm lab:exercise policy
```

These are **intentionally red** until you implement the corresponding function. The question check only validates construction; use a live call to evaluate meaning.

Add `--solution` to run the reference instead. It switches **all three files**, so omit it when testing your own question changes.

To catch up one file, save your edits first, then:

```bash
cp lab/solution/observe.ts lab/exercises/observe.ts
```

There is no automatic reset or overwrite.

## The game: your own candidate

Edit `lab/challenges/bluff.json` (introduce one plausible false promise), then `lab/challenges/legit.json` (a valid paraphrase). Both start valid. Keep `storage: "local"`; change only confirmation. Label before judging and freeze the verifier for both rounds.

```bash
pnpm lab:check --candidate lab/challenges/bluff.json --solution --judge live
pnpm lab:check --candidate lab/challenges/legit.json --solution --judge live
# No-key peer-review version:
pnpm lab:app --candidate lab/challenges/bluff.json
```

`lab:app` validates and renders the candidate **once, at startup**. After you edit a challenge JSON, stop the server (Ctrl+C), start it again, and open the **newly printed URL**.

Each start uses a new port. A new port is a new browser origin, so localStorage does not carry over from the previous run. To test that the waitlist entry survives reload, reload the **same running URL**.

[Game rules](src/content/lessons/06-red-team.md) · [Paper scorecard](public/materials/bouncer-scorecard.md). No synthetic scores for novel text, no labels sent to the judge, no leaderboard service required.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm lab:doctor` | Check Node, Chromium, local listener; report key presence without testing it |
| `pnpm lab:app --scenario happy` | Manually explore a candidate in a browser |
| `pnpm lab:app --candidate FILE` | Preview your own candidate for a human round; reads FILE once, so restart after edits and use the new URL |
| `pnpm lab:check --candidate FILE --judge live` | Judge your own validated JSON candidate |
| `pnpm lab:check --scenario NAME [--solution]` | Evaluate one candidate; print its evidence/report path |
| `pnpm lab:loop --solution [--stubborn]` | Run the bounded worker → verify → repair loop |
| `pnpm lab:eval --solution [--accept-at 0.8]` | Evaluate single-candidate decisions, not post-repair outcomes |
| `pnpm lab:eval --solution --suite heldout` | Reveal after choosing a policy; teaching holdout, not secret data |
| `pnpm lab:replay` | Inspect the recorded real Jev comparison offline |
| `pnpm lab:test` | Unit, fake-transport, and real-browser reference tests; no model costs |
| `pnpm test` | Template regression tests |
| `pnpm build` | Typecheck lab/site and build lessons, glossary, and slides |
| `pnpm slides:check` | Check 26 slides, reveals, portraits, interactive loop, round timer, and reduced motion |

Training scenarios: `happy`, `memory-only`, `overpromise`, `polite-lie`, `missing-next-step`, `injection`, `paraphrase`, `uncertain`, `missing-evidence`, `stale-evidence`, `judge-down`.

The illustrative defaults are `--repair-below 0.2 --accept-at 0.9`. Enforce `0 <= repairBelow < acceptAt <= 1`. With synthetic fixtures, 0.8 admits the polite lie and exits **1** to flag the false accept. This is an expected teaching result, not a setup error.

`lab:check` reports decisions without treating an intentional repair/escalation as a process failure. Exercise checks and regression tests use nonzero exit on failed assertions. `lab:eval` uses nonzero exit for false accepts or missed required escalations.

## Optional live worker

Set `OPENROUTER_API_KEY` and an explicit `WORKER_MODEL` supporting JSON output:

```bash
pnpm lab:loop --solution --judge live --worker live
```

The generative model proposes only the small candidate schema. It receives failures on repair; no arbitrary shell execution is granted. Maximum two worker requests and two Jev requests per loop. Provider token budgets, 20-second worker timeouts, and the attempt cap bound the demo. The real worker adapter has fake-transport tests but has **not** been exercised against a live provider here.

## Keep the claims honest

- Hard checks are gates, not points in an average.
- Missing evidence and model outages are not known product defects.
- A Noul is the model's probability of yes, not proof or a separate confidence score.
- A repaired candidate requires fresh observations and judgment.
- A source hash provides local provenance checks, not isolation from a shell-capable attacker.
- More escalation is not automatically better: count unnecessary interruption of valid work.
- The small teaching suite does not establish production calibration or reliability.

Run reports, screenshots, and human-review packets live under ignored `.lab-runs/`. Only fictional data is used. Do not reuse this reporting path for sensitive production evidence without retention/access controls.

## Instructor and site notes

- [Minute-by-minute run-of-show](docs/facilitator.md)
- [Deck visual direction](DESIGN.md): shared portrait intro, WorkOS-indigo tickets and stamps, click-driven reveals, a step-through repair loop, and opt-in 90-second timers. All assets/fonts are local.
- [Setup and failure plans](docs/preflight.md)
- [Verification results and remaining rehearsal work](docs/verification.md)
- [Transfer worksheet](public/materials/transfer-worksheet.md)
- [Implementation contract](docs/lab-contract.md)
- [Template operations](.agents/skills/workshop/SKILL.md)

The glossary is hand-authored/reviewed in `generated/glossary.json`; no implicit AI generation is needed. Cloudflare chat is off. Source is hosted privately at [nicknisi/beyond-done](https://github.com/nicknisi/beyond-done). No site was deployed and no billable key was provisioned. The placeholder hostname intentionally blocks deployment until an actual destination is agreed.
