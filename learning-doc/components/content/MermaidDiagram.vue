<script setup lang="ts">
import { ref, onMounted } from 'vue';
import mermaid from 'mermaid';

const props = defineProps({
  code: {
    type: String,
    required: true
  }
});

const svgContent = ref('');
const id = `mermaid-${Math.round(Math.random() * 100000)}`;

onMounted(async () => {
  try {
    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
    const { svg } = await mermaid.render(id, props.code);
    svgContent.value = svg;
  } catch (error) {
    console.error('Mermaid rendering error:', error);
    svgContent.value = `<pre class="text-red-500">Error rendering diagram</pre>`;
  }
});
</script>

<template>
  <div class="mermaid-diagram flex justify-center my-6" v-html="svgContent"></div>
</template>
