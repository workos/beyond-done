---
title: "When “done” lies — and what you'd check instead"
description: Watch a confident report ship a broken feature, list what you'd check by hand, and see why your agent needs a lever instead of instructions.
order: 2
duration: "10 minutes (live 0:00–10:00)"
---

> Live segment **0:00–10:00**. No code yet: first establish what “done” must mean, and what checking it takes.

## Outcome

You can say why “the agent said it was done” isn't evidence, name the checks you'd run by hand, and explain why a small CLI beats a paragraph of instructions.

## The hook: incident → live failure (0:00–6:00)

The hosts open with PocketOS founder Jer Crane's [account of an agent deleting production data](https://x.com/lifeofjer/status/2048103471019434248). [Railway's follow-up](https://blog.railway.com/p/your-ai-wants-to-nuke-your-database) says the database was recovered and deletion safeguards changed. Production permissions and recovery are part of that story; this class's browser prototype doesn't reproduce it or claim to prevent it.

After the host intros, the repo QR goes up so you can clone while we talk. Then the deck shows a **staged worker report**: the waitlist form renders, submits, and shows a success message. It's a teaching prop, not a real agent transcript. **Vote:** is the feature done?

Then break it yourself:

```bash
pnpm snack up
```

A Chrome window opens on the app. Leave the terminal running. Submit `ada@example.test`, read the confirmation, then reload. The record vanishes. A submit check didn't establish persistence. (Read the confirmation carefully, too. It comes back in lesson 5.)

Lauren Tan's [pstack Part 2](https://x.com/poteto/status/2097732320606507506) makes verification central to agent work: “if an agent can't verify its own work, nothing else matters.” [Part 1](https://x.com/poteto/status/2094457600259842065) describes reusable verification tools and feature maps. The rest of the hour builds a small version of that idea.

## The fictional task

You're prototyping the **Midnight Snack Lab** waitlist for a sold-out (fictional) conference workshop. “Done” means three things:

1. A visitor who joins sees the **same email and status after a reload**.
2. The confirmation says **waitlist only**: no guaranteed seat.
3. It says they'll get an **email only if** a place opens.

> **This is a browser-local prototype.** It stores state in the browser only. Nobody is registered with a real organizer, no email is sent, and no money is charged.

## What would you check? (6:00–10:00)

Before shipping that waitlist, a careful person would reload the page, open DevTools to look at local storage and the console, maybe check the network tab, and read what the page actually promises.

The agent that said “done” could do none of that. It had the code and a terminal.

The usual first fix is to write instructions in `AGENTS.md`: “always verify in a browser, remember to reload.” The agent reads them, interprets them a little differently every run, and leaves nothing to inspect. The better fix is a **lever**: a small command-line tool that drives *this* app and reports what happened as JSON. It runs the same way every time, costs the agent fewer tokens than a throwaway script, can be tested, and leaves a receipt.

## The plan for the hour

| Lesson | You will | File or command |
| --- | --- | --- |
| 3 · Drive the app | Use `snack` to see what the agent will see | `pnpm snack …` |
| 4 · Build the proof | Write the one function that defines “done” | `lab/exercises/prove.ts` |
| 5 · Hand it to your agent | Add to the feature map, then let your agent repro, fix and prove | `lab/verify/` |
| 6 · Break it quietly | Find snack's hidden bug with snack alone | `pnpm snack up --bug …` |
| 7 · Take it home | Plan the lever for your own app | worksheet |

Reference versions live in `lab/solution/`. Add `--solution` to `snack prove` or `lab:exercise` to use the reference without overwriting your work.

## Discuss

- What shallow check convinced you (or an agent) that something was done?
- What do *you* check by hand that your agent can't?

## Catch-up

If `pnpm snack up` won't start, run `pnpm snack doctor`: every failing check says what to do next. Then revisit [Preflight](/lessons/01-preflight/).
