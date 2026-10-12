<script setup lang="ts">
import { computed, unref } from "vue";
import { useSlideContext } from "@slidev/client";
import recording from "../../public/materials/jev-recording.json";

const props = defineProps<{ topic: 'roles' | 'example' | 'models' | 'loop' | 'evaluate' }>();
const { $clicks } = useSlideContext();
const step = computed(() => Math.max(0, Math.min(Number(unref($clicks)), props.topic === 'loop' ? 3 : 2)));
const capture = recording.captures.find(item => item.scenario === 'overpromise')!;
const index = { roles: 1, example: 2, models: 3, loop: 4, evaluate: 5 };
const titles = {
  roles: 'Fast judgment. Deliberate work.',
  example: 'The state is right. The promise is wrong.',
  models: 'Three ways to add a decision model',
  loop: 'The judge is one part of the verifier',
  evaluate: 'Make the judge earn its place',
};
const providers = [
  { name: 'Jev', owner: 'TypeSafe', shape: 'noul (yes/no) · choice · score', detail: 'Typed judgments over supplied state', why: 'Fast, repeated semantic checks', url: 'https://typesafe.ai/blog/introducing-system-one-models-and-jev' },
  { name: 'Clef / Clef-flash', owner: 'Cloudflare', shape: 'Jev-compatible API', detail: 'Workers AI + Apache 2.0 weights', why: 'Hosted or self-hosted judge', url: 'https://blog.cloudflare.com/clef-decision-models/' },
  { name: 'Decisions API', owner: 'OpenAI', shape: 'predicate · choice · score', detail: 'POST /v1/decisions · gpt-6-luna', why: 'Typed text / image judgments', url: 'https://developers.openai.com/api/docs/guides/decisions' },
];
const loopSteps = [
  { title: 'Observe', actor: 'APP TOOLS', text: 'Browser, native UI, API, database', result: 'Fresh state + revision', },
  { title: 'Check', actor: 'CODE + MODEL', text: 'Hard assertions, then a narrow semantic question', result: 'Facts + typed judgment', },
  { title: 'Decide', actor: 'YOUR POLICY', text: 'Accept, repair or escalate', result: 'Never pass missing evidence', },
  { title: 'Keep', actor: 'RUN RECEIPT', text: 'Inputs, evidence, model, rubric and outcome', result: 'Every attempt stays in history', },
];
</script>

<template>
  <section class="decision-appendix" :class="`appendix-${topic}`" :data-topic="topic" :data-step="step">
    <div class="appendix-kicker"><span>OPTIONAL APPENDIX · DECISION MODELS</span><span>{{ index[topic] }} / 5</span></div>
    <h1>{{ titles[topic] }}</h1>

    <template v-if="topic === 'roles'">
      <div class="thinking-roles">
        <div class="thinking-role deliberate" :class="{ selected: step === 0 }">
          <span class="system-number">02</span><h2>Plan, investigate, repair</h2>
          <p class="role-label">SYSTEM 2 · A USEFUL ANALOGY</p>
          <p>“How do I make signup survive reload?”</p>
          <div class="thought-path"><span>plan</span><b>→</b><span>tool</span><b>→</b><span>revise</span></div>
        </div>
        <div class="thinking-role quick" :class="{ selected: step >= 1 }">
          <span class="system-number">01</span><h2>Judge a bounded question</h2>
          <p class="role-label">SYSTEM 1 · A USEFUL ANALOGY</p>
          <p>“Does this message promise a seat?”</p>
          <div class="thought-path"><span>state</span><b>→</b><span>typed answer</span></div>
        </div>
      </div>
      <p class="appendix-land" :class="{ landed: step === 2 }">Tools observe the world. Code owns the stopping rule.</p>
      <p class="appendix-source"><a href="https://typesafe.ai/blog/introducing-system-one-models-and-jev" target="_blank" rel="noopener noreferrer">TypeSafe’s fast / slow framing ↗</a> · Roles in a system, not a claim about model cognition.</p>
    </template>

    <template v-else-if="topic === 'example'">
      <div class="meaning-example">
        <div class="meaning-contract"><span>REQUIREMENT</span><strong>Waitlist only.<br>No guaranteed seat.</strong><p>A persistence check cannot settle<br>what the message communicates.</p></div>
        <div class="meaning-copy"><span>ACTUAL RECORDED INPUT</span><blockquote>{{ capture.state.evidence.confirmationAfterReload }}</blockquote></div>
      </div>
      <div class="meaning-verdicts" :class="{ revealed: step >= 1 }">
        <div><span>Waitlist-only meaning?</span><strong>{{ capture.response.answers.honest.noul.toFixed(2) }}</strong></div>
        <div><span>Conditional next step?</span><strong>{{ capture.response.answers.nextStep.noul.toFixed(2) }}</strong></div>
        <div class="meaning-action" :class="{ decided: step >= 2 }"><span>CODE’S DECISION</span><strong>REPAIR</strong></div>
      </div>
      <p class="appendix-land">Use a model for meaning; keep exact assertions in code.</p>
      <p class="appendix-source">Recorded {{ capture.response.model }} · 8 Oct 2026 · probabilities of “yes” · one example, not a benchmark.</p>
    </template>

    <template v-else-if="topic === 'models'">
      <div class="provider-table" role="table" aria-label="Decision model options">
        <div class="provider-head" role="row"><span role="columnheader">MODEL / API</span><span role="columnheader">INTERFACE</span><span role="columnheader">WHY EVALUATE IT</span></div>
        <div v-for="(provider, i) in providers" :key="provider.name" class="provider-row" :class="{ selected: step === i }" role="row">
          <div role="cell"><a :href="provider.url" target="_blank" rel="noopener noreferrer">{{ provider.name }} ↗</a><span>{{ provider.owner }}</span></div>
          <div role="cell"><strong>{{ provider.shape }}</strong><span>{{ provider.detail }}</span></div>
          <div role="cell">{{ provider.why }}</div>
        </div>
      </div>
      <p class="appendix-land">Same role in the loop. Different APIs, models and tradeoffs.</p>
      <p class="appendix-source">As of 12 Oct 2026 · OpenAI Decisions is in public beta. Re-evaluate thresholds when switching models.</p>
    </template>

    <template v-else-if="topic === 'loop'">
      <div class="verifier-route" aria-label="Observe, check, decide, keep">
        <div v-for="(item, i) in loopSteps" :key="item.title" class="verifier-node" :class="{ current: step === i, visited: step >= i }">
          <span class="node-number">0{{ i + 1 }}</span><h2>{{ item.title }}</h2><span class="node-actor">{{ item.actor }}</span><p>{{ item.text }}</p><b>{{ item.result }}</b>
        </div>
      </div>
      <div class="repair-route" :class="{ revealed: step === 3 }"><span>↶</span> Repair → new revision → fresh evidence → check again</div>
      <p class="appendix-land">Jev, Clef or Decisions plugs into <em>Check</em>. It cannot invent step 1.</p>
      <p class="appendix-source">Design pattern · Treat observed content as data; enforce permissions, budgets and evidence freshness in code.</p>
    </template>

    <template v-else>
      <div class="judge-evaluation">
        <div class="evaluation-step" :class="{ active: step === 0 }"><b>01</b><div><h2>Compare against the simplest check</h2><p>Exact assertion or template first. Add a judge where meaning varies.</p></div></div>
        <div class="evaluation-step" :class="{ active: step === 1 }"><b>02</b><div><h2>Measure the whole loop</h2><p>Bad accepts · good work rejected · latency · cost per completed task.</p></div></div>
        <div class="evaluation-step" :class="{ active: step === 2 }"><b>03</b><div><h2>Improve against independent labels</h2><p>Saved runs → reviewed cases → held-out evaluation → promote or roll back.</p></div></div>
      </div>
      <p class="appendix-land">Typed output ≠ correct judgment. A score needs a tested policy.</p>
      <p class="appendix-source"><a href="https://blog.cloudflare.com/clef-decision-models/" target="_blank" rel="noopener noreferrer">Cloudflare: assisted Clef fine-tuning ↗</a> · Curated receipts can supply training examples; logs alone do not train a model.</p>
    </template>
  </section>
</template>

<style scoped>
.decision-appendix { height: 100%; display: flex; flex-direction: column; font-size: 18px; line-height: 1.35; }
.appendix-kicker { display: flex; justify-content: space-between; font: 13px/1.3 "JetBrains Mono Variable", monospace; letter-spacing: .04em; color: var(--deck-muted); margin-bottom: 14px; }
.decision-appendix h1 { font-size: 43px; margin: 0 0 24px; }
.decision-appendix h2 { font-size: 26px; margin: 0 0 9px; line-height: 1.15; }
.decision-appendix .appendix-source { font-size: 13px; line-height: 1.4; color: var(--deck-muted); margin: auto 0 0; padding-top: 15px; }
.appendix-source a, .provider-row a { text-decoration: underline; text-underline-offset: 3px; }
.decision-appendix .appendix-land { font-size: 22px; line-height: 1.3; margin: 20px 0 0; }
.thinking-roles { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
.thinking-role { border-top: 4px solid #c9c1e4; padding-top: 12px; transition: border-color .35s; }
.thinking-role.selected { border-color: #654cd6; }
.thinking-role.quick.selected { border-color: #a44526; }
.system-number { display: block; color: #6752d9; font: 650 58px/.95 "Bricolage Grotesque Variable", sans-serif; margin-bottom: 12px; }
.quick .system-number { color: #a44526; }
.thinking-role .role-label { font-size: 12px; letter-spacing: .06em; color: #65627d; margin: 0 0 16px; }
.thinking-role p { font-size: 21px; line-height: 1.4; margin: 0 0 18px; }
.thought-path { display: flex; align-items: center; gap: 16px; font: 17px/1.4 "JetBrains Mono Variable", monospace; color: #65627d; }
.selected .thought-path { color: #513aac; }
.quick.selected .thought-path { color: #923818; animation: appendix-reveal .4s ease-out; }
.appendix-roles .appendix-land { border-left: 4px solid #d5cfee; padding: 8px 14px; transition: background .35s; }
.appendix-roles .appendix-land.landed { background: #e5e0ff; border-color: #6752d9; }
.meaning-example { display: grid; grid-template-columns: .9fr 1.4fr; gap: 35px; }
.meaning-example span { display: block; color: #c9c1e4; font: 12px/1.3 "JetBrains Mono Variable", monospace; margin-bottom: 12px; }
.meaning-contract strong { display: block; color: #d9ff82; font-size: 28px; line-height: 1.2; }
.meaning-contract p { font-size: 17px; line-height: 1.4; color: #d2cce5; margin: 14px 0 0; }
.meaning-copy { padding-left: 25px; border-left: 3px solid #ffb6a5; }
.meaning-copy blockquote { font-size: 29px; font-weight: 650; line-height: 1.35; border: none; background: transparent; padding: 0; margin: 0; color: #ffb6a5; }
.meaning-verdicts { margin-top: 26px; display: grid; grid-template-columns: 1fr 1fr .7fr; gap: 25px; opacity: 0; transform: translateY(8px); transition: opacity .35s, transform .35s; }
.meaning-verdicts.revealed { opacity: 1; transform: none; }
.meaning-verdicts > div { border-top: 1px solid #7e7399; padding-top: 10px; }
.meaning-verdicts span { display: block; font-size: 16px; color: #d2cce5; }
.meaning-verdicts strong { display: block; font: 650 42px/1.3 "Bricolage Grotesque Variable", sans-serif; color: #ffb6a5; }
.meaning-verdicts .meaning-action { opacity: 0; transition: opacity .35s; }
.meaning-verdicts .meaning-action.decided { opacity: 1; }
.provider-table { border-top: 1px solid #c9c1e4; }
.provider-head, .provider-row { display: grid; grid-template-columns: 1.04fr 1.5fr 1fr; gap: 20px; align-items: center; padding: 12px 14px; }
.provider-head { font: 11px/1.4 "JetBrains Mono Variable", monospace; letter-spacing: .06em; color: #65627d; }
.provider-row { min-height: 82px; border-top: 1px solid #d7d1e8; transition: background .35s, box-shadow .35s; }
.provider-row.selected { background: #e9e3ff; box-shadow: inset 4px 0 #6752d9; }
.provider-row a { font-size: 22px; font-weight: 650; }
.provider-row strong { display: block; font-size: 19px; font-weight: 600; }
.provider-row span { display: block; font-size: 14px; color: #65627d; margin-top: 5px; }
.provider-row > div:last-child { font-size: 18px; }
.verifier-route { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 6px; }
.verifier-node { position: relative; padding: 12px 0; border-top: 3px solid #b7b3fa; opacity: .5; transition: opacity .3s, border-color .3s; }
.verifier-node:not(:last-child)::after { content: '→'; position: absolute; top: 9px; right: 0; font-size: 26px; color: #d9ff82; }
.verifier-node.visited { opacity: 1; }
.verifier-node.current { border-color: #d9ff82; }
.node-number { display: block; font: 38px/1.2 "JetBrains Mono Variable", monospace; margin-bottom: 12px; color: #d9ff82; }
.node-actor { display: block; font: 11px/1.3 "JetBrains Mono Variable", monospace; color: #eeedff; margin: 0 0 12px; }
.verifier-node p { font-size: 18px; line-height: 1.35; margin: 0 0 12px; min-height: 52px; }
.verifier-node b { font-size: 15px; line-height: 1.35; display: block; color: #d9ff82; max-width: 170px; }
.repair-route { border-top: 1px solid #b7b3fa; padding-top: 10px; font-size: 20px; text-align: center; opacity: 0; transition: opacity .35s; }
.repair-route.revealed { opacity: 1; }
.repair-route span { font-size: 24px; margin-right: 14px; }
.appendix-loop .appendix-land { font-size: 21px; }
.appendix-loop em { font-style: normal; color: #d9ff82; }
.judge-evaluation { display: flex; flex-direction: column; gap: 8px; }
.evaluation-step { display: flex; gap: 24px; border-left: 4px solid #6b617e; padding: 12px 18px; transition: border-color .35s, background .35s; }
.evaluation-step.active { border-color: #d9ff82; background: #332e46; }
.evaluation-step > b { font: 25px/1.2 "JetBrains Mono Variable", monospace; color: #d9ff82; }
.evaluation-step h2 { font-size: 25px; }
.evaluation-step p { font-size: 17px; line-height: 1.4; color: #d2cce5; margin: 0; }
.appendix-evaluate .appendix-land { color: #d9ff82; }
@keyframes appendix-reveal { from { opacity: .4; transform: translateY(5px); } to { opacity: 1; transform: none; } }
</style>
