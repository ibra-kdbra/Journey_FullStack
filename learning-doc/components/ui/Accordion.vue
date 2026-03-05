<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

const props = defineProps<{
    items: {
        title: string
        content: string
        value: string
    }[]
}>()

const openItems = ref<string[]>([])

const toggleItem = (value: string) => {
    if (openItems.value.includes(value)) {
        openItems.value = openItems.value.filter(v => v !== value)
    } else {
        openItems.value.push(value)
    }
}
</script>

<template>
    <div class="w-full border-t border-slate-200 dark:border-slate-800">
        <div v-for="item in items" :key="item.value" class="border-b border-slate-200 dark:border-slate-800">
            <button @click="toggleItem(item.value)"
                class="flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:underline">
                <span>{{ item.title }}</span>
                <ChevronDown class="h-4 w-4 shrink-0 transition-transform duration-200"
                    :class="{ 'rotate-180': openItems.includes(item.value) }" />
            </button>
            <div v-show="openItems.includes(item.value)"
                class="overflow-hidden text-sm transition-all pb-4 animate-in fade-in slide-in-from-top-1">
                {{ item.content }}
            </div>
        </div>
    </div>
</template>
