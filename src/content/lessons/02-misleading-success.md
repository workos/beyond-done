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

## The hook: vote first (0:00–5:00)

An AI agent was asked to build a waitlist form. It reports **done**: the form
renders, it typechecks, the happy-path test is green.

Before you look at anything, **vote**: is this feature actually done?

Then the facilitator shows the catch — a feature that passes a shallow check
but fails the thing a user actually needs. "Green" measured the wrong thing.
The lesson of the hour: *a claim of done is not evidence; independently
observed behaviour is.*

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

## The smoke test + the contract (5:00–10:00)

Start the app and look at it:

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
