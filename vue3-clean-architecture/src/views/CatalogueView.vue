<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useLibraryStore } from '@/stores/library'
import BookCard from '@/components/BookCard.vue'

const store = useLibraryStore()
const { catalogue, isLoading, error, remainingAllowance } = storeToRefs(store)

onMounted(() => store.refresh())
</script>

<template>
  <section>
    <header class="head">
      <h2>Catalogue</h2>
      <p class="allowance">{{ remainingAllowance }} of {{ store.member.loanAllowance }} loans left</p>
    </header>

    <p v-if="error" class="error" role="alert">
      {{ error }}
      <button type="button" @click="store.dismissError()">Dismiss</button>
    </p>

    <p v-if="isLoading">Loading…</p>

    <div v-else class="grid">
      <BookCard
        v-for="entry in catalogue"
        :key="entry.book.id"
        :entry="entry"
        :can-borrow="remainingAllowance > 0"
        @borrow="store.borrow"
      />
    </div>
  </section>
</template>

<style scoped>
.head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
}

h2 {
  margin: 0;
  color: var(--color-heading);
}

.allowance {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.8;
}

.error {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin: 0 0 16px;
  padding: 12px 16px;
  border: 1px solid var(--color-danger);
  border-radius: 8px;
  color: var(--color-danger);
}

.error button {
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid currentColor;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.error button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

.grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
}
</style>
