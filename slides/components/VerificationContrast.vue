<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, unref, watch } from "vue";
import { useSlideContext } from "@slidev/client";

const { $clicks, $slidev, $page } = useSlideContext();
const step = computed(() => Math.max(0, Math.min(Number(unref($clicks)), 3)));
const active = computed(() => unref($slidev.nav.currentPage) === unref($page));
const mode = ref<"waitlist" | "performance">("waitlist");
const reducedMotion = ref(false);
const elapsed = ref([0, 0]);
const targets = [[0, 0], [240, 240], [720, 480], [2160, 480]];
let frame: number | undefined;
let media: MediaQueryList | undefined;

function stopClock() {
  if (frame !== undefined) cancelAnimationFrame(frame);
  frame = undefined;
}
function syncMotion() { reducedMotion.value = media?.matches ?? false; }
function settleClock() { stopClock(); elapsed.value = [...targets[step.value]]; }
function hidden() { if (document.hidden) settleClock(); }
watch([step, active, mode, reducedMotion], ([next, visible], previous) => {
  stopClock();
  const destination = targets[next];
  if (!visible || reducedMotion.value || !previous?.[1] || next <= previous[0] || document.hidden) {
    elapsed.value = [...destination];
    return;
  }
  const start = [...elapsed.value];
  const began = performance.now();
  function tick(now: number) {
    const progress = Math.min(1, (now - began) / 2400);
    elapsed.value = destination.map((end, index) => Math.round(start[index] + (end - start[index]) * progress));
    if (progress < 1) frame = requestAnimationFrame(tick);
    else frame = undefined;
  }
  frame = requestAnimationFrame(tick);
}, { immediate: true });
onMounted(() => {
  media = window.matchMedia("(prefers-reduced-motion: reduce)");
  syncMotion();
  media.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", hidden);
});
onBeforeUnmount(() => {
  stopClock();
  media?.removeEventListener("change", syncMotion);
  document.removeEventListener("visibilitychange", hidden);
});
function clock(seconds: number) { return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
const copy = computed(() => mode.value === "waitlist" ? {
  task: "Make the waitlist survive reload.",
  guesses: ["Maybe cache?", "Add a delay?", "Rewrite the form?"],
  blind: ["A plausible plan.", "“Probably a timing issue.”", "“Fixed.” Reload. Still gone.", "Undo. Rewrite. Try the same fix."],
  evidence: ["A repeatable check is ready.", "Reload: waitlisted → none", "Persist. Reload. Check again.", "Fresh evidence. Check passes."],
  tool: ["CLI + real browser", "A failing assertion", "A targeted repair", "Verified persistence"],
} : {
  task: "Make the slow interaction responsive.",
  guesses: ["Maybe network?", "Memoize everything?", "Rewrite the view?"],
  blind: ["A plausible plan.", "“Probably the API.”", "More caching. Still stalls.", "Undo. Rewrite. Try the same fix."],
  evidence: ["Record the same interaction.", "Trace: repeated expensive work", "Remove it. Record again.", "Same check. Within budget."],
  tool: ["Chrome DevTools", "Find the hot path", "Compare fresh traces", "Verified against the budget"],
});
</script>

<template>
  <div class="verification-contrast" :data-step="step" :data-mode="mode" :class="{ 'is-active': active }">
    <h1>Same task. Very different afternoon.</h1>
    <div class="contrast-toolbar">
      <div class="shared-task">{{ copy.task }}</div>
      <div class="example-switch" role="group" aria-label="Verification example" @click.stop
        @keydown.enter.stop @keydown.space.stop
        @keydown.left.prevent.stop="$slidev.nav.prev()" @keydown.right.prevent.stop="$slidev.nav.next()">
        <button type="button" :aria-pressed="mode === 'waitlist'" @click="mode = 'waitlist'">Waitlist</button>
        <button type="button" :aria-pressed="mode === 'performance'" @click="mode = 'performance'">Slow UI</button>
      </div>
    </div>

    <div class="contrast-lanes">
      <section class="agent-lane blind-lane" aria-label="Agent without a reliable check">
        <div class="lane-heading"><div><span class="lane-eyebrow">NO RELIABLE CHECK</span><h2>Guess. Edit. Repeat.</h2></div><div class="elapsed" aria-label="Illustrative time without verification">{{ clock(elapsed[0]) }}</div></div>
        <div class="route-scene blind-route" :key="`${mode}-${step}`" aria-hidden="true">
          <svg viewBox="0 0 390 112" class="route-map">
            <path class="idle-path" d="M24 55 H365" />
            <g v-if="step > 0" class="tangled-paths">
              <path d="M24 55 C60 55 24 8 110 16 S224 106 272 52 S184 7 157 45 S215 108 306 87 S370 34 311 28 S247 107 169 83 S63 95 70 56 S162 24 200 64 S308 100 365 55" />
              <path v-if="step >= 2" d="M24 55 C72 126 109 4 161 25 S291 110 305 51 S202 15 224 55 S122 115 105 65 S238 12 289 88 S332 16 365 55" />
              <path v-if="step === 3" d="M24 55 C126 -27 170 143 271 52 S93 4 65 78 S240 97 200 45 S340 8 331 73 S148 105 365 55" />
            </g>
            <circle cx="24" cy="55" r="8" class="agent-dot" />
            <circle cx="365" cy="55" r="8" class="unreached-dot" />
          </svg>
          <template v-if="step > 0">
            <span v-for="(guess, index) in copy.guesses.slice(0, step)" :key="guess" class="guess-chip" :class="`guess-${index}`">{{ guess }}</span>
            <span class="retry-token">↻</span>
          </template>
          <span v-else class="route-caption">No way to tell which guess helped.</span>
        </div>
        <div class="lane-finding" :key="copy.blind[step]"><span>{{ ['UNTESTED', 'ASSUMPTION', 'ANOTHER RETRY', 'STILL UNVERIFIED'][step] }}</span><strong>{{ copy.blind[step] }}</strong></div>
        <div class="time-track" aria-hidden="true"><div :style="{ width: `${elapsed[0] / 2160 * 100}%` }" /></div>
      </section>

      <section class="agent-lane verified-lane" :class="{ complete: step >= 2 }" aria-label="Agent with executable verification">
        <div class="lane-heading"><div><span class="lane-eyebrow">CAN RUN THE CHECK</span><h2>Observe. Fix. Prove.</h2></div><div class="elapsed" aria-label="Illustrative time with verification">{{ clock(elapsed[1]) }}</div></div>
        <div class="route-scene verified-route" :key="mode" aria-hidden="true">
          <template v-if="mode === 'waitlist'">
            <svg viewBox="0 0 390 112" class="route-map">
              <path class="idle-path" d="M45 40 H342" />
              <path v-if="step > 0" :key="step" class="proof-path" :d="step === 1 ? 'M45 40 H187' : 'M45 40 H342'" pathLength="1" />
              <circle v-for="(x, index) in [45, 192, 342]" :key="x" :cx="x" cy="40" r="12" :class="step >= (index === 0 ? 1 : 2) ? 'checked-dot' : 'pending-dot'" />
              <text x="45" y="84" text-anchor="middle">Observe</text><text x="192" y="84" text-anchor="middle">Repair</text><text x="342" y="84" text-anchor="middle">Re-check</text>
            </svg>
          </template>
          <div v-else class="trace-view" :class="{ optimized: step >= 2 }">
            <div class="trace-caption">{{ step >= 2 ? 'AFTER · same interaction' : 'BEFORE · main thread' }}</div>
            <div class="trace-row"><span class="trace-interaction">interaction</span></div>
            <div class="trace-row"><span class="trace-render">render</span></div>
            <div class="trace-row trace-calls"><span v-for="n in 5" :key="n" :class="{ removed: step >= 2 && n > 1 }">sort</span></div>
            <span class="trace-label">{{ step >= 2 ? 'Re-record. Check the original budget.' : 'Repeated work appears in the flame chart.' }}</span>
          </div>
        </div>
        <div class="lane-finding" :key="copy.evidence[step]"><span>{{ copy.tool[step] }}</span><strong>{{ copy.evidence[step] }}</strong></div>
        <div class="time-track" aria-hidden="true"><div :style="{ width: `${elapsed[1] / 2160 * 100}%` }" /></div>
      </section>
    </div>

    <div class="contrast-conclusion" role="status">{{ ['Give the agent a way to see what its edits actually did.', 'A failing check turns a guess into a specific next step.', 'The check passes. That clock stops.', 'Evidence narrows the search. A retry budget stops the spiral.'][step] }}</div>
    <div class="contrast-resource" v-if="mode === 'waitlist'"><span>TRY THE CHECK</span><code>pnpm lab:check --scenario memory-only --solution</code></div>
    <div class="contrast-resource" v-else><span>TRANSFER EXAMPLE</span><a href="https://developer.chrome.com/docs/devtools/performance/overview" target="_blank" rel="noopener noreferrer" @click.stop>Chrome DevTools · record → inspect → re-record ↗</a></div>
    <p class="contrast-disclaimer">Illustration · compressed, invented elapsed times (mm:ss), not a benchmark. {{ mode === 'waitlist' ? 'CLI runs the real app.' : 'Schematic trace, not a lab recording.' }}</p>
  </div>
</template>

<style scoped>
.verification-contrast { --warm: #ffae98; --cool: #d9ff82; }
.verification-contrast h1 { font-size: 42px; margin: 0 0 10px; letter-spacing: -.035em; }
.contrast-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 12px; }
.shared-task { font-size: 21px; color: #e1ddf2; }
.example-switch { display: flex; gap: 4px; padding: 3px; border: 1px solid #6b628c; border-radius: 8px; }
.example-switch button { color: #eeeafa; background: transparent; border: 0; border-radius: 5px; font: 600 16px/1.3 ui-sans-serif, system-ui, sans-serif; padding: 5px 14px; cursor: pointer; }
.example-switch button[aria-pressed="true"] { background: #e7e2fa; color: #30263f; }
.contrast-lanes { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.agent-lane { min-width: 0; border-radius: 12px; padding: 14px; border: 1px solid #745668; }
.blind-lane { color: #fff0ed; background: #392d40; }
.verified-lane { color: #e8f2d8; background: #283b35; border-color: #5d7661; }
.lane-heading { display: flex; justify-content: space-between; align-items: end; gap: 8px; }
.lane-eyebrow { display: block; font-size: 15px; line-height: 1.2; font-weight: 700; letter-spacing: .035em; color: var(--warm); }
.verified-lane .lane-eyebrow { color: var(--cool); }
.verification-contrast h2 { font-size: 24px; margin: 7px 0 0; white-space: nowrap; }
.elapsed { font: 650 34px/1 "Bricolage Grotesque Variable", sans-serif; font-variant-numeric: tabular-nums; letter-spacing: -.02em; }
.route-scene { position: relative; height: 102px; margin-top: 6px; }
.route-map { width: 100%; height: 100%; overflow: visible; }
.route-map path { fill: none; stroke-width: 3; }
.idle-path { stroke: currentColor; opacity: .16; }
.agent-dot { fill: var(--warm); }
.unreached-dot { fill: #392d40; stroke: #cf978a; stroke-width: 2; stroke-dasharray: 3 3; }
.tangled-paths { stroke: var(--warm); opacity: .6; }
.tangled-paths path { stroke-dasharray: 9 5; }
.is-active .tangled-paths path { animation: retry-dash .8s linear 3; }
.guess-chip { position: absolute; padding: 4px 7px; background: #503c52; border: 1px solid #b58388; border-radius: 4px; font-size: 16px; line-height: 1.2; white-space: nowrap; box-shadow: 0 3px 8px #23192855; }
.guess-0 { left: 10%; top: 7px; transform: rotate(-5deg); }
.guess-1 { left: 35%; top: 68px; transform: rotate(5deg); }
.guess-2 { right: 2%; top: 11px; transform: rotate(-4deg); }
.is-active .guess-chip { animation: guess-in .35s ease-out both; }
.retry-token { position: absolute; top: 41px; left: 47%; font-size: 33px; line-height: 1; color: #ffd2c4; }
.is-active .retry-token { animation: retry-spin .8s ease-in-out 3; }
.route-caption { position: absolute; left: 0; top: 77px; width: 100%; text-align: center; font-size: 16px; color: #ddc4d2; }
.proof-path { stroke: var(--cool); stroke-dasharray: 1; }
.is-active .proof-path { animation: draw-proof 1s ease-out both; }
.checked-dot { fill: var(--cool); }
.pending-dot { fill: #283b35; stroke: #86a187; stroke-width: 2; }
.route-map text { fill: #e8f2d8; font: 18px ui-sans-serif, system-ui, sans-serif; }
.lane-finding { border-top: 1px solid #ffffff26; padding-top: 10px; min-height: 70px; }
.lane-finding span { display: block; font-size: 15px; line-height: 1.2; color: #dfb5b1; margin-bottom: 6px; }
.lane-finding strong { display: block; font-size: 21px; line-height: 1.2; font-weight: 600; }
.verified-lane .lane-finding span { color: #bcd5aa; }
.complete .elapsed { color: var(--cool); }
.is-active .lane-finding { animation: finding-in .3s ease-out both; }
.time-track { height: 7px; background: #ffffff12; border-radius: 4px; overflow: hidden; margin-top: 7px; }
.time-track > div { height: 100%; background: var(--warm); border-radius: inherit; }
.verified-lane .time-track > div { background: var(--cool); }
.contrast-conclusion { font-size: 22px; line-height: 1.3; font-weight: 600; margin: 13px 0 8px; }
.contrast-resource { display: flex; align-items: baseline; gap: 14px; }
.contrast-resource > span { font-size: 14px; font-weight: 650; color: #b8accf; white-space: nowrap; }
.contrast-resource code, .contrast-resource a { font-size: 17px; color: #e3f7b7; }
.contrast-resource code { background: transparent; padding: 0; }
.contrast-resource a { text-decoration: underline; text-underline-offset: 3px; }
.verification-contrast .contrast-disclaimer { color: #b9b3cb; font-size: 14px; line-height: 1.3; margin: 10px 0 0; max-width: 810px; }
.trace-view { padding: 2px 7px; }
.trace-caption { font-size: 14px; color: #bcd5aa; margin-bottom: 6px; }
.trace-row { display: flex; gap: 3px; margin-bottom: 3px; height: 16px; }
.trace-row > span { display: block; font: 11px/16px "JetBrains Mono Variable", monospace; color: #283326; padding-left: 5px; border-radius: 2px; }
.trace-interaction { background: #cae8a4; width: 98%; }
.trace-render { background: #f2d786; width: 90%; }
.trace-calls > span { background: #ffae98; width: 17.4%; }
.trace-interaction, .trace-render, .trace-calls > span { transition: width 1s ease, opacity 1s ease; }
.optimized .trace-interaction { width: 40%; }
.optimized .trace-render { width: 30%; }
.optimized .trace-calls .removed { width: 0; padding: 0; opacity: 0; }
.trace-label { display: block; font-size: 15px; margin-top: 6px; }
@keyframes retry-dash { to { stroke-dashoffset: -56; } }
@keyframes retry-spin { to { transform: rotate(360deg); } }
@keyframes guess-in { from { opacity: 0; translate: 0 9px; } }
@keyframes draw-proof { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes finding-in { from { opacity: 0; translate: 0 5px; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}
</style>
