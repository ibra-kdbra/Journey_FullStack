<template>
    <h4 :id="id" class="prose-h4">
        <slot />
    </h4>
</template>

<script setup>
defineProps({
    id: { type: String, required: false },
});
</script>

<style scoped>
.prose-h4 {
    font-size: 1.125rem;
    font-weight: 700;
    letter-spacing: -0.005em;
    line-height: 1.4;
    margin-top: 1.75rem;
    margin-bottom: 0.5rem;
    color: rgb(var(--color-text));
    scroll-margin-top: 6rem;
    position: relative;
    padding-left: 0.25rem;
}

.prose-h4::before {
    content: '◆';
    font-size: 0.5em;
    color: rgb(var(--color-accent-violet));
    margin-right: 0.5rem;
    opacity: 0.6;
    vertical-align: middle;
}
</style>
