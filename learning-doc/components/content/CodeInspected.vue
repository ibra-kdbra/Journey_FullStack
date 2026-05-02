<script setup lang="ts">
import { ref, computed } from 'vue';

interface CodeIssue {
  line: number;
  type: 'error' | 'warning' | 'info';
  message: string;
}

interface Props {
  code?: string;
  language: string;
  filename?: string;
  issues?: CodeIssue[];
  title?: string;
}

const props = defineProps<Props>();
const isExpanded = ref(true);

const normalizedIssues = computed(() => {
  if (!props.issues) return [];
  if (typeof props.issues === 'string') {
    try {
      // Robustly parse JS-like object strings (e.g. from MDC) by quoting keys
      const prepared = (props.issues as string)
        .replace(/([{,])\s*([a-z_][a-z0-9_]*)\s*:/gi, '$1"$2":') // Quote keys
        .replace(/'/g, '"'); // Quote values
      return JSON.parse(prepared);
    } catch (e) {
      console.warn('Failed to parse issues prop:', props.issues);
      return [];
    }
  }
  return props.issues;
});

const getIssueIcon = (type: string) => {
  switch (type) {
    case 'error': return 'i-lucide-x-circle';
    case 'warning': return 'i-lucide-alert-triangle';
    default: return 'i-lucide-info';
  }
};

const getIssueColor = (type: string) => {
  switch (type) {
    case 'error': return 'text-red-400 border-red-900/50 bg-red-950/20';
    case 'warning': return 'text-amber-400 border-amber-900/50 bg-amber-950/20';
    default: return 'text-blue-400 border-blue-900/50 bg-blue-950/20';
  }
};
</script>

<template>
  <div class="code-inspected-container my-8 group overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-2xl transition-all duration-300 hover:border-blue-500/30">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-white/5 bg-slate-900/50 px-4 py-3">
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
          <Icon name="lucide:code-2" class="h-5 w-5" />
        </div>
        <div>
          <h3 v-if="title" class="text-sm font-semibold text-slate-200">{{ title }}</h3>
          <p v-if="filename" class="text-xs text-slate-500 font-mono">{{ filename }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-400 border border-white/5">
          {{ language }}
        </span>
        <button 
          @click="isExpanded = !isExpanded"
          class="p-1 hover:bg-white/5 rounded text-slate-500 transition-colors"
        >
          <Icon :name="isExpanded ? 'lucide:chevron-up' : 'lucide:chevron-down'" />
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div v-show="isExpanded" class="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-white/5">
      <!-- Code Section -->
      <div class="relative flex-1 bg-slate-950 p-0 font-mono text-sm leading-relaxed overflow-x-auto scrollbar-hide">
        <div class="py-4">
          <slot />
        </div>
      </div>

      <!-- Inspector Panel (Linter) -->
      <div v-if="normalizedIssues && normalizedIssues.length > 0" class="w-full lg:w-72 bg-slate-900/30 p-4 shrink-0 overflow-y-auto max-h-[400px]">
        <div class="flex items-center gap-2 mb-4">
          <Icon name="lucide:search-check" class="text-blue-400 h-4 w-4" />
          <span class="text-xs font-bold uppercase tracking-widest text-slate-500">Inspection</span>
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="(issue, index) in normalizedIssues" 
            :key="index"
            class="p-3 rounded-lg border text-xs leading-normal transform transition-all hover:scale-[1.02]"
            :class="getIssueColor(issue.type)"
          >
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-1.5 font-bold uppercase tracking-tight">
                <Icon :name="getIssueIcon(issue.type)" class="h-3.5 w-3.5" />
                <span>Line {{ issue.line }}</span>
              </div>
            </div>
            <p class="text-slate-300">{{ issue.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
