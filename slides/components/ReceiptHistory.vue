<script setup lang="ts">
import { computed, unref } from "vue";
import { useSlideContext } from "@slidev/client";
import opening from "../../public/materials/opening-report.json";
import repair from "../../public/materials/repair-report.json";

const { $clicks } = useSlideContext();
const step = computed(() => Math.max(0, Math.min(Number(unref($clicks)), 3)));
const entries = [
  { label: 'Reload failure', run: opening.runId, attempt: opening.attempts[0] },
  ...repair.attempts.map(attempt => ({ label: 'Copy repair', run: repair.runId, attempt })),
];
const stages = [
  { title: 'Keep the whole run.', body: 'Inputs, actions, artifacts, checks and outcomes. Preserve failures and escalations alongside successes.', action: 'Start now: keep every .lab-runs/<id>/report.json.' },
  { title: 'Turn failures into eval cases.', body: 'Label the expected outcome. Freeze the cases and grader. Change one prompt, tool or policy at a time.', action: 'Compare false accepts, unnecessary escalation, time and cost.' },
  { title: 'Climb on evidence.', body: 'Rerun the same cases. Confirm gains on untouched cases before promoting a change; otherwise keep the baseline.', action: 'That is the improvement loop. Saving logs alone does not improve it.' },
  { title: 'Your own run dataset.', body: 'Curate permitted, redacted, independently labeled runs. Keep train / eval sets separate. Fine-tuning is an optional next step.', action: 'Evaluate any trained model with the same independent gates.' },
];
</script>

<template>
  <section class="receipt-history" :data-step="step">
    <p class="eyebrow">TAKE HOME 03 · RECEIPTS ACCUMULATE</p>
    <h1>Today’s receipt. Tomorrow’s eval.</h1>
    <div class="history-stage">
      <div class="run-ledger">
        <div class="ledger-heading"><span>APPEND EACH ATTEMPT</span><span>↓</span></div>
        <div v-for="(entry, i) in entries" :key="`${entry.run}-${entry.attempt.expected.attempt}`" class="run-card" :style="{ '--order': i }">
          <div><strong>{{ entry.label }}</strong><b :class="entry.attempt.decision.action">{{ entry.attempt.decision.action }}</b></div>
          <code>{{ entry.run.slice(0, 8) }} / attempt {{ entry.attempt.expected.attempt }}</code>
        </div>
        <p>Two saved runs. Three attempts.<br>The failed attempts stay in the record.</p>
      </div>
      <div class="history-arrow" aria-hidden="true">→</div>
      <div class="improvement-loop">
        <div class="loop-route">
          <span :class="{ selected: step === 0 }">Record</span><b>→</b><span :class="{ selected: step === 1 }">Evaluate</span><b>→</b><span :class="{ selected: step === 2 }">Improve</span>
        </div>
        <div class="history-focus" :key="step">
          <span class="step-number">0{{ step + 1 }}</span>
          <h2>{{ stages[step].title }}</h2>
          <p>{{ stages[step].body }}</p>
        </div>
        <div class="promotion-gate" :class="{ enabled: step >= 2, dataset: step === 3 }">
          <span>{{ step === 3 ? 'CURATED DATA → OPTIONAL FINE-TUNE' : 'BETTER ON HOLDOUT? → PROMOTE' }}</span>
          <b>{{ step >= 2 ? '↻' : '○' }}</b>
        </div>
      </div>
    </div>
    <p class="history-action" :key="step">{{ stages[step].action }}</p>
    <p class="source-note">Left: actual workshop reports, fixture scores · Right: a workflow to build in your own system.<br>Riker + CTX arrived here independently. Lesson 07 has the schema, eval commands and next steps.</p>
  </section>
</template>

<style scoped>
.receipt-history { font-size: 18px; line-height: 1.35; }
.receipt-history code { background: transparent; padding: 0; line-height: 1.45; }
.receipt-history .eyebrow { color: #d9ff82; font-size: 15px; letter-spacing: .08em; margin: 0 0 10px; }
.receipt-history h1 { font-size: 44px; margin: 0 0 18px; }
.history-stage { display: grid; grid-template-columns: 310px 45px 1fr; height: 318px; }
.run-ledger { padding: 0 6px 0 0; }
.ledger-heading { display: flex; justify-content: space-between; color: #c3bfd9; font: 12px "JetBrains Mono Variable", monospace; margin-bottom: 12px; }
.run-card { background: #f5f1ff; color: #29233a; border-radius: 6px; padding: 10px 14px; margin-bottom: 8px; border-left: 4px solid #b4a1fc; animation: ledger-arrive .5s ease-out both; animation-delay: calc(var(--order) * .12s); }
.run-card > div { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.run-card strong { font-size: 18px; }
.run-card b { font: 11px "JetBrains Mono Variable", monospace; text-transform: uppercase; background: #ffdfd5; color: #873c28; padding: 4px 6px; border-radius: 3px; }
.run-card b.accept { background: #dcf4b2; color: #305420; }
.run-card code { display: block; font-size: 12px; color: #625a77; margin-top: 5px; }
.run-ledger p { color: #c3bfd9; font-size: 14px; line-height: 1.4; margin: 10px 0 0; }
.history-arrow { display: grid; place-items: center; color: #c6b4ff; font-size: 34px; }
.improvement-loop { border: 1px solid #655d85; background: #332e49; border-radius: 10px; padding: 19px 22px; }
.loop-route { display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 15px; color: #c9c1e4; }
.loop-route span { padding: 6px 9px; border-radius: 4px; transition: background .3s, color .3s; }
.loop-route .selected { background: #d9ff82; color: #293c1b; }
.history-focus { position: relative; padding-top: 25px; min-height: 197px; animation: ledger-arrive .45s ease-out both; }
.step-number { position: absolute; right: 0; top: 12px; font: 64px "Bricolage Grotesque Variable", sans-serif; color: #66568b66; }
.history-focus h2 { position: relative; font-size: 30px; margin: 0 0 12px; }
.history-focus p { position: relative; font-size: 21px; line-height: 1.45; margin: 0; color: #e3def2; }
.promotion-gate { border-top: 1px solid #655d85; padding-top: 13px; display: flex; justify-content: space-between; align-items: center; color: #b9b2d8; font: 12px "JetBrains Mono Variable", monospace; transition: color .4s; }
.promotion-gate.enabled { color: #d9ff82; }
.promotion-gate.dataset { color: #e2c0ff; }
.promotion-gate b { font-size: 24px; line-height: 1; }
.receipt-history .history-action { font-size: 21px; color: #d9ff82; margin: 15px 0 12px; line-height: 1.4; animation: ledger-arrive .4s ease-out both; }
.receipt-history .source-note { color: #c3bfd9; font-size: 14px; line-height: 1.45; margin: 0; }
@keyframes ledger-arrive { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>
