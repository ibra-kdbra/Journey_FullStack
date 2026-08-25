import { describe, it, expect, beforeEach } from 'vitest'
import { BorrowBook } from '../borrow-book'
import { Member } from '../../entities/member'
import { BookNotFound, LoanAllowanceExceeded, NoCopiesAvailable } from '../../errors'
import { InMemoryBookRepository } from '@/infrastructure/in-memory/in-memory-book-repository'
import { InMemoryLoanRepository } from '@/infrastructure/in-memory/in-memory-loan-repository'
import { FixedClock } from '@/infrastructure/system-clock'
import { SequentialIdGenerator } from '@/infrastructure/id-generator'

const NOW = new Date('2026-01-01T00:00:00Z')

describe('BorrowBook', () => {
  let books: InMemoryBookRepository
  let loans: InMemoryLoanRepository
  let clock: FixedClock
  let borrow: BorrowBook
  let member: Member

  beforeEach(() => {
    books = new InMemoryBookRepository([
      { id: 'single', title: 'Only Copy', author: 'A', totalCopies: 1 },
      { id: 'double', title: 'Two Copies', author: 'B', totalCopies: 2 },
    ])
    loans = new InMemoryLoanRepository()
    clock = new FixedClock(NOW)
    borrow = new BorrowBook(books, loans, clock, new SequentialIdGenerator())
    member = Member.create({ id: 'member-1', name: 'Ada', loanAllowance: 2 })
  })

  it('opens a loan dated by the injected clock', async () => {
    const loan = await borrow.execute({ bookId: 'single', member })

    expect(loan.id).toBe('loan-1')
    expect(loan.borrowedAt).toEqual(NOW)
    expect(loan.isOpen).toBe(true)
    expect(await loans.findById('loan-1')).not.toBeNull()
  })

  it('rejects an unknown book', async () => {
    await expect(borrow.execute({ bookId: 'nope', member })).rejects.toThrow(BookNotFound)
  })

  it('lends every copy, then refuses the next request', async () => {
    const other = Member.create({ id: 'member-2', name: 'Grace', loanAllowance: 2 })

    await borrow.execute({ bookId: 'double', member })
    await borrow.execute({ bookId: 'double', member: other })

    await expect(borrow.execute({ bookId: 'double', member })).rejects.toThrow(NoCopiesAvailable)
  })

  it('frees a copy again once one is returned', async () => {
    const loan = await borrow.execute({ bookId: 'single', member })
    await expect(borrow.execute({ bookId: 'single', member })).rejects.toThrow(NoCopiesAvailable)

    await loans.save(loan.returnedOn(NOW))

    await expect(borrow.execute({ bookId: 'single', member })).resolves.toBeDefined()
  })

  it('stops a member at their allowance', async () => {
    await borrow.execute({ bookId: 'single', member })
    await borrow.execute({ bookId: 'double', member })

    await expect(borrow.execute({ bookId: 'double', member })).rejects.toThrow(
      LoanAllowanceExceeded,
    )
  })

  it('counts only open loans against the allowance', async () => {
    const first = await borrow.execute({ bookId: 'single', member })
    await borrow.execute({ bookId: 'double', member })
    await loans.save(first.returnedOn(NOW))

    await expect(borrow.execute({ bookId: 'double', member })).resolves.toBeDefined()
  })
})
