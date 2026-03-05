<template>
    <div class="code-block group">
        <!-- Header bar -->
        <div class="code-header">
            <span v-if="filename" class="code-filename">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                </svg>
                {{ filename }}
            </span>
            <span v-else-if="language" class="code-lang">{{ language }}</span>
            <span v-else class="code-lang">code</span>

            <button @click="copyCode" class="copy-btn" :class="{ copied }">
                <!-- Copy icon -->
                <svg v-if="!copied" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <!-- Check icon -->
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
                <span class="copy-label">{{ copied ? 'Copied!' : 'Copy' }}</span>
            </button>
        </div>

        <!-- Code content -->
        <pre :class="$props.class" class="code-pre"><slot /></pre>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    code: { type: String, default: "" },
    language: { type: String, default: null },
    filename: { type: String, default: null },
    highlights: { type: Array, default: () => [] },
    meta: { type: String, default: null },
    class: { type: String, default: null },
});

const copied = ref(false);

const copyCode = async () => {
    try {
        await navigator.clipboard.writeText(props.code || '');
        copied.value = true;
        setTimeout(() => {
            copied.value = false;
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
};
</script>

<style scoped>
.code-block {
    position: relative;
    margin: 1.5rem 0;
    border-radius: var(--card-radius);
    overflow: hidden;
    border: 1px solid rgba(var(--color-border), 0.4);
    background: rgba(var(--color-surface), 0.8);
    backdrop-filter: blur(12px);
    box-shadow: var(--shadow-lg), inset 0 1px 0 rgba(255, 255, 255, 0.03);
    transition: border-color var(--duration-base) var(--ease-smooth),
        box-shadow var(--duration-base) var(--ease-smooth);
}

.code-block:hover {
    border-color: rgba(var(--color-accent-blue), 0.25);
    box-shadow: var(--shadow-lg), var(--shadow-glow-blue);
}

/* Gradient top accent */
.code-block::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--gradient-accent);
    opacity: 0.6;
    z-index: 1;
}

.code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 1rem;
    background: rgba(var(--color-text), 0.03);
    border-bottom: 1px solid rgba(var(--color-border), 0.3);
}

.code-lang,
.code-filename {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(var(--color-text), 0.4);
}

.code-filename {
    color: rgba(var(--color-accent-blue), 0.7);
    text-transform: none;
    letter-spacing: normal;
}

.copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.7rem;
    font-weight: 600;
    color: rgba(var(--color-text), 0.4);
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all var(--duration-fast) var(--ease-smooth);
    opacity: 0;
}

.group:hover .copy-btn {
    opacity: 1;
}

.copy-btn:hover {
    color: rgba(var(--color-text), 0.8);
    background: rgba(var(--color-text), 0.06);
    border-color: rgba(var(--color-text), 0.1);
}

.copy-btn.copied {
    opacity: 1;
    color: rgb(var(--color-accent-emerald));
}

.copy-label {
    font-family: var(--font-sans);
}

.code-pre {
    margin: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    padding: 1.25rem 1.5rem !important;
    background: transparent !important;
    font-size: 0.8375rem;
    line-height: 1.75;
}

.code-pre :deep(code .line) {
    display: block;
}

.code-pre :deep(code .line.highlight) {
    background: rgba(var(--color-accent-blue), 0.08);
    margin: 0 -1.5rem;
    padding: 0 1.5rem;
    border-left: 2px solid rgba(var(--color-accent-blue), 0.5);
}
</style>
