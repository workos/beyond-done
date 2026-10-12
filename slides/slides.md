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

**The whole hour in one line:** “‘Done’ is a claim. Ask for the receipt.” Every slide does one of three things: shows the problem, builds a piece of the lever that produces the receipt, or tries to break it.

**The arc (for you, not the room):**

1. **The claim (0–6 min):** agents say “done.” A real incident shows the stakes. Our toy app shows the same gap in two minutes. A quote names the thesis, and a contrast shows why verification pays off.
2. **The gap (6–10):** what *you* do to check (reload, DevTools) and the agent can’t. Instructions don’t fix that; a lever does.
3. **Eyes (10–18):** `snack`, a small CLI that drives the app over the Chrome DevTools Protocol. Everyone drives it.
4. **The proof (18–30):** attendees write `prove`, the one coding exercise, and read the receipt it produces.
5. **The agent (30–44):** a feature map, then their own agent: “Repro it. Fix it. Show me proof.” Then the receipt from that run, the copy that still lies, and the stop rule.
6. **The game (44–55):** solo. snack hides a random bug (or none); each attendee finds it with snack alone. Every miss becomes a new check. Final boss: a stale receipt.
7. **Take it home (55–60):** a tool for your app, browser instruments, receipt history, and concrete examples, then two minutes to write their own first check.

The three verbs to keep repeating: **Observe. Fix. Prove.** They’re the right-hand lane on slide 8 and the close.

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

**Roles:** Nick drives the first demo and plays the overconfident worker. Zack calls the vote and watches the room. Swap at the agent run (confirm in rehearsal). Riker and CTX get their own slides later; don’t pitch them here.
-->

---
---

<div class="split">
<div><p class="small-label">FOLLOW ALONG</p><h1>This repo is<br>your workbench.</h1><p class="lede">Clone it on your laptop.<br>Keep README beside the lesson site.</p><div class="command repo-setup">git clone https://github.com/workos/beyond-done.git<br>cd beyond-done<br>pnpm snack doctor<br>pnpm dev</div><p class="aside-note">Node 24 + pnpm 12.4.1 · install steps in README.<br>Repo is private: ask a host if access fails.</p></div>
<ResourceQr resource="repo" />
</div>

<!--
**ACT 1 · THE CLAIM** · 1:15–1:45 · Zack

**Why this slide:** Logistics with a deadline. Three slides from now we ask people to run the broken app, so the clone needs to start now.

**Say:**
- “This repo is your workbench for the hour. Scan it or type the clone URL.”
- “If you did the prework, `pnpm snack doctor` already says Node and Chromium are fine. Keep the README open beside the lesson site; every command lives there.”
- “There’s one file to write today, in `lab/exercises`. If you fall behind, the reference is in `lab/solution`.”
- “It’s private right now. If access fails, wave at one of us.”
- “You don’t need an API key for most of this. When we get to the live model, we’ll project ours.”

**Do:** Leave the QR up for about 30 seconds. Still blocked after two minutes? Pair with a neighbor. People without laptops: predict results with a partner.

**Next →** “While that clones, one more tab.”
-->

---
---

<div class="split">
<div><p class="small-label">YOUR REFERENCE THROUGHOUT THE HOUR</p><h1>A word lost you?<br>Keep this open.</h1><p class="lede">Searchable terms, examples,<br>and checks for understanding.</p><div class="follow-steps"><p><strong>Read</strong> the matching lesson.</p><p><strong>Edit → run → inspect</strong> at each checkpoint.</p><p><strong>Predict first.</strong> Explain the evidence.</p></div><p class="aside-note">Behind? Add <code>--solution</code> to a snack command,<br>or copy <code>lab/solution/prove.ts</code>.</p></div>
<ResourceQr resource="glossary" />
</div>
<p class="footnote">These slides, the lessons, and the glossary: <a href="https://talks.workos.cloud/beyond-done" target="_blank" rel="noopener noreferrer"><strong>talks.workos.cloud/beyond-done</strong></a></p>

<!--
**ACT 1 · THE CLAIM** · 1:45–2:45 · Zack talks, Nick walks the room

**Why this slide:** The last logistics before the story starts. It gives people a safety net so jargon doesn’t lose them, and it sets the rhythm every build will follow.

**Say:**
- “Scan this one too. It’s the glossary: every term we use today, searchable, with examples. If we say a word you don’t know, look it up there instead of tuning out.” Search “evidence” live.
- Point at the footnote: “These slides are hosted too, at talks.workos.cloud/beyond-done, next to the lessons and the glossary. No need to photograph every slide.”
- “Three surfaces today: the repo is the code, the lesson site is the instructions, and `pnpm snack` drives the deliberately broken app.”
- Walk the three steps: “Every build: read the lesson, edit-run-inspect, and **predict before you run**. Predicting is how you notice when the evidence surprises you.”
- “Fall behind? Save your file and copy just that one reference file. Or add `--solution` to any command to run the reference.”

**Next →** “Now, let’s vote on something.”

**Do:** Check that `doctor` is green around the room. Pair anyone stuck. Local fallback: `pnpm dev`, then /glossary/.
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
**ACT 1 · THE CLAIM** · 2:45–3:30 · Nick plays the worker, Zack calls the vote

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
<div><h1>Now break<br>our app.</h1><p class="lede">Submit. Reload.<br>Where did your request go?</p><div class="command">pnpm snack up</div><p class="aside-note">A browser opens. Leave the terminal running.<br>Use <code>ada@example.test</code>.</p><p class="aside-note">So it was <strong>briefly done.</strong></p></div>
<ReloadReveal />
</div>

<!--
**ACT 1 · THE CLAIM** · 3:30–5:30 · Nick drives, Zack watches the room

**Why this slide:** The room sees the gap for itself. Every check on the worker’s ticket was *true*, and the feature still fails. The checks stopped one step before the requirement could fail. This is the problem we spend the hour solving.

**Do** (switch to the browser that `pnpm snack up` opened before the talk; leave that terminal running for the rest of the hour):

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
<p class="footnote"><a href="https://x.com/poteto/status/2097732320606507506" target="_blank" rel="noopener noreferrer">Original article ↗</a> · One waitlist. One CLI. One proof.</p>

<!--
**ACT 1 · THE CLAIM** · 5:30–5:50 · either host

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
**ACT 1 · THE CLAIM** · 5:50–6:30 · either host

**Why this slide:** The payoff argument. Without a check, an agent guesses and stays confident. With one, it gets a specific failure, makes a targeted fix, and knows when it’s finished. Verification is what lets you stop babysitting.

**Say:** “Same task, same agent: make the waitlist survive reload. On the left, no way to check. On the right, a CLI that drives a real browser.”

[click] **(click 1)** “Left: ‘probably a timing issue.’ That’s a guess. Right: the check fails with something specific. Waitlisted before reload, none after.”

[click] **(click 2)** “Left: ‘Fixed!’ Reload. Still gone. Right: persist, reload, run the same check again.”

[click] **(click 3)** “Left is still going, still sure of itself. Right has stopped, because the check passed on fresh evidence. The clock stops when you have proof, not when the agent runs out of ideas.”

**Land it:** “A good check doesn’t just catch bad work. It tells the agent what to fix and when it’s finished.”

**Next →** “This isn’t a theory we made up for a workshop. We both build tools that run on this rule.”

**Careful:** The clocks are invented for illustration. They aren’t measurements. A check narrows the search; it doesn’t guarantee a fast fix. The real version is `pnpm snack prove --solution`, which comes later.

**Optional:** The Slow UI button tells the same story with Chrome DevTools: record, find the hot path, fix, re-record against the budget. It’s a schematic, not part of the lab. Switch back to Waitlist before advancing.
-->

---
title: The worker said “ready.” Riker checked.
class: riker-slide night
clicks: 7
---

<RikerWalkthrough />

<!--
**ACT 1 · THE CLAIM** · 6:30–7:30 · Nick · seven quick clicks

**Why this slide:** Credibility, not a pitch. The loop from the quote slide, running in a tool Nick uses every day, on a real job: job 140, the PR that deployed this workshop site. Every value on screen is Riker’s own record of that job.

**Say** (one line per click, keep moving):
- **(0)** “This is Riker. It runs coding agents for me. Here’s the worker’s hand-back on the job that deployed this site: ‘ready for Nick to run.’ Riker keeps that as the story. It never sets the status.”
- **(1)** “The check was part of the job at 07:34, before the worker wrote any code. Nineteen steps: tests, build, this deck’s checker, a deploy dry run.” Point at the highlight: “And the worker admits it didn’t rerun the full suite.”
- **(2)** “So Riker runs it itself, in the job’s worktree. Two minutes twenty-one. Exit zero.” The clock replays the real duration in about a second and a half.
- **(3)** “The proof comes from the check’s own process: command, exit code, commit, tree, and a hash of the log. Read it back later and the hash still has to match.”
- **(4)** “Signing rewrote the commits, but the tree didn’t change, so the proof still holds. Now it says proven. No check would mean ‘done, unverified.’ A failed check means nothing ships.”
- **(5)** “Some things no command can judge. Riker names the look a person still owes.”
- **(6)** Screenshot: “Every line in the app is read from a record. ‘Proven’ only appears when Riker’s own check passed.”
- **(7)** Screenshot: “Ember only ever means a person is needed. Mint only ever means proven. Nothing else uses either color.”

**Next →** “Zack got to the same rule from a different direction.”

**Careful:** Riker is private; don’t promise access. The job view replays job 140’s stored record. The two screenshots are Riker’s app on a demo repo, not job 140. Left arrow retraces every state. Short on time? Stop after click 5 and skip the screenshots.
-->

---
title: We hold our own tools to this.
class: ctx-slide
clicks: 3
---

<CtxWalkthrough />

<!--
**ACT 1 · THE CLAIM** · 7:30–8:00 · Zack

**Why this slide:** Credibility, not a pitch. The thesis comes from our day jobs. Both tools refuse to treat a worker’s “done” as proof. Today’s build is a small version of both.

**Say:**
- **Nick:** The Riker card recaps the last slide. Hand off in one line: “That’s mine. Zack?”
- **Zack:** “CTX models work as a graph of observable end states. A worker can claim whatever it likes; the claim is logged and ignored. Verifiers write receipts tied to the exact revision, and only CTX’s evaluators close a node.”

**Click walkthrough · Zack:** Use the images as a quick visual example in the hour; expand these prompts during rehearsal or questions. No additional slide advances are needed between images. Left arrow retraces every state.

1. **CTX spotlight:** The CTX card lifts and Riker recedes. “Here’s what that means in my system.”
2. **Architecture overlay:** Start at the agent session, then trace work → verifier → gate → outcome. A **run** is one execution attempt, including its inputs, actions and artifacts; it is not the task’s completion status. **Inputs** bind the work to the things in scope. A **verification** is the required condition, such as all scoped PRs being merged. A **verifier** is the connector that queries the real system and returns an observation/receipt. A worker’s prose cannot satisfy the gate. On failure the task stays open; on success the evaluator can close it. Keep the ledger over time for evaluation and improvement; a training corpus is a possible curated use, not automatic learning.
3. **App overlay:** Walk left to right: “Pull requests in scope” is the input set; “All pull requests merged” is the verification; “Re-check with GitHub” invokes the verifier; the scoped PR and observed merged state support the satisfied gate. Point out **Latest run: No run attached**: this screenshot shows the task’s verification state, not a run-detail view. Do not imply that the captured check has an attached run. The recording of a run and the requirement for completion are different concepts.

**Next →** “Today you’ll build the small version of both: a check the worker can’t fake, receipts tied to a revision, and code, not the worker, deciding when it’s done. Here’s the app you’re going to make trustworthy.”

**Careful:** The implementations are private. The CTX links are public writing: the original context-engine blueprint and the later retrospective about verification gates. Nick and Zack arrived at receipts independently. Return to that shared idea on the receipt and run-history slides; don’t imply either article exposes the private implementation.
-->

---
clicks: 6
---

<div class="split check-split">
<div><p class="small-label">BEFORE YOU’D SHIP THAT WAITLIST</p><h1>What do <span class="accent">you</span><br>do to check?</h1><p class="lede">Shout it out.</p><p class="lede agent-gap" v-click="6">Your agent can’t do any of this.<br>It has your code and a terminal.</p></div>
<div class="devtools" aria-label="The checks a person runs in the browser">
<div class="devtools-tabs"><span>Elements</span><span>Console</span><span>Network</span><span class="on">Application</span></div>
<ul class="devtools-checks">
<li v-click="1"><b>↻</b> Reload the page</li>
<li v-click="2"><b>▤</b> Application → Local storage</li>
<li v-click="3"><b>!</b> Console → any errors?</li>
<li v-click="4"><b>⇅</b> Network → did anything get sent?</li>
<li v-click="5"><b>◎</b> Read what the page actually says</li>
</ul>
</div>
</div>

<!--
**ACT 2 · THE SETUP** · 8:00–9:00 · Zack asks, Nick clicks

**Why this slide:** The room already knows how to verify this bug by hand. Make them say it, then point out the gap: the agent that claimed “done” had none of those tools. Everything after this slide closes that gap.

**Say:** “You just watched the waitlist forget Ada. Be honest: before you shipped it, what would *you* have done to check?”

Take answers from the room. Click each line as someone says it (order doesn’t matter, just click on the next shout):

- [click] **(1)** Reload. “Yes, exactly what the worker never did.”
- [click] **(2)** Local storage in DevTools. “Did it actually save?”
- [click] **(3)** Console. “Did anything blow up quietly?”
- [click] **(4)** Network. “Did it send anything anywhere?”
- [click] **(5)** Read the page. “What does the message actually promise?” Plant it; it pays off later.

If the room goes quiet, prompt with “Who opens DevTools first thing?”

[click] **(6)** “Here’s the thing. Your agent can’t do any of this. It has your code and a terminal. So it guesses, and it says ‘done.’”

**Next →** “So how do you give it those tools? Most people start by writing instructions.”
-->

---
---

<p class="small-label">THE FIRST INSTINCT, AND THE BETTER ONE</p>

# Don’t write a paragraph.<br><span class="accent">Build a lever.</span>

<div class="comparison lever-compare">
<div><div class="small-label">AGENTS.md</div><blockquote class="paragraph-quote">“Always verify UI changes in a browser. Remember to reload and check that data persists. Look at the console for errors…”</blockquote><p class="comparison-label">Re-read and re-interpreted every run. Leaves no evidence.</p></div>
<div><div class="small-label">One command</div><div class="command lever-command">pnpm snack prove</div><blockquote class="lever-result">→ <code>FAIL</code> status after reload: none</blockquote><p class="comparison-label">Same steps every run. Fewer tokens than a throwaway script. Leaves a receipt.</p></div>
</div>

<!--
**ACT 2 · THE SETUP** · 9:00–10:00 · Nick

**Why this slide:** The core move of the hour. Instructions describe verification; a tool *does* it. A small CLI that drives your app is cheaper for the agent, repeatable, testable, and it leaves evidence.

**Say:**
- “The first thing everyone does is write it down. AGENTS.md: ‘always verify in a browser, remember to reload.’ The agent reads it, nods, and interprets it a little differently every time. And when it’s done, there’s nothing to look at.”
- “The better move is to build a lever. One command that does the checking the same way every time.”
- “It’s cheaper, too. Without it, the agent writes a throwaway Playwright script every session to click one button. With it, it runs one command and reads JSON.”
- “And because it’s code, you can test it, improve it, and share it with everyone on the team, including the agents.”

**Next →** “We built one for the waitlist. Meet snack.”

**Careful:** Not anti-AGENTS.md. Instructions still say *when* to use the lever. They’re just a poor substitute for the lever itself.
-->

---
class: night
---

<div class="surface-head"><div><p class="small-label">A REMOTE CONTROL FOR ONE APP</p><h1>Meet <code class="snack-word">snack</code>.</h1></div><p class="lede">One file, built for agents first.<br>Speaks the Chrome DevTools Protocol.</p></div>

<div class="command-surface">
<div><span class="lane-label">HEALTH</span><code>up</code><code>doctor</code><code>down</code></div>
<div><span class="lane-label">DRIVE</span><code>join</code><code>reload</code><code>reset</code></div>
<div><span class="lane-label">LOOK</span><code>snapshot</code><code>storage</code><code>console</code><code>network</code><code>screenshot</code><code>eval</code></div>
<div><span class="lane-label">PROVE</span><code>prove</code><code>judge</code></div>
</div>

<div class="cli-rules"><span>JSON out</span><span>Errors say what to do next</span><span><code>help</code> on everything</span><span><code>doctor</code> first</span><span><code>--dry-run</code> before anything destructive</span></div>

<!--
**ACT 3 · EYES** · 10:00–12:00 · Zack

**Why this slide:** Show the shape of a good verification CLI before anyone runs it. Every command maps to something a person does in the browser or DevTools. The rules along the bottom are what make it usable by an agent.

**Say:**
- “snack is a remote control for exactly one app: our waitlist. It isn’t a framework. It’s one file.”
- Walk the columns left to right:
  - “**Health:** start it, check it, stop it. `doctor` answers ‘is this instance worth driving?’ Run it first, every time.”
  - “**Drive:** the things a user does. Join, reload, start over as a fresh visitor.”
  - “**Look:** the things *you* did in DevTools a minute ago: what’s on the page, what’s in storage, the console, the network, a screenshot.”
  - “**Prove:** one command that runs the whole user path and gives you a receipt. You’ll build that part.”
- “Under the hood it speaks the Chrome DevTools Protocol, the same connection DevTools uses. So anything you can inspect by hand, the agent can inspect too.”
- Point at the rules: “JSON out, so the agent doesn’t parse prose. Errors that tell it what to do instead. Help on everything. And `--dry-run` before anything that deletes something.”

**Next →** “Enough slides. Everybody drive it.”

**Careful:** snack is ours, built for this workshop. Don’t imply it’s a published tool. The pattern is the takeaway.
-->

---
clicks: 1
---

<p class="small-label">EVERYONE · DRIVE IT LIKE AN AGENT WOULD</p>

# Your agent’s eyes, in your terminal.

<div class="split equal drive-split">
<div>
<p class="code-caption">Terminal 1 · leave it running</p>
<div class="command">pnpm snack up</div>
<p class="code-caption drive-gap">Terminal 2 · one at a time. Predict first.</p>
<div class="command">pnpm snack doctor<br>pnpm snack join ada@example.test<br>pnpm snack storage<br>pnpm snack reload<br>pnpm snack snapshot</div>
</div>
<div class="ticket drive-ticket">
<div class="ticket-top"><span>pnpm snack storage</span><span>JSON</span></div>
<div class="ticket-title">What got<br>saved?</div>
<div v-click><code class="json-out">"localStorage": {}</code><p><strong>Nothing.</strong> The page said “waitlisted.” Storage never heard about it.</p></div>
</div>
</div>
<p class="footnote">Lesson 03 · No laptop? Call out what you think each command will print.</p>

<!--
**ACT 3 · EYES** · 12:00–18:00 (1 explain · 4 drive · 1 debrief) · Nick drives on screen, Zack walks the room

**Why this slide:** Hands on the lever. People feel how fast the agent’s view of the app is: five commands, a few seconds, and the bug is named with evidence, without opening a browser tab.

**Say:**
- “Terminal one: `pnpm snack up`. A Chrome window opens. Leave it alone; snack drives it.”
- “Terminal two: run these one at a time. Before each one, predict what it’ll print.”
- After `join`: “Status waitlisted, Ada’s email, a confirmation. Exactly what the worker saw.”
- “Now the one the worker never ran. `storage`. What do you predict?”

[click] **(click: answer)** “Empty. The page said waitlisted; storage never heard about it. Then `reload` and `snapshot`: status none. You just debugged it the way your agent will, from a terminal, with JSON.”

**Do:** Run the commands live, alongside the room. Show `pnpm snack help` once. If someone runs `up` twice, show off the error message: it tells you what to do instead.

**Next →** “snack can look. Now let’s teach it what ‘done’ means.”

**Careful:** `up` needs Chromium from preflight. If it fails, `pnpm snack doctor` says why. Pair anyone stuck after two minutes.
-->

---
class: observe-slide
---

<div class="observe-head">
<div><div class="exercise-number">Build · the one coding exercise</div><h1>Make <code>prove</code> refuse “looks done.”</h1></div>
<div><div class="command">pnpm lab:exercise</div><p class="aside-note">Pass a correct app.<br>Fail three broken ones.</p></div>
</div>
<div class="observe-caption-row"><p class="build-description">Fresh visitor → join → reload → check what survived.</p><p class="code-caption">lab/exercises/prove.ts</p></div>

```ts
export async function prove({ page, email, check, storage }: ProofKit) {
  check("fresh visitor starts empty", await status.innerText(), "none");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Join waitlist" }).click();
  await expect(status).toHaveText("waitlisted"); // no sleeps
  const promised = await confirmation.innerText();
  // Your turn: reload like a user, then check() what survived:
  // status · saved email · confirmation · storage()
}
```
<p class="footnote">Lesson 04 · <code>check()</code> never throws · <code>storage()</code> reads localStorage over CDP</p>

<!--
**ACT 4 · THE PROOF** · 18:00–27:00 (2 explain · 6 build · 1 checkpoint) · hard stop 27:00

**Why this slide:** The one coding exercise. `prove` is the lever’s most important command: it turns “the waitlist works” into a script that fails when it doesn’t. Whatever attendees write here becomes their agent’s definition of done in twenty minutes.

**Say (about 2 min):**
- “snack’s `prove` command calls one function, and you write it. It gets a fresh visitor with the app loaded.”
- Walk the code: “The first half is done: check the visitor starts empty, fill the form the way a user would, click the button, wait for the page to say waitlisted. No sleeps. Sleeps flake and prove nothing.”
- “Your turn: reload, then check what survived. Status, saved email, the confirmation, and what’s actually in storage.”
- **The line that matters:** “`check()` records a fact. It never throws. If the record vanished, that’s a finding: write it down, don’t crash. A crash means ‘can’t tell’; a failed check means ‘broken’. Your agent needs to know the difference.”
- “Give each check a hint that tells an agent what to fix. You’ll see why in a minute.”

**Build (6 min):** `pnpm lab:exercise` until it prints `PASS`. It runs your proof against a correct app and three broken ones, and tells you which broken one slipped through. Mistakes to call out as you walk:
- reusing the pre-reload values instead of reading again after reload
- asserting with `expect` after reload (that throws, so a broken app looks like “can’t tell”)
- checking the exact confirmation text instead of comparing it to `promised`

**Checkpoint (1 min):** behind? `cp lab/solution/prove.ts lab/exercises/prove.ts` (save first), or add `--solution` to `snack prove` and `lab:exercise`.

**Next →** “While the stragglers finish: what counts as proof?”

**Roles:** One host calls out common mistakes; the other walks the room.
-->

---
class: coral
---

<p class="small-label">THE PROOF BAR</p>

# A screenshot of success isn’t proof.

<div class="contract-lines proof-bar">
<p><strong>Use the user’s path.</strong><span>The form, the button, a reload. Never an internal shortcut.</span></p>
<p><strong>Check side effects.</strong><span>What’s in storage. What survives the reload.</span></p>
<p><strong>One run, start to finish.</strong><span>The trigger and the end state in the same receipt.</span></p>
<p><strong>Doctor first.</strong><span>Evidence for the wrong build is no evidence.</span></p>
</div>

<!--
**ACT 4 · THE PROOF** · 27:00–28:00 · either host, while people finish

**Why this slide:** The standard every proof is held to, in four lines. It explains why their `prove` reloads and reads storage instead of trusting the success message.

**Say:**
- “Here’s the bar. One: use the user’s path. If the proof calls `save()` directly, it proves `save()` works, not the feature.”
- “Two: check side effects, not just pixels. The worker’s screenshot of ‘You’re on the list!’ was real. It just wasn’t saved.”
- “Three: one run, start to finish. The click and the result belong in the same receipt, from the same visitor.”
- “Four: doctor first. A perfect proof against an old build proves nothing.” Pause on it. “Remember that one. It comes back as the final boss.”

**Next →** “So what does your agent actually get back when a proof fails?”
-->

---
---

# A failure that says<br>what to do next.

<div class="split receipt-split">
<div>

```json
{
  "verdict": "FAIL",
  "revision": "d14af25cd65a",
  "checks": [
    { "name": "status survives reload",
      "expected": "waitlisted", "actual": "none" },
    { "name": "record is in localStorage",
      "expected": true, "actual": false }
  ],
  "next": ["The record vanished on reload. Persist it…"],
  "screenshot": ".lab-runs/snack/proof-d14af25cd65a.png"
}
```

</div>
<div><p class="lede">This is what your agent reads.</p><div class="exit-codes"><p><strong>0</strong>PASS</p><p><strong>1</strong>FAIL · fix the app</p><p><strong>2</strong>Can’t tell · fix the setup</p></div><p class="aside-note">Missing evidence never becomes a pass.</p></div>
</div>
<p class="footnote">Real output, trimmed · <code>snack prove --solution</code> on the attendee app</p>

<!--
**ACT 4 · THE PROOF** · 28:00–30:00 · Nick · hard stop 30:00

**Why this slide:** The receipt is the interface between your proof and the agent. A specific failure plus a next step means a targeted fix instead of a guess. This is the right-hand lane from the “very different afternoon” slide.

**Say:**
- “Run `pnpm snack prove` against the app. Here’s what comes back.” Point at each part:
  - “The verdict.”
  - “The revision: a fingerprint of the exact code that was served. This proof belongs to *that* code.”
  - “Each check: what we expected, what we got.”
  - “`next`: your hints. That’s the line the agent acts on.”
  - “And a screenshot from the end of the run.”
- “Three exit codes. Zero passed. One failed: the app is broken, fix the app. Two: can’t tell. The browser didn’t start, the proof crashed. That’s a setup problem, and the worst thing an agent can do is ‘fix’ the app because the test harness fell over.”
- “Remember the left lane, ‘probably a timing issue’? This is the cure. Not ‘something’s wrong’, but ‘status after reload was none, persist it.’”

**Do:** Have people run `pnpm snack prove` with their own proof. Finished proofs FAIL against the attendee app. An unfinished proof says PASS, which is the point: a weak proof calls a broken app done.

**Next →** “Your proof knows what done means. Now your agent needs a map.”

**Careful:** The JSON is a real run, trimmed for the slide. Revision hashes will differ if the app file changed.
-->

---
---

<div class="split map-split">
<div><p class="small-label">ONE FILE PER FEATURE</p><h1>Write the map,<br>not the manual.</h1><p class="lede">What exists. How a user gets there.<br>How to drive it. What usually lies.</p><div class="command">lab/verify/features/waitlist.md</div><p class="aside-note">Add two gotchas. Three minutes.<br>Then the skill that ties it together: <code>lab/verify/SKILL.md</code></p></div>
<div class="ticket map-card">
<div class="ticket-top"><span>waitlist.md</span><span>FEATURE MAP</span></div>
<p class="map-h">Sub-features</p>
<p class="map-h">How to get to it (user POV)</p>
<p class="map-h">Driving it with snack</p>
<p class="map-h">What done means</p>
<p class="map-h on">Gotchas</p>
<p class="gotcha">The success message appears whether or not anything was saved.</p>
<p class="gotcha blank">+ ________________________________</p>
<p class="gotcha blank">+ ________________________________</p>
</div>
</div>

<!--
**ACT 5 · THE AGENT** · 30:00–34:00 (1 explain · 3 write) · Zack

**Why this slide:** The CLI tells the agent *how* to look. The map tells it *where* to look and what to distrust. It’s short, it lives in the repo, and everyone who touches the feature benefits, people and agents.

**Say:**
- “A remote control is only useful if you know what the buttons are for. That’s the map: one short file per feature.”
- Walk the headings: “What’s in the feature. How a user gets to it, in user words. The exact snack commands to drive it. What done means: our three acceptance criteria. And gotchas: what usually lies.”
- “We wrote the first gotcha: the success message shows up whether or not anything was saved. That’s the bug you found.”
- “Your turn: add two more. What else in this feature *looks* done but might not be?” If they’re stuck: a message that promises more than it should; a record that comes back with the wrong email; something that only breaks on the second visit.
- “Then open `lab/verify/SKILL.md`. Seven steps: doctor, read the map, reproduce, fix, prove, read the screenshot, report. That’s what you hand your agent.”

**Next →** “Let’s hand it over.”

**Careful:** Keep gotchas behavioral (“what a user would see”), not implementation notes. A gotcha the agent can’t observe with snack isn’t useful yet.
-->

---
clicks: 7
---

<p class="small-label">LIVE · BRING YOUR OWN AGENT</p>

# “Repro it. Fix it. Show me proof.”

<div class="split agent-split">
<div><div class="command prompt-box">Read lab/verify/SKILL.md. Reproduce the reload bug in the waitlist with snack. If it reproduces, fix it, and show me the receipt and the screenshot as proof.</div><p class="aside-note">Any agent with a terminal: Claude Code, Codex, Cursor, pi.<br>Unfinished <code>prove.ts</code>? Your agent will call a broken app done.</p></div>
<div class="agent-run">
<div class="agent-log-bar"><i></i><i></i><i></i><span>agent session · fallback recording</span></div>
<p v-click="1"><b>›</b>snack doctor<em>ok · build fresh</em></p>
<p v-click="2"><b>›</b>snack join ada@example.test<em>waitlisted</em></p>
<p v-click="3"><b>›</b>snack storage<em class="bad">{ }</em></p>
<p v-click="4"><b>›</b>snack reload<em class="bad">status: none</em></p>
<p v-click="5"><b>✎</b>lab/app/index.html<em>persist + honest copy</em></p>
<p v-click="6"><b>›</b>snack prove --solution<em class="good">PASS · 4e8c43d6bc1e</em></p>
<p v-click="7"><b>▣</b>proof-4e8c43d6bc1e.png<em>read it</em></p>
</div>
</div>

<!--
**ACT 5 · THE AGENT** · 34:00–40:00 · Nick drives the agent on screen, Zack walks the room

**Why this slide:** The payoff. The same agent that said “done” on slide 5 now reproduces the bug, fixes it, and proves it, without anyone babysitting. The prompt is three sentences because the lever, the map, and the proof carry the rest.

**Say:**
- “Here’s the whole prompt. Read the skill. Repro the bug with snack. If it repros, fix it and show me proof.”
- “Notice what isn’t in the prompt: no steps, no ‘remember to reload.’ That all lives in the skill and the map.”
- “Run it with whatever agent you use. We’ll run ours up here.”

**Do:** Before the slide, `pnpm snack up` is already running in a visible terminal and `lab/app/index.html` is clean (`git checkout lab/app/index.html`). Paste the prompt into the agent. Narrate as it goes: doctor, prove fails, it looks at storage, edits the file, proves again.

**If the live run stalls (90 seconds max), click through the fallback recording.** It’s a real Claude Code run with exactly this prompt (about 50 seconds, 12 turns):

[click] **(1)** “Doctor first: fresh build.”
[click] **(2)** “It joins, like a user.”
[click] **(3)** “It checks storage itself. Empty.”
[click] **(4)** “Reload: gone. Reproduced, with evidence.”
[click] **(5)** “One file edited: persist the record. It also rewrote the copy, because the map says what done means.”
[click] **(6)** “It noticed the unfinished exercise proof was too weak and ran the reference proof. PASS, for a new revision.”
[click] **(7)** “And it opened the screenshot, because the skill says to.”

**Land it:** “Same agent as slide 5. The difference isn’t the model. It’s the lever.”

**Next →** “Let’s open the receipt from that run.”

**Careful:** Agents vary. If yours fixes the copy too, great: ask it why. That’s the next slide. If an attendee’s agent says PASS without fixing anything, their `prove.ts` is unfinished; that’s a lesson, not a failure. The fallback is a recorded run, not a live one; say so.
-->

---
class: indigo receipt-slide
clicks: 3
---

<p class="small-label">THE RUN YOU JUST WATCHED</p>

# Open the receipt.

<RepairReceipt />
<div class="receipt-command">Try it: <code>pnpm snack prove</code> · every receipt is appended to <code>.lab-runs/snack/receipts/</code></div>

<!--
**ACT 5 · THE AGENT · the receipt** · 40:00–41:00 · three clicks

**Why this slide:** A receipt is a durable record of an evaluation. It should explain the outcome today and preserve enough context to compare runs later. These two are the agent run from the previous slide: before and after its fix. Nick and Zack arrived at this independently in Riker and CTX.

**Say / click:**
- **0 — bind:** “Which revision did we check, and when? This is a real saved receipt from the run you just watched.”
- **1 — observe:** “What did the app actually do? Status after reload: none. Nothing in localStorage. No page errors.”
- **2 — decide:** “Which checks failed, and what should happen next? That `next` line is what the agent acted on.”
- **3 — append:** “New code, new revision, fresh evidence. Attempt two passes; attempt one stays in the history. Don’t overwrite the failure with the final green.”
- Optional callback: Nick’s Riker preserves the job’s check; Zack’s CTX ties evidence to a work-graph revision. The shared move is to preserve the run, not just its final message.

**Do:** Have attendees open their own `.lab-runs/snack/receipts/`: one file per `prove`. Lesson 07 maps the receipt fields and the extra metadata a real system needs.

**Next →** “That history becomes useful evaluation data; we’ll come back to it at the end. But first: the receipt says PASS. So… done? Look at the screenshot.”

**Careful:** Saved receipts from the reference proof (`--solution`) before and after a real Claude Code run, not your live run; your revisions will differ. The revision is a hash of the served HTML, not a Git commit. snack doesn’t record model, tool or environment versions or costs, which a production run archive needs.
-->

---
class: coral
clicks: 1
---

# It persists.<br>It also lies.

<div class="comparison">
<div><div class="small-label">What prove checked</div><blockquote>status after reload:<br>“waitlisted”</blockquote><p class="comparison-label">Verdict: PASS.</p></div>
<div><div class="small-label">What the screenshot says</div><blockquote>“You’re in! Your seat<br>is confirmed.”</blockquote><p class="comparison-label">The map says: waitlist only.</p></div>
</div>
<div class="judge-line" v-click><code>pnpm snack judge</code><span>honest <strong>0.01</strong> · next step <strong>0.02</strong> → <strong>FAIL</strong></span></div>
<p class="aside-note">Some claims aren’t assertions. Ask a fast judge one narrow question, or show a human the screenshot.</p>

<!--
**ACT 5 · THE AGENT** · 41:00–43:30 · Zack

**Why this slide:** Behavior and meaning are different checks. `prove` can tell you the record survived. It can’t tell you whether the message is honest. That’s why the receipt has a screenshot, and why there’s a second kind of check.

**Say:**
- “Prove passed. The record survives reload. Now read the screenshot.” Pause. “‘Your seat is confirmed.’ It’s a waitlist. There is no seat. You may have noticed this way back on slide 6.”
- “Why not grep for ‘waitlist’? Picture: ‘You’re on the waitlist, no seat guaranteed. Your seat is confirmed!’ Keywords pass. Meaning fails.”
- “So we ask a different kind of check. Jev, from TypeSafe, is a small, fast judge: one narrow yes/no question, a probability back.”

[click] **(click: judge)** Run `pnpm snack judge` live. “Does this copy say waitlist only, no guaranteed seat? Almost certainly not. Fail.”

- “No key? Same idea, a human: open the screenshot and read it against the contract in the map. The point is that *someone* reads it.”
- “If your product has one approved message, skip the model and use an exact match. We allow paraphrases on purpose.”

**Do:** Have the agent (or a volunteer) fix the copy, then run `prove` and `judge` again: both pass (rehearsal: 0.98 / 0.98).

**If your live agent already fixed the copy** (Claude Code did in rehearsal, because the map lists the contract): say so. “It caught it because it read the map and the screenshot. `prove` alone passed it.” The numbers on the slide are from `pnpm snack up --bug overpromise`, which serves a working app with only the copy bug.

**Next →** “So when does the agent stop?”

**Careful:** A probability is a signal, not proof. 0.55 doesn’t mean 55% done; it means the judge is torn, and a human decides. The slide’s numbers are a real jev-1.13.0 run of this exact copy with persistence working; live numbers can differ.
-->

---
---

<p class="small-label">IN THE SKILL, SO THE AGENT KNOWS</p>

# When to stop.

<div class="stop-rules">
<div class="policy-row"><span>PASS on this revision, screenshot read, copy honest</span><span>→</span><strong>Done. Show the receipt.</strong></div>
<div class="policy-row"><span>Same check still fails after two fixes</span><span>→</span><strong>Hand a human the receipt.</strong></div>
<div class="policy-row"><span><code>doctor</code> red, or <code>prove</code> can’t tell (exit 2)</span><span>→</span><strong>Fix the setup. Don’t guess.</strong></div>
<div class="policy-row"><span>The judge is unsure</span><span>→</span><strong>A human reads the screenshot.</strong></div>
</div>
<p class="footnote">The skill states the rule. The CLI supplies the evidence. Neither trusts the agent’s word.</p>

<!--
**ACT 5 · THE AGENT** · 43:30–44:00 · Nick · hard stop 44:00

**Why this slide:** A loop without a stop rule either quits early or never ends. These four lines live in `lab/verify/SKILL.md`, so every agent reads the same rule.

**Say:**
- “Top to bottom. Done means PASS on *this* revision, screenshot read, copy honest. Then show the receipt.”
- “Two fixes and the same check still fails? Stop. Hand a human the receipt and what you tried. No infinite retry loops.”
- “Doctor red, or prove can’t tell? That’s the environment. Fix the setup or ask. Never ‘fix’ the app because the browser didn’t start.”
- “Judge unsure? A human reads it.”
- “Notice who decides ‘done’: not the agent’s confidence. The evidence.”

**Next →** “You built a verifier. Time to see if it holds.”
-->

---
class: indigo
---

<p class="small-label">The game: you built the lever. Now try to sneak one past it.</p>

<div class="role-match">
<div><div class="role-name">Saboteur</div><p>snack picks a secret bug.<br>Not even you know which.</p></div>
<span class="versus">vs.</span>
<div><div class="role-name accent">Detective</div><p>You. Find it with snack alone.<br>Name the bug and the proof.</p></div>
</div>

<p class="lede">Everyone plays solo. One round. Sometimes there is no bug.</p>
<p class="footnote"><code>pnpm snack up --bug random</code>. Stopping it reveals the answer.</p>

<!--
**ACT 6 · THE GAME** · 44:00–45:00

**Why this slide:** It tests the lever both ways. Can it find a bug that’s there? Can it stay quiet when nothing is wrong? A detective that cries “bug!” every round is as useless as one that never does.

**Say:**
- “No pairing. snack is the saboteur: `--bug random` picks a secret bug, and it hides it from you too.”
- “You’re the detective. You get snack and nothing else. No reading files, no `eval` on the source. Find the bug, name it, and show the command output that proves it.”
- “Sometimes it picks ‘none.’ ‘It works’ is a real answer, and it scores.”
- “You may use your agent. Hand it the skill and say ‘find what’s wrong’.”

**Next →** “Two minutes. Go.”

**Careful:** The bug is injected by the server at load time, so it isn’t in `lab/app/index.html`. The bug name is revealed only when `up` stops.
-->

---
---

<div class="split">
<div><p class="small-label">One round · 2 minutes</p><h1>Find the bug.</h1><div class="command">pnpm snack up --bug random</div><p class="aside-note">It’s one of: none · memory-only · wrong-email<br>lost-confirmation · overpromise · console-error</p><div class="game-rules"><p>snack commands only.</p><p>Write your answer, then Ctrl+C to reveal.</p></div></div>
<RoundTimer :seconds="120" />
</div>

<!--
**ACT 6 · THE GAME · round** · 45:00–47:30 · one 2-minute solo round, then the reveal

**Why this slide:** Two minutes is enough with the lever and far too little without it. That’s the point.

**Say:**
- “Ctrl+C your `up`, then `pnpm snack up --bug random`. Go. Start with `doctor`. Then whatever you like.”
- “Write down your answer *before* you Ctrl+C. The last line it prints is the reveal.”

**Do:** Press Start. When the timer ends, everyone writes an answer and stops `up` to see the reveal.

**Hints if someone is stuck:** “Did you run `prove`? Did you *read* everything it printed?” “Did you look at the screenshot?” “What does the console say?”

**Next →** “Time. Let’s score it.”

**Careful:** `--bug` serves the reference app plus one bug, not the attendee’s edited app. That’s on purpose: everyone plays the same game.
-->

---
---

<div class="split">
<div><h1>Score the<br>detective.<br><span class="accent">Not the confidence.</span></h1><p class="lede">Who got fooled,<br>and by which bug?</p><div class="game-rules"><p>Bragging rights only.</p></div></div>
<div class="score-receipt">
<div class="small-label">Paper scorecard</div>
<div class="score-line"><span>Named the bug, with output</span><strong>+2</strong></div>
<div class="score-line"><span>Said “it works” and it did</span><strong>+2</strong></div>
<div class="score-line"><span>Said “it works” and it didn’t</span><strong>−3</strong></div>
<div class="score-line"><span>Blamed a bug that wasn’t there</span><strong>−1</strong></div>
<div class="score-line"><span>Right bug, no evidence</span><strong>0</strong></div>
</div>
</div>

<!--
**ACT 6 · THE GAME · scoring** · 47:30–49:00

**Why this slide:** The scoring is the lesson. Calling a broken app done costs the most. Crying wolf costs something too. A guess without evidence earns nothing, even when it’s right.

**Say:**
- Walk the card. “Named it with output: plus two. Correctly said it works: plus two. Said it works when it didn’t: minus three. That’s the expensive one, the one this whole hour is about. Blamed a bug that wasn’t there: minus one. Right guess, no evidence: zero.”
- Count hands: “Who said ‘it works’ and was wrong? Which bug got you?” **Say the bug names out loud.** You’re fishing for overpromise and console-error.

**Next →** “Here’s why those two.”

**Rules:** The hosts settle disputes. Keep it about the system, never embarrass a participant.
-->

---
clicks: 3
---

<p class="small-label">THE REVEAL</p>

# Every miss is a new line in the map.

<div class="miss-list">
<div><code>memory-only</code><span class="status-lozenge good">prove caught it</span><span>status and storage after reload</span></div>
<div><code>wrong-email</code><span class="status-lozenge good">prove caught it</span><span>saved email after reload</span></div>
<div><code>lost-confirmation</code><span class="status-lozenge good">prove caught it</span><span>confirmation after reload</span></div>
<div v-click="1"><code>overpromise</code><span class="status-lozenge bad">prove said PASS</span><span>the screenshot, or <code>judge</code></span></div>
<div v-click="2"><code>console-error</code><span class="status-lozenge bad">prove said PASS</span><span><code>console</code>. It was in the receipt all along.</span></div>
<div v-click="3"><code>none</code><span class="status-lozenge warn">nothing to find</span><span>“It works” is a real answer.</span></div>
</div>

<!--
**ACT 6 · THE GAME · the reveal** · 49:00–51:00

**Why this slide:** The lever is never finished. Every bug that slipped through tells you exactly what to add: a check in `prove`, or a gotcha in the map. That’s how the tool gets better, by being attacked.

**Say:**
- “Three bugs, your proof caught. That’s the four checks you wrote.”

[click] **(1) overpromise** “Prove said PASS. Persistence is fine; the copy lies. Only the screenshot or the judge sees it.”

[click] **(2) console-error** “Prove said PASS. But scroll up in the receipt: `pageErrors: track is not defined`. The evidence was right there. No check looked at it.”

[click] **(3) none** “And the detectives who said ‘it works’ on a working app: that’s the hardest call. Well done.”

- “So, two new lines. A gotcha: ‘read the screenshot, the copy can lie.’ And a check: ‘no page errors.’ Every miss becomes a line in the map or a check in the proof. That’s the maintenance loop.”

**Next →** “One more. The sneakiest.”
-->

---
class: night
clicks: 1
---

<p class="small-label">The final boss: a perfect receipt for the wrong code</p>

# “But it passed<br><span class="accent">yesterday.</span>”

<div class="command">pnpm snack doctor</div>
<div class="doctor-stale"><code>"proof": "STALE: the last receipt says PASS for 4e8c43d6bc1e, but the source is now 1b539940221a. That proof is for code that no longer exists."</code></div>
<p class="lede" v-click>Prove it again. Yesterday’s green is not today’s.</p>

<!--
**ACT 6 · THE GAME · final boss** · 51:00–52:30 · hard stop 55:00 (2:30 slack for earlier overruns)

**Why this slide:** Callback to “doctor first.” Every receipt is stamped with the revision it proved. Change one character and the old PASS stops counting. Agents love to reuse an old green; doctor catches it.

**Do (live, 30 seconds):** With a passing receipt from the agent run, make a one-character edit to `lab/app/index.html` (add a space in a comment). Run `pnpm snack doctor`. Show `build: STALE` and `proof: STALE`.

**Say:**
- “The final boss. Every check green. For yesterday’s code.”
- “What should the agent do?” Take one answer.

[click] **(click: answer)** “Prove it again. A receipt is for one revision. Change the code and the old proof is about code that no longer exists.”

**Story beat (optional, one sentence each):**
- **Nick:** Riker records the commit with every check result, and a job with no fresh check is reported unverified.
- **Zack:** CTX evaluates gates only from current, unexpired receipts tied to the exact revision.

**Next →** “Now take it home.”

**Careful:** Undo the edit afterwards (`git checkout lab/app/index.html` resets the whole app, including the agent’s fix).
-->

---
class: night takeaway-slide
clicks: 2
---

<VerificationWorkbench />

<!--
**ACT 7 · TAKE IT HOME · a tool for your app** · 55:00–55:30 · two clicks

**Why this slide:** Turn the hour into a recipe for their own app. An agent needs a maintained map of the feature plus a tool to exercise it. We built the small version: the map, snack, and `prove`.

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
**ACT 7 · TAKE IT HOME · browser instruments** · 55:30–56:00 · two clicks

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
**ACT 7 · TAKE IT HOME · a history you can improve against** · 56:00–56:30 · three clicks

**Say / click:**
- **0:** “Nick and I both ended up here: receipts are evidence now, and a history of the system over time. Keep the failure, the repair and the final outcome.”
- **1:** “Turn recurring failures into labeled evaluation cases. Freeze the grader. Change one tool, prompt or policy, then rerun the same tasks. Track bad accepts and unnecessary interruptions; add latency and cost in your own system.”
- **2:** “Hillclimbing means keeping a change only when independent evaluation supports it. Check untouched cases before promotion. If the agent can rewrite its own scorekeeper, the hill might be fake.”
- **3:** “Over time you have your own run dataset. With permission, redaction, reviewed labels and a separate evaluation split, it can also support fine-tuning. That’s an option, not something these logs do automatically.”

**Concrete next step:** Lesson 07 shows where snack keeps receipts (`.lab-runs/snack/receipts/`), what each field means, and which extra fields a real run archive needs. The game already produced the first eval cases: the bugs that slipped past `prove`. An automatic improvement loop also needs a bounded experiment budget, a promotion gate and rollback.

**Careful:** The left cards are real saved snack receipts from this workshop (the reload failure, the agent’s fix, and the game’s console-error miss), not a measured trend or a training corpus. The right side is the workflow attendees can build next. This workshop does not fine-tune anything.

**Next →** “Now write the first row for your own app.”
-->

---
class: night takeaway-slide
clicks: 2
---

<VerifierExamples />

<!--
**ACT 7 · TAKE IT HOME** · 56:30–58:45 · 15-second examples, then protect the two-minute exercise

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
<div class="closing-resources"><div><div class="close-questions"><p>Observe.</p><p>Fix.</p><p><span class="accent">Prove.</span></p></div><p class="lede" style="margin-top: 35px">Nick Nisi &amp; Zack Proser</p></div><ResourceQr resource="glossary" compact /></div>
<p class="footnote">Your agents will keep saying “done.” Now they can show you the receipt.</p>

<!--
**ACT 7 · TAKE IT HOME · close** · 58:45–60:00 · both hosts

**Why this slide:** Close the arc where slide 8 opened it. The right-hand lane was “Observe. Fix. Prove.” Now they’ve built it.

**Say:**
- Take one example from the room. Ask: “What would its `doctor` check? What’s its `prove`?”
- “Remember the two afternoons? This is the right-hand one. Observe. Fix. Prove.”
- Close together: “Your agents will keep saying ‘done.’ Now they can show you the receipt.”
- Credit each other. “The repo, the glossary and the worksheet all stay with you.”

Leave them one next action (build the first command), not a reading list.
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
- **Why a CLI and not an MCP server?** Either works. A CLI is cheap to build, easy to test, composes with the shell, and every agent already knows how to run commands.
- **Why not just Playwright tests?** `prove` *is* a Playwright script. The difference is the agent can run it on demand and read a receipt with next steps, plus all the Look commands for debugging.
- **Can the agent edit the proof?** In this repo, yes; it has a shell. The skill tells it not to. Real isolation (separate checkout, read-only verifier) is a separate problem.
- **What about apps that aren’t web?** Same shape, different wire: the simulator for iOS, a PTY or tmux for CLIs, plain HTTP for services.
- **Does a passing browser proof prove the backend?** No. This app has no backend. Add server-side checks to `prove` when that’s your requirement.
- **Is Jev required?** No. It’s one narrow check for meaning. Without it, a human reads the screenshot.

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
<p>Bring your half-built lever,<br>or your agent’s weirdest “done.”</p>
<div class="ticket-bottom"><span>NO RECEIPT REQUIRED</span></div>
<span class="stamp">Come by</span>
</div>
</div>

<!--
**AFTER THE HOUR · booth** · while the room clears

**Say:** “Not done talking? Neither are we. Find us at Booth 6. Bring the agent that swears it’s done, or the lever you started today.”

Leave it up while people pack.
-->

---
src: ./decision-models.md
---
