<script setup lang="ts">
import { computed, unref } from "vue";
import { useSlideContext } from "@slidev/client";
import failed from "../../public/materials/snack-receipts/1-fail-attendee-app.json";
import passed from "../../public/materials/snack-receipts/2-pass-after-agent-fix.json";

const { $clicks } = useSlideContext();
const step = computed(() => Math.max(0, Math.min(Number(unref($clicks)), 3)));
const attempts = [failed, passed];
const attemptNumber = computed(() => step.value === 3 ? 2 : 1);
const receipt = computed(() => attempts[attemptNumber.value - 1]);
const fact = (name: string) => receipt.value.checks.find(check => check.name === name);
const passing = computed(() => receipt.value.checks.filter(check => check.pass).length);
</script>

<template>
  <section class="repair-receipt" :data-step="step">
    <div class="receipt-explainer">
      <ol>
        <li :class="{ current: step === 0 }"><b>01</b><div><strong>Bind the claim.</strong><span>Which revision? When? Which proof?</span></div></li>
        <li :class="{ current: step === 1 }"><b>02</b><div><strong>Keep the observation.</strong><span>What did the app actually do?</span></div></li>
        <li :class="{ current: step === 2 }"><b>03</b><div><strong>Keep the decision.</strong><span>Which checks? What to fix next?</span></div></li>
        <li :class="{ current: step === 3 }"><b>04</b><div><strong>Append the next attempt.</strong><span>New code needs fresh evidence.</span></div></li>
      </ol>
      <div class="attempt-history">
        <span>1 · FAIL</span><b>→</b><span :class="{ revealed: step === 3 }">2 · PASS</span>
      </div>
    </div>
    <div class="receipt-stack">
      <div class="receipt-shadow" :class="{ retained: step === 3 }" aria-hidden="true"></div>
      <div class="receipt-paper" :key="attemptNumber">
        <div class="receipt-top"><span>SNACK RECEIPT</span><span>ATTEMPT {{ attemptNumber }}</span></div>
        <div class="receipt-section">
          <div><span>Revision</span><code>{{ receipt.revision }}</code></div>
          <div><span>Proved at</span><code>{{ receipt.at.slice(11, 23) }} UTC</code></div>
        </div>
        <div class="receipt-section" :class="{ muted: step < 1 }">
          <div><span>Status after reload</span><strong>{{ fact('status survives reload')?.actual }}</strong></div>
          <div><span>Record in localStorage</span><strong>{{ fact('record is in localStorage')?.actual ? 'yes' : 'no' }}</strong></div>
          <div><span>Page errors</span><code>{{ receipt.pageErrors.length }}</code></div>
        </div>
        <div class="receipt-section" :class="{ muted: step < 2 }">
          <div><span>Checks passed</span><code>{{ passing }} / {{ receipt.checks.length }}</code></div>
          <div class="receipt-decision"><b :class="{ accepted: receipt.verdict === 'PASS' }">{{ receipt.verdict }}</b><span>{{ receipt.verdict === 'PASS' ? 'All checks pass on this revision' : 'Next: persist the record, then prove again' }}</span></div>
        </div>
      </div>
    </div>
  </section>
  <p class="receipt-source">Real receipts · <code>snack prove --solution</code> before and after the agent’s fix · <code>public/materials/snack-receipts/</code></p>
</template>

<style scoped>
.repair-receipt { font-size: 18px; line-height: 1.35; }
.repair-receipt code { background: transparent; padding: 0; line-height: 1.45; }
.repair-receipt { display: grid; grid-template-columns: 1fr 1.07fr; gap: 38px; height: 308px; }
.receipt-explainer ol { margin: 0; padding: 0; list-style: none; }
.receipt-explainer li { display: flex; gap: 13px; padding: 6px 12px; margin: 0 0 4px; border-left: 3px solid #9995ef; transition: background .3s, border-color .3s; }
.receipt-explainer li.current { background: #ffffff15; border-color: #d9ff82; border-radius: 0 7px 7px 0; }
.receipt-explainer li > b { font: 15px "JetBrains Mono Variable", monospace; color: #d9ff82; padding-top: 4px; }
.receipt-explainer strong { display: block; font-size: 21px; line-height: 1.2; margin-bottom: 4px; }
.receipt-explainer li span { font-size: 15px; line-height: 1.35; display: block; color: #e1e0ff; }
.attempt-history { display: flex; align-items: center; gap: 15px; margin: 12px 0 0 14px; font: 15px "JetBrains Mono Variable", monospace; }
.attempt-history > span { background: #ffe1d7; color: #773225; border-radius: 4px; padding: 7px 10px; }
.attempt-history > span:last-child { opacity: .25; background: #d9ff82; color: #293c1b; transition: opacity .4s; }
.attempt-history > span.revealed { opacity: 1; }
.receipt-stack { position: relative; margin-right: 10px; }
.receipt-shadow { position: absolute; inset: 0; background: #d3cbfb; border-radius: 8px; transform: rotate(0); transition: transform .5s; }
.receipt-shadow.retained { transform: rotate(3deg) translate(9px, 5px); }
.receipt-paper { font-size: 14px; line-height: 1.25; position: relative; background: #f8f6ff; color: #29233a; border-radius: 8px; padding: 16px 20px 12px; box-shadow: 0 12px 35px #201a5833; animation: print-receipt .55s ease-out both; }
.receipt-top { display: flex; justify-content: space-between; font: 12px "JetBrains Mono Variable", monospace; letter-spacing: .02em; border-bottom: 1px dashed #b8b0cc; padding-bottom: 12px; }
.receipt-section { padding: 7px 0; border-bottom: 1px dashed #b8b0cc; transition: opacity .4s; }
.receipt-section:last-child { border: 0; padding-bottom: 0; }
.receipt-section.muted { opacity: .3; }
.receipt-section > div { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin: 3px 0; }
.receipt-section span { font-size: 14px; color: #625a77; }
.repair-receipt .receipt-section code { font-size: 15px; line-height: 1.25; }
.receipt-section strong { font: 15px "JetBrains Mono Variable", monospace; }
.receipt-section .receipt-decision { margin-top: 11px; justify-content: flex-start; }
.receipt-decision b { padding: 5px 8px; border: 1px solid #ad563e; color: #873c28; border-radius: 3px; font: 14px "JetBrains Mono Variable", monospace; transform: rotate(-3deg); }
.receipt-decision b.accepted { color: #305420; border-color: #589137; background: #e7f5d2; }
.receipt-decision span { font-size: 12px; }
.receipt-source { margin: 24px 0 0 !important; font-size: 14px; line-height: 1.5 !important; color: #e1e0ff; }
.receipt-source code { font-size: 13px; background: transparent; padding: 0; }
@keyframes print-receipt { from { opacity: .4; transform: translateY(-12px) rotate(-2deg); } to { opacity: 1; transform: translateY(0) rotate(0); } }
</style>
