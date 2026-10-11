<script setup lang="ts">
import { computed, unref } from "vue";
import { useSlideContext } from "@slidev/client";
import report from "../../public/materials/opening-report.json";
const { $clicks } = useSlideContext();
const step = computed(() => Math.min(Number(unref($clicks)), 2));
const attempt = report.attempts[0];
</script>

<template>
  <div class="evidence-flow" :data-step="step">
    <div class="proof-stages"><span :class="{ active: step === 0 }">01 Browser</span><span>→</span><span :class="{ active: step === 1 }">02 Evidence</span><span>→</span><span :class="{ active: step === 2 }">03 Hard check</span></div>
    <div class="proof-packet" :class="`proof-step-${step}`">
      <div class="proof-facts"><div><small>AFTER SUBMIT</small><strong>{{ attempt.evidence.observation.submittedStatus }}</strong><code>{{ attempt.evidence.observation.submittedEmail }}</code></div><span>↻</span><div><small>AFTER RELOAD</small><strong>{{ attempt.evidence.observation.reloadedStatus }}</strong><code>{{ attempt.evidence.observation.reloadedEmail }}</code></div></div>
      <div class="proof-identity" :class="{ revealed: step >= 1 }">Same candidate revision <code>{{ attempt.expected.revision.slice(0, 12) }}</code> · attempt {{ attempt.expected.attempt }}</div>
      <div class="proof-failure" :class="{ revealed: step >= 2 }">FAIL · {{ attempt.checks.failures.join(' · ') }}</div>
    </div>
    <p class="illustration-label">Captured local browser run · <code>public/materials/opening-report.json</code><br>Animation explains saved observations. Report scores are synthetic fixtures; no model was called.</p>
  </div>
</template>

<style scoped>
.proof-stages { display: flex; gap: 18px; align-items: center; font-size: 17px; margin-bottom: 14px; }
.proof-stages .active { background: #5040c9; color: white; }
.proof-stages span:not(:nth-child(even)) { padding: 9px 17px; border-radius: 5px; transition: background .3s, color .3s; }
.proof-packet { background: white; border: 2px solid #d5cfee; border-radius: 9px; padding: 18px; transition: border-color .3s, transform .3s; }
.proof-step-1 { transform: translateX(8px); border-color: #6363f1; }
.proof-step-2 { border-color: #c85639; }
.proof-facts { display: grid; grid-template-columns: 1fr 50px 1fr; align-items: center; }
.proof-facts small { display: block; font-size: 12px; color: #65627d; }
.proof-facts strong { display: block; font-size: 31px; margin: 7px 0; }
.proof-facts code { font-size: 16px; }
.proof-facts > span { font-size: 34px; color: #9a634c; }
.proof-identity, .proof-failure { opacity: 0; transform: translateY(12px); transition: opacity .3s, transform .3s; font-size: 15px; margin-top: 12px; }
.proof-identity.revealed, .proof-failure.revealed { opacity: 1; transform: none; }
.proof-failure { background: #ffdcd2; padding: 9px 12px; color: #782f21; }
</style>
