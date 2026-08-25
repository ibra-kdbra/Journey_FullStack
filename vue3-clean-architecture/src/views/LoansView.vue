<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useLibraryStore } from '@/stores/library'
import LoanRow from '@/components/LoanRow.vue'

const store = useLibraryStore()
const { loans, isLoading } = storeToRefs(store)

onMounted(() => store.refresh())
</script>

<template>
  <section>
    <h2>{{ store.member.name }}'s loans</h2>

    <p v-if="isLoading">Loading…</p>
    <p v-else-if="loans.length === 0" class="empty">
      Nothing borrowed yet. Pick something from the catalogue.
    </p>

    <ul v-else class="list">
      <LoanRow
        v-for="entry in loans"
        :key="entry.loan.id"
        :entry="entry"
        @return="store.returnLoan"
      />
    </ul>
  </section>
</template>

<style scoped>
h2 {
  margin: 0 0 16px;
  color: var(--color-heading);
}

.empty {
  color: var(--color-text);
  opacity: 0.8;
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
