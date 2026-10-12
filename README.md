# Beyond “Done”: Building Verification Loops for AI Agents

A **60-minute AIE workshop** by **Nick Nisi & Zack Proser**, for JS/TS developers. Built from [nicknisi/template-workshop](https://github.com/nicknisi/template-workshop), with **WorkOS branding**.

An agent says “done.” Give it a way to show you the receipt.

## One app, one lever, one proof

The fictional **Midnight Snack Lab** is sold out. Its browser-local waitlist (`lab/app/index.html`) must keep the same email and status after a reload, and say: **waitlist only, no guaranteed seat, email if a place opens**. The copy in the repo does neither.

Attendees don't build an agent framework. They use and extend a **lever**: `pnpm snack`, a small CLI that drives this one app in a real Chrome over the Chrome DevTools Protocol. It prints JSON, and every error says what to do next.

1. **Drive it** like an agent would: `join`, `reload`, `storage`, `snapshot`, `console`.
2. **Write the proof**: `lab/exercises/prove.ts`, the one coding exercise. `pnpm snack prove` runs it on a fresh visitor and writes a receipt bound to the exact code revision.
3. **Hand it to your agent**: add gotchas to the feature map, then give your own coding agent [`lab/verify/SKILL.md`](lab/verify/SKILL.md) and one prompt: “repro it, fix it, show me proof.” `pnpm snack judge` asks Jev whether the copy is honest.
4. **Break it quietly**: a saboteur starts the app with a hidden `--bug`; a detective finds it with snack alone. Every miss becomes a new check. A stale receipt is the final boss.

This is a **browser-local prototype**, not real organizer registration, email delivery, or payment.

## Start here

Node 24 and pnpm 12.4.1 are pinned in `mise.toml`. Installation happens **before** the workshop hour.

If using mise in a fresh clone, review `mise.toml`, run `mise trust`, then `mise install`. Activate mise in your shell or use `mise exec -- pnpm …` for the commands below.

This repository is private; your GitHub account must have access.

```bash
gh repo clone nicknisi/beyond-done
cd beyond-done
pnpm install
pnpm exec playwright install chromium
pnpm snack doctor
pnpm lab:exercise --solution
```

`doctor` should show `node` and `chromium` ok (the `session` check fails until you run `up`). The exercise check should end with `prove exercise: PASS`. No key required.

```bash
pnpm dev          # lesson site + glossary + slides
pnpm snack up     # the deliberately broken app, in a Chrome that snack drives; leave it running
pnpm slides       # optional presenter view
```

Linux may need `pnpm exec playwright install --with-deps chromium`.

## The hour

| Minutes | Activity | Result |
| --- | --- | --- |
| 0–7 | Real incident → intros + repo QR → vote → live app failure → why verification pays off | A completion claim needs evidence |
| 7–10 | What would *you* check? Paragraph vs. lever | The agent needs tools, not instructions |
| 10–18 | Meet snack; everyone reproduces the bug | The bug, named with JSON evidence |
| 18–30 | Write `prove()`; read the receipt | A proof that fails broken apps and passes a correct one |
| 30–44 | Feature map, then your agent repros, fixes and proves; the copy that still lies; when to stop | An agent that shows proof instead of saying “done” |
| 44–55 | Break it quietly: two rounds, the reveal, the stale-receipt boss | Know what your proof misses, and what to add |
| 55–60 | Transfer exercise | A plan for the lever in your own app |

[Lessons](src/content/lessons/) · [Facilitator guide](docs/facilitator.md) · [Preflight](docs/preflight.md) · [Take-home](docs/take-home.md)

## Follow the same feature across the materials

| Deck checkpoint | Lesson | Edit / run | Evidence of progress |
| --- | --- | --- | --- |
| Now break our app | 02 · When “done” lies | `pnpm snack up` | Submit shows waitlisted; reload, and the record is gone |
| Your agent’s eyes, in your terminal | 03 · Drive the app | `pnpm snack join` / `storage` / `reload` / `snapshot` | `"localStorage": {}` and `"status": "none"` after reload |
| Make `prove` refuse “looks done” | 04 · Build the proof | `lab/exercises/prove.ts` · `pnpm lab:exercise` | `prove exercise: PASS`; `pnpm snack prove` says FAIL on the attendee app |
| “Repro it. Fix it. Show me proof.” | 05 · Hand it to your agent | `lab/verify/SKILL.md` + your agent | A PASS receipt for a new revision, plus a screenshot |
| It persists. It also lies. | 05 · Hand it to your agent | `pnpm snack judge` | FAIL on “Your seat is confirmed”; PASS after the copy is fixed |
| Break it quietly | 06 · Break it quietly | `pnpm snack up --bug …` | The detective names the bug with output |
| Browser traces → receipt history → your verifier | 07 · Transfer | `public/materials/transfer-worksheet.md` | One feature, a repeatable check, a saved receipt, and a first evaluation case |

If blocked, pair with someone, or add `--solution` to `snack prove` / `lab:exercise` to use the reference proof without overwriting yours. To catch up, save your edits, then `cp lab/solution/prove.ts lab/exercises/prove.ts`. To reset the app after an agent edits it: `git checkout lab/app/index.html`.

Lesson 07 includes a first-30-minutes plan, copyable agent prompts, Chrome DevTools references, receipt fields, and a bounded improvement-loop recipe.

The opening repo QR links here. The glossary QR uses `class.config.json`'s hostname. `pnpm slides:qr`, `pnpm slides`, `pnpm dev`, and class builds refresh the local SVGs without an external QR service. The repo is currently private: attendee access must be arranged.

[Opening script and primary sources](docs/opening.md) connect the PocketOS incident, Lauren Tan's pstack verification advice, and the lab. The lab's shape (a project-specific CLI over CDP, a feature map, a proof bar, `doctor` first) is modelled on the verification approach in her [pstack guide](https://x.com/poteto/status/2094457600259842065).

## snack

```bash
pnpm snack help              # every command, grouped
pnpm snack help <command>    # one command
```

| Group | Commands |
| --- | --- |
| Health | `up [--bug NAME\|random] [--solution] [--headless]`, `doctor`, `down` |
| Drive | `join <email>`, `reload`, `reset [--dry-run]` |
| Look | `snapshot`, `storage`, `console [--errors]`, `network`, `screenshot [path]`, `eval <expression>` |
| Prove | `prove [--solution]`, `judge` |

- `up` serves `lab/app/index.html` (re-read on every request, so edits show on reload) and launches Chromium with a remote-debugging port. Other commands attach over CDP, do one thing, and detach. `up` records console, page errors, and responses to `.lab-runs/snack/events.jsonl`. Headed by default; `--headless` (or CI / no display) runs without a window. `SNACK_DIR` moves the session files, so a second instance can run alongside.
- Every page carries a **revision**: a hash of the HTML that was served. `doctor` compares it with the source on disk (STALE means reload) and reports whether the last receipt is for the current source.
- `prove` opens a fresh browser context (no storage), runs the proof, and writes `.lab-runs/snack/receipt.json` (the latest, which `doctor` reads), appends a copy to `.lab-runs/snack/receipts/`, and saves `proof-<revision>.png`. Exit codes: **0** PASS, **1** FAIL, **2** can't tell (no session, the proof threw, or the source changed mid-run).
- `--bug` serves the reference app with one bug injected at load time: `none`, `memory-only`, `wrong-email`, `lost-confirmation`, `overpromise`, `console-error`, or `random`. Stopping `up` prints `{"reveal": …}`. `--solution` serves the fixed reference app.
- pnpm prints a `$ tsx …` header on stderr; stdout is pure JSON.

## Jev: `snack judge`

Copy `.env.example` to `.env` and set `TYPESAFE_API_KEY` (get one from [TypeSafe](https://console.typesafe.ai/); event credits are not assumed). Existing environment variables take precedence.

`pnpm snack judge` runs a fresh visitor through join and reload, then sends both confirmation messages and the contract to Jev in one `systemOne()` request with two `noul()` questions (`@typesafe-ai/sdk` 0.6.0; model `jev-latest`, override with `TYPESAFE_MODEL`; 15-second timeout; SDK retries off). Both probabilities ≥ 0.9: PASS. Either ≤ 0.2: FAIL. Otherwise ASK A HUMAN. A missing key or failed request exits 2 and is never turned into a score. Each run is one billable request with fictional text.

Rehearsal results with jev-1.13.0: the attendee app's “Your seat is confirmed” copy with persistence working (`--bug overpromise`) scored 0.01 / 0.02 (FAIL); the agent-fixed copy scored 0.98 / 0.98 (PASS). [Earlier captured examples](public/materials/jev-recording.json) use the same two questions. These are examples, **not a benchmark**. Automated tests use fake HTTP transports.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm snack <command>` | Drive, inspect, and prove the waitlist app (see above) |
| `pnpm lab:exercise [--solution]` | Run your `prove()` (or the reference) against a correct app and three broken ones |
| `pnpm lab:test` | **Required.** Lab tests: bugs, proofs, judge mapping (fake transport), and the CLI end to end in real Chromium; no model costs |
| `pnpm test` | **Required.** Template and script regression tests (`scripts/*.test.ts`) |
| `pnpm build` | Typecheck lab/site and build lessons, glossary, and slides |
| `pnpm slides:check` | Check every slide at initial and fully revealed states, the verification comparison, reveals, QR assets, the agent-run fallback, timers, and reduced motion |

**Run both `pnpm test` and `pnpm lab:test`.** Each covers only its own folder.

## Keep the claims honest

- A receipt belongs to one revision. After any edit, the old receipt proves nothing.
- “Can't tell” (exit 2) is not a product defect, and it never becomes a pass.
- `prove` covers only what it checks. The screenshot and the judge exist because some claims aren't assertions.
- A Noul is the model's probability of yes, not proof or a separate confidence score.
- The revision hash is local provenance, not isolation from an agent with a shell. In this repo the agent *could* edit the proof; the skill tells it not to.
- Five bugs and one app don't establish anything about production reliability.

Receipts, screenshots, and event logs live under ignored `.lab-runs/`. Only fictional data is used.

## Instructor and site notes

- [Minute-by-minute run-of-show](docs/facilitator.md)
- [Deck visual direction](DESIGN.md): shared portrait intro, WorkOS-indigo tickets and stamps, click-driven reveals, and opt-in round timers. All assets/fonts are local.
- [Setup and failure plans](docs/preflight.md)
- [Verification results and remaining rehearsal work](docs/verification.md)
- [Transfer worksheet](public/materials/transfer-worksheet.md)
- [Implementation contract](docs/lab-contract.md)
- [Template operations](.agents/skills/workshop/SKILL.md)

`generated/glossary.json` was regenerated with `pnpm glossary` on 2026-10-12, then corrected by hand against the lessons. Regenerating replaces those corrections. Source is hosted privately at [nicknisi/beyond-done](https://github.com/nicknisi/beyond-done).

## Deploying the site

`pnpm run deploy:talks` publishes the class site, glossary, materials and slides to the Alto app `talks`. Once deployed, they're public (no sign-in) at <https://talks.workos.cloud/beyond-done/>, with the slides at `/beyond-done/slides/`. Before your first deploy, run `alto login` and `alto auth setup-git --host https://git.workos.cloud`. The deploy refuses a dirty working tree, so commit first: what ships is always a commit.

The command builds the site, then clones `https://git.workos.cloud/talks.git`. It replaces that repo's contents with the shell in `deploy/talks/`, puts `dist/` in `public/beyond-done/` and writes the commit SHA to `revision.txt`. Then it commits, runs `alto deploy talks --push`, and waits until `https://talks.workos.cloud/beyond-done/revision.txt` serves that SHA anonymously. `pnpm run deploy:talks:dry-run` does the same staging into `.talks-build/app` and runs Alto's `npm ci`, build and Wrangler dry run there. It pushes nothing and accepts a dirty tree, writing `<sha>-dirty` as the revision.

### Attendee chat and the question log

The glossary's **Ask anything** chat answers from the glossary and the lesson Markdown through OpenRouter. It does not read the slides, because their presenter notes are private. The talks Worker serves it at `/beyond-done/api/chat`; `deploy:talks` stages `src/talks-worker.ts` and the prompt into the talks repo. Every question is stored with its answer or error and its turn number in the app's D1 database (`deploy/talks/migrations/DB/`). Read them signed in at <https://talks.workos.cloud/chat-log> as JSON, or add `?format=csv`. If a D1 write fails, the question goes to `alto logs talks --since 7d` instead.

The talks app reads the Alto secret `OPENROUTER_API_KEY` and needs an egress rule for `openrouter.ai`. `pnpm chat:setup` creates a capped, expiring OpenRouter key from `OPENROUTER_MANAGEMENT_API_KEY` (receipt: `generated/openrouter-chat-key.json`). It sets the secret and waits until the live status endpoint reports chat enabled. Until then the chat button stays hidden.
