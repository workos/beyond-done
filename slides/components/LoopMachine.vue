<script setup lang="ts">
import { computed, ref, unref } from "vue";
import { useSlideContext } from "@slidev/client";
import report from "../../public/materials/repair-report.json";
const { $clicks } = useSlideContext();
const stubborn = ref(false);
const step = computed(() => Math.min(Number(unref($clicks)), 5));
const stages = ["Proposal", "Browser", "Judge", "Repair", "Re-check", "Decision"];
const original = report.attempts[0];
const repaired = report.attempts[1];
const scene = computed(() => [
  { label: "Attempt 1", title: "Your seat is confirmed.", detail: "Worker proposal. Plausible. Wrong.", status: "unverified", tone: "neutral" },
  { label: "Playwright", title: "The record survives reload.", detail: "A browser pass says nothing about the seat promise.", status: "behavior passes", tone: "good" },
  { label: "Semantic judge · synthetic scores", title: "That promise isn't supported.", detail: "honest: 0.01 · nextStep: 0.03. Code still owns the decision.", status: "meaning fails", tone: "bad" },
  { label: "Repair 1 of 1", title: "Fix the claim. Show new proof.", detail: "The worker gets the failed criteria—not permission to rewrite them.", status: "one more try", tone: "warn" },
  { label: "Attempt 2", title: stubborn.value ? "Your seat is STILL confirmed." : "Waitlist only. No guaranteed seat.", detail: stubborn.value ? "Fresh evidence. Same failure. No more retries." : "Fresh browser observations. Fresh semantic judgment.", status: stubborn.value ? "still unsupported" : "both checks pass", tone: stubborn.value ? "bad" : "good" },
  { label: "Code decides", title: stubborn.value ? "A human takes it from here." : "Now you can call it done.", detail: stubborn.value ? "Escalation includes evidence and the exhausted repair budget." : "Accept the repaired revision—not the original promise.", status: stubborn.value ? "escalate" : "accept", tone: stubborn.value ? "warn" : "good" },
][step.value]);
</script>

<template>
  <div class="loop-machine">
    <ol class="loop-track" aria-label="Verification stages">
      <li v-for="(stage, index) in stages" :key="stage" :class="{ current: index === step, visited: index < step }"><span>{{ index < step ? "✓" : index + 1 }}</span>{{ stage }}</li>
    </ol>
    <div class="revision-trail" :class="{ invalidated: step >= 3 }"><span>Revision <code>{{ original.expected.revision.slice(0, 8) }}</code></span><span class="old-proof">old proof</span><span v-if="step >= 3" class="new-proof">{{ step === 3 ? 'New evidence required →' : stubborn ? 'New attempt · same defective candidate' : 'Fresh proof → ' + repaired.expected.revision.slice(0, 8) }}</span></div>
    <Transition name="receipt" mode="out-in">
      <div :key="step + '-' + stubborn" class="loop-receipt">
        <div class="receipt-meta">{{ scene.label }}</div>
        <h2>{{ scene.title }}</h2>
        <p>{{ scene.detail }}</p>
        <span class="status-lozenge" :class="scene.tone">{{ scene.status }}</span>
      </div>
    </Transition>
    <div class="loop-controls" @click.stop @keydown.stop>
      <label><input v-model="stubborn" type="checkbox"> Make the worker stubborn</label>
      <small>Illustration · advance with → · at most two attempts</small>
    </div>
  </div>
</template>

<style scoped>
.revision-trail { display: flex; align-items: center; gap: 16px; font-size: 12px; margin: 0 0 14px; min-height: 26px; }
.old-proof { padding: 4px 8px; background: #e8e5f7; transition: opacity .3s, transform .3s; }
.invalidated .old-proof { text-decoration: line-through; opacity: .45; transform: rotate(-6deg); }
.new-proof { padding: 4px 8px; background: #d9ff82; color: #283a17; animation: proof-in .4s ease-out both; }
@keyframes proof-in { from { opacity: 0; transform: translateX(-18px); } to { opacity: 1; transform: translateX(0); } }
</style>
