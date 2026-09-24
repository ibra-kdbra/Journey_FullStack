<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps({
  code: {
    type: String,
    required: true
  }
});

const svgContent = ref('');
const failed = ref(false);
const id = `mermaid-${Math.round(Math.random() * 100000)}`;

onMounted(async () => {
  try {
    // Imported here rather than at the top of the file: mermaid is a browser
    // library, so it must never be evaluated during server rendering, and
    // loading it on demand keeps it out of pages that have no diagrams.
    const { default: mermaid } = await import('mermaid');
    // Mermaid's default (light) theme, on a light panel. The course diagrams
    // were authored for it: the Korean lessons alone carry ~200
    // `style X fill:<pastel>` lines, which assume dark label text. The dark
    // theme draws light text and makes those labels unreadable.
    mermaid.initialize({ startOnLoad: false, theme: 'default' });
    const { svg } = await mermaid.render(id, props.code);
    svgContent.value = svg;
  } catch (error) {
    // A diagram that does not parse falls back to its source, which is what
    // readers saw before diagrams rendered at all - never worse than that.
    console.error('Mermaid rendering error:', error);
    failed.value = true;
  }
});
</script>

<template>
  <div v-if="failed" class="prose-pre-wrapper" data-mermaid-error>
    <pre class="prose-pre-body">{{ props.code }}</pre>
  </div>
  <div v-else class="mermaid-diagram my-6 flex justify-center overflow-x-auto rounded-xl border border-slate-200 bg-white p-6" v-html="svgContent"></div>
</template>
