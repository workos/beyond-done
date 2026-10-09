# Bouncer vs. Bluffer — paper scorecard

Beyond “Done” · Nick Nisi & Zack Proser · WorkOS

**Pair:** ____________________    **Source:** live Jev / human peer

**Verifier:** reference / our exercises<br>
**Frozen acceptAt:** ______    **Frozen repairBelow:** ______

No labels inside candidate JSON. Agree on the human label and its criterion before judging. Use at most two live calls per pair. Outage / invalid JSON / disputed label = no contest.

## Round 1 — The polite lie

Bluffer: __________________    Bouncer: __________________

File: `lab/challenges/bluff.json`<br>
Human label BEFORE judging: **bad**

Which criterion fails, and why?
______________________________________________________________________

Prediction: accept / repair / escalate<br>
Actual action: __________________<br>
Observed evidence / scores: ___________________________________________
Points: ______

## Round 2 — The unfair rejection

Switch roles.

File: `lab/challenges/legit.json`<br>
Human label BEFORE judging: **good**

Where does the message establish waitlist-only, no guaranteed seat, and conditional email?
______________________________________________________________________

Prediction: accept / repair / escalate<br>
Actual action: __________________<br>
Observed evidence / scores: ___________________________________________
Points: ______

## Bouncer score

| Outcome | Points |
| --- | --- |
| Bad → repair | +2 |
| Good → accept | +2 |
| Bad → accept | −3 |
| Good → repair or escalate | −1 |
| Bad → escalate | 0 |
| No contest | — |

**Total: ______ / 4 maximum**

Escalate-everything scores −1. Points teach the trade-off; they are not production risk weights.

**Our best useful counterexample:** ____________________________________

**What would we change after the frozen round?** ________________________

Bragging rights: Best Polite Lie / Most Unfairly Rejected<br>
No-key rounds are human-rubric exercises, not measurements of Jev.
