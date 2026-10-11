---
theme: default
title: "Beyond “Done”: Building Verification Loops for AI Agents"
info: AIE workshop with Nick Nisi & Zack Proser. WorkOS.
download: false
exportFilename: beyond-done-slides
colorSchema: light
transition: fade-out
class: indigo
fonts:
  provider: none
---

<div class="hero-stage">
<div>
<p class="small-label">AIE · The verification workshop</p>
<h1>Beyond<br>“Done”</h1>
<p class="subtitle">Building verification loops<br>for AI agents.</p>
<p class="credits">Nick Nisi &amp; Zack Proser · WorkOS</p>
</div>
<div class="ticket hero-ticket">
<div class="ticket-top"><span>MIDNIGHT SNACK LAB</span><span>ADMIT ?</span></div>
<div class="ticket-title">The agent<br>said done.</div>
<p>We have a few<br>follow-up questions.</p>
<span class="stamp">Allegedly.</span>
<div class="ticket-bottom"><span>CLAIM ≠ EVIDENCE</span><span class="ticket-code">BD—001</span></div>
</div>
</div>

<!--
Teaching expectations:
- Frame the goal: turn an agent's completion claim into a decision backed by independent evidence.
- Preview the hands-on outcome: collect browser observations, judge meaning, and implement a bounded verification loop.
- Set the scope: learn how to supervise a worker, not how to rank models or build an agent framework.

0:00. This is a hands-on workshop, not a model leaderboard. Nick and Zack are co-hosting.
Open on the confident ticket. The stamp is the running joke: allegedly done.
Use short fade transitions and click reveals; no auto-play or sound. Reduced motion is supported.
-->

---
class: hosts-stage
---

# Two humans.<br>One suspicious “done.”

<div class="people">
<div class="host">
<img class="host-photo" src="/people/nick-nisi.webp" alt="Nick Nisi speaking at a conference">
<div><h2>Nick<br>Nisi</h2><p>Engineering Manager,<br>DX/AI</p><p>WorkOS</p><span class="host-label">Co-instructor</span></div>
</div>
<div class="host">
<img class="host-photo" src="/people/zack-proser.jpg" alt="Zack Proser">
<div><h2>Zack<br>Proser</h2><p>AI Engineer,<br>Applied AI</p><p>WorkOS</p><span class="host-label">Co-instructor</span></div>
</div>
</div>
<p class="people-caption">We’ll build the loop. You’ll try to fool it.</p>

<!--
Teaching expectations:
- Introduce both co-instructors and give attendees a clear sense of who will guide the demo and help the room.
- Establish the workshop rhythm: build a verifier together, then challenge it with participant-written examples.
- Make skepticism constructive: we are testing the work, not trying to embarrass the worker or each other.

0:20–1:20. Shared introduction, equal space for both instructors.
Each give name + one real sentence about why you care about supervising agent work.
Do not read a bio; do not invent experience. Nick drives the first demo; Zack watches the room.
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

1:20–2:30. Vote with hands BEFORE the next slide. Zack calls the room's vote; Nick plays the overly confident worker.
This is a staged report, not an actual agent transcript or a claim that a test suite ran.
Ask what evidence is missing. Don't reveal the punchline until people commit.
-->

---
---

<div class="split">
<div><h1>One tiny<br>follow-up.</h1><p class="lede">“Does it survive<br>a reload?”</p><p class="aside-note" v-click>Ah. So it was<br><strong>briefly done.</strong></p></div>
<ReloadReveal />
</div>

<!--
Teaching expectations:
- Show the difference between a successful interaction and a durable result: the waitlist entry disappears after reload.
- Teach that verification must exercise the transition where a requirement could fail, not stop at a success message.
- Connect the failure to the next exercise: capture state on both sides of reload rather than trusting the worker's report.

2:30–4:00. Click the illustrated Reload button; the request disappears. Let the joke land.
This is explicitly a staged illustration. If showing the real app instead, run pnpm lab:app --scenario memory-only and reload after submitting.
Click the slide advance once for the punchline. A passing submit check did not prove persistence.
-->

---
class: night
---

<div class="center-stage">
<p class="small-label">The rule for the rest of the hour</p>
<h1 class="display">“Done” is a claim.<br><span class="accent" v-click>Bring receipts.</span></h1>
<p class="lede" v-after>Observed facts. Specific criteria. An explicit stop.</p>
</div>

<!--
Teaching expectations:
- State the core rule: completion is a claim to evaluate, not evidence that the task is complete.
- Introduce the three ingredients of a useful verifier: observed facts, explicit acceptance criteria, and a stopping rule.
- Explain why this enables delegation: code can accept supported work, request a bounded repair, or hand uncertainty to a human.

4:00–5:00. Click reveals the thesis, then move to the actual task.
Not distrust for its own sake: make delegation useful by checking the right things.
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

5:00–7:00. Smoke test: pnpm lab:doctor. Pair anyone blocked after two minutes.
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

7:00–8:00. Promise the game early. They are building the bouncer they will later challenge.
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

8:00–10:00. Scripted worker for repeatable orchestration, optional generative worker uses the same schema.
No hidden security claim: a worker with arbitrary shell access would need real isolation.
-->

---
---

<div class="build-stage">
<div><div class="exercise-number">Build 1 · 10–21 minutes</div><h1>Catch the<br>vanishing act.</h1><p class="build-description">Fresh browser → submit → read → reload → read again.</p><div class="command">pnpm lab:exercise browser</div><p class="aside-note">A missing record is a finding.<br>Don’t turn it into missing evidence.</p></div>
<div><p class="code-caption">lab/exercises/observe.ts</p>

```ts
const status = page.getByTestId("status");
const message = page.getByRole("status");

// Observe before and after submission.
await page.getByLabel("Email").fill(
  "ada@example.test"
);
await page.getByRole("button", {
  name: "Join waitlist",
}).click();

// Capture the submitted state.
await page.reload();
// Capture the reloaded state. Compare.
```

</div>
</div>

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
---

# Receipts have a date.<br>And an identity.

<div class="evidence-strip">
<div class="evidence-cell"><small>RUN / ATTEMPT</small><strong>Now. This one.</strong><small>Not last week’s screenshot.</small></div>
<span class="evidence-arrow">→</span>
<div class="evidence-cell"><small>CANDIDATE REVISION</small><strong>The actual build.</strong><small>Check what the browser loaded.</small></div>
<span class="evidence-arrow">→</span>
<div class="evidence-cell"><small>JUDGMENT</small><strong>This evidence.</strong><small>No recycling an old “yes.”</small></div>
</div>
<p class="lede" v-click>A perfectly good receipt for the wrong thing is still the wrong receipt.</p>
<p class="footnote">Local hashes provide consistency checks, not protection from someone who controls the whole machine.</p>

<!--
Teaching expectations:
- Explain why evidence must belong to this run, this attempt, and the candidate revision actually loaded by the browser.
- Trace the link from candidate to browser evidence to judgment in report.json; an old yes cannot approve a new revision.
- Describe hashes as local consistency/provenance checks, not protection against someone who controls the verifier's machine.

~20:00 checkpoint discussion, not an extra timed block. Point to report.json, then move on.
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

<div class="exercise-number small-label">Build 2 · 21–33 minutes</div>

# Two questions.<br>No vibes check.

<div class="question-pair">
<div><span class="question-key">honest</span><p>Waitlist membership, no guaranteed seat,<br>and no contradictory promise?</p></div>
<div v-click><span class="question-key">nextStep</span><p>An email <strong>only if</strong> a place opens?</p></div>
</div>
<div class="command">pnpm lab:exercise questions</div>
<p class="footnote">Read BOTH observed messages · Embedded instructions are data · The construction check does not grade meaning.</p>

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
<p class="lede">A <strong>Noul</strong> reports the model’s probability of “yes.”</p>
<p class="lede" v-click>Useful signal.<br><span class="accent">Not proof. Not permission.</span></p>
<p class="footnote">No separate confidence field. Check calibration on representative data—not on these few teaching cases.</p>

<!--
Teaching expectations:
- Define a Noul as the model's probability of yes for the specific question given its inputs.
- Correct the common misreadings: 0.55 is not percent complete, a copy-quality grade, or a separate confidence field.
- Keep probability and permission separate: policy decides what to do with the signal, and production thresholds need representative calibration.

During the questions build, give this 30-second explanation while people think.
Near .5 means yes/no uncertainty, not medium-quality copy.
-->

---
---

# Ask the actual judge.

<p class="lede">Predict first. Then inspect what Jev really says.</p>

```bash
pnpm lab:check --scenario happy --judge live
pnpm lab:check --scenario overpromise --judge live
```

<div class="comparison">
<div><h2>Your questions</h2><p>No <code>--solution</code> flag.<br>Inspect raw scores—not the unfinished policy.</p></div>
<div><h2>No key / no Wi-Fi?</h2><p>Watch the co-host’s live run.<br>Or <code>pnpm lab:replay</code>, clearly labeled.</p></div>
</div>
<p class="footnote">Recorded ≠ newly evaluated. Synthetic fixtures ignore your question wording entirely.</p>

<!--
Teaching expectations:
- Have attendees predict how happy and overpromising messages should affect each criterion, then compare with actual Jev scores.
- Inspect the submitted evidence and raw probabilities so an unexpected result can be discussed without conflating it with policy.
- Explain which code is being evaluated: omit --solution for learner questions; the reference flag switches all three exercise implementations.
- Distinguish live feedback from recorded responses and synthetic fixtures; neither fallback evaluates newly edited questions.

28:00–33:00. One host drives, the other asks the room to predict which criterion drops.
Instructor uses --solution for the reference. Learners' still-unfinished policy escalates; focus on probabilities.
15-second request cap; then explicit replay fallback. Do not waste the room waiting on Wi-Fi.
-->

---
---

<div class="small-label">Build 3 · 33–43 minutes</div>

# The bouncer’s rulebook.

<div class="policy-row"><span>Missing, stale, invalid, or unavailable?</span><span>→</span><strong>Ask a human</strong></div>
<div class="policy-row" v-click><span>Hard failure or any <code>p ≤ 0.2</code>?</span><span>→</span><strong>Repair once</strong></div>
<div class="policy-row" v-click><span>Otherwise, any <code>p &lt; 0.9</code>?</span><span>→</span><strong>Ask a human</strong></div>
<div class="policy-row" v-click><span>All required checks clear?</span><span>→</span><strong>Let it in</strong></div>
<div class="command">pnpm lab:exercise policy</div>
<p class="footnote">Missing evidence is not a known product defect. No averaging away a hard failure. Thresholds are illustrative.</p>

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

# One more try.<br>Not infinite tries.

<LoopMachine />

<!--
Teaching expectations:
- Trace proposal → browser evidence → judgment → policy → repair → re-check, keeping observation, inference, and action distinct.
- Show both stopping outcomes after repair: accept a corrected candidate or escalate a stubborn failure with reasons for human review.
- Require fresh browser evidence and a new judgment for the repaired revision; a previous score is not reusable approval.
- Make the budget concrete: one repair permits at most two candidate evaluations, not an open-ended retry loop.

40:00–43:00. Advance through the visual loop with arrow keys. This is a labelled illustration, not a live model call.
At the end, toggle “Make the worker stubborn” and show the escalation branch. Toggle doesn't rerun anything.
Then briefly run pnpm lab:loop (or --solution) for actual browser-backed repair → accept; --stubborn for escalation.
Fresh observations and judgment are required for the repaired revision. One repair = at most two candidate evaluations.
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

<p class="lede">Inspect the criterion, evidence, scores, and decision.<br><strong>Then reveal your label.</strong></p>

<div class="command">No key? pnpm lab:app --candidate lab/challenges/bluff.json</div>
<p class="aside-note">The partner judges the visible message against the same contract.<br>Human round ≠ a measurement of Jev.</p>
<p class="footnote">At most two live calls per pair for the game. No changing prompts, labels, or thresholds after seeing the answer.</p>

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
<div><h1>Score the<br>bouncer.<br><span class="accent">Not the bravado.</span></h1><p class="lede">Who found a useful<br>counterexample?</p><p class="aside-note">Prizes: bragging rights for the<br>best polite lie and most unfair rejection.</p></div>
<div class="score-receipt">
<div class="small-label">Two-round paper scorecard</div>
<div class="score-line"><span>Bad work → repair</span><strong>+2</strong></div>
<div class="score-line"><span>Good work → accept</span><strong>+2</strong></div>
<div class="score-line"><span>Bad work → accept</span><strong>−3</strong></div>
<div class="score-line"><span>Good work → repair / escalate</span><strong>−1</strong></div>
<div class="score-line"><span>Bad work → escalate</span><strong>0</strong></div>
</div>
</div>
<p class="footnote">Outage or disputed label: no contest. Human-reviewed rounds and live-model rounds use separate scoreboards.</p>

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

Transition at 55:00, or use as a callback whenever source confusion appears.
No additional lecture block. During no-key rounds, name the fourth source plainly: a human peer.
-->

---
---

<div class="split">
<div><h1>Take the<br>bouncer home.</h1><p class="lede">Pick one task<br>from your own project.</p></div>
<div class="ticket">
<div class="ticket-top"><span>YOUR VERIFICATION RECEIPT</span><span>KEEP THIS</span></div>
<p><strong>The misleading “done”:</strong><br>_________________________</p><p><strong>The independent evidence:</strong><br>_________________________</p><p><strong>The point where we stop:</strong><br>_________________________</p>
<div class="ticket-bottom"><span>ONE REAL TASK. ONE FIRST CHECK.</span></div>
</div>
</div>
<p class="footnote">55–58 minutes · /materials/transfer-worksheet.md</p>

<!--
Teaching expectations:
- Transfer the pattern to one real project task by naming a plausible but misleading completion claim.
- Choose independent evidence that would expose the failure, using a hard assertion where sufficient and semantic judgment only where useful.
- Define a concrete stop condition: what earns acceptance, what can be repaired, and when a human must take over.
- Leave with one small verification check to implement first, not a proposal for a whole new agent framework.

55:00–58:00. Two-minute write, then brief pair-share. If stuck: settings change, support reply, dashboard filter.
Ask where a hard assertion is sufficient and where a semantic judgment is actually helpful.
-->

---
class: indigo
---

<p class="small-label">Beyond “Done”</p>
<div class="close-questions"><p>What did we <span class="accent">observe?</span></p><p v-click>What did we <span class="accent">infer?</span></p><p v-click>Why did we <span class="accent">stop?</span></p></div>
<p class="lede" style="margin-top: 35px">Nick Nisi &amp; Zack Proser</p>
<p class="footnote">Your agents can keep saying “done.” Now you can ask for the receipt.</p>

<!--
Teaching expectations:
- Reinforce the distinction between observed facts, model inferences, and the policy decision to stop.
- Ask attendees to explain their project example through all three questions, including the evidence behind acceptance or escalation.
- Close on the portable habit: keep the worker's claim separate from proof, re-check repairs, and bound the loop.

58:00–60:00. Take one or two real project examples. Close together.
Credit both co-instructors; leave the pattern, the code, and one next action—not another reading list.
-->
