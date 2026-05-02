<template>
    <NuxtLink v-if="isInternal" :to="href" class="prose-link internal">
        <slot />
    </NuxtLink>
    <a v-else :href="href" target="_blank" rel="noopener noreferrer" class="prose-link external">
        <slot />
        <svg class="external-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    </a>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    href: {
        type: String,
        default: "",
    },
    target: {
        type: String,
        default: undefined,
        required: false,
    },
});

const isInternal = computed(() => {
    if (!props.href) return true;
    return props.href.startsWith('/') || props.href.startsWith('#') || props.href.startsWith('.');
});
</script>

<style scoped>
.prose-link {
    color: rgb(var(--color-accent-blue));
    font-weight: 500;
    text-decoration: none;
    position: relative;
    transition: color var(--duration-fast) var(--ease-smooth);
    background-image: linear-gradient(rgb(var(--color-accent-blue)),
            rgb(var(--color-accent-blue)));
    background-size: 0% 1.5px;
    background-position: 0 100%;
    background-repeat: no-repeat;
    transition: background-size var(--duration-base) var(--ease-smooth),
        color var(--duration-fast) var(--ease-smooth);
    padding-bottom: 1px;
}

.prose-link:hover {
    background-size: 100% 1.5px;
    color: rgb(var(--color-accent-blue));
}

.external-icon {
    display: inline-block;
    margin-left: 0.2rem;
    vertical-align: middle;
    opacity: 0.5;
    transition: opacity var(--duration-fast) var(--ease-smooth),
        transform var(--duration-fast) var(--ease-smooth);
}

.prose-link.external:hover .external-icon {
    opacity: 1;
    transform: translate(1px, -1px);
}
</style>
