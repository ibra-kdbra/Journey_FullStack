import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { createContainer } from '@/infrastructure/container'
import { DomainError } from '@/domain/errors'
import type { CatalogueEntry } from '@/domain/usecases/list-catalogue'
import type { MemberLoan } from '@/domain/usecases/list-member-loans'

/**
 * The store is a presentation adapter. It holds view state — what is loading,
 * what went wrong — and delegates every decision to a use case. No business rule
 * lives here; if one appears, it belongs in the domain instead.
 */
export const useLibraryStore = defineStore('library', () => {
  const container = createContainer()

  const catalogue = ref<CatalogueEntry[]>([])
  const loans = ref<MemberLoan[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const member = computed(() => container.currentMember)
  const openLoanCount = computed(() => loans.value.filter((entry) => entry.loan.isOpen).length)
  const remainingAllowance = computed(() =>
    Math.max(0, member.value.loanAllowance - openLoanCount.value),
  )

  async function refresh(): Promise<void> {
    isLoading.value = true
    try {
      catalogue.value = await container.listCatalogue.execute()
      loans.value = await container.listMemberLoans.execute(container.currentMember.id)
    } finally {
      isLoading.value = false
    }
  }

  /** Domain errors are expected outcomes, so they become messages, not crashes. */
  async function run(action: () => Promise<unknown>): Promise<void> {
    error.value = null
    try {
      await action()
      await refresh()
    } catch (caught) {
      if (caught instanceof DomainError) {
        error.value = caught.message
      } else {
        throw caught
      }
    }
  }

  async function borrow(bookId: string): Promise<void> {
    await run(() => container.borrowBook.execute({ bookId, member: container.currentMember }))
  }

  async function returnLoan(loanId: string): Promise<void> {
    await run(() => container.returnBook.execute({ loanId }))
  }

  function dismissError(): void {
    error.value = null
  }

  return {
    catalogue,
    loans,
    isLoading,
    error,
    member,
    openLoanCount,
    remainingAllowance,
    refresh,
    borrow,
    returnLoan,
    dismissError,
  }
})
