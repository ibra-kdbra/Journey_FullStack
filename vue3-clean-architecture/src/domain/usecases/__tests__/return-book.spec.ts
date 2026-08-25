import { describe, it, expect, beforeEach } from 'vitest'
import { ReturnBook } from '../return-book'
import { Loan } from '../../entities/loan'
import { LoanAlreadyReturned, LoanNotFound } from '../../errors'
import { InMemoryLoanRepository } from '@/infrastructure/in-memory/in-memory-loan-repository'
import { FixedClock } from '@/infrastructure/system-clock'

const BORROWED_AT = new Date('2026-01-01T00:00:00Z')
const RETURNED_AT = new Date('2026-01-05T00:00:00Z')

describe('ReturnBook', () => {
  let loans: InMemoryLoanRepository
  let returnBook: ReturnBook

  beforeEach(() => {
    loans = new InMemoryLoanRepository([
      Loan.open({ id: 'loan-1', bookId: 'ddd', memberId: 'member-1', borrowedAt: BORROWED_AT }),
    ])
    returnBook = new ReturnBook(loans, new FixedClock(RETURNED_AT))
  })

  it('closes the loan and persists it', async () => {
    const returned = await returnBook.execute({ loanId: 'loan-1' })

    expect(returned.isOpen).toBe(false)
    expect(returned.returnedAt).toEqual(RETURNED_AT)
    expect((await loans.findById('loan-1'))?.isOpen).toBe(false)
  })

  it('rejects an unknown loan', async () => {
    await expect(returnBook.execute({ loanId: 'nope' })).rejects.toThrow(LoanNotFound)
  })

  it('rejects a second return, deferring to the entity rule', async () => {
    await returnBook.execute({ loanId: 'loan-1' })
    await expect(returnBook.execute({ loanId: 'loan-1' })).rejects.toThrow(LoanAlreadyReturned)
  })
})
