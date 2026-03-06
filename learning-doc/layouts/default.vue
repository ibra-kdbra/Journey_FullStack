<template>
    <div class="min-h-screen flex flex-col relative overflow-x-hidden"
        :style="{ background: `rgb(var(--color-bg))`, color: `rgb(var(--color-text))` }">

        <!-- Ambient Background Decoration -->
        <div class="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
            <div class="blob absolute -top-40 -left-40 w-[500px] h-[500px]"
                :style="{ background: `rgba(var(--color-accent-blue), 0.12)` }" />
            <div class="blob absolute top-1/3 -right-40 w-[400px] h-[400px]" style="animation-delay: -4s;"
                :style="{ background: `rgba(var(--color-accent-violet), 0.1)` }" />
            <div class="blob absolute -bottom-20 left-1/3 w-[350px] h-[350px]" style="animation-delay: -2s;"
                :style="{ background: `rgba(var(--color-accent-rose), 0.08)` }" />
        </div>

        <DocsReadingProgressBar v-if="isDocsPage" />
        <CommonNavbar />
        <CommonSearchShortcut />

        <main class="flex-grow flex flex-col relative z-0">
            <slot />
        </main>

        <CommonFooter />
    </div>
</template>

<script setup lang="ts">
const route = useRoute();
const isDocsPage = computed(() => route.path.startsWith("/courses"));
</script>

<style>
.container {
    max-width: 72rem;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
}

@media (min-width: 640px) {
    .container {
        padding-left: 2rem;
        padding-right: 2rem;
    }
}
</style>
