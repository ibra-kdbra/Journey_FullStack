<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  code: { type: String, default: '' },
  language: { type: String, default: null },
  filename: { type: String, default: null },
  highlights: { type: Array as () => number[], default: () => [] },
  meta: { type: String, default: null },
  class: { type: String, default: null },
  style: { type: [String, Object], default: null }
});

const copied = ref(false);

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code || '');
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch (e) {
    console.error('Copy failed', e);
  }
};

const displayLanguage = computed(() => props.language ? props.language.toLowerCase() : '');
const displayFileName = computed(() => props.filename || displayLanguage.value);

const langIcon = computed(() => {
  const lang = displayLanguage.value;
  if (!lang) return null;
  
  const iconMap: Record<string, string> = {
    'rust': 'logos:rust',
    'rs': 'logos:rust',
    'go': 'logos:go',
    'golang': 'logos:go',
    'javascript': 'logos:javascript',
    'js': 'logos:javascript',
    'typescript': 'logos:typescript-icon',
    'ts': 'logos:typescript-icon',
    'tsx': 'logos:react',
    'jsx': 'logos:react',
    'python': 'logos:python',
    'py': 'logos:python',
    'c': 'logos:c',
    'cpp': 'logos:c-plusplus',
    'java': 'logos:java',
    'kotlin': 'logos:kotlin-icon',
    'bash': 'logos:bash-icon',
    'sh': 'logos:bash-icon',
    'shell': 'logos:bash-icon',
    'html': 'logos:html-5',
    'css': 'logos:css-3',
    'json': 'logos:json',
    'yaml': 'logos:yaml',
    'yml': 'logos:yaml',
    'toml': 'logos:toml',
    'sql': 'logos:postgresql',
    'docker': 'logos:docker-icon',
    'dockerfile': 'logos:docker-icon',
  };
  
  return iconMap[lang] || null;
});
</script>

<template>
  <div class="prose-pre-wrapper">
    <!-- Header Bar -->
    <div class="prose-pre-header">
      <div class="prose-pre-info">
        <Icon v-if="langIcon" :name="langIcon" class="prose-pre-lang-icon" />
        <span class="prose-pre-lang">{{ displayFileName || 'text' }}</span>
      </div>
      <button 
        @click="copyCode"
        class="prose-pre-copy"
        :class="{ 'prose-pre-copy--success': copied }"
        aria-label="Copy code"
      >
        <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="prose-pre-copy-icon" />
        <span>{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </div>

    <!-- Code Content — Shiki output acts as the <code> blocks inside this <pre> -->
    <pre :class="props.class" :style="props.style" class="prose-pre-body">
      <slot />
    </pre>
  </div>
</template>

<style>
/*
 * ═══════════════════════════════════════════════
 * ProsePre — Code Block Wrapper
 * Non-scoped: rules MUST reach Shiki's generated HTML
 *
 * CRITICAL: Tailwind Preflight resets <pre> to
 *   white-space: normal — we override that here.
 * ═══════════════════════════════════════════════
 */

/* --- Container --- */
.prose-pre-wrapper {
  position: relative;
  margin: 1.5rem 0;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background-color: #0d1117;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
}

/* --- Header --- */
.prose-pre-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #161b22;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.prose-pre-info {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.prose-pre-lang-icon {
  width: 1rem;
  height: 1rem;
}

.prose-pre-lang {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  font-weight: 600;
  color: #8b949e;
  text-transform: lowercase;
}

/* --- Copy Button --- */
.prose-pre-copy {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 500;
  font-family: var(--font-sans, sans-serif);
  color: #8b949e;
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.15s ease;
}

.prose-pre-copy:hover {
  color: #c9d1d9;
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.prose-pre-copy--success {
  color: #3fb950 !important;
  border-color: rgba(63, 185, 80, 0.3) !important;
  background-color: rgba(63, 185, 80, 0.08) !important;
}

.prose-pre-copy-icon {
  width: 0.875rem;
  height: 0.875rem;
}

/* --- Code Body (<pre>) --- */
pre.prose-pre-body {
  overflow-x: auto;
  white-space: pre !important;
  word-wrap: normal !important;
  overflow-wrap: normal !important;
  margin: 0 !important;
  padding: 1rem 1.25rem !important;
  background-color: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  font-family: var(--font-mono, 'JetBrains Mono', monospace) !important;
  font-size: 0.8125rem !important;
  line-height: 1.7 !important;
  tab-size: 2 !important;
}

pre.prose-pre-body code {
  white-space: pre !important;
  word-wrap: normal !important;
  overflow-wrap: normal !important;
  background-color: transparent !important;
  padding: 0 !important;
  border: none !important;
  font-family: inherit !important;
  font-size: inherit !important;
  display: block !important;
}

/* Shiki wraps each line in <span class="line"> */
pre.prose-pre-body code .line {
  display: block;
  min-height: 1.4em;
}

/* Scrollbar */
pre.prose-pre-body::-webkit-scrollbar {
  height: 6px;
}
pre.prose-pre-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.02);
}
pre.prose-pre-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
pre.prose-pre-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
