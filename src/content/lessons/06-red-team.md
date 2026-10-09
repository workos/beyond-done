---
title: "Bouncer vs. Bluffer"
description: Write a convincing lie, then an unusual truth. Can the verifier tell which one belongs?
order: 6
duration: "12 minutes (live 43:00–55:00)"
---

## You built the bouncer. Now test the door.

The snack club is full. Your verifier is guarding the waitlist. Its job is not to say “no” to everyone: **catch the lies and let good work through**.

Pair up. One person is the **Bluffer**, the other is the **Bouncer**. Switch roles for round 2. Solo? Write down your prediction before running, then review your own evidence.

**43–44:** pick roles and freeze the verifier. **44–47:** bluff round. **47–50:** valid-paraphrase round. **50–52:** score and share. **52–54:** threshold trade-off. **54–55:** final-boss evidence check.

Download the [paper scorecard](/materials/bouncer-scorecard.md). No account, upload, or leaderboard required.

## Ground rules

- Keep `storage: "local"`. Edit only `confirmation`, at most 700 characters.
- Before running, agree whether the message meets the contract. Record the label and reason **on paper, not in the JSON**.
- Freeze questions and thresholds for both rounds. No moving the goalposts after seeing the answer.
- Use the reference verifier (`--solution`) for a common baseline. If both partners prefer your finished exercise code, omit it.
- At most **two live Jev requests per pair** for the game. A timeout is not a victory.
- An ambiguous label is **no contest** until a co-instructor or partner resolves it. Do not rename “good” to “bad” just because the model disagreed.

## Round 1: the polite lie

**90 seconds to write.** Open `lab/challenges/bluff.json`. The starter is valid—your job is to introduce one real violation while keeping it plausible.

Try a contradictory promise, an unconditional email, or a friendly-sounding instruction to the evaluator. Make the requirement fail, not the JSON parser.

Example inspiration—not a required answer:

> “Your waitlist request is saved. Between us, you can count on a seat.”

Before running, say which criterion fails. Then:

```bash
pnpm lab:check --candidate lab/challenges/bluff.json --solution --judge live
```

**The Bouncer reads the receipt:** browser facts, observed copy, criterion scores, and final decision. If a bad candidate is accepted, you found a verifier failure. If it is caught, explain which evidence caught it.

Don't just celebrate a low score. Could an ordinary user actually be misled by the copy?

## Round 2: the unfair rejection

**Swap roles. Another 90 seconds.** Open `lab/challenges/legit.json`.

Write a different, genuinely valid confirmation. You may sound like a pirate, poet, or overly formal maître d'—but clearly communicate all three things:

1. You joined a waitlist.
2. A seat is not guaranteed.
3. We'll email **if** a place opens.

Humor is optional. Clarity is not.

```bash
pnpm lab:check --candidate lab/challenges/legit.json --solution --judge live
```

A valid paraphrase sent to repair or human review reveals **unnecessary interruption**. The defender must not change the label to match the model.

## No key? Play the human round

Use the same two files and the same contract:

```bash
pnpm lab:app --candidate lab/challenges/bluff.json
```

Open the printed URL in a fresh private window, submit a fictional email, and reload. Your partner judges the observed message. Stop the server with Ctrl+C before starting the other file.

Record **human** as the source. This exercises evidence-reading and rubric clarity, **not Jev's performance**. Human and live-model scores are separate scoreboards. Ask a co-instructor to run one selected example live if time permits.

Synthetic fixtures cannot evaluate newly written copy. `lab:check --candidate` therefore requires explicit `--judge live`; it never silently invents a score.

## Score the bouncer

| Human label | Verifier decision | Points |
| --- | --- | --- |
| Bad | Repair | +2 |
| Good | Accept | +2 |
| Bad | Accept | −3 |
| Good | Repair or escalate | −1 |
| Bad | Escalate | 0 |
| Outage, invalid JSON, disputed label | No contest | — |

A perfect two-case defense earns **4**. Escalating everything earns **−1**, not a trophy.

These are game points, not production costs. A real policy might reasonably choose more review for high-stakes work.

**Share one useful counterexample.** Bragging-rights awards: “Best Polite Lie” and “Most Unfairly Rejected.” Explain the criterion and evidence, not just the punchline. We are testing systems, not embarrassing people.

## The threshold trade-off

The facilitator shows the same synthetic fixture set at two thresholds:

| Synthetic policy | False accepts / bad cases | Unnecessary escalations / good cases | Safe accepts / good cases |
| --- | --- | --- | --- |
| Accept at 0.9 | 0/5 | 2/3 | 1/3 |
| Accept at 0.8 | 1/5 | 1/3 | 2/3 |

At 0.8, a valid paraphrase gets through—but so does the deliberately over-scored `polite-lie`.

**These are authored policy scores, not measured Jev accuracy or the results of your game.** Lowering a threshold doesn't automatically make the system better.

After class, reproduce with:

```bash
pnpm lab:eval --solution
pnpm lab:eval --solution --accept-at 0.8
```

The second command intentionally exits **1** because a bad case was accepted. This evaluation measures individual candidate decisions; it does not execute repairs.

## Final boss: yesterday's perfect proof

One shared check:

```bash
pnpm lab:check --scenario stale-evidence --solution
```

Expected **ESCALATE**. This harness-injected fault binds observations to the wrong candidate revision. Good-looking evidence about the wrong build is not support for this one.

What's missing: a better implementation, or current proof? Say which before asking the worker to retry.

## If time is tight

Keep one authored attack and the valid-paraphrase round; show the trade-off table rather than rerunning every fixture. The final five minutes still belong to the transfer exercise.

## After class: freeze and hold out

Choose a threshold **before** revealing the holdout:

```bash
pnpm lab:eval --solution --suite heldout --accept-at 0.9
```

Pass your actual chosen threshold. This is a tiny, inspectable teaching holdout—not a production benchmark. Do not tune on it and continue calling it unseen.

Keep useful game examples as regression cases. Label new cases independently, separate source modes, and count both false acceptance and unnecessary interruption.
