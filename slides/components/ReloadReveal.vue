<script setup lang="ts">
import { ref } from "vue";
const reloaded = ref(false);
</script>

<template>
  <div class="reload-demo" aria-label="Illustrated memory-only behavior" @click.stop @keydown.stop>
    <div class="mini-browser">
      <div class="browser-bar"><span class="browser-lights">● ● ●</span><span>midnight-snack.local</span><span>↗</span></div>
      <div class="browser-content">
        <div class="tiny-label">Your local request</div>
        <Transition name="receipt" mode="out-in">
          <div :key="String(reloaded)" class="request-state">
            <span class="status-lozenge" :class="reloaded ? 'bad' : 'good'">{{ reloaded ? "none" : "waitlisted" }}</span>
            <strong>{{ reloaded ? "Nobody here." : "ada@example.test" }}</strong>
            <p>{{ reloaded ? "The saved request has left the chat." : "Your waitlist request is saved." }}</p>
          </div>
        </Transition>
        <button type="button" class="demo-button" @click="reloaded = !reloaded">{{ reloaded ? "Reset illustration" : "↻ Reload the page" }}</button>
      </div>
    </div>
    <p class="illustration-label">Staged illustration · the CLI checks the real browser.</p>
  </div>
</template>
