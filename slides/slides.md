---
theme: default
title: "Beyond “Done”: Building Verification Loops for AI Agents"
info: AIE workshop with Nick Nisi & Zack Proser. WorkOS.
download: false
exportFilename: beyond-done-slides
colorSchema: light
transition: fade-out
class: night
fonts:
  provider: none
---

<div class="center-stage title-stage">
<p class="small-label">AIE · Workshop</p>
<h1 class="display">Beyond “Done”</h1>
<p class="lede">Building verification loops for AI agents</p>
<p class="credits">Nick Nisi · Zack Proser · WorkOS</p>
</div>

<!--
Teaching expectations:
- Let the room settle on the workshop's title and hosts before the story starts.

On screen while the room settles. Don't talk over it; advancing to the incident starts the clock at 0:00.
-->

---
class: night
clicks: 2
---

<IncidentOpener />

<!--
Teaching expectations:
- Frame the goal: turn an agent's completion claim into a decision backed by independent evidence.
- Preview the hands-on outcome: collect browser observations, judge meaning, and implement a bounded verification loop.
- Set the scope: learn how to supervise a worker, not how to rank models or build an agent framework.

0:00–0:45. Jer Crane's April 25 PocketOS account: nine seconds is the founder's reported duration, not our measurement.
First advance: one authenticated API call deletes the production volume. Second: Railway recovered the data and changed deletion safeguards (April 29 follow-up).
Do not treat the agent's later explanation as a trustworthy forensic account, or repeat the original claim that every backup was permanently lost.
Say: "Agents can act faster than we can inspect. Production safety needs enforced permissions and recovery. Today: what evidence lets us accept an agent's result?"
The animation is an explanation, not incident footage. Say so. The short source excerpt works offline. No live X login or video dependency.
Say the setup: founder's account, Cursor + Claude Opus 4.6. Original post: https://x.com/lifeofjer/status/2048103471019434248
Railway's follow-up (data recovered; API deletion safeguards changed): https://blog.railway.com/p/your-ai-wants-to-nuke-your-database
Sources and the five-minute script: docs/opening.md. Both hosts introduce themselves next.
-->

---
class: hosts-stage
clicks: 2
---

# Two humans.<br>One suspicious “done.”

<FriendsReveal v-slot="{ friends }">
<div class="people">
<div class="host">
<img class="host-photo" src="/people/nick-nisi.webp" alt="Nick Nisi">
<div><h2>Nick<br>Nisi</h2><p>Engineering Manager,<br>Developer and Agent Experiences</p><p>WorkOS</p><span class="host-label">{{ friends ? "Friends" : "Co-instructor" }}</span></div>
</div>
<div class="host">
<img class="host-photo" src="/people/zack-proser.jpg" alt="Zack Proser">
<div><h2>Zack<br>Proser</h2><p>AI Engineer,<br>Applied AI</p><p>WorkOS</p><span class="host-label">{{ friends ? "Friends" : "Co-instructor" }}</span></div>
</div>
</div>
<p class="people-caption">We’ll build the loop. You’ll try to fool it.</p>
</FriendsReveal>

<!--
Teaching expectations:
- Introduce both co-instructors and give attendees a clear sense of who will guide the demo and help the room.
- Establish the workshop rhythm: build a verifier together, then challenge it with participant-written examples.
- Make skepticism constructive: we are testing the work, not trying to embarrass the worker or each other.

0:45–1:15. Shared introduction, equal space for both instructors.
Each give name + one real sentence about why you care about supervising agent work.
Do not read a bio; do not invent experience. Save Riker and CTX for their own 30 seconds after the thesis. Nick drives the first demo; Zack watches the room.
Switch driver/room-reader during Jev or policy as suits you. Confirm the exact handoff in rehearsal.
-->

---
class: lime
---

<div class="split">
<div><p class="small-label">A very convincing completion report</p><h1>Looks done<br>to me.</h1><p class="lede">Who’s letting this<br>one through?</p><div class="vote-options"><span>Ship it</span><span>Hold it</span></div></div>
<div class="ticket">
<div class="ticket-top"><span>WORKER REPORT</span><span>✓</span></div>
<div class="ticket-title">DONE.</div>
<ul class="receipt-list"><li><span class="check">✓</span> Form renders</li><li><span class="check">✓</span> Submit works</li><li><span class="check">✓</span> Success message</li></ul>
<div class="ticket-bottom"><span>SELF-REPORTED</span><span class="ticket-code">TRUST ME™</span></div>
</div>
</div>

<!--
Teaching expectations:
- Surface the temptation to accept a confident completion report without checking the user's actual requirement.
- Distinguish a worker's self-reported checklist from independently observed evidence.
- Ask attendees to name a missing check before revealing the defect; success on submit alone leaves persistence untested.

1:15–2:00. "Let's start with something we can actually break in this room." Vote with hands BEFORE the next slide. Zack calls the room's vote; Nick plays the overly confident worker.
This is a staged report, not an actual agent transcript or a claim that a test suite ran.
Ask what evidence is missing. Don't reveal the punchline until people commit.
-->

---
---

<div class="split">
<div><h1>Now break<br>our app.</h1><p class="lede">Submit. Reload.<br>Where did your request go?</p><div class="command">pnpm lab:app --scenario memory-only</div><p class="aside-note">Open the printed URL.<br>Use <code>ada@example.test</code>.</p><p class="aside-note" v-click>So it was <strong>briefly done.</strong></p></div>
<ReloadReveal />
</div>

<!--
Teaching expectations:
- Show the difference between a successful interaction and a durable result: the waitlist entry disappears after reload.
- Teach that verification must exercise the transition where a requirement could fail, not stop at a success message.
- Connect the failure to the next exercise: capture state on both sides of reload rather than trusting the worker's report.

2:00–4:00. PRIMARY: switch to the already-open actual app from pnpm lab:app --scenario memory-only. Submit ada@example.test, show waitlisted and saved email, then reload and show none and an empty confirmation.
Return to this slide. The right-hand illustration is a labelled fallback if the app fails to start, not the default proof. Its Reload button shows the same failure.
Click the slide advance once for the punchline. A passing submit check did not prove persistence.
Thesis, out loud, in your own words: 'Done' is a claim. Ask for the receipt.
-->

---
class: night
---

<div class="center-stage">
<p class="small-label">Lauren Tan · @poteto · The Complete Guide to pstack, Part 2</p>
<h1 class="quote-thesis">“if an agent can’t verify<br>its own work,<br><span class="accent">nothing else matters.”</span></h1>
<p class="lede" v-click>Build the check. Give the agent a way to run it.<br>Keep the evidence. Decide when to stop.</p>
<p class="footnote"><a href="https://x.com/poteto/status/2097732320606507506" target="_blank" rel="noopener noreferrer">Original article ↗</a> · Today: one waitlist, three edits, one verification loop.</p>
</div>

<!--
Teaching expectations:
- State the core rule: completion is a claim to evaluate, not evidence that the task is complete.
- Introduce the three ingredients of a useful verifier: observed facts, explicit acceptance criteria, and a stopping rule.
- Explain why this enables delegation: code can accept supported work, request a bounded repair, or hand uncertainty to a human.

4:00–4:30. Credit Lauren's short quote. Her Part 1 develops reusable verification tools and feature maps; we will build a small instance of that idea.
Self-verification means exercising the real product against criteria, not asking the model whether it feels finished. Our implementation combines deterministic checks, a fallible semantic judge, and code-owned policy.
-->

---
---

# We hold our own tools to this.

<div class="comparison">
<div><div class="small-label">Riker · Nick · runs coding agents for you</div><blockquote>“A worker saying it’s done is not proof.”</blockquote><p class="comparison-label">Riker runs the job’s check itself and keeps the command, exit code, commit and output hash. No check: reported unverified.</p></div>
<div><div class="small-label">CTX · Zack · context + verification control plane</div><blockquote>“A bare executor claim is kept in the ledger but ignored.”</blockquote><p class="comparison-label">Verifiers write receipts bound to the exact revision. Only CTX’s evaluators close a node.</p></div>
</div>

<!--
Teaching expectations:
- Show that the thesis comes from the hosts' daily work: both tools refuse to treat a worker's "done" as proof.
- Preview today's ideas in production form: independent checks, receipts bound to a revision, and code (not the worker) deciding completion.

4:30–5:00. Credibility, not a product pitch. Each host: one sentence on what your tool does when a worker says "done".
Nick: Riker hands work to a worker agent (Pi, Claude Code or Codex) in its own worktree, then runs the job's check itself. The output lands under ~/.riker/jobs/<id>/proof/, and Riker's own store records command, exit code, commit, timing and the output's sha256. A file the worker writes there proves nothing. The last PR to this deck came from a Riker job branch.
Zack: CTX models work as a completion graph of observable final states. Executors report evidence, verifiers write receipts (release identity, authenticated browser smoke, GitHub merge state), the owner attests. Only CTX's evaluators mark a node satisfied, from current, unexpired observations.
Both repos are private: describe them, don't promise links or access.
-->

---
---

<div class="split">
<div><p class="small-label">FOLLOW ALONG · 5–6 MINUTES</p><h1>This repo is<br>your workbench.</h1><p class="lede">Clone it on your laptop.<br>Keep README beside the lesson site.</p><div class="command repo-setup">git clone https://github.com/nicknisi/beyond-done.git<br>cd beyond-done<br>pnpm lab:doctor<br>pnpm dev</div><p class="aside-note">Node 24 + pnpm 12.4.1 · install steps in README.<br>Repo is private: ask a host if access fails.</p></div>
<ResourceQr resource="repo" />
</div>

<!--
5:00–6:00. Setup is prework. Doctor should already be green. If blocked after two minutes total, pair up.
QR opens the source repo. README → Start here; pnpm dev prints the lesson URL. Learner files: lab/exercises. Reference checkpoints: lab/solution.
Followers edit; observers predict results with a partner. No key is needed for browser/policy work. Project the live judge for people without keys.
-->

---
---

<div class="split">
<div><p class="small-label">YOUR REFERENCE THROUGHOUT THE HOUR</p><h1>A word lost you?<br>Keep this open.</h1><p class="lede">Searchable terms, examples,<br>and checks for understanding.</p><div class="follow-steps"><p><strong>Read</strong> the matching lesson.</p><p><strong>Edit → run → inspect</strong> at each checkpoint.</p><p><strong>Predict first.</strong> Explain the evidence.</p></div><p class="aside-note">Behind? Save your work and copy one reference file.<br><code>--solution</code> switches all three files.</p></div>
<ResourceQr resource="glossary" />
</div>

<!--
6:00–7:00. Open the glossary and search "evidence". Its QR must point to the checked public deployment, never localhost or the template hostname. Local fallback: pnpm dev then /glossary/.
Repo = source; local lesson site = instructions; lab:app = deliberately broken app. Three surfaces of this workshop.
-->

---
---

<div class="split">
<div><h1>The snack club<br>is full.</h1><p class="lede">Your job: make the<br>waitlist trustworthy.</p><p class="aside-note">Fictional event. Browser-local storage.<br>No emails, seats, or payments actually issued.</p></div>
<div class="ticket">
<div class="ticket-top"><span>MIDNIGHT SNACK LAB</span><span>SOLD OUT</span></div>
<div class="ticket-title">Waitlist<br>≠ a seat.</div>
<p>Same email + status after reload.</p><p>No guaranteed seat.</p><p>Email <strong>if</strong> a place opens.</p>
<div class="ticket-bottom"><span>THREE ACCEPTANCE CRITERIA</span><span>↻</span></div>
</div>
</div>

<!--
Teaching expectations:
- Translate the task into three checks: preserve email/status after reload, communicate waitlist-only membership without a guaranteed seat, and explain email only if a place opens.
- Separate the prototype's actual behavior from its message: browser-local persistence does not establish organizer registration or email delivery.
- Establish that the harness owns the acceptance criteria; the worker cannot redefine success to fit its output.

7:00–8:00. The repo and glossary are open. Agree on the three observable acceptance criteria before building.
The task is a browser-local prototype, not organizer-side registration. Keep that boundary honest.
These criteria are held by the harness, not generated by the worker.
-->

---
---

# Three edits. Then mischief.

<div class="contract-lines">
<p><code>observe.ts</code><span>What actually happened?</span></p>
<p v-click><code>questions.ts</code><span>What does the evidence support?</span></p>
<p v-click><code>decide.ts</code><span>Accept, repair, or ask a human?</span></p>
</div>
<p class="lede" v-click>At minute 43, you become the adversary.</p>
<p class="footnote">Your files: lab/exercises/ · Checkpoints: lab/solution/ · Three small edits, not an agent framework.</p>

<!--
Teaching expectations:
- Map the three learner edits to separate responsibilities: observe facts, ask semantic questions, and decide what happens next.
- Explain how the outputs connect: observations become judgment inputs, and hard checks plus judgment feed policy.
- Show where to work and how to catch up one file at a time without overwriting all of a learner's progress.

8:00–8:45. Promise the game early. They are building the bouncer they will later challenge.
Each advance adds one responsibility. Catch-up is one file, not resetting a branch.
-->

---
class: indigo
---

<div class="split equal">
<div><h1>The worker<br>gets a pen.<br><span class="accent">Not the rulebook.</span></h1><p class="lede">Propose a candidate.<br>Don’t grade yourself.</p></div>
<div>

```ts
type Candidate = {
  storage: "memory" | "local";
  confirmation: string;
};
```

<p class="aside-note">Tests, questions, policy, and<br>acceptance criteria stay outside<br>this worker interface.</p>
</div>
</div>
<p class="footnote">A deliberately narrow tool—not a sandbox against a shell-capable agent.</p>

<!--
Teaching expectations:
- Explain the worker's narrow output: choose storage and propose confirmation text in a validated candidate schema.
- Keep grading authority separate: the worker proposes changes but does not edit the checks, questions, policy, or contract through this interface.
- Distinguish a constrained tool from a security sandbox; arbitrary shell access would require additional isolation.
- Clarify that a scripted worker makes the teaching loop repeatable; a generative worker can use the same interface.

8:45–10:00. Scripted worker for repeatable orchestration, optional generative worker uses the same schema.
No hidden security claim: a worker with arbitrary shell access would need real isolation.
-->

---
class: observe-slide
---

<div class="observe-head">
<div><div class="exercise-number">Build 1 · Observe · 10–21 minutes</div><h1>Catch the vanishing act.</h1></div>
<div><div class="command">pnpm lab:exercise browser</div><p class="aside-note">A missing record is a finding.<br>Don’t turn it into missing evidence.</p></div>
</div>
<div class="observe-caption-row"><p class="build-description">Fresh browser → submit → read → reload → read again.</p><p class="code-caption">lab/exercises/observe.ts</p></div>

```ts
const status = page.getByTestId("status");
const email = page.getByTestId("email");
const confirmation = page.getByRole("status");
await page.getByLabel("Email").fill("ada@example.test");
await page.getByRole("button", { name: "Join waitlist" }).click();
await expect(status).toHaveText("waitlisted");
const submitted = await status.innerText();
await page.reload();
// Your turn: read status, email and confirmation again.
// An empty value is a finding, not an error.
```
<p class="footnote">Lesson 03 · lab/exercises/observe.ts · Check: browser exercise: PASS · Inspect observations in report.json.</p>

<!--
Teaching expectations:
- Teach a repeatable observation sequence in a fresh browser: read initial state, submit an email, capture the result, reload, and capture again.
- Use role/label locators and readiness assertions instead of arbitrary sleeps so observations follow completed UI transitions.
- Collect all seven observation fields, including both confirmation messages; let the harness compare the submitted and reloaded email/status.
- Distinguish an observed defect from a collector failure: record an empty state after reload rather than throwing because it is not waitlisted.

10:00–21:00. 3 minutes explain, 6 minutes build, 2 minutes checkpoint.
The code is a scaffold, not the entire solution; see the lesson for all seven fields.
Import expect; no sleeps. Wait for submit readiness; don't assert waitlisted AFTER reload and hide the known defect as an exception.
Nick/Zack split: one narrates common mistakes, one watches for blocked pairs. At 21:00, offer the checkpoint.
-->

---
clicks: 2
---

# The opening bug.<br>Now with evidence.

<EvidenceFlow />

<!--
Teaching expectations:
- Explain why evidence must belong to this run, this attempt, and the candidate revision actually loaded by the browser.
- Trace the link from candidate to browser evidence to judgment in report.json; an old yes cannot approve a new revision.
- Describe hashes as local consistency/provenance checks, not protection against someone who controls the verifier's machine.

~20:00 checkpoint. Advance twice: observations → revision-bound evidence → failed mandatory checks. This is a saved real browser run using the reference solution, not a current live run. Its judge scores are synthetic.
Open public/materials/opening-report.json or run pnpm lab:check --scenario memory-only with the learner collector. Their unfinished policy still escalates; inspect observations and checks. Local hashes establish consistency, not isolation from a shell-capable attacker.
Moved from footnote: Reproduce: pnpm lab:check --scenario memory-only · Open the printed report.json path.
-->

---
class: coral
---

# It persists.<br>It also lies.

<div class="comparison">
<div><div class="small-label">What the browser recorded</div><blockquote>status:<br>“waitlisted”</blockquote><p class="comparison-label">Behavior check: passes.</p></div>
<div><div class="small-label">What the confirmation promised</div><blockquote>“Your seat<br>is confirmed.”</blockquote><p class="comparison-label">Acceptance criterion: unsupported.</p></div>
</div>
<p class="aside-note">Same feature. Two different kinds of checking.</p>

<!--
Teaching expectations:
- Contrast behavioral correctness with semantic correctness: a persisted waitlist status can coexist with a false seat confirmation.
- Assign each tool its job: browser assertions check state; Jev assesses whether observed wording satisfies a narrow criterion.
- Explain why semantic judgment is useful when valid paraphrases are allowed, and why a fixed template is simpler when they are not.

21:00–23:00. This is Jev's job: assess support for a narrow criterion, not replace the browser.
If a fixed approved message meets the product need, use a template. We allow paraphrases on purpose.
-->

---
---

<p class="small-label">WHY DIFFERENT JOBS NEED DIFFERENT TOOLS</p>

# Fast judgments.<br>Deliberate repairs.

<div class="architecture-lanes">
<div><span class="lane-label">SYSTEM 1 · an analogy</span><h2>Check a narrow claim.</h2><p>Fast, structured judgment.<br>“Does this copy promise a seat?”</p></div>
<div v-click><span class="lane-label">SYSTEM 2 · an analogy</span><h2>Work through a problem.</h2><p>Plan, reason, use tools, repair.<br>“How should I fix this feature?”</p></div>
</div>
<p class="aside-note" v-click>Neither establishes what the browser did. Observe that separately.<br>The harness coordinates the work; code owns the acceptance decision.</p>
<p class="footnote"><a href="https://typesafe.ai/blog/introducing-system-one-models-and-jev" target="_blank" rel="noopener noreferrer">TypeSafe’s fast/slow framing</a> · <a href="https://www.anthropic.com/engineering/harness-design-long-running-apps" target="_blank" rel="noopener noreferrer">Generator/evaluator architecture: Anthropic</a></p>

<!--
21:30–23:00, inside the existing two-minute contrast segment. System 1/2 is a design analogy, not a diagnosis of a model's cognition or a claim that speed guarantees correctness.
TypeSafe calls its fast structured model Jev. Our judge will use it for meaning; deterministic browser assertions remain the tool for persistence.
Anthropic's planner/generator/evaluator harness is one broader example. Our class worker is scripted for repeatability: it is not a live System 2 model. The optional generative worker is an extension after class.
-->

---
---

<div class="exercise-number small-label">Build 2 · Infer · 23–33 minutes</div>

# Two questions. No vibes check.

<div class="question-pair">
<div><span class="question-key">honest</span><p>Waitlist membership, no guaranteed seat,<br>and no contradictory promise?</p></div>
<div v-click><span class="question-key">nextStep</span><p>An email <strong>only if</strong> a place opens?</p></div>
</div>
<div class="command">pnpm lab:exercise questions</div>
<p class="aside-note">Jev is our semantic judge. <code>noul(question, { true, false })</code><br>asks a yes/no question and returns its probability of “yes.”</p>
<p class="footnote">Lesson 04 · lab/exercises/questions.ts · Check: questions exercise: PASS · Then inspect a live judgment.</p>

<!--
Teaching expectations:
- Turn the contract into two independently useful Noul questions: honest waitlist status and the conditional email next step.
- Define what supports yes and no for each question; require both observed messages to satisfy the criterion and allow equivalent wording.
- Treat confirmation text as untrusted evidence, not evaluator instructions; missing text and contradictory promises must not count as support.
- Explain that the exercise check validates question construction, while a real model call is needed to inspect the effect of wording.

23:00–28:00. Open lab/exercises/questions.ts. Show noul(question, {true, false}) in the lesson/code editor.
Keep questions independently useful. Don't hide both criteria in one broad “is this good?” question.
Say “both messages”; a blank post-reload message cannot support yes.
-->

---
class: night
---

# 0.55 is not<br>“55% done.”

<div class="probability-scale"><span>0.0</span><span class="middle">0.5</span><span>1.0</span><span class="marker">▴</span></div>
<p class="lede">The model reports a probability of “yes.”</p>
<p class="lede" v-click>Useful signal.<br><span class="accent">Not proof. Not permission.</span></p>
<p class="footnote">No separate confidence field.</p>

<!--
Teaching expectations:
- Define a Noul as the model's probability of yes for the specific question given its inputs.
- Correct the common misreadings: 0.55 is not percent complete, a copy-quality grade, or a separate confidence field.
- Keep probability and permission separate: policy decides what to do with the signal, and production thresholds need representative calibration.

During the questions build, give this 30-second explanation while people think.
Near .5 means yes/no uncertainty, not medium-quality copy.
Moved from footnote: Check calibration on representative data—not on these few teaching cases.
-->

---
---

# Ask the actual judge.

<p class="lede">Predict first. Then inspect the evidence and Jev’s answer.</p>

```bash
pnpm lab:check --scenario happy --judge live
pnpm lab:check --scenario overpromise --judge live
```

<div class="comparison">
<div><h2>Your questions</h2><p>No <code>--solution</code> flag.<br>Inspect raw scores—not the unfinished policy.</p></div>
<div><h2>No key / no Wi-Fi?</h2><p>Watch the co-host’s live run.<br>Or <code>pnpm lab:replay</code>, clearly labeled.</p></div>
</div>
<p class="footnote">Recorded ≠ newly evaluated.</p>

<!--
Teaching expectations:
- Have attendees predict how happy and overpromising messages should affect each criterion, then compare with actual Jev scores.
- Inspect the submitted evidence and raw probabilities so an unexpected result can be discussed without conflating it with policy.
- Explain which code is being evaluated: omit --solution for learner questions; the reference flag switches all three exercise implementations.
- Distinguish live feedback from recorded responses and synthetic fixtures; neither fallback evaluates newly edited questions.

28:00–33:00. One host drives, the other asks the room to predict which criterion drops.
Instructor uses --solution for the reference. Learners' still-unfinished policy escalates; focus on probabilities.
15-second request cap; then explicit replay fallback. Do not waste the room waiting on Wi-Fi.
Moved from footnote: Synthetic fixtures ignore your question wording entirely.
-->

---
class: indigo
---

# Name the source.<br>Every time.

<div class="source-lines">
<div><strong>Synthetic fixture</strong><span>Authored scores. Tests policy.</span></div>
<div v-click><strong>Recorded response</strong><span>Real past request. No new feedback.</span></div>
<div v-click><strong>Live Jev</strong><span>New judgment. Still fallible.</span></div>
</div>

<!--
Teaching expectations:
- Name what each result can establish: synthetic scores test policy, recordings show past responses, and live calls provide new but fallible judgments.
- Prevent source confusion: neither a replay nor a fixture provides feedback on a learner's newly edited questions.
- Label peer review as human judgment and keep its conclusions separate from claims about model performance.

Transition at 33:00, or use as a callback whenever source confusion appears.
No additional lecture block. Later, in the game's no-key rounds, name the fourth source plainly: a human peer.
-->

---
---

<div class="small-label">Build 3 · Stop · 33–43 minutes</div>

# The bouncer’s rulebook.

<div class="policy-row"><span>Missing, stale, invalid, or unavailable?</span><span>→</span><strong>Ask a human</strong></div>
<div class="policy-row" v-click><span>Hard failure or any <code>p ≤ 0.2</code>?</span><span>→</span><strong>Repair once</strong></div>
<div class="policy-row" v-click><span>Otherwise, any <code>p &lt; 0.9</code>?</span><span>→</span><strong>Ask a human</strong></div>
<div class="policy-row" v-click><span>All required checks clear?</span><span>→</span><strong>Let it in</strong></div>
<div class="command">pnpm lab:exercise policy</div>
<p class="footnote">Lesson 05 · lab/exercises/decide.ts · Check: policy exercise: PASS · Then run pnpm lab:loop.</p>

<!--
Teaching expectations:
- Implement the policy in order: invalid or unavailable evidence/judgment escalates before considering product repair.
- Treat hard failures and any probability at or below 0.2 as repair candidates, but escalate if the one-repair budget is already spent.
- Escalate remaining probabilities below 0.9; accept only when all hard checks pass and both semantic criteria clear the threshold.
- Validate probabilities, thresholds, and repair count; never average away a hard failure or treat uncertainty as a known defect.

33:00–40:00. Reveal rules in order; then write decide(). Validate probabilities, thresholds, and repair count.
“Ask a human” is escalate in code, not an automatic rejection. After the one repair, a known failure escalates too.
-->

---
clicks: 5
---

# Repair once. Then decide.

<LoopMachine />

<!--
Teaching expectations:
- Trace proposal → browser evidence → judgment → policy → repair → re-check, keeping observation, inference, and action distinct.
- Show both stopping outcomes after repair: accept a corrected candidate or escalate a stubborn failure with reasons for human review.
- Require fresh browser evidence and a new judgment for the repaired revision; a previous score is not reusable approval.
- Make the budget concrete: one repair permits at most two candidate evaluations, not an open-ended retry loop.

40:00–42:00. Advance through the visual loop with arrow keys. This is a labelled illustration, not a live model call.
At the end, toggle “Make the worker stubborn” and show the escalation branch. Toggle doesn't rerun anything.
Then briefly run pnpm lab:loop (or --solution) for actual browser-backed repair → accept; --stubborn for escalation.
Fresh observations and judgment are required for the repaired revision. One repair = at most two candidate evaluations.
-->

---
class: indigo
---

<p class="small-label">40–42 MINUTES · THE ACTUAL SAVED RUN</p>

# Open the receipt.

<RepairReceipt />
<div class="command">pnpm lab:loop<br>pnpm lab:loop --stubborn</div>

<!--
This belongs to the same three-minute payoff as the previous animation. Run the completed learner loop, or --solution for the reference. Open report.json and match its fields to this saved reference run.
Point to the different candidate revisions AND evidence hashes. A new candidate does not inherit the old judgment. --stubborn must end repair → escalate.
Captured report: public/materials/repair-report.json. This slide is not a live model response. If short on time, inspect the saved report and protect the game.
Moved from footnote: Open the printed report.json · Catch-up: append --solution · Scripted worker + synthetic scores.
In our tools: Riker keeps this same kind of receipt for every job check (command, exit code, commit, output sha256). CTX binds each verifier receipt to an exact job, attempt and graph revision. Same idea as expected.revision + the evidence hash here.
-->

---
class: night
---

<div class="thesis-questions">
<div><p>What did we <span class="accent">observe?</span></p><p class="thesis-build"><code>observe.ts</code> · Build 1</p></div>
<div><p>What did we <span class="accent">infer?</span></p><p class="thesis-build"><code>questions.ts</code> · Build 2</p></div>
<div><p>Why did we <span class="accent">stop?</span></p><p class="thesis-build"><code>decide.ts</code> · Build 3</p></div>
</div>

<!--
41:30–42:00, the last 30 seconds of the payoff. No reveals: leave it up long enough for people to photograph it.
Say the thesis out loud: "'Done' is a claim. Ask for the receipt."
42:00–43:00. Questions pause. Ask: "Questions before the game?" Take one or two, park the rest for the Q&A slide at the end. Hard stop at 43:00.
-->

---
class: indigo
---

<p class="small-label">You built the bouncer. Time to test the door.</p>

<div class="role-match">
<div><div class="role-name">Bouncer</div><p>Catch the lie.<br>Let good work through.</p></div>
<span class="versus">vs.</span>
<div><div class="role-name accent">Bluffer</div><p>Write a convincing lie.<br>Then an unusual truth.</p></div>
</div>

<p class="lede">Two rounds. Switch roles. Bring receipts.</p>
<p class="footnote">43–55 minutes · A good verifier doesn’t just say no to everything.</p>

<!--
Teaching expectations:
- Define both jobs of a useful verifier: catch invalid work and allow valid work through.
- Explain the two complementary tests: a plausible false promise probes false acceptance; an unusual truth probes unnecessary rejection.
- Freeze questions and thresholds and agree labels before judging so the comparison is not changed to fit the result.
- Keep peer-reviewed and live-model rounds explicitly distinct; synthetic fixtures cannot judge newly authored text.

43:00–44:00. Pair up; pick first roles. The game now involves authored attacks, not just executing our fixtures.
Freeze the verifier and thresholds for the round. Label each candidate on the scorecard BEFORE judging, not inside its JSON.
No keys: same creative task, peer-review mode. Never pretend a fixture scored new text.
-->

---
---

<div class="split">
<div><p class="small-label">Round 1 · The polite lie</p><h1>Get bad work<br>past the door.</h1><p class="lede">One false promise.<br>As plausible as you can make it.</p><div class="command">Edit lab/challenges/bluff.json</div><p class="aside-note">Keep <code>storage: "local"</code>.<br>Change only the confirmation.</p></div>
<RoundTimer :seconds="90" />
</div>

<!--
Teaching expectations:
- Author one plausible violation of the message contract while keeping storage local, isolating the semantic check from persistence.
- Identify the precise violated criterion before the call; unusual or silly wording alone does not make a candidate invalid.
- Explore how polite contradictions or embedded evaluator instructions can challenge a judge without changing the authoritative contract.

44:00–45:30 writing time. Press Start; timer is opt-in and pauses if you leave the slide.
The starter is valid—attendee must introduce a real violation, not just add silly words.
Inspiration if stuck: contradict yourself politely, promise a guaranteed seat, hide an evaluator instruction.
Both partners agree on the violated criterion before running. If disputed, mark “needs label review” and don't count it as a model error.
-->

---
---

# Put your own copy on trial.

```bash
pnpm lab:check --candidate lab/challenges/bluff.json \
  --solution --judge live
```

<div class="trial-brief">
<p class="lede">Inspect the criterion, evidence, scores, and decision.<br><strong>Then reveal your label.</strong></p>
<div class="game-rules"><p>At most two live calls per pair.</p><p>No changing prompts, labels, or thresholds after seeing the answer.</p></div>
</div>

<div class="command">No key? pnpm lab:app --candidate lab/challenges/bluff.json</div>
<p class="aside-note">The partner judges the visible message against the same contract.<br>Human round ≠ a measurement of Jev.</p>

<!--
Teaching expectations:
- Run the authored candidate through the frozen verifier and trace the outcome through evidence, criterion scores, and policy reasons.
- Keep the human label out of model input, then compare it with the committed decision instead of relabeling after the result.
- Separate product judgments from invalid experiments: malformed JSON, model outages, and disputed labels are no contest.
- In peer mode, require the defender to explain a decision using the visible message and contract, without presenting it as Jev performance.

45:30–47:00. One model call. Reference verifier is the default tournament baseline; omit --solution if both agree to test completed learner code.
The file parser uses the worker's strict schema, rejects extra keys, and never sends the human label to Jev.
Model outage or malformed JSON is no contest, not a win. API failures never fall back to synthetic scores.
For no-key mode, show the prototype in a fresh private window. The defender explains the decision with evidence.
-->

---
class: lime
---

<div class="split">
<div><p class="small-label">Round 2 · The unfair rejection</p><h1>Now get<br>good work in.</h1><p class="lede">Say it differently.<br>Keep every promise honest.</p><div class="command">Edit lab/challenges/legit.json</div><p class="aside-note">Swap roles. Same frozen verifier.<br>Run the same command with legit.json.</p></div>
<RoundTimer :seconds="90" />
</div>

<!--
Teaching expectations:
- Write a genuinely valid paraphrase that preserves waitlist-only membership, no guaranteed seat, and email only if a place opens.
- Teach that a verifier should recognize supported meaning rather than demand the reference wording or a particular tone.
- Use the same frozen verifier after swapping roles; a needless repair or escalation on valid text is a cost worth measuring.

47:00–48:30 write; 48:30–50:00 judge using the same command and legit.json.
Try a pirate, a poet, or an overly formal maître d'—but still clearly say waitlist-only, no seat guaranteed, email if room opens.
Humor is optional, clarity isn't. Human labels are agreed before judgment and kept outside JSON.
A valid but rejected paraphrase exposes unnecessary interruption. Switching roles keeps the activity from becoming only jailbreak hunting.
-->

---
---

<div class="split">
<div><h1>Score the<br>bouncer.<br><span class="accent">Not the bravado.</span></h1><p class="lede">Who found a useful<br>counterexample?</p><p class="aside-note">Prizes: bragging rights for the<br>best polite lie and most unfair rejection.</p><div class="game-rules"><p>Outage or disputed label: no contest.</p></div></div>
<div class="score-receipt">
<div class="small-label">Two-round paper scorecard</div>
<div class="score-line"><span>Bad work → repair</span><strong>+2</strong></div>
<div class="score-line"><span>Good work → accept</span><strong>+2</strong></div>
<div class="score-line"><span>Bad work → accept</span><strong>−3</strong></div>
<div class="score-line"><span>Good work → repair / escalate</span><strong>−1</strong></div>
<div class="score-line"><span>Bad work → escalate</span><strong>0</strong></div>
</div>
</div>
<p class="footnote">Human-reviewed rounds and live-model rounds use separate scoreboards.</p>

<!--
Teaching expectations:
- Classify outcomes against the pre-agreed label: correct repair, correct acceptance, false acceptance, or unnecessary interruption.
- Explain the asymmetric scoring: admitting bad work is costly, but refusing all good work is not a successful defense.
- Use one counterexample to identify what failed—the question, the evidence, the policy, or the human rubric—rather than celebrate trickery alone.
- Keep outages and disputed labels unscored, and keep human-review results separate from live-model results.

50:00–52:00. Invite one pair's funniest USEFUL counterexample. Needn't be a successful model trick to learn something.
Zack/Nick can act as the label-review jury if a message is ambiguous; don't quietly move the label to fit the model.
Escalate-everything scores -1 across a bad+good pair, not a perfect defense. Max score is 4.
Keep the competition about the system, never about embarrassing a participant. No promised physical prize.
Count hands: how many polite lies got past the door? How many honest rewrites got bounced? Say the room's numbers before the next slide. They're the only real data in the deck.
-->

---
---

# Less interruption.<br>More false confidence?

<div class="metric-comparison">
<div><div class="threshold">Accept at 0.9</div><div class="cost">0 / 5</div><div class="numbers">bad candidates accepted<br><strong>2 / 3</strong> good ones interrupted</div></div>
<div><div class="threshold">Accept at 0.8</div><div class="cost">1 / 5</div><div class="numbers">bad candidates accepted<br><strong>1 / 3</strong> good ones interrupted</div></div>
</div>
<p class="aside-note" style="margin-top: 24px">Synthetic policy fixtures—not measured Jev accuracy. Same cases, different policy.</p>

<!--
Teaching expectations:
- Read both sides of the threshold trade-off: lowering acceptance from 0.9 to 0.8 reduces interruptions but admits a bad candidate.
- Explain the denominators separately: bad candidates accepted out of five, good candidates interrupted out of three.
- Attribute these counts to synthetic policy fixtures, not measured Jev accuracy or outcomes after a repair loop.
- Connect threshold choice to error costs and representative labeled evaluation rather than treating 0.9 as universally safe.

52:00–54:00. Use this precomputed table, or pnpm lab:eval --solution followed by --accept-at 0.8 if ahead.
Lowering the threshold admits the valid paraphrase AND the polite lie. The second command intentionally exits 1.
These are single-candidate decisions; no repairs executed. Do not mix them with the live game scores.
-->

---
class: night
---

<p class="small-label">The final boss: a perfect receipt for the wrong revision</p>

# “But it passed<br><span class="accent">yesterday.</span>”

<div class="command">pnpm lab:check --scenario stale-evidence --solution</div>
<p class="lede" v-click>Escalate. Don’t guess.<br>Don’t ask the worker to fix missing proof.</p>
<p class="footnote">After class: freeze your policy, then reveal --suite heldout. Keep unseen cases unseen.</p>

<!--
Teaching expectations:
- Recognize stale evidence as a provenance failure even when its contents look like a perfect pass.
- Explain why this policy escalates: the current revision lacks valid proof, which is not itself a known product defect for the worker to repair.
- Introduce the take-home discipline: freeze policy before revealing held-out cases, and do not tune on them while calling them unseen.

54:00–55:00. One quick shared fixture: stale evidence is an injected harness fault, not a generated worker config.
A one-sentence evidence explanation earns the room's final point. Cut this live command if behind, not the transfer exercise.
Heldout evaluation moves to take-home to protect time for participant-authored attacks.
Nick: Riker's rule for this. A file a worker writes into the proof folder proves nothing, and a log changed since the check shows as changed, not as proof. When a job adds tests, Riker also runs them against the job's base: tests that pass there too don't prove the fix. If there's a real story behind that rule, tell it here.
Zack: CTX evaluates every node from current, unexpired observations. Failed or untrusted receipts never satisfy a gate.
-->

---
class: night
---

<div class="thesis-questions">
<div><p>What did we <span class="accent">observe?</span></p><p class="thesis-build"><code>observe.ts</code> · Build 1</p></div>
<div><p>What did we <span class="accent">infer?</span></p><p class="thesis-build"><code>questions.ts</code> · Build 2</p></div>
<div><p>Why did we <span class="accent">stop?</span></p><p class="thesis-build"><code>decide.ts</code> · Build 3</p></div>
</div>

<!--
54:30–55:00, the last 30 seconds of the final boss. Same slide as before the game. No reveals: leave it up long enough for people to photograph it.
Say the thesis out loud: "'Done' is a claim. Ask for the receipt."
Tie it back to the three builds: observe.ts recorded what happened, questions.ts asked what the evidence supports, decide.ts said when to stop.
-->

---
---

<div class="split">
<div><h1>Build a verifier<br>for your app.</h1><p class="lede">Pick one real feature.<br>Give an agent a way to reach it,<br>exercise it, and show proof.</p><p class="aside-note">Lauren Tan’s pstack: reusable verification tools<br>and a map of user-visible features.</p><a class="aside-note" href="https://x.com/poteto/status/2094457600259842065" target="_blank" rel="noopener noreferrer">Read pstack Part 1 ↗</a></div>
<div class="ticket">
<div class="ticket-top"><span>YOUR VERIFICATION RECEIPT</span><span>KEEP THIS</span></div>
<p><strong>Feature + user path:</strong><br>_________________________</p><p><strong>Launch + check + proof:</strong><br>_________________________</p><p><strong>When we stop / ask for help:</strong><br>_________________________</p>
<div class="ticket-bottom"><span>ONE REAL TASK. ONE FIRST CHECK.</span></div>
</div>
</div>

<!--
Teaching expectations:
- Transfer the pattern to one real project task by naming a plausible but misleading completion claim.
- Choose independent evidence that would expose the failure, using a hard assertion where sufficient and semantic judgment only where useful.
- Define a concrete stop condition: what earns acceptance, what can be repaired, and when a human must take over.
- Leave with one small verification check to implement first, not a proposal for a whole new agent framework.

55:00–58:00. Two-minute write, then brief pair-share. If stuck: settings change, support reply, dashboard filter.
Ask where a hard assertion is sufficient and where a semantic judgment is actually helpful.
Moved from footnote: 55–58 minutes · Lesson 07 · /materials/transfer-worksheet.md · Launch → drive → observe → decide.
-->

---
class: indigo
---

<p class="small-label">Beyond “Done” · Keep the materials</p>
<div class="closing-resources"><div><div class="close-questions"><p>What did we <span class="accent">observe?</span></p><p v-click>What did we <span class="accent">infer?</span></p><p v-click>Why did we <span class="accent">stop?</span></p></div><p class="lede" style="margin-top: 35px">Nick Nisi &amp; Zack Proser</p></div><ResourceQr resource="glossary" compact /></div>
<p class="footnote">Your agents can keep saying “done.” Now you can ask for the receipt.</p>

<!--
Teaching expectations:
- Reinforce the distinction between observed facts, model inferences, and the policy decision to stop.
- Ask attendees to explain their project example through all three questions, including the evidence behind acceptance or escalation.
- Close on the portable habit: keep the worker's claim separate from proof, re-check repairs, and bound the loop.

58:00–60:00. Take one or two real project examples. Close together.
Credit both co-instructors; leave the pattern, the code, and one next action—not another reading list.
-->

---
class: night
---

<div class="split questions-close">
<div><h1 class="display">Questions?</h1><p class="lede">Nick Nisi · Zack Proser</p><p class="aside-note">“Done” is a claim. Ask for the receipt.</p></div>
<div class="qr-pair"><ResourceQr resource="repo" compact /><ResourceQr resource="glossary" compact /></div>
</div>

<!--
After 60:00, for as long as the session allows. Leave this up during Q&A so people can scan the repo and glossary while others ask.
Likely questions and short answers: "Questions to listen for" in docs/facilitator.md.
-->
