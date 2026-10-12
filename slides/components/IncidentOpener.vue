<script setup lang="ts">
import { computed, unref } from "vue";
import { useSlideContext } from "@slidev/client";
const { $clicks } = useSlideContext();
const step = computed(() => Math.min(Number(unref($clicks)), 2));
</script>

<template>
  <div class="incident-opener" :data-phase="step">
    <div class="incident-scene">
      <div class="incident-quote">
        <p class="incident-kicker">A real incident. April 2026.</p>
        <h1>“It took<br><span>9 seconds.</span>”</h1>
        <p>Jer Crane, founder of PocketOS,<br>on an agent deleting production data.</p>
      </div>
      <div class="incident-system" :class="{ erased: step === 1, recovered: step === 2 }">
        <div class="incident-request">Routine staging task <span>→</span> Production API</div>
        <div class="incident-volume">
          <div class="volume-heading">PRODUCTION VOLUME</div>
          <div class="incident-records" aria-hidden="true">
            <div v-for="row in 6" :key="row" class="incident-record" :style="{ '--row': row }"><span></span><span></span><span></span></div>
          </div>
          <div class="incident-verdict" role="status">{{ ['An agent has the keys.', 'One destructive API call.', 'Data later recovered.'][step] }}</div>
        </div>
        <p class="incident-question">{{ ['What stops it?', 'Instructions did not enforce the boundary.', 'Recovery is a system capability, too.'][step] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.incident-opener { height: 100%; display: flex; flex-direction: column; justify-content: center; }
.incident-scene { display: grid; grid-template-columns: 1.05fr 1fr; gap: 38px; align-items: center; }
.incident-kicker { font-size: 15px; color: var(--snack-lime); }
.incident-quote h1 { font-size: 68px; line-height: 1.04; margin: 12px 0 23px; }
.incident-quote h1 span { color: var(--snack-coral); }
.incident-quote p { font-size: 17px; }
.incident-request { font: 12px "JetBrains Mono Variable", monospace; display: flex; justify-content: space-between; gap: 8px; margin-bottom: 20px; }
.incident-request span { color: var(--snack-coral); }
.incident-volume { border: 2px solid #8c86b8; border-radius: 18px; padding: 18px; background: #34304e; transition: border-color .35s, background .35s; }
.volume-heading { font: 12px "JetBrains Mono Variable", monospace; letter-spacing: .08em; margin-bottom: 18px; }
.incident-records { display: grid; gap: 9px; height: 116px; }
.incident-record { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 10px; opacity: 1; transform: translateX(0); transition: opacity .35s, transform .5s; transition-delay: calc(var(--row) * .055s); }
.incident-record span { background: #aaa1e3; height: 8px; border-radius: 2px; }
.erased .incident-record { opacity: 0; transform: translateX(45px) skewX(-16deg); }
.erased .incident-volume { border-color: var(--snack-coral); background: #503047; }
.recovered .incident-volume { border-color: var(--snack-lime); }
.recovered .incident-record span { background: var(--snack-lime); }
.incident-verdict { margin-top: 19px; font-size: 19px; font-weight: 650; }
.incident-question { font-size: 18px; margin: 17px 0 8px; min-height: 27px; }
@media (prefers-reduced-motion: reduce) { .incident-record, .incident-volume { transition: none; } }
</style>
