---
title: "When “done” lies — the smoke test and the contract"
description: Watch a passing build that ships a broken feature, then read the exact contract you will build against.
order: 2
duration: "10 minutes (live 0:00–10:00)"
---

> Live segment **0:00–10:00**. No code edit yet: first establish what “done” must mean.

## Outcome

You can say, out loud, why "the agent said it was done" is not evidence, and
you know exactly which three files you will edit and which commands grade them.

## The hook: incident → live failure (0:00–6:00)

The hosts open with PocketOS founder Jer Crane's [account of an agent deleting production data](https://x.com/lifeofjer/status/2048103471019434248). [Railway's follow-up](https://blog.railway.com/p/your-ai-wants-to-nuke-your-database) says the database was recovered and deletion safeguards changed. Production permissions and recovery are part of that story; this class's browser prototype does not reproduce it or claim to prevent it.

After the host intros, the repo QR goes up so you can clone while we talk. Then inspect a smaller claim we can check together. The deck's **staged worker report** says the waitlist form renders, submits, and displays a success message. This is a teaching prop, not a real agent transcript or test run. **Vote:** is the feature done?

Watch the facilitator run:

```bash
pnpm lab:app --scenario memory-only
```

In the actual app, submit `ada@example.test`, then reload. The record vanishes. A submit check did not establish persistence. The slide illustration is a labelled fallback if the demo cannot start.

Lauren Tan's [pstack Part 2](https://x.com/poteto/status/2097732320606507506) makes verification central to agent work. [Part 1](https://x.com/poteto/status/2094457600259842065) describes reusable tools that exercise actual features and retain evidence. Our CLI and three exercises implement a small version of that pattern.

## The fictional task

You are prototyping the **Midnight Snack Lab** waitlist — a sold-out
(fictional) conference workshop.

- A new visitor starts with **no enrollment**.
- They submit `ada@example.test` and see a **waitlisted** record.
- They **reload** and find the **same email and status**.
- The confirmation must clearly say: you are on the waitlist, there is **no
  guaranteed seat**, and you will get an **email only if** space opens.

> **This is a browser-local prototype.** It stores state in the browser only.
> We do **not** register anyone with real organizers, send real email, charge
> money, or run a real service. Never describe it as real enrollment.

## Repo, glossary, and contract (6:00–10:00)

The repo QR (shown right after the intros) opens [nicknisi/beyond-done](https://github.com/nicknisi/beyond-done). It is currently private; ask a host if your GitHub account cannot access it. README has installation and command instructions. Run `pnpm lab:doctor`, then `pnpm dev` for the lesson site and [interactive glossary](/glossary/). The hosts will share the public glossary URL once it is ready.

Follow this rhythm: **read the lesson → edit the named file → run its check → inspect the evidence**. Predict results before running. If setup blocks you, pair with someone; observing and explaining the evidence is useful participation too.

To reproduce the opening:

```bash
pnpm lab:app --scenario memory-only
```

Open the printed URL (don't assume a port). Submit `ada@example.test` and
reload. Notice whether the record survives the reload — hold that thought; you
are about to *measure* it instead of eyeballing it.

### The three files you own

You will edit **only** these, in order, over the next three lessons:

| File | Function | What it produces |
| --- | --- | --- |
| `lab/exercises/observe.ts` | `observe(page): Promise<Observation>` | Independently observed browser evidence |
| `lab/exercises/questions.ts` | `buildQuestions()` | Two honest questions for the judge |
| `lab/exercises/decide.ts` | `decide(input): Decision` | A policy that accepts, repairs, or escalates |

Reference versions with identical signatures live in `lab/solution/`.

### The agent's narrow interface

The worker (the "agent") can only propose a validated `Candidate`:
`{ storage: 'memory' | 'local', confirmation: string }`. The trusted app
renders those strings **as text**. The worker **cannot** change the tests, the
policy, or the acceptance criteria through this interface. This is a
deliberately narrow tool — not autonomous code editing, and **not** a security
sandbox against a shell-capable adversary.

### Source mode is the truth

The repeatable repair uses a **scripted worker** and **synthetic policy scores**. Lesson 4 compares real Jev judgments (your key or the facilitator’s); only the generative worker is an after-class stretch. Every check/loop writes `report.json` under `.lab-runs/<id>/` with source mode. `pnpm lab:app` is the browser preview; `pnpm dev` serves the lesson website.

### Expected observation

`pnpm lab:app` serves the prototype; you can submit and reload. No grading yet —
the next three lessons each turn one file from red to green.

## Discuss

- What shallow check convinced you (or the agent) that it was "done"?
- In your own work, name one "green" that doesn't mean what people think it
  means.

## Catch-up

No files to preserve. If `pnpm lab:app` won't start, revisit
[Preflight](/lessons/01-preflight/).

## Stretch (optional)

Skim `lab/exercises/observe.ts` and read its type for `Observation`. You'll
fill it in next.
