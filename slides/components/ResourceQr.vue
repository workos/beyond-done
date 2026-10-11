<script setup lang="ts">
import { computed } from "vue";
import { repoUrl, glossaryUrl } from "../resources";
const props = defineProps<{ resource: "repo" | "glossary"; compact?: boolean }>();
const qrBase = import.meta.env.BASE_URL;
const url = computed(() => props.resource === "repo" ? repoUrl : glossaryUrl);
</script>

<template>
  <div class="resource-qr" :class="{ compact }" @click.stop @keydown.stop>
    <template v-if="url">
      <a :href="url" target="_blank" rel="noopener noreferrer" :aria-label="`Open ${resource === 'repo' ? 'workshop repository' : 'interactive glossary'}`">
        <img :src="`${qrBase}qr/${resource}.svg`" :alt="`QR code for ${url}`" width="240" height="240">
      </a>
      <p>{{ resource === 'repo' ? 'github.com/nicknisi/beyond-done' : url.replace('https://', '') }}</p>
    </template>
    <div v-else class="resource-pending"><strong>Glossary link pending</strong><p>The hosts will share the public URL.</p></div>
  </div>
</template>

<style scoped>
.resource-qr { text-align: center; }
.resource-qr img { width: 240px; height: 240px; display: block; margin: 0 auto; background: white; border-radius: 8px; }
.resource-qr p { font: 13px/1.5 "JetBrains Mono Variable", monospace; margin: 12px auto 0; overflow-wrap: anywhere; max-width: 320px; }
.resource-qr.compact img { width: 132px; height: 132px; }
.resource-qr.compact p { font-size: 10px; max-width: 230px; }
.resource-pending { border: 1px dashed currentColor; padding: 30px 18px; border-radius: 8px; }
</style>
