<script setup lang="ts">
import type { MemberLoan } from '@/domain/usecases/list-member-loans'

defineProps<{ entry: MemberLoan }>()
const emit = defineEmits<{ return: [loanId: string] }>()
</script>

<template>
  <li class="row">
    <div class="detail">
      <p class="title">{{ entry.book?.title ?? entry.loan.bookId }}</p>

      <p v-if="!entry.loan.isOpen" class="status returned">
        <span aria-hidden="true">✓</span> Returned
      </p>
      <p v-else-if="entry.isOverdue" class="status overdue">
        <span aria-hidden="true">!</span>
        Overdue by {{ Math.abs(entry.daysUntilDue) }} day(s)
      </p>
      <p v-else class="status due">
        <span aria-hidden="true">•</span> Due in {{ entry.daysUntilDue }} day(s)
      </p>
    </div>

    <button v-if="entry.loan.isOpen" type="button" @click="emit('return', entry.loan.id)">
      Return
    </button>
  </li>
</template>

<style scoped>
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.detail {
  min-width: 0;
}

.title {
  margin: 0;
  font-weight: 600;
  color: var(--color-heading);
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 0 0;
  font-size: 0.875rem;
}

.status.due {
  color: var(--color-text);
  opacity: 0.8;
}

.status.overdue {
  color: var(--color-danger);
  font-weight: 600;
}

.status.returned {
  color: var(--color-accent);
}

button {
  min-height: 44px;
  flex-shrink: 0;
  padding: 0 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-soft);
  color: var(--color-heading);
  font: inherit;
  cursor: pointer;
}

button:hover {
  border-color: var(--color-border-hover);
}

button:focus-visible {
  outline: 2px solid var(--color-focus);
  outline-offset: 2px;
}
</style>
