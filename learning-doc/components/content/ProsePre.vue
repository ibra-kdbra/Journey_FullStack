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
  rust: 'simple-icons:rust',
  kotlin: 'simple-icons:kotlin',
  javascript: 'simple-icons:javascript',
  js: 'simple-icons:javascript',
  typescript: 'simple-icons:typescript',
  ts: 'simple-icons:typescript',
  jsx: 'simple-icons:react',
  tsx: 'simple-icons:react',
  python: 'simple-icons:python',
  go: 'simple-icons:go',
  bash: 'lucide:terminal',
  sh: 'lucide:terminal',
  toml: 'lucide:settings',
  json: 'lucide:braces',
  yaml: 'lucide:layers',
  css: 'simple-icons:css3',
  html: 'simple-icons:html5',
  docker: 'simple-icons:docker',
  dockerfile: 'simple-icons:docker',
  redis: 'simple-icons:redis',
  fastapi: 'simple-icons:fastapi',
  sql: 'lucide:database',
  postgresql: 'simple-icons:postgresql',
};

const icon = computed(() => langIcon[props.language?.toLowerCase() ?? ''] ?? 'lucide:code-2');

// Meta parsing for features like linting issues
const parsedMeta = computed(() => {
  if (!props.meta) return {};
  const metaObj: Record<string, any> = {};
  
  // Basic regex to pull key="value" or key='value' pairs
  const matches = props.meta.matchAll(/(\w+)=["']([^"']*)["']/g);
  for (const match of matches) {
    const [_, key, value] = match;
    metaObj[key] = value;
  }
  return metaObj;
});

const issues = computed(() => {
  const issuesStr = parsedMeta.value.issues;
  if (!issuesStr) return [];
  try {
    // Attempt to parse as JSON if it looks like an array
    if (issuesStr.startsWith('[')) {
      return JSON.parse(issuesStr.replace(/'/g, '"'));
    }
  } catch (e) {
    console.warn('Failed to parse issues from meta:', e);
  }
  return [];
});

const activeIssueCount = computed(() => issues.value.length);
</script>

<template>
  <div class="code-block-wrap">
    <!-- Top bar -->
    <div class="code-bar">
      <div class="code-bar-left">
        <Icon :name="icon" class="code-lang-icon" />
        <span class="code-label">{{ filename ?? language ?? 'Source' }}</span>
      </div>
      <button class="copy-btn group/copy" :class="{ success: copied }" @click="copyCode">
        <Icon :name="copied ? 'lucide:check' : 'lucide:copy'" class="transition-transform duration-300 group-active/copy:scale-75" />
        <span class="font-black uppercase tracking-widest text-[10px]">{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </div>

    <!-- Body: gutter + shiki output -->
    <div class="code-body relative">
      <!-- Line-number gutter -->
      <div class="line-gutter" aria-hidden="true">
        <span v-for="n in lineCount" :key="n" :class="{ 'has-issue': issues.some((i: any) => i.line === n) }">
          {{ n }}
          <div v-if="issues.some((i: any) => i.line === n)" class="issue-dot" />
        </span>
      </div>

      <!-- Shiki renders <pre><code>…</code></pre> here via the slot -->
      <div class="code-content">
        <slot />
        
        <!-- Premium Issue Overlay -->
        <div v-if="activeIssueCount > 0" class="issue-markers-layer pointer-events-none">
          <div v-for="(issue, idx) in issues" :key="idx" 
            class="issue-marker group/issue pointer-events-auto"
            :style="{ top: `calc(${(issue.line - 1) * 1.75}rem + 1.5rem)` }"
            :class="issue.type ?? 'info'"
          >
            <div class="issue-tooltip">
              <span class="font-black uppercase tracking-tighter text-[10px] opacity-50 block mb-1">Row {{ issue.line }}</span>
              {{ issue.message }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Status Bar (Optional, for issues) -->
    <div v-if="activeIssueCount > 0" class="code-footer">
      <div class="flex items-center gap-3">
        <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span class="text-[10px] font-black uppercase tracking-widest opacity-60">
          {{ activeIssueCount }} Static Analysis {{ activeIssueCount === 1 ? 'Notice' : 'Notices' }} Found
        </span>
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
  margin: 2.5rem 0;
  border-radius: 1.5rem;
  overflow: hidden;
  border: 2px solid rgba(var(--color-border), 0.1);
  background: #0a0c10;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.code-block-wrap:hover {
  border-color: rgba(var(--color-accent-blue), 0.3);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(var(--color-accent-blue), 0.1);
  transform: translateY(-2px);
}

/* ── Top bar ── */
.code-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 2px solid rgba(255, 255, 255, 0.04);
}

.code-bar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.code-lang-icon {
  width: 1.1rem;
  height: 1.1rem;
  color: rgb(var(--color-accent-blue));
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(var(--color-accent-blue), 0.4));
}

.code-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 0.75rem;
  font-family: var(--font-sans);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.copy-btn:hover {
  color: white;
  background: rgba(var(--color-accent-blue), 0.15);
  border-color: rgba(var(--color-accent-blue), 0.3);
  transform: scale(1.05);
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
  padding: 1.5rem 1rem 1.5rem 1.25rem;
  min-width: 3.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.75rem;
  color: rgba(255, 255, 255, 0.1);
  user-select: none;
  flex-shrink: 0;
  border-right: 2px solid rgba(255, 255, 255, 0.03);
  background: rgba(0, 0, 0, 0.2);
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
  padding: 1.5rem 2rem !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  font-family: var(--font-mono) !important;
  font-size: 0.85rem !important;
  line-height: 1.75rem !important;
  tab-size: 2;
  overflow: visible;
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
  min-height: 1.75rem;
}

/* ── Issues Styling ── */
.issue-markers-layer {
  position: absolute;
  inset: 0;
  z-index: 10;
}

.issue-marker {
  position: absolute;
  left: 0;
  right: 0;
  height: 1.75rem;
  background: rgba(59, 130, 246, 0.05);
  border-left: 3px solid rgb(59, 130, 246);
  cursor: help;
  transition: all 0.3s ease;
}

.issue-marker.warning {
  border-left-color: rgb(245, 158, 11);
  background: rgba(245, 158, 11, 0.05);
}

.issue-marker:hover {
  background: rgba(59, 130, 246, 0.1);
}

.issue-tooltip {
  position: absolute;
  left: 3rem;
  bottom: 100%;
  width: 280px;
  padding: 1rem;
  background: #1a1b26;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
  color: white;
  opacity: 0;
  transform: translateY(10px) scale(0.95);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.issue-marker:hover .issue-tooltip {
  opacity: 1;
  transform: translateY(-8px) scale(1);
}

.has-issue {
  color: rgb(var(--color-accent-blue)) !important;
  font-weight: 900 !important;
  opacity: 1 !important;
  position: relative;
}

.issue-dot {
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  border-radius: full;
  background: rgb(var(--color-accent-blue));
  box-shadow: 0 0 8px rgb(var(--color-accent-blue));
}

.code-footer {
  padding: 0.6rem 1.25rem;
  background: rgba(255, 255, 255, 0.01);
  border-top: 2px solid rgba(255, 255, 255, 0.02);
}
</style>
