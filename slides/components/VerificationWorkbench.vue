<script setup lang="ts">
import { computed, unref } from "vue";
import { useSlideContext } from "@slidev/client";
import receipt from "../../public/materials/snack-receipts/1-fail-attendee-app.json";

const { $clicks } = useSlideContext();
const step = computed(() => Math.max(0, Math.min(Number(unref($clicks)), 2)));
const afterReload = receipt.checks.find(check => check.name === "status survives reload");
</script>

<template>
  <section class="verification-workbench" :data-step="step">
    <p class="eyebrow">TAKE HOME 01 · A SMALL TOOL FOR YOUR APP</p>
    <h1>Make the user journey executable.</h1>
    <div class="feature-map">
      <div><span>FEATURE</span><strong>Join the waitlist</strong></div>
      <div><span>USER PATH</span><strong>Submit → reload</strong></div>
      <div><span>PROOF</span><strong>Same email + status</strong></div>
    </div>
    <div class="workbench-stage">
      <div class="tool-terminal">
        <div class="terminal-title"><i></i><i></i><i></i><span>the agent’s repeatable tool</span></div>
        <code>pnpm snack prove</code>
        <div class="tool-path" :class="{ wired: step >= 1 }">
          <span>Launch</span><b>→</b><span>Drive</span><b>→</b><span>Observe</span>
        </div>
        <p>One command wraps the real browser.<br>Run it again after every repair.</p>
      </div>
      <div class="wire" :class="{ connected: step >= 1 }" aria-hidden="true"><i v-if="step >= 1" :key="step"></i><span>→</span></div>
      <div class="proof-window" :class="{ failed: step >= 2 }">
        <div class="proof-header"><span>INDEPENDENT OBSERVATION</span><b>{{ step >= 2 ? 'FAIL' : '…' }}</b></div>
        <div v-if="step < 2" class="proof-pending" :key="`pending-${step}`">
          <span class="browser-symbol">↻</span>
          <strong>{{ step === 0 ? 'Give the agent a way in.' : 'Drive the same user path.' }}</strong>
          <span>{{ step === 0 ? 'Launch, seed data, check readiness.' : 'Submit. Read. Reload. Read again.' }}</span>
        </div>
        <div v-else key="result" class="proof-result">
          <div><span>Expected after reload</span><strong>{{ afterReload?.expected }}</strong></div>
          <div><span>Got after reload</span><strong class="bad-value">{{ afterReload?.actual }}</strong></div>
          <p>Now the agent has a specific failure to repair.</p>
        </div>
      </div>
    </div>
    <p class="workbench-takeaway">Map one feature → expose one check → keep the evidence.</p>
    <p class="source-note"><a href="https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md" target="_blank" rel="noopener noreferrer">Lauren Tan’s pstack: verification skills + feature maps ↗</a><br>Our CLI · a real saved receipt (<code>public/materials/snack-receipts/</code>)</p>
  </section>
</template>

<style scoped>
.verification-workbench { font-size: 18px; line-height: 1.35; }
.verification-workbench code { background: transparent; padding: 0; line-height: 1.45; }
.verification-workbench { color: #f8f8ff; }
.verification-workbench .eyebrow { color: #d9ff82; font-size: 15px; letter-spacing: .08em; margin: 0 0 8px; }
.verification-workbench h1 { font-size: 44px; margin: 0 0 14px; }
.feature-map { display: grid; grid-template-columns: 1fr 1fr 1.1fr; border: 1px solid #655d85; border-radius: 9px; overflow: hidden; margin-bottom: 14px; background: #302b45; }
.feature-map > div { padding: 10px 19px; border-right: 1px solid #655d85; }
.feature-map > div:last-child { border: 0; }
.feature-map span { display: block; color: #b9b2d8; font: 12px "JetBrains Mono Variable", monospace; letter-spacing: .1em; margin-bottom: 5px; }
.feature-map strong { font-size: 21px; font-weight: 550; }
.workbench-stage { display: grid; grid-template-columns: 1fr 60px 1fr; height: 230px; align-items: stretch; }
.tool-terminal { background: #191625; border: 1px solid #5d5578; border-radius: 9px; padding: 14px 20px; }
.terminal-title { display: flex; align-items: center; gap: 5px; margin-bottom: 10px; color: #b9b2d8; font-size: 13px; }
.terminal-title i { width: 6px; height: 6px; border-radius: 50%; background: #8374b0; }
.terminal-title span { margin-left: 7px; }
.verification-workbench .tool-terminal code { display: block; font-size: 18px; line-height: 1.6; color: #d9ff82; background: #191625; padding: 0; border-radius: 0; box-shadow: none; }
.tool-path { display: flex; gap: 9px; font-size: 16px; color: #b9b2d8; margin-top: 10px; transition: color .4s; }
.tool-path.wired { color: #d9ff82; }
.tool-terminal p { font-size: 14px; line-height: 1.45; margin: 10px 0 0; color: #b9b2d8; }
.wire { position: relative; display: grid; place-items: center; color: #827698; font-size: 36px; }
.wire.connected { color: #d9ff82; }
.wire i { position: absolute; top: 49%; left: 7px; width: 7px; height: 7px; background: #d9ff82; border-radius: 50%; box-shadow: 0 0 15px #d9ff82; animation: send-proof 1s ease-out 2 both; }
.proof-window { border: 1px solid #655d85; border-radius: 9px; overflow: hidden; background: #332e49; transition: border-color .4s; }
.proof-window.failed { border-color: #ff967f; }
.proof-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 15px; background: #ffffff09; font: 12px "JetBrains Mono Variable", monospace; color: #c9c1e4; }
.proof-header b { color: #ffb6a5; font-size: 14px; }
.proof-pending { display: grid; justify-items: center; gap: 8px; padding: 18px 10px; }
.browser-symbol { font-size: 44px; line-height: 1; color: #b6a7ff; }
.proof-pending strong { font-size: 19px; }
.proof-pending > span:last-child { font-size: 15px; color: #c9c1e4; }
.proof-result { padding: 16px; animation: arrive-proof .45s ease-out both; }
.proof-result > div { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 17px; }
.proof-result strong { font: 19px "JetBrains Mono Variable", monospace; }
.proof-result .bad-value { color: #ffb6a5; }
.proof-result p { border-top: 1px solid #655d85; margin: 13px 0 0; padding-top: 10px; font-size: 18px; line-height: 1.3; }
.verification-workbench .workbench-takeaway { font-size: 22px; margin: 12px 0 10px; color: #d9ff82; }
.verification-workbench .source-note { color: #c3bfd9; font-size: 14px; line-height: 1.45; margin: 0; }
.source-note a { text-decoration: underline; text-underline-offset: 3px; }
@keyframes send-proof { 0% { transform: translateX(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateX(40px); opacity: 0; } }
@keyframes arrive-proof { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
</style>
