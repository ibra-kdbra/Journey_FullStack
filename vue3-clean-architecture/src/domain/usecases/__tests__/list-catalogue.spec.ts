import { describe, it, expect } from 'vitest'
import { ListCatalogue } from '../list-catalogue'
import { Loan } from '../../entities/loan'
import { InMemoryBookRepository } from '@/infrastructure/in-memory/in-memory-book-repository'
import { InMemoryLoanRepository } from '@/infrastructure/in-memory/in-memory-loan-repository'

const NOW = new Date('2026-01-01T00:00:00Z')

const books = () =>
  new InMemoryBookRepository([
    { id: 'b', title: 'Beta', author: 'A', totalCopies: 2 },
    { id: 'a', title: 'Alpha', author: 'B', totalCopies: 1 },
  ])

describe('ListCatalogue', () => {
  it('returns books sorted by title', async () => {
    const entries = await new ListCatalogue(books(), new InMemoryLoanRepository()).execute()
    expect(entries.map((e) => e.book.title)).toEqual(['Alpha', 'Beta'])
  })

  it('reports every copy available when nothing is on loan', async () => {
    const entries = await new ListCatalogue(books(), new InMemoryLoanRepository()).execute()
    expect(entries.map((e) => [e.book.id, e.availableCopies, e.isAvailable])).toEqual([
      ['a', 1, true],
      ['b', 2, true],
    ])
  })

  it('subtracts open loans and marks a fully-lent book unavailable', async () => {
    const loans = new InMemoryLoanRepository([
      Loan.open({ id: 'l1', bookId: 'a', memberId: 'm1', borrowedAt: NOW }),
      Loan.open({ id: 'l2', bookId: 'b', memberId: 'm1', borrowedAt: NOW }),
    ])

    const entries = await new ListCatalogue(books(), loans).execute()

    expect(entries.find((e) => e.book.id === 'a')).toMatchObject({
      availableCopies: 0,
      isAvailable: false,
    })
    expect(entries.find((e) => e.book.id === 'b')).toMatchObject({
      availableCopies: 1,
      isAvailable: true,
    })
  })

  it('ignores returned loans', async () => {
    const returned = Loan.open({
      id: 'l1',
      bookId: 'a',
      memberId: 'm1',
      borrowedAt: NOW,
    }).returnedOn(NOW)

    const entries = await new ListCatalogue(books(), new InMemoryLoanRepository([returned])).execute()

    expect(entries.find((e) => e.book.id === 'a')?.availableCopies).toBe(1)
  })
})
