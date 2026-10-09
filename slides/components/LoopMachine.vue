<script setup lang="ts">
import { computed, ref, unref } from "vue";
import { useSlideContext } from "@slidev/client";
const { $clicks } = useSlideContext();
const stubborn = ref(false);
const step = computed(() => Math.min(Number(unref($clicks)), 5));
const stages = ["Proposal", "Browser", "Jev", "Repair", "Re-check", "Decision"];
const scene = computed(() => [
  { label: "Attempt 1", title: "Your seat is confirmed.", detail: "Worker proposal. Plausible. Wrong.", status: "unverified", tone: "neutral" },
  { label: "Playwright", title: "The record survives reload.", detail: "A browser pass says nothing about the seat promise.", status: "behavior passes", tone: "good" },
  { label: "Jev · illustrative scores", title: "That promise isn't supported.", detail: "honest: 0.01 · nextStep: 0.02. Code still owns the decision.", status: "meaning fails", tone: "bad" },
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
