<script setup lang="ts">
import { computed } from 'vue'
import type { CatalogueEntry } from '@/domain/usecases/list-catalogue'

const props = defineProps<{ entry: CatalogueEntry; canBorrow: boolean }>()
const emit = defineEmits<{ borrow: [bookId: string] }>()

const disabled = computed(() => !props.entry.isAvailable || !props.canBorrow)

const reason = computed(() => {
  if (!props.entry.isAvailable) return 'Every copy is on loan'
  if (!props.canBorrow) return 'You have reached your loan allowance'
  return null
})
</script>

<template>
  <article class="card">
    <header>
      <h3>{{ entry.book.title }}</h3>
      <p class="author">{{ entry.book.author }}</p>
    </header>

    <p class="availability" :class="{ 'is-out': !entry.isAvailable }">
      <span aria-hidden="true">{{ entry.isAvailable ? '●' : '○' }}</span>
      {{ entry.availableCopies }} of {{ entry.book.totalCopies }} available
    </p>

    <button type="button" :disabled="disabled" @click="emit('borrow', entry.book.id)">
      Borrow
    </button>
    <p v-if="reason" class="reason">{{ reason }}</p>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background-soft);
}

h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-heading);
}

.author {
  margin: 4px 0 0;
  font-size: 0.875rem;
  color: var(--color-text);
  opacity: 0.75;
}

.availability {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-accent);
}

/* State is never colour alone — the ● / ○ glyph carries it too. */
.availability.is-out {
  color: var(--color-danger);
}

button {
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  background: var(--color-accent);
  color: var(--color-accent-contrast);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 160ms var(--ease-smooth);
}

button:hover:not(:disabled) {
  opacity: 0.88;
}

button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}

button:disabled {
  border-color: var(--color-border);
  background: var(--color-background-mute);
  color: var(--color-text);
  opacity: 0.6;
  cursor: not-allowed;
}

.reason {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text);
  opacity: 0.75;
}

@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}
</style>
