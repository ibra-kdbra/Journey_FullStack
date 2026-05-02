<script setup lang="ts">
import { ref } from "vue";
import { Check, Copy } from "lucide-vue-next";

const props = defineProps<{
    code: string;
}>();

const isCopied = ref(false);

const copy = async () => {
    await navigator.clipboard.writeText(props.code);
    isCopied.value = true;
    setTimeout(() => (isCopied.value = false), 2000);
};
</script>

<template>
    <button @click="copy"
        class="absolute right-4 top-4 z-10 rounded-xl p-2 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
        :title="isCopied ? 'Copied!' : 'Copy to clipboard'">
        <Check v-if="isCopied" :size="16" class="text-green-400" />
        <Copy v-else :size="16" class="text-slate-300" />
    </button>
</template>
