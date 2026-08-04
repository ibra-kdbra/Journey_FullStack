<template>
    <div class="min-h-screen flex flex-col relative"
        :style="{ background: `rgb(var(--color-bg))`, color: `rgb(var(--color-text))` }">

        <CourseReadingProgressBar v-if="isCoursesPage" />
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
const isCoursesPage = computed(() => route.path.startsWith("/courses"));
</script>

<style>
.container {
    max-width: 76rem;
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
