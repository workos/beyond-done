<script setup lang="ts">
import { computed, unref } from "vue";
import { useSlideContext } from "@slidev/client";
import architecture from "../assets/ctx/verification-architecture.png";
import workGraph from "../assets/ctx/work-graph.png";

const { $clicks } = useSlideContext();
const step = computed(() => Math.max(0, Math.min(Number(unref($clicks)), 3)));
</script>

<template>
  <section class="ctx-walkthrough" :data-step="step">
    <div v-if="step < 2" class="ctx-comparison" :class="{ focused: step === 1 }">
      <h1>We hold our own tools to this.</h1>
      <div class="comparison">
        <div class="riker-card">
          <div class="small-label">Riker · Nick · runs coding agents for you</div>
          <blockquote>“Status comes from records, not model prose.”</blockquote>
          <p class="comparison-label">Riker runs the job’s check itself and keeps the command, exit code, commit and output hash. No check: reported unverified.</p>
        </div>
        <div class="ctx-card">
          <div class="small-label">CTX · Zack · context + verification control plane</div>
          <blockquote>“A bare executor claim is kept in the ledger but ignored.”</blockquote>
          <p class="comparison-label">Verifiers write receipts bound to the exact revision. Only CTX’s evaluators close a node.</p>
          <p class="host-reading"><a href="https://zackproser.com/blog/ctx-personal-context-engine" target="_blank" rel="noopener noreferrer">Read Zack’s CTX blueprint ↗</a><br><a href="https://zackproser.com/blog/what-survived-the-experiments" target="_blank" rel="noopener noreferrer">The verification lesson ↗</a></p>
        </div>
      </div>
    </div>
    <div v-else :key="step" class="ctx-overlay" :class="step === 2 ? 'architecture-view' : 'graph-view'">
      <div class="ctx-overlay-heading"><span>CTX · {{ step === 2 ? 'From agent session to verified work' : 'The gate, in the real app' }}</span><span class="ctx-progress">{{ step - 1 }} / 2</span></div>
      <figure class="ctx-image-frame">
        <img v-if="step === 2" :src="architecture" alt="CTX architecture: an agent records task inputs, actions and artifacts; a verifier observes the real system and returns a receipt to a verification gate. Satisfied work closes; failed work stays open." />
        <img v-else :src="workGraph" alt="CTX task graph: Pull requests in scope flows into All pull requests merged, then Done. The verification detail shows Satisfied, No run attached, and a Re-check with GitHub button." />
      </figure>
      <p class="ctx-image-caption">{{ step === 2 ? 'Record the work → check the real system → keep the receipt.' : 'Inputs define the scope. The gate states the requirement. The verifier checks GitHub.' }}</p>
    </div>
  </section>
</template>

<style scoped>
.ctx-walkthrough { height: 100%; }
.ctx-comparison { padding: 42px 56px 48px; height: 100%; }
.ctx-comparison .comparison > div { transition: opacity .35s ease, transform .35s ease, box-shadow .35s ease; }
.ctx-comparison.focused .riker-card { opacity: .35; }
.ctx-comparison.focused .ctx-card { position: relative; transform: translateY(-4px); box-shadow: 0 0 0 4px #974313, 0 14px 30px #24223826; }
.ctx-overlay { height: 100%; padding: 12px 20px 37px; display: flex; flex-direction: column; background: #0b1627; color: #f8f8ff; animation: ctx-enter .35s ease-out both; }
.ctx-overlay.graph-view { background: #262624; }
.ctx-overlay-heading { display: flex; align-items: center; justify-content: space-between; flex: 0 0 23px; font-size: 16px; line-height: 1.2; font-weight: 650; color: #ffd28d; }
.ctx-progress { font: 12px/1.2 "JetBrains Mono Variable", monospace; color: #d9d6cf; }
.ctx-image-frame { flex: 1; min-height: 0; margin: 7px 0 5px; display: flex; align-items: center; justify-content: center; }
.ctx-image-frame img { display: block; width: 100%; height: 100%; object-fit: contain; }
.ctx-overlay .ctx-image-caption { flex: 0 0 auto; margin: 0; text-align: center; font-size: 14px; line-height: 1.3; color: #e3e2e0; }
@keyframes ctx-enter { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: scale(1); } }
</style>
