<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, unref, watch } from "vue";
import { useSlideContext } from "@slidev/client";
const props = withDefaults(defineProps<{ seconds?: number }>(), { seconds: 90 });
const { $slidev, $page } = useSlideContext();
const remaining = ref(props.seconds * 1000);
const running = ref(false);
let deadline = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const clock = computed(() => {
  const seconds = Math.ceil(remaining.value / 1000);
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
});
function tick() {
  remaining.value = Math.max(0, deadline - performance.now());
  if (remaining.value === 0) stop();
}
function stop() { if (timer) clearInterval(timer); timer = undefined; running.value = false; }
function pause() { if (running.value) tick(); stop(); }
function toggle() {
  if (running.value) return pause();
  if (remaining.value === 0) remaining.value = props.seconds * 1000;
  deadline = performance.now() + remaining.value;
  running.value = true;
  timer = setInterval(tick, 100);
}
function reset() { stop(); remaining.value = props.seconds * 1000; }
function hidden() { if (document.hidden) pause(); }
watch(() => unref($slidev.nav.currentPage), page => { if (page !== unref($page)) pause(); });
onMounted(() => document.addEventListener("visibilitychange", hidden));
onBeforeUnmount(() => { stop(); document.removeEventListener("visibilitychange", hidden); });
</script>

<template>
  <div class="round-timer" @click.stop @keydown.stop>
    <div class="timer-face" :class="{ ticking: running, finished: remaining === 0 }" role="timer" aria-label="Round time remaining">{{ clock }}</div>
    <div class="timer-actions">
      <button type="button" @click="toggle">{{ running ? "Pause timer" : remaining === props.seconds * 1000 ? "Start " + props.seconds + "-second round" : remaining === 0 ? "Start another round" : "Resume timer" }}</button>
      <button type="button" class="quiet-button" @click="reset">Reset timer</button>
    </div>
    <p role="status">{{ remaining === 0 ? "Pens down. Swap roles." : "Label first. Judge second." }}</p>
  </div>
</template>
