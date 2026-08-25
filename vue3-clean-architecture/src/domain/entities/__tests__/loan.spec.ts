import { describe, it, expect } from 'vitest'
import { Loan } from '../loan'
import { LoanAlreadyReturned } from '../../errors'

const BORROWED_AT = new Date('2026-01-01T00:00:00Z')
const daysAfter = (days: number) =>
  new Date(BORROWED_AT.getTime() + days * 24 * 60 * 60 * 1000)

const openLoan = () =>
  Loan.open({ id: 'loan-1', bookId: 'ddd', memberId: 'member-1', borrowedAt: BORROWED_AT })

describe('Loan', () => {
  it('is due after the standard loan period', () => {
    expect(openLoan().dueAt).toEqual(daysAfter(Loan.PERIOD_DAYS))
  })

  it('honours an explicit period', () => {
    const loan = Loan.open({
      id: 'loan-1',
      bookId: 'ddd',
      memberId: 'member-1',
      borrowedAt: BORROWED_AT,
      periodDays: 3,
    })
    expect(loan.dueAt).toEqual(daysAfter(3))
  })

  it('is not overdue on the due date itself', () => {
    expect(openLoan().isOverdue(daysAfter(Loan.PERIOD_DAYS))).toBe(false)
  })

  it('is overdue the moment the due date passes', () => {
    expect(openLoan().isOverdue(daysAfter(Loan.PERIOD_DAYS + 1))).toBe(true)
  })

  it('counts down the days remaining, going negative once late', () => {
    const loan = openLoan()
    expect(loan.daysUntilDue(daysAfter(4))).toBe(10)
    expect(loan.daysUntilDue(daysAfter(20))).toBe(-6)
  })

  it('returns a new closed loan and leaves the original untouched', () => {
    const loan = openLoan()
    const returned = loan.returnedOn(daysAfter(2))

    expect(returned.isOpen).toBe(false)
    expect(returned.returnedAt).toEqual(daysAfter(2))
    expect(loan.isOpen).toBe(true)
    expect(loan.returnedAt).toBeNull()
  })

  it('is never overdue once returned', () => {
    const returned = openLoan().returnedOn(daysAfter(2))
    expect(returned.isOverdue(daysAfter(90))).toBe(false)
  })

  it('refuses a second return', () => {
    const returned = openLoan().returnedOn(daysAfter(2))
    expect(() => returned.returnedOn(daysAfter(3))).toThrow(LoanAlreadyReturned)
  })
})
