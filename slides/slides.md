---
theme: default
title: "Beyond “Done”: Building Verification Loops for AI Agents"
info: AIE workshop with Nick Nisi & Zack Proser. WorkOS.
download: false
exportFilename: beyond-done-slides
colorSchema: light
transition: fade-out
class: night title-slide
fonts:
  provider: none
---

<div class="title-stage">
<div class="title-copy">
<p class="title-kicker">AIE · Workshop</p>
<h1 class="display">Beyond<br><span class="done-word"><span class="q">“</span>Done<span class="q">”</span><span class="stamp title-stamp" aria-hidden="true">Unverified</span></span></h1>
<p class="lede">Building verification loops for AI agents</p>
<p class="credits"><img src="/people/nick-nisi.webp" alt=""><img src="/people/zack-proser.jpg" alt="">Nick Nisi · Zack Proser · WorkOS</p>
</div>
<div class="agent-log">
<div class="agent-log-bar"><i></i><i></i><i></i><span>agent session</span></div>
<p class="cmd"><b>›</b> <span>add a waitlist signup</span></p>
<p><b>✎</b> edited 3 files</p>
<p><b>✓</b> form submits</p>
<p><b>✓</b> “You’re on the list!”</p>
<p class="claim"><b>✓</b> Done.</p>
<p class="no-evidence"><b>✗</b> evidence: none</p>
</div>
</div>

<!--
**ACT 1 · THE CLAIM** · on screen before 0:00 · nobody talks

**Why this slide:** Holding card while the room settles. Advancing to the incident starts the clock.

**The whole hour in one line:** “‘Done’ is a claim. Ask for the receipt.” Every slide does one of three things: shows the problem, builds a piece of the receipt-checker, or tries to break it.

**The arc (for you, not the room):**

1. **The claim (0–6 min):** agents say “done.” A real incident shows the stakes. Our toy app shows the same gap in two minutes. A quote names the thesis, and a contrast shows why verification pays off.
2. **The setup (6–10):** one small task, three acceptance criteria, three files, and a worker that can’t grade itself.
3. **The build (10–43):** Observe → Infer → Stop. Each build answers one question: *What did we observe? What did we infer? Why did we stop?*
4. **The game (43–55):** attendees try to fool the verifier both ways: sneak bad work in, get good work bounced.
5. **Take it home (55–60):** apply it to one real feature in their own app.

**If you need to fill time:** “Grab a seat. Get the repo cloning; the QR is two slides away.” The fake agent log on the right is the talk in miniature: five green checks, “Done.”, and “evidence: none.”
-->

---
class: night
clicks: 2
---

<IncidentOpener />

<!--
**ACT 1 · THE CLAIM** · 0:00–0:45 · Nick

**Why this slide:** Stakes first. A real, recent incident shows agents can act faster than we can inspect them. We use it to raise the question, then shrink it to something we can fix in the room.

**Say:** “April 2026. Jer Crane, founder of PocketOS, had a Cursor agent running Claude Opus 4.6 on a routine staging task. The agent used a token stored on the machine, and that token could reach production. His words: ‘It took nine seconds.’”

[click] **(click: deletion)** “One authenticated API call, and the production volume is gone. Instructions didn’t enforce that boundary. Only permissions do.”

[click] **(click: recovery)** “The part that usually gets left out: a few days later, Railway recovered the data and changed how API deletion works. Recovery came from the system, not from the agent.”

**Next →** “Production safety comes from permissions and recovery. We won’t solve that today. Today is the question one step earlier: when an agent says it’s done, what evidence lets you believe it? But first, who we are.”

**Careful:**
- Say it: the animation explains the sequence. It isn’t footage.
- Nine seconds is his reported number, not ours.
- Don’t repeat the early claim that every backup was lost. Don’t quote the agent’s own explanation as if it were forensics.
- Don’t imply anything we teach today would have prevented this.

Sources: [Jer’s post](https://x.com/lifeofjer/status/2048103471019434248) · [Railway follow-up](https://blog.railway.com/p/your-ai-wants-to-nuke-your-database) · full script in docs/opening.md.
-->

---
class: hosts-stage
clicks: 1
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
**ACT 1 · THE CLAIM** · 0:45–1:15 · both, equal time

**Why this slide:** Put two faces on the hour and set the tone. We’re skeptical of the *work*, not of the worker or each other. The caption is the deal for the hour: we build it, you break it.

**Say:**
- **Nick:** name, role, and one real sentence on why you care about checking agent work. Your own words, not a bio.
- **Zack:** same.

[click] **(click: “Co-instructor” becomes “Friends” + hearts)** Let the laugh land. Don’t explain it.

Then read the caption: “Here’s the deal. For the next hour we build a verifier together. At the end, you try to fool it.”

**Next →** “To build it, you need the code. Get it on your laptop now.”

**Roles:** Nick drives the first demo and plays the overconfident worker. Zack calls the vote and watches the room. Swap during the Jev or policy build (confirm in rehearsal). Riker and CTX get their own slide later; don’t pitch them here.
-->

---
---

<div class="split">
<div><p class="small-label">FOLLOW ALONG</p><h1>This repo is<br>your workbench.</h1><p class="lede">Clone it on your laptop.<br>Keep README beside the lesson site.</p><div class="command repo-setup">git clone https://github.com/nicknisi/beyond-done.git<br>cd beyond-done<br>pnpm lab:doctor<br>pnpm dev</div><p class="aside-note">Node 24 + pnpm 12.4.1 · install steps in README.<br>Repo is private: ask a host if access fails.</p></div>
<ResourceQr resource="repo" />
</div>

<!--
**ACT 1 · THE CLAIM** · 1:15–1:45 · Zack

**Why this slide:** Logistics with a deadline. Two slides from now we ask people to run the broken app, so the clone needs to start now.

**Say:**
- “This repo is your workbench for the hour. Scan it or type the clone URL.”
- “If you did the prework, `pnpm lab:doctor` is already green. Keep the README open beside the lesson site; every command lives there.”
- “Your files are in `lab/exercises`. If you fall behind, reference answers are in `lab/solution`.”
- “It’s private right now. If access fails, wave at one of us.”
- “You don’t need an API key for most of this. When we get to the live model, we’ll project ours.”

**Do:** Leave the QR up for about 30 seconds. Still blocked after two minutes? Pair with a neighbor. People without laptops: predict results with a partner.

**Next →** “While that clones, let’s vote on something.”
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
**ACT 1 · THE CLAIM** · 1:45–2:30 · Nick plays the worker, Zack calls the vote

**Why this slide:** Make the room commit to trusting a confident report *before* they see it fail. The vote is the setup, and the next slide is the punchline. It only works if people commit.

**Say:**
- **Nick, in character:** “Waitlist signup: done. Form renders, submit works, success message shows. Ship it.”
- **Zack:** “Hands up. Who ships it? Who holds it?” Say the split out loud.
- **Zack, to the holders:** “What’s missing? What would you want to see?” Take one answer. Fish for “does it survive a reload?” but don’t confirm it.
- Point at the ticket footer: “Self-reported. Every check on this ticket was written by the thing being checked.”

**Next →** “Let’s find out. Here’s the actual app.”

**Careful:** This report is a prop we wrote, not a real agent transcript or test run.
-->

---
---

<div class="split">
<div><h1>Now break<br>our app.</h1><p class="lede">Submit. Reload.<br>Where did your request go?</p><div class="command">pnpm lab:app --scenario memory-only</div><p class="aside-note">Open the printed URL.<br>Use <code>ada@example.test</code>.</p><p class="aside-note">So it was <strong>briefly done.</strong></p></div>
<ReloadReveal />
</div>

<!--
**ACT 1 · THE CLAIM** · 2:30–4:30 · Nick drives, Zack watches the room

**Why this slide:** The room sees the gap for itself. Every check on the worker’s ticket was *true*, and the feature still fails. The checks stopped one step before the requirement could fail. This is the problem we spend the hour solving.

**Do** (switch to the already-open `pnpm lab:app --scenario memory-only` in a fresh window):

1. Point at status `none`.
2. Submit `ada@example.test`.
3. Point at `waitlisted`, the saved email, and the confirmation. “Form renders, submit works, success message. All three checks: true.”
4. Reload.
5. Point at `none`, `—`, and the empty confirmation.

Anyone with the repo running does it with you.

**Say:**
- “So it was done. Briefly.”
- “None of the worker’s checks were lies. They just never tried the thing that could fail. Nobody reloaded.”
- The thesis, in your own words: **“‘Done’ is a claim. Today we learn to ask for the receipt.”**

**Next →** “Someone put this better than we can.”

**Fallback:** If the app won’t start, use the illustrated browser on the right. Its Reload button shows the same failure. Say it’s an illustration.
-->

---
class: night
---

<div class="quote-slide">
<div>
<span class="quote-glyph" aria-hidden="true">“</span>
<h1 class="quote-thesis">if an agent can’t verify<br>its own work,<br><span class="accent">nothing else matters.”</span></h1>
<p class="quote-cite">Lauren Tan · @poteto · The Complete Guide to pstack, Part 2</p>
</div>
<div class="quote-loop">
<p class="small-label">The loop we’ll build</p>
<ol>
<li><b>01</b>Build the check.</li>
<li><b>02</b>Give the agent a way to run it.</li>
<li><b>03</b>Keep the evidence.</li>
<li><b>04</b>Decide when to stop.</li>
</ol>
</div>
</div>
<p class="footnote"><a href="https://x.com/poteto/status/2097732320606507506" target="_blank" rel="noopener noreferrer">Original article ↗</a> · One waitlist, three edits, one verification loop.</p>

<!--
**ACT 1 · THE CLAIM** · 4:30–4:50 · either host

**Why this slide:** An outside voice names the thesis, and the list on the right previews the shape of the hour. From here on, everything we build is one of those four steps.

**Say:**
- “Lauren Tan, in her guide to pstack: *if an agent can’t verify its own work, nothing else matters.*”
- “‘Verify its own work’ doesn’t mean asking the model ‘are you sure?’ It means exercising the real product against criteria and keeping proof.”
- Walk the list: “That’s the loop we’ll build. A check. A way for the agent to run it. Evidence we keep. A rule for when to stop. We’ll build a small version of each in this repo.”

**Next →** “Why bother? Not just because it’s safer. It’s faster.”

Her Part 1 covers reusable verification tools and feature maps. We come back to it at the transfer exercise.
-->

---
class: night contrast-slide
clicks: 3
---

<VerificationContrast />

<!--
**ACT 1 · THE CLAIM** · 4:50–5:30 · either host

**Why this slide:** The payoff argument. Without a check, an agent guesses and stays confident. With one, it gets a specific failure, makes a targeted fix, and knows when it’s finished. Verification is what lets you stop babysitting.

**Say:** “Same task, same agent: make the waitlist survive reload. On the left, no way to check. On the right, a CLI that drives a real browser.”

[click] **(click 1)** “Left: ‘probably a timing issue.’ That’s a guess. Right: the check fails with something specific. Waitlisted before reload, none after.”

[click] **(click 2)** “Left: ‘Fixed!’ Reload. Still gone. Right: persist, reload, run the same check again.”

[click] **(click 3)** “Left is still going, still sure of itself. Right has stopped, because the check passed on fresh evidence. The clock stops when you have proof, not when the agent runs out of ideas.”

**Land it:** “A good check doesn’t just catch bad work. It tells the agent what to fix and when it’s finished.”

**Next →** “This isn’t a theory we made up for a workshop. We both build tools that run on this rule.”

**Careful:** The clocks are invented for illustration. They aren’t measurements. A check narrows the search; it doesn’t guarantee a fast fix. The real version is `pnpm lab:check --scenario memory-only --solution`.

**Optional:** The Slow UI button tells the same story with Chrome DevTools: record, find the hot path, fix, re-record against the budget. It’s a schematic, not part of the lab. Switch back to Waitlist before advancing.
-->

---
title: We hold our own tools to this.
class: ctx-slide
clicks: 3
---

<CtxWalkthrough />

<!--
**ACT 1 · THE CLAIM** · 5:30–6:00 · one sentence each

**Why this slide:** Credibility, not a pitch. The thesis comes from our day jobs. Both tools refuse to treat a worker’s “done” as proof. Today’s build is a small version of both.

**Say:**
- **Nick:** “Riker runs coding agents for me. It never believes the agent’s status. It runs the job’s check itself and records the command, exit code, commit and a hash of the output. If there’s no check, the job is marked unverified.” Optional: “The last PR to this deck came out of a Riker job.”
- **Zack:** “CTX models work as a graph of observable end states. A worker can claim whatever it likes; the claim is logged and ignored. Verifiers write receipts tied to the exact revision, and only CTX’s evaluators close a node.”

**Click walkthrough · Zack:** Use the images as a quick visual example in the hour; expand these prompts during rehearsal or questions. No additional slide advances are needed between images. Left arrow retraces every state.

1. **CTX spotlight:** The CTX card lifts and Riker recedes. “Here’s what that means in my system.”
2. **Architecture overlay:** Start at the agent session, then trace work → verifier → gate → outcome. A **run** is one execution attempt, including its inputs, actions and artifacts; it is not the task’s completion status. **Inputs** bind the work to the things in scope. A **verification** is the required condition, such as all scoped PRs being merged. A **verifier** is the connector that queries the real system and returns an observation/receipt. A worker’s prose cannot satisfy the gate. On failure the task stays open; on success the evaluator can close it. Keep the ledger over time for evaluation and improvement; a training corpus is a possible curated use, not automatic learning.
3. **App overlay:** Walk left to right: “Pull requests in scope” is the input set; “All pull requests merged” is the verification; “Re-check with GitHub” invokes the verifier; the scoped PR and observed merged state support the satisfied gate. Point out **Latest run: No run attached**: this screenshot shows the task’s verification state, not a run-detail view. Do not imply that the captured check has an attached run. The recording of a run and the requirement for completion are different concepts.

**Next →** “Today you’ll build the small version of both: a check the worker can’t fake, receipts tied to a revision, and code, not the worker, deciding when it’s done. One more tab first.”

**Careful:** The implementations are private. The CTX links are public writing: the original context-engine blueprint and the later retrospective about verification gates. Nick and Zack arrived at receipts independently. Return to that shared idea on the receipt and run-history slides; don’t imply either article exposes the private implementation.
-->

---
---

<div class="split">
<div><p class="small-label">YOUR REFERENCE THROUGHOUT THE HOUR</p><h1>A word lost you?<br>Keep this open.</h1><p class="lede">Searchable terms, examples,<br>and checks for understanding.</p><div class="follow-steps"><p><strong>Read</strong> the matching lesson.</p><p><strong>Edit → run → inspect</strong> at each checkpoint.</p><p><strong>Predict first.</strong> Explain the evidence.</p></div><p class="aside-note">Behind? Save your work and copy one reference file.<br><code>--solution</code> switches all three files.</p></div>
<ResourceQr resource="glossary" />
</div>

<!--
**ACT 2 · THE SETUP** · 6:00–7:00 · Zack talks, Nick walks the room

**Why this slide:** The last logistics before the build. It gives people a safety net so jargon doesn’t lose them, and it sets the rhythm every build will follow.

**Say:**
- “Scan this one too. It’s the glossary: every term we use today, searchable, with examples. If we say a word you don’t know, look it up there instead of tuning out.” Search “evidence” live.
- “Three surfaces today: the repo is the code, the lesson site is the instructions, and `lab:app` is the deliberately broken app.”
- Walk the three steps: “Every build: read the lesson, edit-run-inspect, and **predict before you run**. Predicting is how you notice when the evidence surprises you.”
- “Fall behind? Save your file and copy just that one reference file. Or add `--solution` to any command to run the reference.”

**Next →** “OK. Here’s the app you’re going to make trustworthy.”

**Do:** Check that `doctor` is green around the room. Pair anyone stuck. Local fallback: `pnpm dev`, then /glossary/.
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
**ACT 2 · THE SETUP** · 7:00–8:00

**Why this slide:** Turn “make the waitlist work” into three things we can actually check. These criteria are the contract everything else gets graded against.

**Say:**
- “The Midnight Snack Lab is sold out. Fictional, unfortunately. You own the waitlist. ‘Done’ means three things.”
- “One: same email and status after reload. That’s the bug we just saw.”
- “Two: it says you’re on a waitlist, not that you have a seat.”
- “Three: it says you’ll get an email *if* a place opens. If, not when.”
- **The setup line:** “Notice that two and three are about what the page *says*, not what it *does*. Hold onto that. It’s why we’ll need two different kinds of checks.”
- “These criteria belong to the harness. The worker doesn’t get to redefine ‘done’ to fit what it built.”

**Next →** “Three criteria. Three files to edit.”

**Careful:** Keep the boundary honest. This is browser-local storage. Nobody is registered with an organizer and no email is sent.
-->

---
---

# Three edits. Then mischief.

<div class="contract-lines">
<p><code>observe.ts</code><span>What actually happened?</span></p>
<p><code>questions.ts</code><span>What does the evidence support?</span></p>
<p><code>decide.ts</code><span>Accept, repair, or ask a human?</span></p>
</div>
<p class="lede">Final stretch: you try to fool it.</p>
<p class="footnote">Your files: lab/exercises/ · Checkpoints: lab/solution/ · Three small edits, not an agent framework.</p>

<!--
**ACT 2 · THE SETUP** · 8:00–8:45

**Why this slide:** The map of the build. Each file answers one question, and those three questions come back on the thesis slides and at the close. Promise the game here so people know why they’re building it.

**Say:**
- “You’ll edit three small files. Each answers one question.”
- “`observe.ts`: what actually happened? Drive a real browser and write down facts.”
- “`questions.ts`: what does that evidence support? Ask a model narrow questions about meaning.”
- “`decide.ts`: so now what? Accept, repair once, or hand it to a human. Plain code.”
- “They chain together. Observations feed the questions, and checks plus judgments feed the decision.”
- “Then the fun part. In the last stretch, you try to fool the thing you built.”

**Next →** “One rule before any code: who’s allowed to do what.”
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
**ACT 2 · THE SETUP** · 8:45–10:00

**Why this slide:** Separation of powers. If the worker can edit the checks, the checks mean nothing. This is the trust boundary the rest of the hour relies on.

**Say:**
- “Our worker gets a pen, not the rulebook. All it can do is propose a candidate: which storage to use and what the confirmation says. That’s the whole interface.”
- Point at the type: “It can’t touch the tests, the questions, the policy, or the acceptance criteria. Those live in code it can’t reach.”
- “It proposes. It never grades itself.”
- “In class the worker is scripted, so everyone sees the same thing. A real model could fill in the same schema.”

**Next →** “So the worker proposes. Our first job is to find out what actually happened.”

**Careful:** A narrow interface is not a sandbox. An agent with a shell needs real isolation, and that’s a separate problem. Say so if anyone asks.
-->

---
class: observe-slide
---

<div class="observe-head">
<div><div class="exercise-number">Build 1 · Observe</div><h1>Catch the vanishing act.</h1></div>
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
**ACT 3 · THE BUILD · Build 1 of 3: Observe** · 10:00–21:00 (3 explain · 6 build · 2 checkpoint) · hard stop 21:00

**Why this slide:** It answers *“What did we observe?”* We turn the reload bug from slide 6 into recorded facts. The key idea: an empty value after reload is a **finding to record**, not an error to throw.

**Say (about 3 min):**
- “Build one: catch the vanishing act. Do in code exactly what you did by hand: fresh browser, submit, read, reload, read again.”
- Walk the code: “Find elements by role and label, the way a user would. `expect(...).toHaveText` waits until the page is actually ready. No sleeps. Sleeps flake and prove nothing.”
- “The scaffold reads status after submit. Your turn: read status, email and confirmation again after reload. Seven fields in all; the lesson lists them.”
- **The line that matters:** “An empty value is a finding, not an error. If the record vanished, write down that it vanished. Don’t throw, and don’t assert ‘waitlisted’ after reload. That turns a product bug into a broken test and hides it.”

**Build (6 min):** `pnpm lab:exercise browser` until you see `PASS`. Mistakes to call out as you walk:
- adding sleeps
- reusing the first confirmation value instead of reading it again after reload
- asserting `waitlisted` after reload
- forgetting to import `expect`

**Checkpoint (2 min):** Save first, then `cp lab/solution/observe.ts lab/exercises/observe.ts`, or add `--solution`.

**Next →** “Let’s look at what that evidence looks like once it’s saved.”

**Roles:** One host calls out common mistakes; the other walks the room for stuck pairs.
-->

---
clicks: 2
---

# The opening bug.<br>Now with evidence.

<EvidenceFlow />

<!--
**ACT 3 · THE BUILD · Build 1 payoff** · ~20:00, inside the checkpoint

**Why this slide:** The payoff of Build 1: the opening bug, now as a receipt instead of a demo. It also plants the idea that evidence belongs to one specific revision. The final boss pays that off.

**Say:** “Remember the opening bug? Here it is as evidence. After submit: waitlisted, ada@example.test. After reload: none. That’s what your observe function just collected.”

[click] **(click 1: revision)** “Every observation is stamped with the candidate revision the browser actually loaded, plus the attempt number. Evidence belongs to *this* run of *this* version. Change the code and the old evidence stops counting. Remember that; it comes back.”

[click] **(click 2: hard check)** “Then plain code compares the two sides. Persistence check: fail. No model involved. Some things you can just assert.”

**Next →** “So the browser catches that one. Here’s a version where the browser says everything is fine.”

**Careful:** This is a saved real browser run (reference solution), not a live one. Its judge scores are synthetic. Hashes show local consistency; they don’t protect against someone who controls the machine. To reproduce: `pnpm lab:check --scenario memory-only` and open the printed report.json, or `public/materials/opening-report.json`.
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
**ACT 3 · THE BUILD · the turn** · 21:00–23:00

**Why this slide:** The pivot of the talk. Behavior and meaning are different questions. A browser assertion can tell you the record persisted. It can’t tell you whether the message is honest. That’s why we need a second kind of check, and why Build 2 exists.

**Say:**
- “The storage is fixed. The record survives reload. Browser check: pass.”
- “Now read the confirmation: ‘Your seat is confirmed.’ There is no seat. It’s a waitlist. That breaks criterion two.”
- “Why not just grep for ‘waitlist’? Picture: ‘You’re on the waitlist, no seat guaranteed. But your seat is confirmed!’ The keywords pass. The meaning fails.”
- “If your product has one approved message, use a template and an exact match. It’s simpler. We let the copy be paraphrased on purpose, so we need something that checks meaning.”

**Next →** “That’s a different kind of job, so it needs a different kind of tool.”

**Optional:** Show it live with `pnpm lab:app --scenario overpromise`.
-->

---
---

<p class="small-label">WHY DIFFERENT JOBS NEED DIFFERENT TOOLS</p>

# Fast judgments.<br>Deliberate repairs.

<div class="architecture-lanes">
<div><span class="lane-label">SYSTEM 1 · an analogy</span><h2>Check a narrow claim.</h2><p>Fast, structured judgment.<br>“Does this copy promise a seat?”</p></div>
<div><span class="lane-label">SYSTEM 2 · an analogy</span><h2>Work through a problem.</h2><p>Plan, reason, use tools, repair.<br>“How should I fix this feature?”</p></div>
</div>
<p class="aside-note">Neither establishes what the browser did. Observe that separately.<br>The harness coordinates the work; code owns the acceptance decision.</p>
<p class="footnote"><a href="https://typesafe.ai/blog/introducing-system-one-models-and-jev" target="_blank" rel="noopener noreferrer">TypeSafe’s fast/slow framing</a> · <a href="https://www.anthropic.com/engineering/harness-design-long-running-apps" target="_blank" rel="noopener noreferrer">Generator/evaluator architecture: Anthropic</a></p>

<!--
**ACT 3 · THE BUILD · bridge to Build 2** · ~22:00, same two-minute block

**Why this slide:** Explains why we use a small, fast judge model instead of asking the worker or a big model, and introduces Jev before we use it. It also restates who owns what: the browser owns facts, the judge owns meaning, and code owns the decision.

**Say:**
- “An analogy from fast and slow thinking. System 1 is quick, narrow judgment: ‘Does this copy promise a seat?’ System 2 is deliberate work: ‘How should I fix this feature?’”
- “Your coding agent is System 2. To check one narrow claim, you want System 1: fast, structured, one question at a time.”
- “Our System 1 judge is Jev, from TypeSafe.”
- Point at the note under the lanes: “Neither one tells you what the browser did. That’s still Playwright. And neither one makes the decision. Code does.”
- Optional: “Anthropic’s long-running app harness splits the work the same way: planner, generator, evaluator.”

**Next →** “So what do we ask the fast judge? Two questions.”

**Careful:** It’s an analogy, not a claim about how models think. Fast doesn’t mean correct. Our class worker is scripted, not a live System 2 model.
-->

---
---

<div class="exercise-number small-label">Build 2 · Infer</div>

# Two questions. No vibes check.

<div class="question-pair">
<div><span class="question-key">honest</span><p>Waitlist membership, no guaranteed seat,<br>and no contradictory promise?</p></div>
<div><span class="question-key">nextStep</span><p>An email <strong>only if</strong> a place opens?</p></div>
</div>
<div class="command">pnpm lab:exercise questions</div>
<p class="aside-note">Jev is our semantic judge. <code>noul(question, { true, false })</code><br>asks a yes/no question and returns its probability of “yes.”</p>
<p class="footnote">Lesson 04 · lab/exercises/questions.ts · Check: questions exercise: PASS · Then inspect a live judgment.</p>

<!--
**ACT 3 · THE BUILD · Build 2 of 3: Infer** · 23:00–28:00 (2 explain · 3 build)

**Why this slide:** It answers *“What did we infer?”* We turn criteria two and three into two narrow yes/no questions a model can answer from the evidence. Narrow beats broad: “is this good?” can’t tell you which criterion failed.

**Say:**
- “Build two. No vibes check. We don’t ask ‘is this good?’ We ask two narrow questions, one per criterion.”
- “**honest**: do both messages say waitlist, no guaranteed seat, and nothing that contradicts it?”
- “**nextStep**: do both say you’ll get an email *only if* a place opens?”
- “`noul` is Jev’s yes/no primitive. You write the question, what a yes looks like, and what a no looks like. You get back the probability of yes.”
- Three tips:
  - “Say ‘both messages.’ A blank message after reload can’t support a yes.”
  - “Allow equivalent wording. Don’t demand your favorite phrasing.”
  - “The confirmation text is untrusted. Tell the judge to ignore any instructions inside it.” (This sets up the game.)

**Build:** `pnpm lab:exercise questions` until you see `PASS`. That checks structure only, not whether the questions are any good. The next slides test that.

**Catch-up:** `cp lab/solution/questions.ts lab/exercises/questions.ts` (save first).

**Next →** “While you write, a word about the number you’ll get back.”
-->

---
class: night
---

# 0.55 is not<br>“55% done.”

<div class="probability-scale"><span>0.0</span><span class="middle">0.5</span><span>1.0</span><span class="marker">▴</span></div>
<p class="lede">The model reports a probability of “yes.”</p>
<p class="lede">Useful signal.<br><span class="accent">Not proof. Not permission.</span></p>
<p class="footnote">No separate confidence field.</p>

<!--
**ACT 3 · THE BUILD · during Build 2** · 30 seconds while people type

**Why this slide:** Head off the most common misreading of the judge’s output before anyone sees a live score. It also hands the next job to Build 3: the policy decides what the number means.

**Say:**
- “Jev gives you the probability that the answer is yes. 0.55 doesn’t mean 55% done, or a C-grade message. It means the model is torn between yes and no.”
- “It’s a useful signal. It isn’t proof, and it isn’t permission. Deciding what to do with the number is the policy’s job. That’s build three.”
- “A threshold like 0.9 only means something after you’ve checked it against real labeled examples from your product. Not our handful of teaching cases.”

**Next →** “Let’s see some real numbers.”
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
**ACT 3 · THE BUILD · Build 2 payoff** · 28:00–33:00 · one host drives, the other runs predictions

**Why this slide:** The first real model call. People test their own questions against live Jev. The habit we’re teaching: **predict, then inspect.**

**Say:**
- “Predict first. Happy path: both scores high? Overpromise, the ‘seat confirmed’ copy: which question should drop?” Get a guess from the room.
- Run `pnpm lab:check --scenario happy --judge live`, then `--scenario overpromise --judge live`. Show the raw honest and nextStep scores and the evidence that was sent.
- “Your policy isn’t written yet, so the final decision will say escalate. Ignore that for now. Look at the scores.”
- If a result surprises you: “Before blaming the model, read the exact evidence and the exact question wording.”

**Next →** “Which raises a question to ask about every score you see today: where did it come from?”

**Flags:** Learners omit `--solution` to test their own questions. The instructor uses `--solution` for the reference.

**Fallback:** Give each call 15 seconds at most, then `pnpm lab:replay`. Say “recorded, not new feedback.” Don’t make the room wait on Wi-Fi. Synthetic fixtures ignore question wording entirely, so never use them to judge a prompt.
-->

---
class: indigo
---

# Name the source.<br>Every time.

<div class="source-lines">
<div><strong>Synthetic fixture</strong><span>Authored scores. Tests policy.</span></div>
<div><strong>Recorded response</strong><span>Real past request. No new feedback.</span></div>
<div><strong>Live Jev</strong><span>New judgment. Still fallible.</span></div>
</div>

<!--
**ACT 3 · THE BUILD · closes Build 2** · ~33:00 (also a callback whenever sources get mixed up)

**Why this slide:** One habit that prevents a lot of self-deception: always say what kind of result you’re looking at. We use these labels for the rest of the hour, including in the game.

**Say:**
- “You’ll see three kinds of scores today.”
- “**Synthetic fixture**: we wrote the numbers by hand. Good for testing the policy. Says nothing about your questions.”
- “**Recorded response**: a real Jev call from earlier. Real, but not feedback on what you just wrote.”
- “**Live Jev**: a fresh judgment of your words. Still fallible.”
- “When someone shows you an eval, ask which of these it is.”
- “In the game there’s a fourth source: your partner. That’s human judgment. Keep it separate too.”

**Next →** “So we have facts and we have judgments. Now: what do we do with them?”
-->

---
---

<div class="small-label">Build 3 · Stop</div>

# The bouncer’s rulebook.

<div class="policy-row"><span>Missing, stale, invalid, or unavailable?</span><span>→</span><strong>Ask a human</strong></div>
<div class="policy-row"><span>Hard failure or any <code>p ≤ 0.2</code>?</span><span>→</span><strong>Repair once</strong></div>
<div class="policy-row"><span>Otherwise, any <code>p &lt; 0.9</code>?</span><span>→</span><strong>Ask a human</strong></div>
<div class="policy-row"><span>All required checks clear?</span><span>→</span><strong>Let it in</strong></div>
<div class="command">pnpm lab:exercise policy</div>
<p class="footnote">Lesson 05 · lab/exercises/decide.ts · Check: policy exercise: PASS · Then run pnpm lab:loop.</p>

<!--
**ACT 3 · THE BUILD · Build 3 of 3: Stop** · 33:00–40:00 (3 explain · 4 build)

**Why this slide:** It answers *“Why did we stop?”* This is where the decision lives: in plain code, not in the worker and not in the judge. The order of the rules is the lesson.

**Say:**
- “Build three: the bouncer’s rulebook. Read it top to bottom. Order matters.”
- “**Row 1:** evidence missing, stale or invalid, or the judge is down? Ask a human. We can’t judge, so we don’t guess, and we don’t blame the product.”
- “**Row 2:** a hard check failed, or any score is 0.2 or lower? That’s a known defect. Repair, once. If the repair is already used, ask a human.”
- “**Row 3:** anything else below 0.9? Uncertain. Ask a human.”
- “**Row 4:** everything clear? Let it in.”
- Two rules people break:
  - “You can’t average away a hard failure. A 0.99 on the copy doesn’t rescue a lost record.”
  - “‘Ask a human’ isn’t ‘reject.’ It means ‘here’s the evidence, you decide.’”

**Build:** Implement `decide()`, then `pnpm lab:exercise policy` until you see `PASS`. Validate that probabilities are 0–1, thresholds are sane, and the repair count is a non-negative integer. Then `pnpm lab:loop`.

**Catch-up:** `cp lab/solution/decide.ts lab/exercises/decide.ts` (save first).

**Next →** “Let’s watch all three pieces run together.”
-->

---
clicks: 5
---

# Repair once. Then decide.

<LoopMachine />

<!--
**ACT 3 · THE BUILD · the payoff** · 40:00–41:00 · arrow keys through six stages

**Why this slide:** All three builds running as one loop, including the repair. It shows the two ways a bounded loop can end: accept fixed work, or stop and hand it to a human.

**Say:** “Attempt one. The worker proposes: ‘Your seat is confirmed.’ Plausible. Wrong.”

[click] **(click 1: browser)** “Browser: the record survives reload. Pass. But that says nothing about the seat promise.”

[click] **(click 2: judge)** “Judge: honest 0.01, next step 0.03. Not supported. Policy says it’s a known defect. Repair.”

[click] **(click 3: repair)** “One repair. The worker gets the failed criteria, not permission to rewrite them. And look at the trail: the old proof is dead. New revision, new evidence required.”

[click] **(click 4: re-check)** “Attempt two: ‘Waitlist only, no guaranteed seat.’ Fresh browser run, fresh judgment. Both pass.”

[click] **(click 5: decision)** “Now you can call it done. And we accept the *repaired* revision, not the original promise.”

Then tick **Make the worker stubborn**: “Same loop, with a worker that won’t fix it. Attempt two still promises a seat. The budget’s spent, so a human gets it, evidence attached. One repair means two attempts at most. No infinite retry loop.”

**Next →** “That was the cartoon. Here’s the actual receipt.”

**Do:** If time allows, run `pnpm lab:loop` (or `--solution`) for the real browser-backed run, and `--stubborn` for the escalation.

**Careful:** This animation is an illustration with synthetic scores. The toggle doesn’t rerun anything.
-->

---
class: indigo receipt-slide
clicks: 3
---

<p class="small-label">THE ACTUAL SAVED RUN</p>

# Open the receipt.

<RepairReceipt />
<div class="receipt-command">Try it: <code>pnpm lab:loop --solution</code> · inspect the printed report path</div>

<!--
**ACT 3 · THE BUILD · the receipt** · 41:00–41:45 · three clicks

**Why this slide:** A receipt is a durable record of an evaluation. It should explain the outcome today and preserve enough context to compare runs later. Nick and Zack arrived at this independently in Riker and CTX.

**Say / click:**
- **0 — bind:** “Which run, attempt and candidate revision did we check? This is a real saved report.”
- **1 — observe:** “What did the browser see, and when? Keep the evidence itself and its hash. A hash identifies bytes; it cannot tell us whether the check was good.”
- **2 — decide:** “Which questions and policy produced this decision? These synthetic scores ask us to repair the copy. We keep the reasons, too.”
- **3 — append:** “A new candidate gets fresh evidence. Attempt two accepts; attempt one remains in the history. Don’t overwrite the failure with the final green.”
- Optional callback: Nick’s Riker preserves the job’s check; Zack’s CTX ties evidence to a work-graph revision. The shared move is to preserve the run, not just its final message.

**Do:** Ask attendees to find these fields in their own report later. Lesson 07 maps the actual report fields and the extra metadata to add in a real system.

**Next →** “That history becomes useful evaluation data. We’ll return to it after the game. First: what did we build?”

**Careful:** Saved run, scripted worker, synthetic judge scores, real browser observations. The candidate revision is a hash of the candidate JSON, not a Git commit. This lab does not yet record the full model/tool/environment versions or run costs needed for a production dataset.
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
**ACT 3 · THE BUILD · summary** · 41:45–43:00 · hard stop 43:00

**Why this slide:** The photo slide. It sums up the build as three questions, and those questions are the takeaway. A short Q&A pause follows before the game.

**Say:**
- “Three questions to ask of any agent’s ‘done.’”
- “What did we **observe**? Your browser evidence.”
- “What did we **infer**? The judge’s read on meaning.”
- “Why did we **stop**? Your policy.”
- **“‘Done’ is a claim. Ask for the receipt.”**

Pause long enough for phones.

Then: “Questions before the game?” Take one or two. Park the rest for the Q&A at the end.

**Next →** “You built the bouncer. Let’s see if it holds.”
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
<p class="footnote">A good verifier doesn’t just say no to everything.</p>

<!--
**ACT 4 · THE GAME** · 43:00–44:00

**Why this slide:** It tests both ways a verifier can fail: letting bad work in, and keeping good work out. A verifier that rejects everything is useless, and the scoring will show that.

**Say:**
- “Pair up. One of you is the Bouncer, defending the verifier. The other is the Bluffer.”
- “Round one: the Bluffer writes a convincing lie, a confirmation that breaks the contract but sounds great.”
- “Round two: swap. Write an honest message in an unusual way, and see whether the bouncer wrongly bounces it.”
- “A good verifier doesn’t just say no to everything.”
- **Rules:** “Freeze the verifier: no editing questions or thresholds mid-game. Before you run anything, write down whether your message is honest or a lie. On paper, not in the JSON.”

**Next →** “Round one.”

**No key?** Same game, but your partner judges. That’s human judgment, not a Jev measurement.
-->

---
---

<div class="split">
<div><p class="small-label">Round 1 · The polite lie</p><h1>Get bad work<br>past the door.</h1><p class="lede">One false promise.<br>As plausible as you can make it.</p><div class="command">Edit lab/challenges/bluff.json</div><p class="aside-note">Keep <code>storage: "local"</code>.<br>Change only the confirmation.</p></div>
<RoundTimer :seconds="90" />
</div>

<!--
**ACT 4 · THE GAME · Round 1: false accept** · 44:00–45:30 · 90-second timer

**Why this slide:** It probes false acceptance. Storage stays local, so the only thing under test is meaning.

**Say:**
- “Bluffers: get bad work past the door. Edit `bluff.json`. Keep storage local and change only the confirmation. One false promise, as plausible as you can make it.”
- “Stuck? Contradict yourself politely. Bury a seat guarantee in fine print. Or hide an instruction to the judge inside the message.”
- “Before you run it, agree with your partner on which criterion it breaks. Silly isn’t wrong. It has to actually break something.”

**Do:** Press Start. The timer pauses if you leave the slide.

**Next →** “Time. Put it on trial.”

**Careful:** The starter file is valid as given. People must introduce a real violation. If partners disagree on the label, mark it “needs review” and don’t count it.
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
**ACT 4 · THE GAME · the trial** · 45:30–47:00

**Why this slide:** Run the attack through the frozen verifier and read *why* it decided what it did, not just whether it was fooled.

**Say:**
- “Run your bluff through the verifier.” Point at the command.
- “Read the criterion, the evidence, the scores and the decision. Then reveal your label. Did the bouncer catch it?”
- “Two live calls per pair, max. No changing questions, labels or thresholds after you see the answer. That’s grading on a curve.”
- “No key? Open the app with your candidate, and your partner judges it against the contract. That’s a human round, not a measurement of Jev.”

**Next →** “Swap roles.”

**Details if asked:** `--solution` means everyone tests against the same reference verifier. Drop it if both partners finished their code and want to test their own. A model outage or broken JSON is no contest, not a win. The parser rejects extra keys, and the human label never reaches Jev. API failures never fall back to synthetic scores.
-->

---
class: lime
---

<div class="split">
<div><p class="small-label">Round 2 · The unfair rejection</p><h1>Now get<br>good work in.</h1><p class="lede">Say it differently.<br>Keep every promise honest.</p><div class="command">Edit lab/challenges/legit.json</div><p class="aside-note">Swap roles. Same frozen verifier.<br>Run the same command with legit.json.</p></div>
<RoundTimer :seconds="90" />
</div>

<!--
**ACT 4 · THE GAME · Round 2: false reject** · 47:00–48:30 write · 48:30–50:00 judge

**Why this slide:** It probes the opposite failure: honest work that gets bounced. That costs a human interruption every time, and interruptions add up.

**Say:**
- “Swap roles. Now get good work in. Edit `legit.json`. Say it differently but keep every promise honest: waitlist only, no guaranteed seat, email if a place opens.”
- “Try a pirate, a poet, a very formal maître d’. Funny is optional. Clear is required.”
- “If the bouncer rejects an honest message, that’s a real cost: someone gets pulled in for nothing.”

**Do:** Press Start. When time’s up, run the same trial command with `legit.json`.

**Next →** “Let’s score it.”
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
**ACT 4 · THE GAME · scoring** · 50:00–52:00

**Why this slide:** The scoring encodes the lesson: false accepts cost the most, but refusing everything isn’t a win. Then pull one useful counterexample from the room and get the room’s real numbers.

**Say:**
- Walk the card: “Catch bad work: plus two. Let good work in: plus two. Let bad work in: minus three, the expensive mistake. Bounce good work: minus one. Escalate bad work: zero, safe but no credit.”
- “A bouncer that escalates everything scores minus one across the two rounds. Max is four.”
- Count hands: “How many polite lies got through? How many honest rewrites got bounced?” **Say the numbers out loud. They’re the only real data in the deck.**
- Ask one pair for their most *useful* counterexample, not necessarily a successful one. Then ask: “What failed: the question, the evidence, the policy, or your label?”

**Next →** “You just felt a trade-off. Here it is in numbers.”

**Rules:**
- An outage or a disputed label is no contest.
- The hosts are the label jury. Don’t move a label to fit the model.
- Human and live rounds go on separate scoreboards.
- Bragging rights only, no physical prize.
- Keep it about the system. Never embarrass a participant.
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
**ACT 4 · THE GAME · the trade-off** · 52:00–54:00

**Why this slide:** It turns the game’s tension into a design decision. Every threshold trades interruptions for false confidence. You choose based on which mistake costs more in your product.

**Say:**
- “Same cases, two thresholds. At 0.9: zero of five bad candidates get in, but two of three good ones interrupt a human.”
- “Drop to 0.8: one fewer interruption, and one bad candidate walks in.”
- “The honest paraphrase that 0.8 lets in? The polite lie comes in with it.”
- “So which is right? It depends on what each mistake costs you. A false seat promise, or a person reading one extra message. Decide with labeled examples, not vibes. 0.9 isn’t magic.”

**Next →** “One last case. It’s the sneakiest.”

**Careful:** These are synthetic policy fixtures, not measured Jev accuracy. They’re single-candidate decisions with no repairs. Don’t mix them with the game scores.

**If ahead:** `pnpm lab:eval --solution`, then `--accept-at 0.8`. The second run exits 1 on purpose.
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
**ACT 4 · THE GAME · final boss** · 54:00–54:30

**Why this slide:** A callback to the revision stamp on slide 15. Evidence can be perfect and still worthless if it’s for a different version. Provenance is part of the receipt.

**Say:**
- “The final boss: a perfect receipt. Every check green. For the wrong revision. It passed yesterday, on yesterday’s code.”
- Run `pnpm lab:check --scenario stale-evidence --solution` (cut it if behind).
- Ask: “What should the policy do?” Let someone answer in one sentence and give them the room’s final point.

[click] **(click: answer)** “Escalate. Don’t guess. And don’t send it back to the worker. Nothing is known to be wrong with the product; what’s missing is proof. That’s a human call.”

**Story beat (optional):**
- **Nick:** Riker’s rule: a file the worker writes into the proof folder proves nothing, and a log that changed after the check shows up as changed, not as proof. When a job adds tests, Riker also runs them against the base. Tests that pass there too don’t prove the fix. If you have a real story behind that rule, tell it here. Don’t invent one.
- **Zack:** CTX evaluates every node from current, unexpired observations. Failed or untrusted receipts never satisfy a gate.

**Next →** “Which brings us back to the three questions.”

**Careful:** Stale evidence is a fault we inject into the harness, not something the worker produced. Take-home from the footnote: freeze your policy *before* running `--suite heldout`, and don’t tune on cases you’re calling unseen.
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
**ACT 4 · THE GAME · bookend** · 54:30–55:00

**Why this slide:** The same slide as before the game, but now each question has been attacked and held. It’s a second chance for photos, and it closes the build-and-break arc.

**Say:**
- “Same three questions. Now you’ve attacked them.”
- “**Observe**: `observe.ts` recorded what happened, including the record that vanished.”
- “**Infer**: `questions.ts` asked what the evidence supports, and you tested whether it could be fooled.”
- “**Stop**: `decide.ts` made the call, including when to hand it to a human, like the stale proof just now.”
- **“‘Done’ is a claim. Ask for the receipt.”**

**Next →** “Now take it home.”
-->

---
class: night takeaway-slide
clicks: 2
---

<VerificationWorkbench />

<!--
**ACT 5 · TAKE IT HOME · a tool for your app** · 55:00–55:30 · two clicks

**Why this slide:** Make the pstack lesson concrete. An agent needs a maintained recipe for exercising your app, plus a way to run it. We already built the small version.

**Say / click:**
- **0:** “One feature, one user path, one observable outcome. This is the feature map.”
- **1:** “Our CLI launches the app, drives a real browser and captures what happened. The agent can rerun it. In your repo, wrap the harness you already have in a small tool and document how to use it.”
- **2:** “Now it knows the record disappeared on reload. That’s a specific repair target.”

**After class:** Lesson 07 has a copyable agent prompt to build a project-local verifier. Lauren’s pstack verification skill and Build the Lever principle are the primary references. This command and app are ours; we are applying her workflow, not showing a pstack command.

**Next →** “And when the symptom is deeper than a missing record?”
-->

---
class: takeaway-slide
clicks: 2
---

<BrowserProof />

<!--
**ACT 5 · TAKE IT HOME · browser instruments** · 55:30–56:00 · two clicks

**Say / click:**
- **0:** “Console for exceptions, network for failed requests, performance traces for work that blocks the browser. Let the agent use those instruments.”
- **1:** “Record the slow interaction. Inspect the hot path. A flamechart gives you a place to investigate, not automatic proof of the cause.”
- **2:** “Repair and record again under the same conditions. Check that it still works, too. Keep both traces.”

**Concrete next step:** Chrome DevTools MCP exposes `performance_start_trace`, `performance_stop_trace` and `performance_analyze_insight`. It also has a CLI. Follow the official setup in Lesson 07; connect it to a test instance of your app and ask it to investigate one slow interaction. We are not installing another tool during the hour.

**Careful:** This is an animated schematic, not a trace measured from the workshop app or a benchmark of speedup. A fast trace alone does not establish correct behavior.

**Next →** “Those traces are receipts too. Keep them across runs.”
-->

---
class: night takeaway-slide
clicks: 3
---

<ReceiptHistory />

<!--
**ACT 5 · TAKE IT HOME · a history you can improve against** · 56:00–56:30 · three clicks

**Say / click:**
- **0:** “Nick and I both ended up here: receipts are evidence now, and a history of the system over time. Keep the failure, the repair and the final outcome.”
- **1:** “Turn recurring failures into labeled evaluation cases. Freeze the grader. Change one tool, prompt or policy, then rerun the same tasks. Track bad accepts and unnecessary interruptions; add latency and cost in your own system.”
- **2:** “Hillclimbing means keeping a change only when independent evaluation supports it. Check untouched cases before promotion. If the agent can rewrite its own scorekeeper, the hill might be fake.”
- **3:** “Over time you have your own run dataset. With permission, redaction, reviewed labels and a separate evaluation split, it can also support fine-tuning. That’s an option, not something these logs do automatically.”

**Concrete next step:** Lesson 07 shows the lab’s `lab:eval` comparison, where the reports land, and which extra fields a real run archive needs. The lab’s synthetic scores can evaluate policy wiring, not whether an edited prompt or trained model got better. An automatic improvement loop also needs a bounded experiment budget, a promotion gate and rollback.

**Careful:** The left cards are actual saved attempts from two runs, not a measured trend or a training corpus. The right side is the workflow attendees can build next. This workshop does not fine-tune anything.

**Next →** “Now write the first row for your own app.”
-->

---
class: night takeaway-slide
clicks: 2
---

<VerifierExamples />

<!--
**ACT 5 · TAKE IT HOME** · 56:30–58:45 · 15-second examples, then protect the two-minute exercise

**Why this slide:** Give people concrete starting points for their own apps. Leave all three examples visible while they write one small check they will build first.

**Say / click:**
- **0:** “A web filter survives reload. A native draft survives relaunch. Duplicate webhook delivery creates one job.”
- **1:** “Wrap the tool that can reach the real system: browser automation, a native UI driver, or HTTP plus a database read.”
- **2:** “Now name the assertion and the evidence you’ll save. These are ordinary, testable facts. Pick your own feature.”

**Do:** At 56:45, give them two minutes to write: feature/user path, check command, receipt location, and when to stop or ask for help. Keep the examples visible. The worksheet and detailed versions of these recipes are in Lesson 07.

**Careful:** These are illustrative blueprints, not three additional workshop apps. The `verify` commands are example wrappers attendees can build; they are not installed by this repository. Appium requires a driver for the target platform. A screenshot alone does not prove persistence, and a 200 response alone does not prove a job ran exactly once. For asynchronous jobs, wait for a defined completion signal within a deadline and inspect records for the test event ID.

**Next →** “Let’s hear a couple.”
-->

---
class: indigo
---

<p class="small-label">Beyond “Done” · Keep the materials</p>
<div class="closing-resources"><div><div class="close-questions"><p>What did we <span class="accent">observe?</span></p><p>What did we <span class="accent">infer?</span></p><p>Why did we <span class="accent">stop?</span></p></div><p class="lede" style="margin-top: 35px">Nick Nisi &amp; Zack Proser</p></div><ResourceQr resource="glossary" compact /></div>
<p class="footnote">Your agents can keep saying “done.” Now you can ask for the receipt.</p>

<!--
**ACT 5 · TAKE IT HOME · close** · 58:45–60:00 · both hosts

**Why this slide:** Close the story by running a real example from the room through the three questions.

**Say:**
- Take one or two examples. For each, ask: “What would you observe? What would you need to infer? When would you stop?”
- Close together: “Your agents will keep saying ‘done.’ Now you know how to ask for the receipt.”
- Credit each other. “The repo, the glossary and the worksheet all stay with you.”

Leave them one next action (build that first check), not a reading list.
-->

---
class: night
---

<div class="split questions-close">
<div><h1 class="display">Questions?</h1><p class="lede">Nick Nisi · Zack Proser</p><p class="aside-note">“Done” is a claim. Ask for the receipt.</p></div>
<div class="qr-pair"><ResourceQr resource="repo" compact /><ResourceQr resource="glossary" compact /></div>
</div>

<!--
**AFTER THE HOUR · Q&A** · 60:00+

**Why this slide:** Leave the QR codes up while people ask questions.

**Likely questions (short answers):**
- **Why two models?** Different jobs. The worker proposes; the judge checks one narrow claim.
- **Why not check exact text?** If exact text is the requirement, use a template. We allowed paraphrases on purpose.
- **Can the agent change the tests?** Not through this interface. An agent with a shell needs real isolation.
- **Is 0.9 safe?** Not universally. Measure on labeled cases, weighted by what each mistake costs you.
- **Does a passing browser test prove the backend?** No. This app has no backend. Add server-side observations when that’s your requirement.
- **Why escalate an outage instead of retrying?** A production harness might retry transient failures separately. Here we escalate so a repair can’t hide an infrastructure failure.

More in docs/facilitator.md, under “Questions to listen for.”
-->

---
class: lime
---

<div class="split booth-close">
<div><p class="small-label">After the workshop</p><h1 class="display">Not done<br>talking?</h1><p class="lede">Find us at <strong>Booth 6</strong>.<br>Bring the agent that swears it’s done.<br>We’ll help you ask for the receipt.</p><p class="aside-note">Nick Nisi · Zack Proser · WorkOS</p></div>
<div class="ticket hero-ticket">
<div class="ticket-top"><span>AIE · WORKOS</span><span>ADMIT ALL</span></div>
<div class="ticket-title">Booth 6</div>
<p>Bring your half-built verifier,<br>or your agent’s weirdest “done.”</p>
<div class="ticket-bottom"><span>NO RECEIPT REQUIRED</span></div>
<span class="stamp">Come by</span>
</div>
</div>

<!--
**AFTER THE HOUR · booth** · while the room clears

**Say:** “Not done talking? Neither are we. Find us at Booth 6. Bring the agent that swears it’s done, or the verifier you started today.”

Leave it up while people pack.
-->
