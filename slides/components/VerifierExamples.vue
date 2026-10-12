<script setup lang="ts">
import { computed, unref } from "vue";
import { useSlideContext } from "@slidev/client";

const { $clicks } = useSlideContext();
const step = computed(() => Math.max(0, Math.min(Number(unref($clicks)), 2)));
const examples = [
  { kind: 'web', label: 'WEB APP', title: 'Saved filter', tool: 'Playwright', url: 'https://playwright.dev/docs/writing-tests', command: 'verify filter', action: 'Choose Open → reload', when: 'ASSERT AFTER RELOAD', assertion: 'filter === "Open"', artifact: 'Keep: trace + selected value' },
  { kind: 'native', label: 'NATIVE CLIENT', title: 'Durable draft', tool: 'Appium + platform driver', url: 'https://appium.io/docs/en/latest/intro/', command: 'verify draft', action: 'Save → quit → relaunch', when: 'ASSERT AFTER RELAUNCH', assertion: 'body === "Ship it"', artifact: 'Keep: UI tree + saved draft' },
  { kind: 'api', label: 'API / BACKGROUND JOB', title: 'One event, one job', tool: 'HTTP client + DB readback', url: 'https://playwright.dev/docs/api-testing', command: 'verify webhook', action: 'Send the same event twice', when: 'ASSERT AFTER PROCESSING', assertion: 'jobsFor(eventId) === 1', artifact: 'Keep: responses + job rows' },
];
</script>

<template>
  <section class="verifier-examples" :data-step="step">
    <p class="eyebrow">TAKE HOME 04 · START WITH ONE FEATURE</p>
    <h1>What could your verifier check?</h1>
    <div class="example-grid">
      <article v-for="(example, index) in examples" :key="example.kind" class="example-card" :class="[example.kind, { instrumented: step >= 1, evidenced: step >= 2 }]" :style="{ '--order': index }">
        <div class="example-label">{{ example.label }}</div>
        <h2>{{ example.title }}</h2>
        <div class="app-sketch" :key="`${example.kind}-${step}`" aria-hidden="true">
          <div v-if="example.kind === 'web'" class="web-sketch">
            <div class="window-bar"><i></i><i></i><i></i><span>issues.app</span></div>
            <div class="filter-row"><b>Open ▾</b><span class="reload-symbol" :class="{ running: step === 1 }">↻</span></div>
            <div class="result-lines"><i></i><i></i></div>
          </div>
          <div v-else-if="example.kind === 'native'" class="native-sketch" :class="{ relaunching: step === 1 }">
            <div class="native-sidebar"><i></i><i></i><i></i></div>
            <div class="draft-sheet"><span>DRAFT</span><b>Ship it</b><i></i></div>
            <span class="disk-symbol">↓</span>
          </div>
          <div v-else class="api-sketch" :class="{ delivering: step === 1 }">
            <div class="event-stack"><span>evt_42</span><span>evt_42</span></div>
            <div class="event-wire"><i></i><b>→</b></div>
            <div class="job-store"><b>1</b><span>job</span></div>
          </div>
        </div>
        <p class="example-action">{{ example.action }}</p>
        <div class="example-tool">
          <a :href="example.url" target="_blank" rel="noopener noreferrer">{{ example.tool }} ↗</a>
          <code>{{ example.command }}</code>
        </div>
        <div class="example-proof" :key="`proof-${step}`">
          <span>{{ example.when }}</span>
          <code>{{ example.assertion }}</code>
          <p>{{ example.artifact }}</p>
        </div>
      </article>
    </div>
    <div class="example-prompt" :key="step"><b>{{ ['01 · PICK A USER JOURNEY', '02 · GIVE THE AGENT A TOOL', '03 · YOUR TURN — TWO MINUTES'][step] }}</b><span>{{ ['What could look done while still being broken?', 'Wrap the harness you already have. Make it repeatable.', 'Name your feature, check command and saved receipt.'][step] }}</span></div>
    <p class="example-note">Illustrative blueprints; these wrapper commands are yours to build. Recipes + worksheet in Lesson 07.</p>
  </section>
</template>

<style scoped>
.verifier-examples { height: 100%; display: flex; flex-direction: column; font-size: 18px; line-height: 1.3; color: #f8f8ff; }
.verifier-examples code { font-variant-ligatures: none; }
.verifier-examples .eyebrow { color: #d9ff82; font-size: 14px; letter-spacing: .08em; line-height: 1.4; margin: 0 0 6px; }
.verifier-examples h1 { font-size: 42px; line-height: 1.05; margin: 0 0 15px; }
.example-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; flex: 0 0 auto; }
.example-card { --example-accent: #c6b4ff; background: #302b45; border: 1px solid #625a7c; border-top: 3px solid var(--example-accent); border-radius: 10px; padding: 11px 14px; }
.example-card.native { --example-accent: #ffc8a8; }
.example-card.api { --example-accent: #d9ff82; }
.example-label { color: var(--example-accent); font: 11px/1.4 "JetBrains Mono Variable", monospace; letter-spacing: .04em; }
.verifier-examples h2 { color: #f8f8ff; font-size: 24px; line-height: 1.15; margin: 5px 0 11px; letter-spacing: -.025em; }
.app-sketch { height: 68px; background: #191625; border-radius: 5px; overflow: hidden; margin-bottom: 9px; }
.web-sketch { padding: 7px 10px; }
.window-bar { display: flex; gap: 4px; align-items: center; color: #c9c1e4; font-size: 10px; }
.window-bar i { background: #8779b0; width: 4px; height: 4px; border-radius: 50%; }
.window-bar span { margin-left: 6px; }
.filter-row { display: flex; justify-content: space-between; align-items: center; margin-top: 5px; }
.filter-row b { font-size: 12px; font-weight: 500; background: #615084; border-radius: 3px; padding: 2px 8px; }
.reload-symbol { font-size: 22px; line-height: 1; color: #c6b4ff; }
.reload-symbol.running { animation: verifier-reload .75s ease-in-out 2; }
.result-lines { display: flex; gap: 5px; margin-top: 6px; }
.result-lines i { width: 42%; height: 4px; background: #655a83; border-radius: 2px; }
.native-sketch { display: flex; height: 100%; padding: 9px; gap: 10px; }
.native-sidebar { width: 25px; display: grid; gap: 6px; align-content: start; padding-top: 3px; }
.native-sidebar i { height: 5px; background: #756182; border-radius: 2px; }
.draft-sheet { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.draft-sheet span { font: 9px/1.2 "JetBrains Mono Variable", monospace; color: #ffc8a8; }
.draft-sheet b { font-size: 18px; font-weight: 500; }
.draft-sheet i { height: 4px; width: 75%; background: #756182; margin-top: 4px; }
.disk-symbol { align-self: center; color: #ffc8a8; font-size: 25px; }
.relaunching .draft-sheet { animation: verifier-relaunch 1.2s ease-in-out both; }
.api-sketch { height: 100%; display: flex; justify-content: center; align-items: center; gap: 16px; }
.event-stack { display: grid; gap: 4px; font: 11px/1.2 "JetBrains Mono Variable", monospace; color: #d9ff82; }
.event-stack span { padding: 4px 8px; border: 1px solid #73864a; border-radius: 3px; }
.event-wire { position: relative; font-size: 25px; color: #9bae74; }
.event-wire i { position: absolute; top: 50%; left: -6px; height: 5px; width: 5px; border-radius: 50%; background: #d9ff82; opacity: 0; }
.delivering .event-wire i { animation: verifier-delivery .75s ease-in 2; }
.job-store { display: flex; flex-direction: column; align-items: center; border: 1px solid #9bae74; border-radius: 8px; width: 43px; padding: 4px 0; color: #d9ff82; }
.job-store b { font-size: 23px; line-height: 1; }
.job-store span { font-size: 10px; }
.verifier-examples .example-action { font-size: 15px; line-height: 1.3; margin: 0 0 9px; color: #e3def2; }
.example-tool { border-left: 2px solid #6a617d; padding-left: 9px; margin-bottom: 7px; transition: border-color .3s; }
.example-tool a { font-size: 12px; line-height: 1.4; color: #cec6e8; text-decoration: underline; text-underline-offset: 3px; }
.verifier-examples .example-tool code { display: block; color: #f8f8ff; background: transparent; padding: 0; font-size: 17px; line-height: 1.45; }
.instrumented .example-tool { border-color: var(--example-accent); }
.example-proof { background: #242035; border: 1px solid #625a7c; border-radius: 5px; padding: 8px 9px; transition: border-color .35s, background .35s; }
.example-proof > span { display: block; font: 10px/1.4 "JetBrains Mono Variable", monospace; color: #cec6e8; }
.verifier-examples .example-proof code { display: block; font-size: 13px; line-height: 1.6; color: #f8f8ff; background: transparent; padding: 0; white-space: nowrap; }
.verifier-examples .example-proof p { font-size: 12px; line-height: 1.3; margin: 3px 0 0; color: #cec6e8; }
.evidenced .example-proof { border-color: var(--example-accent); background: #342e49; animation: verifier-evidence .4s ease-out both; animation-delay: calc(var(--order) * .1s); }
.example-prompt { display: flex; flex-direction: column; gap: 4px; margin-top: 12px; animation: verifier-evidence .35s ease-out; }
.example-prompt b { font: 12px/1.3 "JetBrains Mono Variable", monospace; color: #d9ff82; }
.example-prompt span { font-size: 20px; line-height: 1.3; }
.verifier-examples .example-note { font-size: 12px; line-height: 1.4; color: #c9c1e4; margin: auto 0 0; padding-top: 8px; }
@keyframes verifier-reload { to { transform: rotate(360deg); } }
@keyframes verifier-relaunch { 35% { opacity: 0; transform: translateY(7px); } 65% { opacity: 0; transform: translateY(7px); } }
@keyframes verifier-delivery { 15% { opacity: 1; } 100% { opacity: 0; transform: translateX(28px); } }
@keyframes verifier-evidence { from { opacity: .4; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>
