<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref, watch } from "vue";
import { useSlideContext } from "@slidev/client";
import behind from "../assets/riker/behind-the-scenes.webp";
import needsYou from "../assets/riker/needs-you.webp";

// Every value below is Riker's own record of job 140 (PR #13, which deployed this site),
// read from its jobs store. The screenshots are Riker's app on a demo repo, from its install page.
const { $clicks } = useSlideContext();
const step = computed(() => Math.max(0, Math.min(Number(unref($clicks)), 7)));
const scene = computed(() => step.value === 0 ? "idle" : step.value <= 2 ? "check" : step.value === 3 ? "proof" : step.value === 4 ? "decide" : "look");

const rail = [
  { title: "Build the check", sub: "written before any code" },
  { title: "Run it yourself", sub: "the worker’s run is a draft" },
  { title: "Keep the evidence", sub: "exit · commit · tree · hash" },
  { title: "Decide when to stop", sub: "proven, failed, or unverified" },
];
const railState = (i: number) => {
  const current = Math.min(step.value, 4) - 1;
  return i < current ? "done" : i === current ? "current" : "todo";
};

const checks = ["install", "test", "lab:test", "build", "slides:check", "deploy dry run", "site index", "slides index",
  "revision.txt", "talks index", "lockfile", "worker bundle", "alto.json shape", "no root links", "slide assets",
  "/people/ paths", "private notes", "glossary QR", "clean tree"];

const captions = [
  "A real job and the worker’s own words. Riker keeps the hand-back as the job’s story. It never sets the status.",
  "The check is part of the job before any code exists: tests, build, the slide checker, a deploy dry run, then file and grep assertions.",
  "Riker’s supervisor runs it in the job’s worktree, in its own process. Its brief told the worker: “My own check is the one that counts.”",
  "The proof comes from the check’s own process, with the log’s hash. Every time it’s shown, the log is hashed again: an edited log reads “changed.”",
  "Signing rewrote every commit, but the tree didn’t change, so the proof still holds. Change one byte and it wouldn’t: “my check passed on other code than what’s pushed.”",
  "Some things no command can judge. Riker names the look a person owes, and a look counts only for the tree it was given on.",
];

// The check took 2m 21s (140,985 ms). Replayed in about 1.5 s on stage.
const CHECK_SECONDS = 141;
const elapsed = ref(step.value >= 3 ? CHECK_SECONDS : 0);
const clock = computed(() => `${Math.floor(elapsed.value / 60)}:${String(elapsed.value % 60).padStart(2, "0")}`);
let frame = 0;
watch(step, (now, before) => {
  cancelAnimationFrame(frame);
  if (now < 2) { elapsed.value = 0; return; }
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (now !== 2 || before !== 1 || reduced) { elapsed.value = CHECK_SECONDS; return; }
  const start = performance.now();
  const tick = (t: number) => {
    const progress = Math.min(1, (t - start) / 1500);
    elapsed.value = Math.round(CHECK_SECONDS * progress);
    if (progress < 1) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
}, { immediate: true });
onBeforeUnmount(() => cancelAnimationFrame(frame));

const overlays = {
  6: {
    heading: "Behind the scenes: every line is read from a record",
    image: behind, ratio: 995 / 720,
    alt: "Riker's Behind the scenes view: a Right now summary saying job 2's check passed and is waiting on your look, an activity feed of commands with exit codes, and a finished job marked proven with “My check passed: npm test.”",
    caption: "Riker’s app on a demo repo. “proven” appears only when Riker’s own check passed.",
    marks: [
      { box: [2.3, 14.6, 95.7, 33.3], tone: "neutral", title: "Right now", text: "Written from records: check passed, checked locally, not shared yet, still waiting on your look." },
      { box: [1.3, 54.4, 48.2, 23.6], tone: "neutral", title: "Activity", text: "Every command the worker ran, with its exit code. “Finished — check passed” is Riker’s line." },
      { box: [50.8, 53.9, 47.2, 44.4], tone: "proven", title: "Recently finished", text: "“proven” and “My check passed: npm test.” With no check it would say “done, unverified.”" },
    ],
  },
  7: {
    heading: "Needs you: when only a person can decide",
    image: needsYou, ratio: 1390 / 838,
    alt: "Riker's Needs you view: an ember badge reading “Needs you, a decision and 7 PRs”, a decision card asking whether to sort a breakdown by amount or by name with Riker's read and two options, and a sidebar job marked proven.",
    caption: "Ember only ever means a person is needed. Mint only ever means proven. Nothing else uses either color.",
    marks: [
      { box: [0.9, 1.4, 21.9, 8.4], tone: "human", title: "It comes to you", text: "Something waits on a person. You never go looking for status." },
      { box: [38.9, 15.8, 59.4, 82.1], tone: "human", title: "The decision", text: "Riker’s read, two options with their risks and undo cost, or “Ask me later.”" },
      { box: [4.3, 63.2, 17.3, 5.4], tone: "proven", title: "Proven", text: "The job beside it already passed its check." },
    ],
  },
} as const;
const overlay = computed(() => step.value >= 6 ? overlays[step.value as 6 | 7] : undefined);
</script>

<template>
  <section class="riker-walkthrough" :data-step="step">
    <div v-if="!overlay" class="rk-job">
      <header class="rk-head">
        <p class="rk-eyebrow">
          <svg viewBox="0 0 96 96" aria-hidden="true"><path d="M48 10 L84 83 L52 67 L52 37.7 L48 33.5 L44 37.7 L44 67 L12 83 Z" /></svg>
          RIKER · NICK’S TEAMMATE FOR CODING AGENTS · JOB 140, THE PR THAT DEPLOYED THIS SITE
        </p>
        <h1>The worker said “ready.” <span>Riker checked.</span></h1>
      </header>

      <ol class="rk-rail" aria-label="The loop we’ll build, in production">
        <li v-for="(item, i) in rail" :key="item.title" :class="railState(i)">
          <b>{{ railState(i) === 'done' ? '✓' : `0${i + 1}` }}</b>
          <div><strong>{{ item.title }}</strong><span>{{ item.sub }}</span></div>
        </li>
      </ol>

      <div class="rk-stage">
        <figure class="rk-claim" :class="{ receded: step >= 4 }">
          <figcaption>PI WORKER → RIKER · HAND-BACK · 07:59</figcaption>
          <blockquote>
            <p>The Beyond Done site now builds under <code>/beyond-done/</code> and <code>pnpm run deploy:talks</code> is <mark>ready for Nick to run.</mark></p>
            <p>I didn’t run your full check command… <code>pnpm test</code> failed one dev-server test on its first run; I fixed it and reran that test file <mark class="gap" :class="{ flagged: step >= 2 }">(the full suite was not rerun).</mark></p>
          </blockquote>
          <span class="stamp rk-stamp" aria-hidden="true">Claim</span>
          <p v-if="step >= 3" class="rk-claim-note">Kept on the timeline as the job’s story.</p>
        </figure>

        <div class="rk-record">
          <div class="rk-record-head">
            <span><b>#140</b> Make the site deployable to talks.workos.cloud</span>
            <span :key="step >= 4 ? 'proven' : 'checking'" class="rk-pill" :class="step >= 4 ? 'proven' : 'checking'">{{ step >= 4 ? 'proven' : 'checking' }}</span>
          </div>

          <div :key="scene" class="rk-body" :class="scene">
            <template v-if="scene === 'idle'">
              <p class="rk-empty"><strong>Nothing counts yet.</strong>The status waits on one thing: Riker’s own check.</p>
              <ul class="rk-timeline">
                <li><code>07:34</code>Job created</li>
                <li><code>07:39</code>Worker starts in its own worktree</li>
                <li><code>07:59</code>Worker hands back</li>
              </ul>
            </template>

            <template v-else-if="scene === 'check'">
              <div class="rk-check-head">
                <span>THE JOB’S CHECK · 19 STEPS · SET 07:34, BEFORE THE WORKER STARTED</span>
                <span v-if="step === 2" class="rk-clock"><span aria-label="Check duration">{{ clock }}</span><b v-if="elapsed === CHECK_SECONDS" class="rk-exit">exit 0</b></span>
              </div>
              <ul class="rk-chips" :class="{ ran: step === 2 }">
                <li v-for="(name, i) in checks" :key="name" :style="{ '--i': i }"><i aria-hidden="true">{{ step === 2 ? '✓' : '·' }}</i>{{ name }}</li>
              </ul>
            </template>

            <template v-else-if="scene === 'proof'">
              <div class="rk-proof">
                <div class="rk-proof-top"><span>RIKER PROOF · RUN 1</span><span>from the check’s own process</span></div>
                <dl>
                  <div class="wide"><dt>command</dt><dd><code>pnpm install --frozen-lockfile &amp;&amp; pnpm test &amp;&amp; … (19)</code></dd></div>
                  <div><dt>exit</dt><dd><code class="good">0</code></dd></div>
                  <div><dt>took</dt><dd><code>2m 21s</code></dd></div>
                  <div><dt>commit</dt><dd><code>86c80a3</code></dd></div>
                  <div><dt>tree</dt><dd><code class="tree">a70b9da</code></dd></div>
                  <div class="wide"><dt>log</dt><dd><code>35,553 bytes · sha256 539aab0a…dad7a0</code></dd></div>
                  <div class="wide"><dt>base run</dt><dd>not run: <q>no test runner I recognise in the check</q></dd></div>
                  <div class="wide"><dt>read back</dt><dd><span class="rk-kept">kept ✓</span> hash still matches</dd></div>
                </dl>
              </div>
            </template>

            <template v-else-if="scene === 'decide'">
              <div class="rk-trees">
                <div class="rk-tree-row"><span>checked</span><code>86c80a3</code><b>→</b><code class="tree">a70b9da</code></div>
                <div class="rk-tree-row"><span>signed + pushed</span><code>0afcf0f</code><b>→</b><code class="tree">a70b9da</code></div>
                <span class="rk-same" aria-hidden="true">same tree ✓</span>
              </div>
              <p class="rk-shipped"><b>PR #13</b> opened and marked ready for review, 08:01:57. Merged that morning.</p>
              <ul class="rk-rules">
                <li><span class="rk-pill proven">proven</span>its check passed on exactly this tree</li>
                <li><span class="rk-pill quiet">done, unverified</span>no check ran: no proof</li>
                <li><span class="rk-pill quiet">failed</span>check failed: you hear why, nothing ships</li>
              </ul>
            </template>

            <template v-else>
              <div class="rk-look">
                <span>STILL WAITING ON YOUR LOOK</span>
                <p>After Nick’s first real deploy, open <code>/beyond-done/</code> and <code>/beyond-done/slides/</code> in a private window, with no sign-in. Check that lessons, the glossary, materials links, slide images (host portraits, logo) and both QR codes load.</p>
              </div>
              <ul class="rk-laws">
                <li><i class="proven" aria-hidden="true"></i><strong>Mint</strong> only ever means a check passed.</li>
                <li><i class="human" aria-hidden="true"></i><strong>Ember</strong> only ever means a person is needed.</li>
              </ul>
            </template>
          </div>
        </div>
      </div>

      <p :key="step" class="rk-caption"><b v-if="step > 0">{{ step <= 4 ? `0${step}` : '04' }}</b>{{ captions[step] }}</p>
    </div>

    <div v-else :key="step" class="riker-overlay">
      <div class="rk-overlay-heading"><span>RIKER · {{ overlay.heading }}</span><span class="rk-progress">{{ step - 5 }} / 2</span></div>
      <div class="rk-overlay-stage" :class="`shot-${step}`">
        <figure class="rk-shot" :style="{ aspectRatio: overlay.ratio }">
          <img :src="overlay.image" :alt="overlay.alt" />
          <span v-for="(mark, i) in overlay.marks" :key="mark.title" class="rk-ring" :class="mark.tone" aria-hidden="true"
            :style="{ left: `${mark.box[0]}%`, top: `${mark.box[1]}%`, width: `${mark.box[2]}%`, height: `${mark.box[3]}%`, '--i': i }"><b>{{ i + 1 }}</b></span>
        </figure>
        <ol class="rk-notes">
          <li v-for="(mark, i) in overlay.marks" :key="mark.title" :class="mark.tone" :style="{ '--i': i }">
            <b>{{ i + 1 }}</b><div><strong>{{ mark.title }}</strong><span>{{ mark.text }}</span></div>
          </li>
        </ol>
      </div>
      <p class="rk-overlay-caption">{{ overlay.caption }}</p>
    </div>
  </section>
</template>

<style scoped>
.riker-walkthrough {
  --rk-frame: #151515; --rk-panel: #1f1f1f; --rk-panel2: #262626; --rk-line: #343434;
  --rk-tx: #ececec; --rk-tx2: #a3a3a3; --rk-accent: #d4e46e; --rk-human: #ff7b54; --rk-proven: #00ba7c;
  height: 100%; background: var(--rk-frame); color: var(--rk-tx); font-size: 15px; line-height: 1.4;
}
.riker-walkthrough code { background: transparent; padding: 0; font-size: .92em; color: inherit; }
.rk-job { height: 100%; padding: 20px 36px 0; }

.rk-head { margin-bottom: 12px; animation: rk-arrive .26s ease-out both; }
.riker-walkthrough .rk-eyebrow { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font: 600 12px/1.3 "JetBrains Mono Variable", monospace; letter-spacing: .06em; color: var(--rk-tx2); }
.rk-eyebrow svg { width: 15px; height: 15px; fill: #e7edf3; }
.riker-walkthrough h1 { font-size: 33px; margin: 0; letter-spacing: -.03em; }
.riker-walkthrough h1 span { color: var(--rk-accent); }

.rk-rail { list-style: none; margin: 0 0 12px; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.rk-rail li { margin: 0; display: flex; gap: 9px; align-items: flex-start; padding: 7px 10px; border-radius: 8px; border: 1px solid var(--rk-line); background: var(--rk-panel); opacity: .45; transition: opacity .26s, border-color .26s, background .26s, transform .26s; }
.rk-rail li.done { opacity: .75; }
.rk-rail li.current { opacity: 1; border-color: var(--rk-accent); background: #2a2d1c; transform: translateY(-2px); }
.rk-rail b { font: 600 13px/1.5 "JetBrains Mono Variable", monospace; color: var(--rk-accent); min-width: 18px; }
.rk-rail li.done b { color: var(--rk-proven); }
.rk-rail strong { display: block; font-size: 14px; line-height: 1.25; }
.rk-rail span { display: block; font-size: 12px; line-height: 1.3; color: var(--rk-tx2); }

.rk-stage { display: grid; grid-template-columns: 292px 1fr; gap: 16px; height: 292px; }

.rk-claim { position: relative; margin: 0; padding: 13px 16px; border-radius: 14px 14px 14px 4px; background: #2b2b33; border: 1px solid #3c3c48; transition: opacity .3s; }
.rk-claim.receded { opacity: .55; }
.rk-claim figcaption { font: 600 11px/1.3 "JetBrains Mono Variable", monospace; letter-spacing: .05em; color: var(--rk-tx2); margin-bottom: 8px; }
.rk-claim blockquote { margin: 0; padding: 0; border: 0; background: none; font-size: 14px; line-height: 1.42; color: #e2e2ea; }
.riker-walkthrough .rk-claim blockquote p { margin: 0 0 8px; line-height: 1.42; }
.rk-claim mark { background: #d4e46e2e; color: #f3f7d4; padding: 0 2px; border-radius: 3px; }
.rk-claim mark.gap { background: transparent; color: inherit; transition: background .35s .2s, color .35s .2s; }
.rk-claim mark.gap.flagged { background: #ff7b5433; color: #ffd2c4; }
.rk-stamp { position: absolute; right: 12px; bottom: 30px; font-size: 20px; padding: 5px 11px; animation: rk-stamp .42s .35s cubic-bezier(.3,1.5,.5,1) both; }
.riker-walkthrough .rk-claim-note { position: absolute; left: 16px; bottom: 10px; margin: 0; font-size: 12px; color: var(--rk-tx2); animation: rk-arrive .26s ease-out both; }

.rk-record { display: flex; flex-direction: column; border-radius: 12px; border: 1px solid var(--rk-line); background: var(--rk-panel); overflow: hidden; }
.rk-record-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 9px 14px; border-bottom: 1px solid var(--rk-line); font-size: 14px; }
.rk-record-head b { font-family: "JetBrains Mono Variable", monospace; color: var(--rk-tx2); margin-right: 4px; }
.rk-pill { display: inline-block; flex: none; padding: 2px 10px; border-radius: 99px; font: 600 12px/1.5 "JetBrains Mono Variable", monospace; border: 1px solid var(--rk-line); color: var(--rk-tx2); }
.rk-record-head .rk-pill.proven { animation: rk-flip .5s cubic-bezier(.2,.9,.3,1.3) both; }
.rk-pill.proven { color: var(--rk-proven); border-color: var(--rk-proven); box-shadow: 0 0 0 3px #00ba7c26; }
.rk-pill.quiet { color: var(--rk-tx2); }
.rk-body { flex: 1; min-height: 0; padding: 12px 14px; animation: rk-arrive .26s ease-out both; }

.riker-walkthrough .rk-empty { margin: 18px 0 18px; font-size: 16px; color: var(--rk-tx2); }
.rk-empty strong { display: block; font-size: 24px; font-family: "Bricolage Grotesque Variable", sans-serif; color: var(--rk-tx); margin-bottom: 4px; }
.rk-timeline { list-style: none; margin: 0; padding: 0; border-left: 2px solid var(--rk-line); }
.rk-timeline li { margin: 0 0 8px; padding-left: 14px; font-size: 14px; animation: rk-arrive .26s calc(var(--n, 0) * 120ms + 150ms) ease-out both; }
.rk-timeline li:nth-child(2) { --n: 1; }
.rk-timeline li:nth-child(3) { --n: 2; }
.rk-timeline code { color: var(--rk-accent); margin-right: 10px; }

.rk-check-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; min-height: 26px; margin-bottom: 9px; font: 600 11px/1.3 "JetBrains Mono Variable", monospace; letter-spacing: .04em; color: var(--rk-tx2); }
.rk-clock { flex: none; display: flex; align-items: center; gap: 8px; font: 600 15px "JetBrains Mono Variable", monospace; color: var(--rk-tx); font-variant-numeric: tabular-nums; }
.rk-exit { white-space: nowrap; padding: 1px 8px; border-radius: 4px; background: var(--rk-proven); color: #000; font-size: 13px; animation: rk-pop .35s cubic-bezier(.3,1.5,.5,1) both; }
.rk-chips { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.rk-chips li { margin: 0; display: flex; align-items: center; gap: 5px; padding: 4px 6px; border-radius: 6px; border: 1px solid var(--rk-line); background: var(--rk-panel2); font: 12px/1.35 "JetBrains Mono Variable", monospace; white-space: nowrap; overflow: hidden; animation: rk-chip .3s calc(var(--i) * 28ms) ease-out both; transition: border-color .2s, background .2s, color .2s; }
.rk-chips li i { font-style: normal; color: var(--rk-tx2); width: 10px; }
.rk-chips.ran li { animation: none; border-color: #00ba7c80; background: #00ba7c1f; transition-delay: calc(var(--i) * 70ms); }
.rk-chips.ran li i { color: var(--rk-proven); }

.rk-proof { position: relative; background: #f4f6ee; color: #1d211a; border-radius: 8px; padding: 10px 14px 8px; box-shadow: 0 12px 30px #0008; animation: rk-print .5s ease-out both; }
.rk-proof-top { display: flex; justify-content: space-between; font: 600 11px "JetBrains Mono Variable", monospace; letter-spacing: .04em; color: #5b6152; border-bottom: 1px dashed #b9bfae; padding-bottom: 6px; margin-bottom: 4px; }
.rk-proof dl { margin: 0; display: grid; grid-template-columns: 1fr 1fr; column-gap: 18px; }
.rk-proof dl > div { display: flex; gap: 10px; align-items: baseline; padding: 3px 0; border-bottom: 1px dashed #d4d8ca; animation: rk-arrive .25s calc(var(--r, 0) * 70ms + 200ms) ease-out both; }
.rk-proof dl > div.wide { grid-column: 1 / -1; }
.rk-proof dl > div:last-child { border: 0; }
.rk-proof dl > div:nth-child(2) { --r: 1; } .rk-proof dl > div:nth-child(3) { --r: 2; } .rk-proof dl > div:nth-child(4) { --r: 3; }
.rk-proof dl > div:nth-child(5) { --r: 4; } .rk-proof dl > div:nth-child(6) { --r: 5; } .rk-proof dl > div:nth-child(7) { --r: 6; } .rk-proof dl > div:nth-child(8) { --r: 7; }
.rk-proof dt { flex: 0 0 72px; font: 11px "JetBrains Mono Variable", monospace; color: #6c7262; }
.rk-proof dd { margin: 0; font-size: 13px; line-height: 1.35; }
.rk-proof dd code { font-size: 13px; }
.rk-proof code.good { color: #0a7a58; font-weight: 700; }
.rk-proof code.tree { background: #d4e46e66; border-radius: 3px; padding: 0 3px; }
.rk-kept { color: #0a7a58; font-weight: 700; margin-right: 6px; }

.rk-trees { position: relative; padding: 4px 0 2px; }
.rk-tree-row { display: grid; grid-template-columns: 120px 80px 22px auto; align-items: center; gap: 8px; padding: 6px 10px; margin-bottom: 6px; border-radius: 8px; background: var(--rk-panel2); font-size: 13px; animation: rk-arrive .3s ease-out both; }
.rk-tree-row:nth-child(2) { animation-delay: .25s; }
.rk-tree-row span { color: var(--rk-tx2); }
.rk-tree-row b { color: var(--rk-tx2); font-weight: 400; }
.rk-tree-row code { font-size: 14px; }
.rk-tree-row code.tree { color: var(--rk-accent); justify-self: start; padding: 1px 6px; border-radius: 4px; background: #d4e46e1f; }
.rk-same { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); padding: 4px 10px; border-radius: 99px; background: var(--rk-proven); color: #000; font: 700 13px "JetBrains Mono Variable", monospace; animation: rk-pop-mid .4s .65s cubic-bezier(.3,1.5,.5,1) both; }
.riker-walkthrough .rk-shipped { margin: 6px 0 8px; font-size: 14px; color: var(--rk-tx2); animation: rk-arrive .3s .9s ease-out both; }
.rk-shipped b { color: var(--rk-tx); }
.rk-rules { list-style: none; margin: 0; padding: 8px 0 0; border-top: 1px solid var(--rk-line); }
.rk-rules li { display: flex; align-items: center; gap: 10px; margin: 0 0 6px; font-size: 13px; color: var(--rk-tx2); animation: rk-arrive .26s calc(var(--n, 0) * 90ms + 1.1s) ease-out both; }
.rk-rules li:nth-child(2) { --n: 1; } .rk-rules li:nth-child(3) { --n: 2; }
.rk-rules .rk-pill { min-width: 128px; text-align: center; }

.rk-look { padding: 12px 14px; border-radius: 10px; border: 1px solid var(--rk-human); background: #ff7b5414; box-shadow: 0 0 0 4px #ff7b5422; animation: rk-slide .4s cubic-bezier(.2,.9,.3,1.1) both; }
.rk-look > span { font: 700 11px "JetBrains Mono Variable", monospace; letter-spacing: .06em; color: var(--rk-human); }
.riker-walkthrough .rk-look p { margin: 6px 0 0; font-size: 14px; line-height: 1.45; }
.rk-laws { list-style: none; margin: 14px 0 0; padding: 0; }
.rk-laws li { display: flex; align-items: center; gap: 9px; margin: 0 0 6px; font-size: 14px; color: var(--rk-tx2); animation: rk-arrive .26s calc(var(--n, 0) * 120ms + .45s) ease-out both; }
.rk-laws li:nth-child(2) { --n: 1; }
.rk-laws strong { color: var(--rk-tx); }
.rk-laws i { width: 12px; height: 12px; border-radius: 50%; flex: none; }
.rk-laws i.proven { background: var(--rk-proven); }
.rk-laws i.human { background: var(--rk-human); }

.riker-walkthrough .rk-caption { margin: 12px 0 0; max-width: 800px; font-size: 15px; line-height: 1.38; color: #d6d6d6; animation: rk-arrive .26s ease-out both; }
.rk-caption b { font: 600 13px "JetBrains Mono Variable", monospace; color: var(--rk-accent); margin-right: 8px; }

.riker-overlay { height: 100%; padding: 12px 20px 30px; display: flex; flex-direction: column; animation: rk-arrive .3s ease-out both; }
.rk-overlay-heading { display: flex; justify-content: space-between; align-items: center; flex: 0 0 24px; font-size: 16px; font-weight: 650; color: var(--rk-accent); }
.rk-progress { font: 12px "JetBrains Mono Variable", monospace; color: var(--rk-tx2); }
.rk-overlay-stage { flex: 1; min-height: 0; display: flex; gap: 22px; align-items: center; margin: 6px 0; }
.rk-shot { position: relative; margin: 0; height: 100%; max-height: 430px; flex: none; border-radius: 8px; overflow: hidden; box-shadow: 0 16px 40px #000a, 0 0 0 1px #ffffff14; }
.shot-7 .rk-shot { height: 400px; }
.rk-shot img { display: block; width: 100%; height: 100%; animation: rk-zoom .7s ease-out both; }
.rk-ring { position: absolute; border: 3px solid var(--rk-accent); border-radius: 9px; box-shadow: 0 0 0 4px #00000066, 0 0 18px #d4e46e66; animation: rk-ring .45s calc(var(--i) * 550ms + 350ms) cubic-bezier(.2,.9,.3,1.2) both; }
.rk-ring.proven { border-color: var(--rk-proven); box-shadow: 0 0 0 4px #00000066, 0 0 18px #00ba7c88; }
.rk-ring.human { border-color: var(--rk-human); box-shadow: 0 0 0 4px #00000066, 0 0 18px #ff7b5488; }
.rk-ring b { position: absolute; left: -11px; top: -11px; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; background: inherit; font: 700 12px "JetBrains Mono Variable", monospace; color: #000; background-color: var(--rk-accent); }
.rk-ring.proven b { background-color: var(--rk-proven); }
.rk-ring.human b { background-color: var(--rk-human); }
.rk-notes { list-style: none; margin: 0; padding: 0; flex: 1; min-width: 0; }
.rk-notes li { display: flex; gap: 10px; margin: 0 0 14px; padding: 0 0 12px; border-bottom: 1px solid var(--rk-line); animation: rk-arrive .3s calc(var(--i) * 550ms + 400ms) ease-out both; }
.rk-notes li:last-child { border: 0; }
.rk-notes li > b { flex: none; width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; background: var(--rk-accent); color: #000; font: 700 12px "JetBrains Mono Variable", monospace; }
.rk-notes li.proven > b { background: var(--rk-proven); }
.rk-notes li.human > b { background: var(--rk-human); }
.rk-notes strong { display: block; font-size: 16px; line-height: 1.25; margin-bottom: 3px; }
.rk-notes span { display: block; font-size: 14px; line-height: 1.4; color: #cfcfcf; }
.riker-walkthrough .rk-overlay-caption { flex: 0 0 auto; margin: 0; text-align: center; font-size: 14px; line-height: 1.3; color: #e3e2e0; }

@keyframes rk-arrive { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes rk-chip { from { opacity: 0; transform: scale(.92); } to { opacity: 1; transform: none; } }
@keyframes rk-stamp { from { opacity: 0; transform: scale(1.6) rotate(-9deg); } to { opacity: 1; transform: scale(1) rotate(-9deg); } }
@keyframes rk-pop { from { opacity: 0; transform: scale(1.5); } to { opacity: 1; transform: none; } }
@keyframes rk-pop-mid { from { opacity: 0; transform: translateY(-50%) scale(1.5); } to { opacity: 1; transform: translateY(-50%); } }
@keyframes rk-flip { 0% { transform: rotateX(90deg); } 60% { transform: rotateX(-15deg); box-shadow: 0 0 0 8px #00ba7c40; } 100% { transform: none; } }
@keyframes rk-print { from { opacity: .3; transform: translateY(-14px) rotate(-1.5deg); } to { opacity: 1; transform: none; } }
@keyframes rk-slide { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: none; } }
@keyframes rk-zoom { from { transform: scale(1.04); } to { transform: none; } }
@keyframes rk-ring { from { opacity: 0; transform: scale(1.12); } to { opacity: 1; transform: none; } }
</style>
