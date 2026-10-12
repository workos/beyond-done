---
title: "Transfer and debrief"
description: Build one app-specific check, keep receipts, and turn run history into evaluation data.
order: 7
duration: "5 minutes (live 55:00–60:00)"
---

> Live segment **55:00–60:00**: three quick takeaways, then two minutes to map your first check. The setup prompts and evaluation recipe below are for after class.

## Outcome

You can describe the loop — **observe → fix → prove** — and
restate the claims it does and does not support, in your own project's terms.

## The pattern you just built

1. **Give the agent a lever:** a small CLI that drives the real app and reports what happened as JSON, with `doctor` first.
2. **Define done in a proof** that exercises the user path and checks side effects, and writes a receipt bound to one revision.
3. **Read what assertions can't see:** the screenshot, a narrow judge (Jev) or a human for meaning.
4. **Stop on evidence:** PASS on the current revision. “Can't tell” is never a pass; the same failure after two fixes goes to a human.

## Transfer worksheet (fill in for your project)

Do this now, in two minutes, for something you actually ship. The printable
version is at [`/materials/transfer-worksheet.md`](/materials/transfer-worksheet.md),
with more follow-up in `docs/take-home.md` (repository). Start with the small feature map below; complete the longer questions after class.

### Start with one feature map

Lauren Tan's [pstack Part 1](https://x.com/poteto/status/2094457600259842065) argues for reusable verification tools and a map of the features an agent can exercise. Make one row for your app:

| Feature | Launch / reach it | User path | Tool + proof | Stop / ask for help |
| --- | --- | --- | --- | --- |
| Our waitlist | `pnpm snack up` → a Chrome snack can drive | Join → reload | `pnpm snack prove` → revision-bound receipt | Stale or missing proof: re-prove or ask; same failure after two fixes: a human |
| Your feature | … | … | … | … |

A useful check is runnable again after the next change. Give it a clear command, prerequisites, and expected evidence. Start with deterministic assertions; add a semantic question only where meaning requires one. See the [pstack verification skill source](https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md) for a fuller approach.

### Finish the verification plan

1. **The "done" that lies:** what shallow green do people trust in your system?
2. **Independent evidence:** what would you observe, from the outside, to check
   it for real?
3. **Meaning checks:** which claims need a judgment (model or human) rather than an
   assertion? Write each as a narrow yes/no question.
4. **Hard checks:** what must be true regardless of any probability?
5. **Can't tell:** what happens when evidence is missing, stale, or the judge is
   down? (It must never become a pass.)
6. **Repair budget:** how many fixes before a human is pulled in? (We used two.)
7. **Eval cases:** which misses become regression cases, and which cases will
   you hold out to sanity-check changes?

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
pnpm snack up                 # own terminal; leave it running
pnpm snack doctor
pnpm snack prove --solution
```

On the attendee app, `prove` reports **FAIL** (status after reload: `none`) and exits 1. After a fix it reports **PASS** for a new revision. Each run prints the receipt, writes `.lab-runs/snack/receipt.json`, and appends a copy to `.lab-runs/snack/receipts/`. Exit codes separate PASS (0), FAIL (1) and can't tell (2), so a CI gate can use them; it should still reject a missing receipt. No API key is needed; only `snack judge` calls a model.

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

Open the [saved FAIL receipt](/materials/snack-receipts/1-fail-attendee-app.json) and the [PASS after the agent's fix](/materials/snack-receipts/2-pass-after-agent-fix.json), or the receipts in your own `.lab-runs/snack/receipts/`. This table separates what snack already saves from metadata to add in your own system:

| Question | Already in the workshop receipt | Add for your own system |
| --- | --- | --- |
| What work was attempted? | `app`, and the proof that ran (`prove.ts`) | Task ID, parent run, user request, allowed scope |
| Which version was checked? | `revision` (a hash of the served HTML) | Git commit **and** dirty patch/artifact hash, build/deployment ID |
| What actually happened? | `checks[].actual`, `pageErrors`, `screenshot`, `at` | Tool calls/results, trace/log paths and hashes |
| What did the evaluator use? | `checks[].name` and `expected`; `snack judge` adds the model and probabilities | Verifier/policy version, model ID/settings, tool and environment versions |
| Why did it stop? | `verdict`, `next` | Independent outcome label, reviewer, escalation/resolution |
| What did it cost? | Not collected by this lab | Wall time, retries, token/API cost; distinguish missing from zero |

The receipt’s **revision hashes the served HTML**, not a Git commit. Do not relabel it as a source revision. Preserve the underlying artifacts (the screenshot) as well as their hashes. Append attempts; never overwrite a failed attempt with the final success. snack keeps the latest receipt for `doctor` and appends every receipt to `receipts/`. `.lab-runs/` is gitignored local scratch: copy runs you want to keep to your own durable archive, with appropriate access and retention rules. The workshop does not upload or train on them.

### Turn the history into an improvement loop

1. **Curate cases.** Choose real tasks and failure modes. Label desired outcomes independently of the worker’s summary. Retain failures, escalation and successful runs; only keeping successes hides failure modes.
2. **Freeze the comparison.** Pin the cases, starting state and evaluator. Change one prompt, tool, model or policy at a time. Keep a baseline and record the variant’s configuration.
3. **Rerun.** Compare false accepts, unnecessary repairs/escalations, successful completion, latency and cost. For variable model outputs, use repeated runs; one lucky pass is weak evidence.
4. **Confirm before promotion.** Use untouched cases to assess the selected change. If it regresses or exceeds the budget, keep the baseline. Repeated tuning on the same holdout turns it into training data; reserve fresh cases for later checks.
5. **Automate only this bounded loop.** A self-improving system still needs an experiment budget, an independent promotion gate, rollback and a human owner for ambiguous outcomes.

That is hillclimbing: propose a change, measure it, keep it only when the evidence supports the objective. Logging is the prerequisite, not the improvement algorithm.

Try the smallest version here, on your proof. The game's misses are your first eval cases:

```bash
pnpm lab:exercise                      # baseline: your proof vs. a correct app and three broken ones
# Change one thing: add a "no page errors" check to lab/exercises/prove.ts.
pnpm lab:exercise                      # the correct app must still pass
pnpm snack up --bug console-error      # own terminal
pnpm snack prove                       # the miss should now FAIL
```

Keep the change only if the correct app still passes and the miss now fails. Then try `--bug overpromise`: no assertion on this page catches it, which is why the meaning check exists. Five bugs and one app teach the loop; they don't measure anything about production reliability.

### Optional later: fine-tuning

A run archive can become a dataset of tasks, tool interactions, artifacts and independently evaluated outcomes. Before training, select data you have permission to use, remove secrets/personal data, review labels, and split by task or related run family so near-duplicate attempts do not leak across train and evaluation sets. A failed trace can be useful evaluation data without being a behavior you want to imitate. Test a trained model behind the same independent gates and compare it to the baseline. Fine-tuning is one possible use of the archive; this workshop implements neither dataset curation nor training.

## Claims — say these precisely

- A receipt belongs to **one revision**. After any edit, the old receipt proves nothing.
- “Can't tell” (exit 2) is **not** a product failure, and it never becomes a pass.
- A Noul is the **probability of yes**, not a separate confidence or a proof.
- The prototype is **browser-local**: no real enrollment, email, or payment.
- The revision hash is local provenance, **not** isolation from an agent with a
  shell.
- One app and five bugs are **not** production reliability.
- A PASS after a fix needs fresh evidence for the new revision; the earlier FAIL
  stays in the history.

## Time-compression fallback

Running short on time? This still works:

- **Skip the editor loop:** add `--solution` to `snack prove` and `lab:exercise`,
  and watch the agent run on the projector.
- **Keep the playful core:** play one round of Break it quietly with
  `pnpm snack up --bug random`, and explain the evidence that found it.
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
