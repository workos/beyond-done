# Break it quietly — paper scorecard

Beyond “Done” · Nick Nisi & Zack Proser · WorkOS

**Pair:** ____________________

The saboteur starts `pnpm snack up --bug NAME` while the detective looks away. The detective may use only `pnpm snack` commands (no reading files, no `eval` on the source). Write the answer down **before** the saboteur stops `up` and it prints `{"reveal": "…"}`.

Bugs: `none` · `memory-only` · `wrong-email` · `lost-confirmation` · `overpromise` · `console-error`

## Round 1

Saboteur: __________________    Detective: __________________

Detective's answer (bug, or “it works”): ______________________________

The command and output that prove it: _________________________________

Reveal: __________________    Points: ______

## Round 2

Switch roles.

Saboteur: __________________    Detective: __________________

Detective's answer (bug, or “it works”): ______________________________

The command and output that prove it: _________________________________

Reveal: __________________    Points: ______

## Scoring

| Result | Points |
| --- | --- |
| Named the bug, with output | +2 |
| Said “it works” and it did | +2 |
| Said “it works” and it didn't | −3 |
| Blamed a bug that wasn't there | −1 |
| Right bug, no evidence | 0 |

Each person scores the round they were the detective. The hosts settle disputes. Bragging rights only.

## After the game

Which bug got past `pnpm snack prove`? What would you add so it can't next time: a check in `prove`, or a gotcha in `lab/verify/features/waitlist.md`?

______________________________________________________________________
