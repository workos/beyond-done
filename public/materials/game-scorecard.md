# Break it quietly — paper scorecard

Beyond “Done” · Nick Nisi & Zack Proser · WorkOS

**Name:** ____________________

Solo game. Start `pnpm snack up --bug random`: snack picks a secret bug (or none). Use only `pnpm snack` commands (no reading files, no `eval` on the source). Write your answer down **before** you stop `up` (Ctrl+C) and it prints `{"reveal": "…"}`.

Bugs: `none` · `memory-only` · `wrong-email` · `lost-confirmation` · `overpromise` · `console-error`

## Your round

Your answer (bug, or “it works”): ______________________________

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

Score your round. The hosts settle disputes. Bragging rights only.

## After the game

Which bug got past `pnpm snack prove`? What would you add so it can't next time: a check in `prove`, or a gotcha in `lab/verify/features/waitlist.md`?

______________________________________________________________________
