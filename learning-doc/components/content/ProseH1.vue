<template>
    <h1 :id="id" class="prose-h1 group relative">
        <a v-if="id" :href="`#${id}`"
            class="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-[rgb(var(--color-accent-blue))] no-underline"
            aria-hidden="true">
            #
        </a>
        <span class="prose-h1-text">
            <slot />
        </span>
    </h1>
</template>

<script setup>
defineProps({
    id: { type: String, required: false },
});
</script>

<style scoped>
.prose-h1 {
    font-size: 2.25rem;
    font-weight: 900;
    letter-spacing: -0.03em;
    line-height: 1.2;
    margin-top: 0;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid transparent;
    background-image: linear-gradient(to right, rgba(var(--color-accent-blue), 0.3), rgba(var(--color-accent-violet), 0.15), transparent);
    background-size: 100% 2px;
    background-position: bottom;
    background-repeat: no-repeat;
    color: rgb(var(--color-text));
    animation: fade-up 0.5s var(--ease-smooth) both;
    scroll-margin-top: 6rem;
}

.prose-h1-text {
    background: linear-gradient(135deg, rgb(var(--color-text)) 0%, rgb(var(--color-text)) 60%, rgb(var(--color-accent-blue)) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}
</style>
