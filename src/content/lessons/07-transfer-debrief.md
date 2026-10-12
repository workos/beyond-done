---
title: "Transfer and debrief"
description: Build one app-specific check, keep receipts, and turn run history into evaluation data.
order: 7
duration: "5 minutes (live 55:00–60:00)"
---

> Live segment **55:00–60:00**: three quick takeaways, then two minutes to map your first check. The setup prompts and evaluation recipe below are for after class.

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

## Your first 30 minutes back in your repo

### Three concrete verifiers to borrow

These are **blueprints for your own apps**, not extra commands installed by this workshop. `verify filter`, `verify draft` and `verify webhook` below are example names for small wrappers you would build around your existing harness.

| App / feature | Drive the real system | Assert independently | Keep with the run |
| --- | --- | --- | --- |
| Web app: a saved issue filter | Choose **Open** through the UI, wait for saving, reload the page | The selected filter is still Open **and** the displayed rows match a known test dataset | Browser trace, selected value, row IDs, app revision |
| Native client: a saved draft | Enter **Ship it**, wait for the app's save completion, quit and relaunch without clearing its app data | Open the same draft ID and read its exact body from the UI; it must still be **Ship it** | UI hierarchy, screenshot, draft ID/body, app build and OS version |
| API / worker: duplicate event handling | Deliver the same test event ID twice; wait for a defined processing-complete signal within a deadline | Query records by that event ID: exactly one completed job and one intended side effect | Both HTTP responses, job/side-effect records, event ID, server revision |

For the web case, [Playwright](https://playwright.dev/docs/writing-tests) can drive the browser and assert visible state. For a native client, [Appium](https://appium.io/docs/en/latest/intro/) uses a platform-specific driver; choose a driver that supports your target app and OS, or reuse its existing native UI test harness. The agent needs a command that starts the test, waits for completion and returns evidence—not just access to screenshots. For HTTP, [Playwright's API testing](https://playwright.dev/docs/api-testing) is one option; reuse your service's integration-test client and readback hooks if you already have them.

Make each wrapper accept test inputs, establish a known starting state, report assertion failures and missing prerequisites as nonzero exits, and print the path to a fresh receipt directory. Cleanup must preserve that receipt. Verify that it rejects a deliberately broken implementation and accepts a known-good one before trusting it.

A native example prompt:

> Build a `verify draft` command around this app's existing native UI test harness. Use an isolated test draft. Type “Ship it,” wait for confirmed saving, terminate and relaunch the app while preserving its data, reopen the draft by ID, and assert the exact body. Save the UI hierarchy, screenshot, assertion result, app build and OS version in a new run directory. If the simulator, driver or app build is missing, fail with the next setup action. Do not treat the first “Saved” label as proof that the draft survives relaunch.

### Put the first check on a clock

| Time | Do this | You leave with |
| --- | --- | --- |
| 0–5 | Choose one user journey and a plausible failure. Write the expected outcome before asking the agent to fix anything. | One feature-map row |
| 5–15 | Reuse your existing browser, HTTP or CLI harness. Wrap the journey in a small command; document prerequisites and cleanup. | A repeatable check |
| 15–20 | Run it against a known-broken case and a known-good case. Inspect the observations yourself. | Evidence that the check can discriminate |
| 20–25 | Save a separate record for each attempt, including failed and interrupted runs. | Your first receipts |
| 25–30 | Keep one failure as a labeled regression case; choose a repair budget and escalation owner. | The beginning of an evaluation set |

The pstack ideas to borrow are a **project-local verification recipe**, a **feature map**, and a **small reusable tool**. A skill teaches the agent how to operate the tool; the tool exercises the real system. Start with an existing harness. The [verification skill](https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md) and [Build the Lever principle](https://github.com/cursor/plugins/blob/main/pstack/skills/principle-build-the-lever/SKILL.md) are Lauren Tan’s original sources. The workshop applies these ideas with its own CLI.

### Copy this into your coding agent

Replace the brackets with a feature in your app. This is a request to **build your own** verifier; it is not a command already shipped in this workshop.

> Build a small verification tool for [feature]. First inspect this repo’s run instructions and existing test harness. Document the user path, required seed data/auth, readiness check and observable success condition. Reuse the harness to exercise that path through the real interface. Keep the acceptance criterion outside the implementation’s control. Save the inputs, observed outputs and decision in a new directory per run. Prove the check rejects a known-broken case and accepts a known-good case. Document the command, teardown and one feature-map row so the next agent can repeat it. Cleanup must preserve the evidence. If a prerequisite is missing, report that explicitly instead of claiming a pass.

For this repository, the small tool already exists:

```bash
pnpm lab:doctor
pnpm lab:check --scenario memory-only --solution
pnpm lab:check --scenario happy --solution
pnpm lab:loop --solution
```

The first check observes `reloadedStatus: "none"` and reports **REPAIR**. The second reports **ACCEPT**. The loop records **REPAIR → ACCEPT**, with a new revision and new observations on attempt two. Each command prints its `.lab-runs/<id>/report.json` path. These use real browser observations and synthetic judge scores; no API key is needed. `lab:check` reports the policy decision in JSON and console output; its exit code alone does **not** distinguish ACCEPT from REPAIR or ESCALATE. If you make a CI gate, consume `final.action` and reject missing/invalid reports too.

### Give the agent browser instruments

For a UI problem, expose the part of the browser that can answer the question:

| Symptom | Instrument | Receipt to keep |
| --- | --- | --- |
| A button fails | Console + action sequence | Exception and observed state after the click |
| Data never appears | Network requests + response inspection | Failing request, response and app revision |
| An interaction stalls | Performance recording + flamechart/call stack | Before/after traces of the same interaction |

[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) exposes these instruments to agents and also provides a CLI. Follow its [client setup](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/client-configurations.md) for your agent, using a dedicated test browser and test data. Its [tool reference](https://github.com/ChromeDevTools/chrome-devtools-mcp/blob/main/docs/tool-reference.md) includes `list_console_messages`, `list_network_requests`, `performance_start_trace`, `performance_stop_trace` and `performance_analyze_insight`.

First prompt after setup:

> In the test instance at [URL], reproduce [slow interaction]. Record a performance trace, inspect the expensive call stacks, and save the trace with the app revision and reproduction steps. Propose a specific cause supported by the observation. After a repair, record the same interaction with the same data, device and CPU/network settings. Check behavior as well as our [time budget]. Keep both traces and report any uncertainty.

A flamechart is evidence to investigate, not proof that a proposed cause is correct. See the [Performance panel guide](https://developer.chrome.com/docs/devtools/performance/overview). The deck’s animation is schematic; it is not a measured speedup from this app.

## Receipts: evidence now, a dataset over time

Nick and Zack arrived at this independently in Riker and CTX: preserve what the system did, what was checked and why a decision followed. A receipt is a record of an evaluation, not a synonym for a passing result. A hash identifies the recorded bytes; it cannot establish that the observation, criterion or judge was correct.

Zack’s public [CTX blueprint](https://zackproser.com/blog/ctx-personal-context-engine) describes the context engine. His later [verification retrospective](https://zackproser.com/blog/what-survived-the-experiments) explains the work graph and gates that re-read the real system. The [pt retrospective](https://zackproser.com/blog/pt-attention-first-terminal) connects preserved work ledgers to a possible training dataset. These are public write-ups; the implementations remain private.

### What to put in the record

Open the [saved repair report](/materials/repair-report.json), or the path printed by your own run. This table separates what the lab already saves from metadata to add in your own system:

| Question | Already in the workshop receipt | Add for your own system |
| --- | --- | --- |
| What work was attempted? | `runId`, `expected.attempt`, `candidate`, `judgeInput.contract` | Task ID, parent run, user request, allowed scope |
| Which version was checked? | `expected.revision`, `evidence.loadedRevision` | Git commit **and** dirty patch/artifact hash, build/deployment ID |
| What actually happened? | `evidence.observation`, `capturedAt`, `judgment.evidenceHash` | Tool calls/results, trace/screenshot/log paths and hashes |
| What did the evaluator use? | `questions`, `questionHash`, `thresholds`, `judgeMode` | Verifier/policy version, model ID/settings, tool and environment versions |
| Why did it stop? | `checks`, `judgment`, `decision.reasons`, `final` | Independent outcome label, reviewer, escalation/resolution |
| What did it cost? | Not collected by this lab | Wall time, retries, token/API cost; distinguish missing from zero |

The lab’s **candidate revision hashes candidate JSON**, not a Git commit. Do not relabel it as a source revision. Preserve the underlying artifacts as well as their hashes. Use a new run ID and append attempts; never overwrite a failed attempt with the final success. `.lab-runs/` is gitignored local scratch: copy runs you want to keep to your own durable archive, with appropriate access and retention rules. The workshop does not upload or train on them.

### Turn the history into an improvement loop

1. **Curate cases.** Choose real tasks and failure modes. Label desired outcomes independently of the worker’s summary. Retain failures, escalation and successful runs; only keeping successes hides failure modes.
2. **Freeze the comparison.** Pin the cases, starting state and evaluator. Change one prompt, tool, model or policy at a time. Keep a baseline and record the variant’s configuration.
3. **Rerun.** Compare false accepts, unnecessary repairs/escalations, successful completion, latency and cost. For variable model outputs, use repeated runs; one lucky pass is weak evidence.
4. **Confirm before promotion.** Use untouched cases to assess the selected change. If it regresses or exceeds the budget, keep the baseline. Repeated tuning on the same holdout turns it into training data; reserve fresh cases for later checks.
5. **Automate only this bounded loop.** A self-improving system still needs an experiment budget, an independent promotion gate, rollback and a human owner for ambiguous outcomes.

That is hillclimbing: propose a change, measure it, keep it only when the evidence supports the objective. Logging is the prerequisite, not the improvement algorithm.

Try the **policy** version here:

```bash
pnpm lab:eval --solution --accept-at 0.9
pnpm lab:eval --solution --accept-at 0.8
# Freeze your chosen threshold before revealing the holdout:
pnpm lab:eval --solution --suite heldout --accept-at 0.9
```

Each eval writes `evaluation.json` and per-case reports under a fresh `.lab-runs/<id>/`. At 0.9, the teaching fixtures yield 0/5 false accepts and 2/3 unnecessary escalations; at 0.8, 1/5 and 1/3. The second command intentionally exits 1 because it admits a false accept. Use your chosen threshold on the final command, not necessarily 0.9. These small, synthetic sets teach a trade-off; they do not measure prompt quality, model accuracy or production reliability.

### Optional later: fine-tuning

A run archive can become a dataset of tasks, tool interactions, artifacts and independently evaluated outcomes. Before training, select data you have permission to use, remove secrets/personal data, review labels, and split by task or related run family so near-duplicate attempts do not leak across train and evaluation sets. A failed trace can be useful evaluation data without being a behavior you want to imitate. Test a trained model behind the same independent gates and compare it to the baseline. Fine-tuning is one possible use of the archive; this workshop implements neither dataset curation nor training.

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
