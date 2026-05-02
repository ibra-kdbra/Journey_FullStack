<script setup lang="ts">
interface AvatarProps {
    src?: string;
    alt?: string;
    fallback?: string;
    size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<AvatarProps>(), {
    size: 'md'
})

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-24 w-24 text-xl'
}
</script>

<template>
    <div class="relative flex shrink-0 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        :class="sizeClasses[size]">
        <img v-if="src" :src="src" :alt="alt" class="aspect-square h-full w-full object-cover" />
        <div v-else class="flex h-full w-full items-center justify-center font-bold text-slate-500 uppercase">
            {{ fallback || alt?.charAt(0) || '?' }}
        </div>
    </div>
</template>
