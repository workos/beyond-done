---
title: "Transfer and debrief"
description: Map the verification loop onto your own project, and lock in the precise claims.
order: 7
duration: "5 minutes (live 55:00–60:00)"
---

> Live segment **55:00–60:00**. No new code. Carry the pattern home.

## Outcome

You can describe the loop — **observe → ask → decide → bounded repair** — and
restate the claims it does and does not support, in your own project's terms.

## The pattern you just built

1. **Observe** real behaviour independently (don't trust "done").
2. **Ask** precise yes/no questions whose answers are probabilities (Nouls).
3. **Decide** with hard checks that can't be averaged away, failing closed on
   missing evidence or a judge outage.
4. **Repair once**, then re-observe and re-judge; escalate if it still falls
   short.

## Transfer worksheet (fill in for your project)

Do this now, in two minutes, for something you actually ship. The printable
version is at [`/materials/transfer-worksheet.md`](/materials/transfer-worksheet.md),
with more follow-up in `docs/take-home.md` (repository). Start with the small feature map below; complete the longer questions after class.

### Start with one feature map

Lauren Tan's [pstack Part 1](https://x.com/poteto/status/2094457600259842065) argues for reusable verification tools and a map of the features an agent can exercise. Make one row for your app:

| Feature | Launch / reach it | User path | Tool + proof | Stop / ask for help |
| --- | --- | --- | --- | --- |
| Our waitlist | `pnpm lab:app --scenario memory-only` → printed URL | Submit email → reload | Playwright observations + revision-bound report | Missing/stale proof: escalate; known failure: one repair |
| Your feature | … | … | … | … |

A useful check is runnable again after the next change. Give it a clear command, prerequisites, and expected evidence. Start with deterministic assertions; add a semantic question only where meaning requires one. See the [pstack verification skill source](https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md) for a fuller approach.

### Finish the verification plan

1. **The "done" that lies:** what shallow green do people trust in your system?
2. **Independent evidence:** what would you observe, from the outside, to check
   it for real?
3. **Two honest questions:** write two yes/no questions a judge (model or human)
   could answer about that evidence.
4. **Hard checks:** what must be true regardless of any probability?
5. **Fail-closed:** what's your "we can't judge" path (missing evidence, judge
   down)?
6. **Repair budget:** how many automatic repairs before a human is pulled in?
7. **Thresholds + holdout:** what's your acceptance bar, and what cases will you
   hold out to sanity-check it?

> Need a starting point? Think about an agent changing account settings, drafting a support reply, or updating a dashboard filter. What evidence would you need before accepting its work?

## Claims — say these precisely

- A Noul is the **probability of yes**, not a separate confidence or a proof.
- Synthetic probabilities are **fixtures**, not live Jev measurements or model
  accuracy.
- The prototype is **browser-local**: no real enrollment, email, or payment.
- Process separation is **not** a security sandbox; injection guidance is **not**
  a security guarantee.
- A small hand-authored suite is **not** production reliability.
- Accept-after-repair (with fresh evidence) is **not** a false accept.

## Time-compression fallback

Running short on time? This still works:

- **Skip the editor loop:** run every graded command with `--solution` and watch
  the loop, attacks, and eval on the projector.
- **Keep the playful core:** author one misleading message and one valid paraphrase, then explain the evidence. A partner can judge if API access is unavailable. Use the provided threshold table instead of repeating every eval.
- **If setup failed entirely:** pair with a green neighbour; you can still do the
  transfer worksheet and debrief, which is the part you keep.

## Final checks (optional, after the hour)

```bash
pnpm lab:test   # reference/unit/browser regression — no credentials, no cost
pnpm test       # original template tests
pnpm build      # whole-project typecheck + class/deck build
```

## Discuss

- What's the first "done that lies" you'll put a loop around on Monday?
- Where will you *refuse* to automate the accept and keep a human in the loop?
