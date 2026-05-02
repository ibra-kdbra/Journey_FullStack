<script setup lang="ts">
const props = defineProps<{
    tabs: {
        label: string
        value: string
    }[]
}>()

const activeTab = ref(props.tabs[0]?.value)
</script>

<template>
    <div class="w-full">
        <div
            class="inline-flex h-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-muted-foreground mb-4">
            <button v-for="tab in tabs" :key="tab.value" @click="activeTab = tab.value"
                class="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                :class="activeTab === tab.value ? 'bg-white dark:bg-slate-950 text-foreground shadow-sm' : 'hover:bg-background/50 hover:text-foreground'">
                {{ tab.label }}
            </button>
        </div>

        <div v-for="tab in tabs" :key="tab.value">
            <div v-if="activeTab === tab.value"
                class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in duration-300">
                <slot :name="tab.value" />
            </div>
        </div>
    </div>
</template>
