---
title: "Break it quietly"
description: snack hides a random bug; you find it with snack alone. Every bug that slips through becomes a new check.
order: 6
duration: "11 minutes (live 44:00–55:00)"
---

> Live segment **44:00–55:00**. One round, then the reveal and the final boss.

## Outcome

You've tested the lever both ways: can it find a bug that's there, and can it stay quiet when nothing is wrong? You know which bugs your proof misses, and what to add.

## Roles

Everyone plays solo.

- **Saboteur:** snack. `--bug random` picks a secret bug and hides it from you too.
- **Detective:** you. Find it using only `pnpm snack` commands. No reading files, no `eval` on the source. Your agent may help: hand it the skill and say “find what's wrong.”

Sometimes there's no bug. “It works” is a real answer.

## The round (2 minutes)

Stop the running `up` (Ctrl+C), then:

```bash
pnpm snack up --bug random
```

It's one of `none`, `memory-only`, `wrong-email`, `lost-confirmation`, `overpromise` or `console-error`. The bug is injected by the server when the page loads, so it isn't in `lab/app/index.html`. Everyone plays against the same reference app plus one bug.

Start with `pnpm snack doctor`. Write down your answer and the output that proves it. When time's up, stop `up` (Ctrl+C); the last thing it prints is `{"reveal": "…"}`.

**Practicing later?** `pnpm snack up --bug NAME` starts a specific bug.

## Score

| Result | Points |
| --- | --- |
| Named the bug, with output | +2 |
| Said “it works” and it did | +2 |
| Said “it works” and it didn't | −3 |
| Blamed a bug that wasn't there | −1 |
| Right bug, no evidence | 0 |

A printable scorecard is at [`/materials/game-scorecard.md`](/materials/game-scorecard.md).

## The reveal

| Bug | Your `prove` | What finds it |
| --- | --- | --- |
| `memory-only` | FAIL | status and storage after reload |
| `wrong-email` | FAIL | saved email after reload |
| `lost-confirmation` | FAIL | confirmation after reload |
| `overpromise` | **PASS** | the screenshot, or `snack judge` |
| `console-error` | **PASS** | `snack console`, and `pageErrors` in the receipt |
| `none` | PASS | nothing to find |

Two bugs get past a proof that only checks persistence. Each one tells you what to add: a gotcha in the map (“read the screenshot; the copy can lie”) or a check in the proof (“no page errors”). Every miss becomes a new line. That's how the lever improves.

**Stretch:** add a “no page errors” check. `runProof` in `lab/proof.ts` collects them; decide how your proof should see them.

## Final boss: “But it passed yesterday.”

The game stopped your `up`, and any `prove` you ran during it replaced your latest receipt. Set the scene again with your fixed app from lesson 5:

```bash
pnpm snack up       # its own terminal; leave it running
pnpm snack prove    # PASS on the current revision (add --solution if your proof isn't finished)
```

Now make a one-character edit to `lab/app/index.html` (a space in the `<title>`), don't reload, and run:

```bash
pnpm snack doctor
```

`build` and `proof` both say **STALE**: the receipt says PASS for a revision that no longer exists. Every receipt belongs to one revision. Change the code, and the old proof proves nothing. Prove it again.

Undo with `git checkout lab/app/index.html` (this also undoes the agent's fix).
