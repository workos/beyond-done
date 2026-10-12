<script setup lang="ts">
import { computed, unref } from "vue";
import { useSlideContext } from "@slidev/client";

const { $clicks } = useSlideContext();
const step = computed(() => Math.max(0, Math.min(Number(unref($clicks)), 2)));
</script>

<template>
  <section class="browser-proof" :data-step="step">
    <p class="eyebrow">TAKE HOME 02 · MAKE THE INVISIBLE INSPECTABLE</p>
    <h1>“It feels slow” → show the trace.</h1>
    <div class="browser-tools">
      <div><b>Console</b><span>What threw?</span></div>
      <div><b>Network</b><span>What request failed?</span></div>
      <div class="selected"><b>Performance</b><span>What blocked the thread?</span></div>
    </div>
    <div class="browser-stage">
      <ol class="trace-recipe">
        <li :class="{ current: step === 0 }"><b>01</b><div><strong>Record the real action.</strong><code>performance_start_trace</code><span>Click the slow filter. Stop recording.</span></div></li>
        <li :class="{ current: step === 1 }"><b>02</b><div><strong>Find the expensive work.</strong><code>performance_analyze_insight</code><span>Inspect the trace and call stacks.</span></div></li>
        <li :class="{ current: step === 2 }"><b>03</b><div><strong>Repair. Record again.</strong><span>Same data, device and throttling.<br>Recheck behavior + time budget.</span></div></li>
      </ol>
      <div class="trace-panel" :class="{ inspected: step >= 1, repaired: step >= 2 }">
        <div class="trace-caption"><span>MAIN THREAD · ILLUSTRATION</span><span>time →</span></div>
        <div class="flamechart">
          <div class="flame event">click → render</div>
          <div class="flame render">renderRows()</div>
          <div class="flame-children"><i v-for="n in 8" :key="n"></i></div>
          <div v-if="step >= 1" class="hotspot">Repeated work, visible in the stack.</div>
        </div>
        <div class="trace-compare">
          <div class="budget-line"><span>budget</span></div>
          <div class="trace-row"><span>Before</span><i class="before-bar"></i></div>
          <div class="trace-row"><span>After</span><i class="after-bar"></i></div>
        </div>
        <div class="trace-verdict" :key="step">{{ ['Let the agent inspect the browser.', 'A trace narrows the next experiment.', 'Keep both traces. Compare the same task.'][step] }}</div>
      </div>
    </div>
    <p class="source-note"><a href="https://github.com/ChromeDevTools/chrome-devtools-mcp" target="_blank" rel="noopener noreferrer">Chrome DevTools MCP / CLI ↗</a> · <a href="https://developer.chrome.com/docs/devtools/performance/overview" target="_blank" rel="noopener noreferrer">Performance panel ↗</a><br>Schematic, not a measured speedup · setup and first prompt in Lesson 07</p>
  </section>
</template>

<style scoped>
.browser-proof { font-size: 18px; line-height: 1.35; }
.browser-proof code { background: transparent; padding: 0; line-height: 1.45; }
.browser-proof .eyebrow { color: #5b4cd0; font-size: 15px; letter-spacing: .08em; margin: 0 0 10px; }
.browser-proof h1 { font-size: 44px; margin: 0 0 16px; }
.browser-tools { display: grid; grid-template-columns: .85fr 1fr 1.25fr; border: 1px solid #d7d1ec; border-radius: 9px; overflow: hidden; margin-bottom: 18px; }
.browser-tools > div { padding: 12px 17px; display: flex; flex-direction: column; gap: 4px; background: #efedf8; }
.browser-tools b { font-size: 21px; line-height: 1.25; }
.browser-tools span { font-size: 15px; line-height: 1.3; color: #65627d; }
.browser-tools .selected { background: #ded6ff; }
.browser-stage { display: grid; grid-template-columns: 1fr 1.05fr; gap: 22px; height: 270px; }
.trace-recipe { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px; }
.trace-recipe li { line-height: 1.2; display: flex; align-items: flex-start; gap: 12px; margin: 0; padding: 6px 12px; border-left: 3px solid #e5e0f3; transition: background .3s, border-color .3s; }
.trace-recipe li.current { border-color: #6752d9; background: #ece7fe; border-radius: 0 7px 7px 0; }
.trace-recipe li > b { font: 15px "JetBrains Mono Variable", monospace; color: #6752d9; padding-top: 4px; }
.trace-recipe strong { display: block; font-size: 20px; font-weight: 650; margin-bottom: 4px; }
.trace-recipe code { display: block; color: #5b4c9c; font-size: 13px; margin-bottom: 4px; }
.trace-recipe span { font-size: 15px; line-height: 1.4; display: block; color: #65627d; }
.trace-panel { background: #242238; border-radius: 9px; color: #f8f8ff; padding: 14px; box-shadow: 0 10px 24px #2f24411a; }
.trace-caption { display: flex; justify-content: space-between; font: 10px "JetBrains Mono Variable", monospace; color: #c9c1e4; }
.flamechart { height: 101px; padding-top: 18px; }
.flame { height: 22px; font: 12px "JetBrains Mono Variable", monospace; line-height: 22px; padding-left: 8px; border-radius: 3px; }
.flame.event { width: 95%; background: #6758a3; }
.flame.render { width: 84%; background: #a66795; margin: 4px 0 0 6%; transition: background .4s; }
.inspected .flame.render { background: #ed977e; color: #342438; }
.flame-children { display: flex; gap: 3px; margin: 4px 0 0 6%; width: 84%; }
.flame-children i { flex: 1; height: 12px; border-radius: 2px; background: #b4759d; }
.inspected .flame-children i { background: #ffc8a8; animation: trace-highlight .5s ease-out both; }
.hotspot { font-size: 13px; color: #ffbaa7; padding-top: 7px; animation: trace-highlight .5s ease-out both; }
.trace-compare { position: relative; margin-top: 13px; padding-top: 9px; }
.trace-row { display: flex; align-items: center; gap: 12px; margin: 9px 0; height: 18px; }
.trace-row > span { font-size: 13px; width: 42px; flex-shrink: 0; }
.trace-row i { height: 15px; border-radius: 3px; transform-origin: left; }
.before-bar { width: 74%; background: #ff967f; }
.after-bar { width: 24%; background: #d9ff82; transform: scaleX(0); transition: transform 1.1s cubic-bezier(.18,.8,.3,1); }
.repaired .after-bar { transform: scaleX(1); }
.budget-line { position: absolute; top: 7px; bottom: -3px; left: 68%; border-left: 1px dashed #c9c1e4; }
.budget-line span { position: absolute; top: -13px; left: -20px; font-size: 10px; color: #c9c1e4; }
.trace-verdict { border-top: 1px solid #655d85; margin-top: 11px; padding-top: 8px; font-size: 16px; line-height: 1.25; color: #d9ff82; animation: trace-highlight .5s ease-out both; }
.browser-proof .source-note { font-size: 14px; color: #65627d; line-height: 1.5; margin: 12px 0 0; }
.source-note a { text-decoration: underline; text-underline-offset: 3px; }
@keyframes trace-highlight { from { opacity: .3; } to { opacity: 1; } }
</style>
