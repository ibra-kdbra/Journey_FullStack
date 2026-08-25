import { describe, it, expect } from 'vitest'
import { ListMemberLoans } from '../list-member-loans'
import { Loan } from '../../entities/loan'
import { InMemoryBookRepository } from '@/infrastructure/in-memory/in-memory-book-repository'
import { InMemoryLoanRepository } from '@/infrastructure/in-memory/in-memory-loan-repository'
import { FixedClock } from '@/infrastructure/system-clock'

const START = new Date('2026-01-01T00:00:00Z')
const daysAfter = (d: number) => new Date(START.getTime() + d * 24 * 60 * 60 * 1000)

const books = new InMemoryBookRepository([
  { id: 'a', title: 'Alpha', author: 'A', totalCopies: 1 },
  { id: 'b', title: 'Beta', author: 'B', totalCopies: 1 },
])

const loan = (id: string, bookId: string, borrowedAt: Date) =>
  Loan.open({ id, bookId, memberId: 'm1', borrowedAt })

describe('ListMemberLoans', () => {
  it('returns only the requested member’s loans', async () => {
    const loans = new InMemoryLoanRepository([
      loan('l1', 'a', START),
      Loan.open({ id: 'l2', bookId: 'b', memberId: 'someone-else', borrowedAt: START }),
    ])

    const result = await new ListMemberLoans(loans, books, new FixedClock(START)).execute('m1')

    expect(result.map((r) => r.loan.id)).toEqual(['l1'])
  })

  it('attaches the book and flags overdue loans', async () => {
    const loans = new InMemoryLoanRepository([loan('l1', 'a', START)])
    const clock = new FixedClock(daysAfter(Loan.PERIOD_DAYS + 3))

    const [entry] = await new ListMemberLoans(loans, books, clock).execute('m1')

    expect(entry.book?.title).toBe('Alpha')
    expect(entry.isOverdue).toBe(true)
    expect(entry.daysUntilDue).toBe(-3)
  })

  it('sorts open loans before returned ones, most urgent first', async () => {
    const returned = loan('closed', 'a', START).returnedOn(daysAfter(1))
    const loans = new InMemoryLoanRepository([
      returned,
      loan('later', 'b', daysAfter(5)),
      loan('sooner', 'a', START),
    ])

    const result = await new ListMemberLoans(loans, books, new FixedClock(daysAfter(6))).execute('m1')

    expect(result.map((r) => r.loan.id)).toEqual(['sooner', 'later', 'closed'])
  })

  it('tolerates a loan whose book is no longer in the catalogue', async () => {
    const loans = new InMemoryLoanRepository([loan('l1', 'withdrawn', START)])

    const [entry] = await new ListMemberLoans(loans, books, new FixedClock(START)).execute('m1')

    expect(entry.book).toBeNull()
  })
})
