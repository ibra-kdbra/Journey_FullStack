<script setup lang="ts">
const props = defineProps<{
    ratio?: number
}>()
</script>

<template>
    <div class="relative w-full overflow-hidden" :style="{ paddingBottom: `${(1 / (ratio || 1)) * 100}%` }">
        <div class="absolute inset-0">
            <slot />
        </div>
    </div>
</template>
