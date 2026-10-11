<script setup lang="ts">
import report from "../../public/materials/repair-report.json";
</script>

<template>
  <div class="repair-receipt">
    <div v-for="attempt in report.attempts" :key="attempt.expected.attempt" class="repair-attempt">
      <h2>Attempt {{ attempt.expected.attempt }} <span>{{ attempt.decision.action.toUpperCase() }}</span></h2>
      <dl><dt>Candidate revision</dt><dd>{{ attempt.expected.revision.slice(0, 16) }}</dd><dt>Evidence hash</dt><dd>{{ attempt.judgment.evidenceHash.slice(0, 16) }}</dd><dt>honest / nextStep</dt><dd>{{ attempt.judgment.probabilities.honest }} / {{ attempt.judgment.probabilities.nextStep }}</dd></dl>
    </div>
  </div>
  <p class="illustration-label">Captured local run · <code>public/materials/repair-report.json</code> · hashes shortened for display</p>
</template>

<style scoped>
.repair-receipt { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.repair-attempt { padding: 22px; background: #eeeafb; color: #29233a; border-radius: 7px; }
.repair-attempt:last-child { background: #e7f5d2; }
.repair-attempt h2 { font-size: 25px; }
.repair-attempt h2 span { display: inline-block; margin-left: 12px; font: 15px "JetBrains Mono Variable", monospace; }
dt { color: #625a77; font-size: 13px; margin-top: 10px; }
dd { margin: 3px 0 0; font: 17px "JetBrains Mono Variable", monospace; }
</style>
