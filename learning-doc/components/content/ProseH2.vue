<template>
    <h2 :id="id" class="prose-h2 group relative">
        <a v-if="id" :href="`#${id}`" class="anchor-link" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
        </a>
        <slot />
    </h2>
</template>

<script setup>
defineProps({
    id: { type: String, required: false },
});
</script>

<style scoped>
.prose-h2 {
    font-size: 1.75rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.3;
    margin-top: 3rem;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    padding-left: 0;
    color: rgb(var(--color-text));
    position: relative;
    scroll-margin-top: 6rem;
    border-bottom: 1px solid rgba(var(--color-border), 0.4);
    transition: border-color var(--duration-base) var(--ease-smooth);
}

.prose-h2:hover {
    border-bottom-color: rgba(var(--color-accent-blue), 0.4);
}

.anchor-link {
    position: absolute;
    left: -1.75rem;
    top: 50%;
    transform: translateY(-50%) translateX(4px);
    opacity: 0;
    color: rgb(var(--color-accent-blue));
    transition: all var(--duration-base) var(--ease-smooth);
    text-decoration: none;
    padding: 0.25rem;
    border-radius: 0.375rem;
}

.prose-h2:hover .anchor-link {
    opacity: 0.7;
    transform: translateY(-50%) translateX(0);
}

.anchor-link:hover {
    opacity: 1 !important;
    background: rgba(var(--color-accent-blue), 0.08);
}
</style>
