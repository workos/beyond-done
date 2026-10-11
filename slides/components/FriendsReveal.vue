<script setup lang="ts">
import { computed, unref } from "vue";
import { useSlideContext } from "@slidev/client";

const { $clicks } = useSlideContext();
const step = computed(() => Math.min(Number(unref($clicks)), 2));
const hearts = Array.from({ length: 12 }, (_, i) => ({
  x: (i % 6 - 2.5) * 29,
  drift: (i % 2 ? 1 : -1) * (18 + i * 3),
  delay: i * 45,
  size: 15 + i % 3 * 6,
}));
</script>

<template>
  <div class="friends-reveal" :data-step="step">
    <slot :friends="step === 2" />
    <div v-if="step === 2" class="friend-hearts" aria-hidden="true">
      <span class="heart-keepsake">♥</span>
      <span v-for="(heart, i) in hearts" :key="i" class="flying-heart" :style="{
        '--x': `${heart.x}px`, '--drift': `${heart.drift}px`,
        '--delay': `${heart.delay}ms`, '--size': `${heart.size}px`,
      }">♥</span>
    </div>
  </div>
</template>

<style scoped>
.friends-reveal { position: relative; }
.friends-reveal :deep(.host-label) {
  min-width: 100px;
  text-align: center;
  position: relative;
  z-index: 2;
  border-radius: 3px;
  transition: transform 850ms cubic-bezier(.22, 1.25, .36, 1), background 450ms, color 450ms, box-shadow 450ms;
}
.friends-reveal :deep(.host-photo) { transition: transform 850ms cubic-bezier(.22, 1.25, .36, 1); }
.friends-reveal :deep(.people-caption) { transition: transform 850ms cubic-bezier(.22, 1.25, .36, 1); }
[data-step="1"] :deep(.host:first-child .host-label) { transform: translate(40px, 14px) rotate(4deg); }
[data-step="1"] :deep(.host:last-child .host-label) { transform: translate(-62px, 14px) rotate(-4deg); }
[data-step="2"] :deep(.host:first-child .host-label) { transform: translate(126px, 54px) rotate(-6deg) scale(1.18); }
[data-step="2"] :deep(.host:last-child .host-label) { transform: translate(-211px, 54px) rotate(6deg) scale(1.18); }
[data-step="2"] :deep(.host-label) { background: #ffbad3; color: #84294f; box-shadow: 0 5px 18px #d6447d25; font-weight: 750; }
[data-step="2"] :deep(.host:first-child .host-photo) { transform: rotate(4deg); }
[data-step="2"] :deep(.host:last-child .host-photo) { transform: rotate(-4deg); }
[data-step="2"] :deep(.people-caption) { transform: translateY(42px); }
.friend-hearts { position: absolute; left: 50%; top: 224px; z-index: 3; pointer-events: none; color: #dc4380; }
.heart-keepsake { display: block; font-size: 29px; transform: translateX(-50%); animation: heart-beat 650ms ease-in-out 3; }
.flying-heart { position: absolute; left: var(--x); top: 10px; opacity: 0; font-size: var(--size); animation: heart-float 2100ms var(--delay) ease-out both; }
@keyframes heart-float {
  0% { opacity: 0; transform: translate(-50%, 24px) scale(.35) rotate(-15deg); }
  18% { opacity: .95; }
  75% { opacity: .8; }
  100% { opacity: 0; transform: translate(calc(-50% + var(--drift)), -115px) scale(1.1) rotate(18deg); }
}
@keyframes heart-beat {
  0%, 100% { transform: translateX(-50%) scale(1); }
  40% { transform: translateX(-50%) scale(1.35); }
  65% { transform: translateX(-50%) scale(.95); }
}
@media (prefers-reduced-motion: reduce) {
  .friends-reveal :deep(.host-label), .friends-reveal :deep(.host-photo), .friends-reveal :deep(.people-caption) { transition: none; }
  .heart-keepsake { animation: none; }
  .flying-heart { display: none; }
}
</style>
