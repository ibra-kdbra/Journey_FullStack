<template>
    <h3 :id="id" class="prose-h3 group relative">
        <a v-if="id" :href="`#${id}`" class="anchor-link" aria-hidden="true">#</a>
        <span class="accent-bar" />
        <slot />
    </h3>
</template>

<script setup>
defineProps({
    id: { type: String, required: false },
});
</script>

<style scoped>
.prose-h3 {
    font-size: 1.375rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.4;
    margin-top: 2.25rem;
    margin-bottom: 0.75rem;
    padding-left: 1rem;
    color: rgb(var(--color-text));
    position: relative;
    scroll-margin-top: 6rem;
}

.accent-bar {
    position: absolute;
    left: 0;
    top: 0.15em;
    bottom: 0.15em;
    width: 3px;
    border-radius: 2px;
    background: var(--gradient-accent);
    opacity: 0.7;
    transition: opacity var(--duration-base) var(--ease-smooth);
}

.prose-h3:hover .accent-bar {
    opacity: 1;
}

.anchor-link {
    position: absolute;
    left: -1.25rem;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    color: rgb(var(--color-accent-blue));
    transition: opacity var(--duration-base) var(--ease-smooth);
    text-decoration: none;
    font-size: 0.875rem;
    font-weight: 400;
}

.prose-h3:hover .anchor-link {
    opacity: 0.5;
}

.anchor-link:hover {
    opacity: 1 !important;
}
</style>
