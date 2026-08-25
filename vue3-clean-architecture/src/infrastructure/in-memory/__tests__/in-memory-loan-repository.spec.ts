import { describe, it, expect } from 'vitest'
import { InMemoryLoanRepository } from '../in-memory-loan-repository'
import { Loan } from '@/domain/entities/loan'

const NOW = new Date('2026-01-01T00:00:00Z')
const open = (id: string, bookId: string, memberId: string) =>
  Loan.open({ id, bookId, memberId, borrowedAt: NOW })

describe('InMemoryLoanRepository', () => {
  it('returns null for an id it has never seen', async () => {
    expect(await new InMemoryLoanRepository().findById('nope')).toBeNull()
  })

  it('saves by id, so re-saving replaces rather than duplicates', async () => {
    const repo = new InMemoryLoanRepository()
    const loan = open('l1', 'a', 'm1')

    await repo.save(loan)
    await repo.save(loan.returnedOn(NOW))

    expect((await repo.findById('l1'))?.isOpen).toBe(false)
    expect(await repo.findByMember('m1')).toHaveLength(1)
  })

  it('separates open loans by book and by member', async () => {
    const repo = new InMemoryLoanRepository([
      open('l1', 'a', 'm1'),
      open('l2', 'a', 'm2'),
      open('l3', 'b', 'm1'),
    ])

    expect((await repo.findOpenByBook('a')).map((l) => l.id)).toEqual(['l1', 'l2'])
    expect((await repo.findOpenByMember('m1')).map((l) => l.id)).toEqual(['l1', 'l3'])
  })

  it('excludes returned loans from the open queries but keeps them in the history', async () => {
    const repo = new InMemoryLoanRepository([open('l1', 'a', 'm1')])
    await repo.save(open('l1', 'a', 'm1').returnedOn(NOW))

    expect(await repo.findOpenByBook('a')).toHaveLength(0)
    expect(await repo.findOpenByMember('m1')).toHaveLength(0)
    expect(await repo.findByMember('m1')).toHaveLength(1)
  })
})
