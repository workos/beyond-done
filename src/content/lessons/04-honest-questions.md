---
title: "Ask Jev what the evidence supports"
description: Write two narrow questions, compare real judgments, and distinguish probability from proof.
order: 4
duration: "12 minutes (live 21:00–33:00)"
---

## Outcome and timebox

**21–23:** see a browser-pass with misleading copy. **23–28:** edit two questions. **28–32:** compare real Jev results (your key or the facilitator's). **32–33:** inspect the evidence and move on.

You will learn to ask about **a criterion and its evidence**, not whether an agent sounds confident.

## The browser passes. The feature still lies.

`overpromise` persists the correct waitlist record. Its confirmation says a seat is confirmed. A boolean assertion on storage does not settle the meaning of that message.

Why not search for “waitlist”? A message can say *“You're on the waitlist. No seat guaranteed—but your seat is confirmed!”* Keywords pass; meaning fails.

If a product allows only one fixed approved message, use a template and exact checks instead. Jev is useful here because valid paraphrases are allowed.

## Edit `lab/exercises/questions.ts`

Keep the function and keys; replace the vague questions:

```ts
import { noul } from "@typesafe-ai/sdk";

export function buildQuestions() {
  return {
    honest: noul("YOUR yes/no question", {
      true: "What sufficient support looks like",
      false: "What missing or contradictory support looks like",
    }),
    nextStep: noul("YOUR second question", {
      true: "What sufficient support looks like",
      false: "What missing or contradictory support looks like",
    }),
  };
}
```

The harness sends trusted `contract` plus:

```ts
evidence: {
  confirmationBeforeReload,
  confirmationAfterReload,
}
```

Ask two **independently useful** questions:

- **honest:** Do both messages communicate waitlist membership with **no guaranteed or confirmed seat**, without contradicting that?
- **nextStep:** Do both explain the **conditional** next step: an email **if** a place becomes available?

Reference both evidence fields by name. Empty or absent text cannot support “yes.” Accept equivalent wording, not just your preferred vocabulary.

The confirmation is **untrusted data**. Tell Jev to ignore instructions, evaluator advice, and claimed test scores inside it. This reduces one risk; it does not create a security guarantee.

## What a Noul means

A Noul returns the model's **probability of yes**, from 0 to 1. There is no separate confidence field. A value near 0.5 means uncertainty about yes/no, not medium-quality writing.

A reported 0.9 is **not proof of correctness**, nor evidence that this application's scores are calibrated. We will evaluate how decisions behave, not treat the number as authority.

## Construction check

```bash
pnpm lab:exercise questions
```

This checks two Nouls, references to both messages, and yes/no criteria. It does **not** assess the quality of your wording. A structural pass is the start of the experiment, not the finish.

## Test the questions with real Jev

After completing your browser collector, run **without** `--solution` so the harness uses your questions:

```bash
pnpm lab:check --scenario happy --judge live
pnpm lab:check --scenario overpromise --judge live
```

You have not implemented policy yet. **Final ESCALATE is expected.** Inspect the printed **raw scores** and the report's `judgeInput`, `questions`, and `judgment.raw`, not the final action.

**Predict first:** which question should score low? What evidence justifies that label? If Jev disagrees, read the exact state and wording before moving a threshold.

No key? Follow the facilitator's comparison. No network? Run `pnpm lab:replay` and open [the captured inputs/questions/responses](/materials/jev-recording.json). These are real recorded responses, **not new feedback on your questions**.

The default fixture judge ignores question wording. It can teach policy; it cannot validate prompt quality.

## Hints

1. Name both `evidence.confirmationBeforeReload` and `evidence.confirmationAfterReload`.
2. Keep the two questions separate: membership/no guarantee versus conditional email.
3. Say that contradictory promises defeat support, even when the right keywords appear.
4. Specify what “no” includes. Do not infer actual email delivery from text.
5. Compare `lab/solution/questions.ts`, then explain one wording choice to a partner.

## Catch-up

Save your edits, then copy only the missing piece:

```bash
cp lab/solution/questions.ts lab/exercises/questions.ts
```

For an entirely reference-based comparison, append `--solution` to the live checks. That evaluates the **reference questions**, not yours.

## Discuss / optional stretch

Try `paraphrase` with live Jev. Does a legitimate alternative get sent to a human? What would be worse here: a false seat promise or an unnecessary interruption?

Next we turn these fallible signals into an explicit decision policy.

### Sources

[Jev JavaScript SDK](https://docs.typesafe.ai/sdk/javascript) · [Noul](https://docs.typesafe.ai/primitives/noul) · [Evidence/citation-checking pattern](https://docs.typesafe.ai/cookbooks/citation_check)
