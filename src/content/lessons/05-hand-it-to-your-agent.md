---
title: "Hand it to your agent"
description: Add to the feature map, give your agent the skill, and watch it reproduce, fix, and prove the bug. Then catch the lie the proof can't see.
order: 5
duration: "14 minutes (live 30:00–44:00)"
---

> Live segment **30:00–44:00**. You write two lines of Markdown, then your agent does the rest.

## Outcome

Your agent reproduces the reload bug with snack, fixes `lab/app/index.html`, and shows you a passing receipt and a screenshot. You can explain why the screenshot still matters, and when the agent should stop.

## 1. Write the map (30:00–34:00)

The CLI tells an agent *how* to look. The **feature map** tells it where to look and what to distrust. Open **`lab/verify/features/waitlist.md`**. Each feature file answers the same questions:

- **Sub-features:** what exists.
- **How to get to it (user POV):** in a user's words.
- **Driving it with snack:** the exact commands.
- **What done means:** the three acceptance criteria.
- **Gotchas:** what usually lies.

The first gotcha is written: the success message appears whether or not anything was saved. **Add two more.** What else in this feature looks done but might not be? Keep them behavioral: something a user would see, and that snack can observe.

Then read **`lab/verify/SKILL.md`**: doctor, read the map, reproduce, fix, prove, read the screenshot, report. That's what you hand your agent.

## 2. Repro it. Fix it. Show me proof. (34:00–40:00)

With `pnpm snack up` running, give your agent this prompt:

```text
Read lab/verify/SKILL.md. Reproduce the reload bug in the waitlist with snack.
If it reproduces, fix it, and show me the receipt and the screenshot as proof.
```

**Expected:** the agent runs `doctor`, then `prove` (FAIL: status after reload is `none`), looks at `storage` (empty), edits `lab/app/index.html` to persist the record, reloads, and runs `prove` again: PASS for a new revision, with a screenshot path.

The prompt has no steps and no “remember to reload”. The skill, the map, and your proof carry all of that.

> **Did your agent say PASS without fixing anything?** Your `prove.ts` is unfinished, and a weak proof calls a broken app done. That's the lesson. Finish it, or tell the agent to use `pnpm snack prove --solution`.

To start over: `git checkout lab/app/index.html`.

## 3. Open the receipt (40:00–41:00)

Every `pnpm snack prove` appends a receipt to `.lab-runs/snack/receipts/`. Read the two from your agent's run (or the saved pair: [FAIL](/materials/snack-receipts/1-fail-attendee-app.json), then [PASS](/materials/snack-receipts/2-pass-after-agent-fix.json)) in four steps:

1. **Bind:** which revision, and when?
2. **Observe:** what did the app actually do? Status after reload, storage, page errors.
3. **Decide:** which checks failed, and what's `next`? That line is what the agent acted on.
4. **Append:** new code, new revision, fresh evidence. The failure stays in the history.

## 4. It persists. It also lies. (41:00–43:30)

Open the screenshot from the passing receipt. The confirmation says **“You're in! Your seat is confirmed.”** The map says waitlist only, no guaranteed seat. `prove` checked that the record survives; it can't tell whether the message is honest.

That takes a different kind of check:

```bash
pnpm snack judge
```

It runs a fresh visitor through join and reload, then asks Jev two narrow yes/no questions: does each message say waitlist only, and does it promise an email only if a place opens? Jev returns the probability of “yes” for each. Both at least 0.9: PASS. Either at most 0.2: FAIL. Anything between: ASK A HUMAN. A missing key or a failed request is “can't tell”, never a score.

**No key?** Judge it as a human: read the screenshot against the contract in the map. The point is that someone reads it.

Have the agent fix the copy, then run `prove` and `judge` again. Both should pass.

A probability is a signal, not proof. 0.55 doesn't mean 55% done; it means the judge is torn. If your product has exactly one approved message, skip the model and compare the text.

## 5. When to stop (43:30–44:00)

From `lab/verify/SKILL.md`:

| Situation | The agent should |
| --- | --- |
| PASS for the current revision, screenshot read, copy honest | Stop. Report the receipt. |
| The same check still fails after two fixes | Stop. Hand a human the receipt and what it tried. |
| `doctor` red, or `prove` exits 2 | Fix the setup or ask. Never “fix” the app because the harness failed. |
| `judge` says ASK A HUMAN | Show a human the screenshot and the contract. |

“Done” comes from the evidence, not the agent's confidence.

## Catch-up

No agent? Pair with someone who has one, or follow the hosts' run on screen. You can also play the agent yourself: follow the seven steps in the skill by hand.
