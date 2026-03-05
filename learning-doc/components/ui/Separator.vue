<script setup lang="ts">
const props = defineProps<{
    orientation?: 'horizontal' | 'vertical'
}>()
</script>

<template>
    <div class="shrink-0 bg-slate-200 dark:bg-slate-800"
        :class="orientation === 'vertical' ? 'h-full w-[1px]' : 'h-[1px] w-full'" />
</template>
