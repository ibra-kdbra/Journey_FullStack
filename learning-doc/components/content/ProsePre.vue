<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
  code: { type: String, default: '' },
  language: { type: String, default: null },
  filename: { type: String, default: null },
  highlights: { type: Array as () => number[], default: () => [] },
  meta: { type: String, default: null }
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

// Line count from raw code prop for the gutter
const lineCount = computed(() => {
  if (!props.code) return 0;
  const lines = props.code.split('\n');
  // trim trailing empty line Shiki often appends
  if (lines[lines.length - 1] === '') lines.pop();
  return lines.length;
});

const langIcon: Record<string, string> = {
  rust: 'i-simple-icons-rust',
  kotlin: 'i-simple-icons-kotlin',
  javascript: 'i-simple-icons-javascript',
  js: 'i-simple-icons-javascript',
  typescript: 'i-simple-icons-typescript',
  ts: 'i-simple-icons-typescript',
  jsx: 'i-simple-icons-react',
  tsx: 'i-simple-icons-react',
  python: 'i-simple-icons-python',
  go: 'i-simple-icons-go',
  bash: 'i-lucide-terminal',
  sh: 'i-lucide-terminal',
  toml: 'i-lucide-settings',
  json: 'i-lucide-braces',
  yaml: 'i-lucide-layers',
  css: 'i-simple-icons-css3',
  html: 'i-simple-icons-html5',
};

const icon = computed(() => langIcon[props.language?.toLowerCase() ?? ''] ?? 'i-lucide-code-2');
</script>

<template>
  <div class="code-block-wrap">
    <!-- Top bar -->
    <div class="code-bar">
      <div class="code-bar-left">
        <Icon :name="icon" class="code-lang-icon" />
        <span class="code-label">{{ filename ?? language ?? 'code' }}</span>
      </div>
      <button class="copy-btn" :class="{ success: copied }" @click="copyCode">
        <Icon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" />
        <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
      </button>
    </div>

    <!-- Body: gutter + shiki output -->
    <div class="code-body">
      <!-- Line-number gutter -->
      <div class="line-gutter" aria-hidden="true">
        <span v-for="n in lineCount" :key="n">{{ n }}</span>
      </div>
      <!-- Shiki renders <pre><code>…</code></pre> here via the slot -->
      <div class="code-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style>
/* =====================================================
   ProsePre — Code Block
   Non-scoped so rules can reach Shiki's rendered HTML
   ===================================================== */

.code-block-wrap {
  margin: 1.75rem 0;
  border-radius: 0.875rem;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.07);
  background: #0d1117;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.code-block-wrap:hover {
  border-color: rgba(96, 165, 250, 0.25);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(96, 165, 250, 0.08);
}

/* ── Top bar ── */
.code-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.code-bar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.code-lang-icon {
  width: 0.9rem;
  height: 0.9rem;
  color: rgba(148, 163, 184, 0.7);
  flex-shrink: 0;
}

.code-label {
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  color: rgba(148, 163, 184, 0.55);
  letter-spacing: 0.02em;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 0.4rem;
  font-size: 0.7rem;
  font-weight: 500;
  color: rgba(148, 163, 184, 0.6);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
}

.copy-btn:hover {
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.copy-btn.success {
  color: #34d399;
}

/* ── Body layout ── */
.code-body {
  display: flex;
  overflow-x: auto;
}

/* ── Line-number gutter ── */
.line-gutter {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 1.25rem 0.75rem 1.25rem 1rem;
  min-width: 2.75rem;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 0.78rem;
  line-height: 1.625rem;
  color: rgba(148, 163, 184, 0.2);
  user-select: none;
  flex-shrink: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.035);
  background: rgba(0, 0, 0, 0.15);
}

.line-gutter span {
  display: block;
}

/* ── Code content ── */
.code-content {
  flex: 1;
  min-width: 0;
  padding: 0;
}

/* 
 * Let Shiki's <pre> sit flush — reset everything that 
 * might conflict, but DO NOT touch color or span styles.
 */
.code-content pre {
  margin: 0 !important;
  padding: 1.25rem 1.5rem !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  font-family: 'JetBrains Mono', ui-monospace, monospace !important;
  font-size: 0.825rem !important;
  line-height: 1.625rem !important;
  tab-size: 2;
  overflow: visible; /* parent handles scroll */
}

.code-content pre code {
  font-family: inherit !important;
  font-size: inherit !important;
  background: transparent !important;
  padding: 0 !important;
  border: none !important;
  /* ⚠ color is NOT set here — Shiki injects per-token inline styles */
}

/* Shiki wraps each line in a <span class="line"> */
.code-content pre code .line {
  display: block;
  min-height: 1.625rem;
}
</style>
