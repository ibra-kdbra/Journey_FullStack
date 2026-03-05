<script setup lang="ts">
defineProps<{
    variant?: "default" | "outline" | "secondary" | "destructive";
}>();
</script>

<template>
    <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        :class="{
            'border-transparent bg-primary text-primary-foreground hover:bg-primary/80':
                variant === 'default' || !variant,
            'text-foreground': variant === 'outline',
            'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80':
                variant === 'secondary',
            'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80':
                variant === 'destructive',
        }">
        <slot />
    </div>
</template>
