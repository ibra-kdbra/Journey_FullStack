import { LoanAlreadyReturned } from '../errors'

export interface LoanSnapshot {
  id: string
  bookId: string
  memberId: string
  borrowedAt: Date
  dueAt: Date
  returnedAt: Date | null
}

/**
 * A loan is immutable. Returning one produces a new Loan rather than mutating
 * this one, so a caller holding a reference can never observe a value that has
 * silently changed underneath it.
 */
export class Loan {
  static readonly PERIOD_DAYS = 14
  private static readonly DAY_MS = 24 * 60 * 60 * 1000

  private constructor(
    readonly id: string,
    readonly bookId: string,
    readonly memberId: string,
    readonly borrowedAt: Date,
    readonly dueAt: Date,
    readonly returnedAt: Date | null,
  ) {}

  static open(params: {
    id: string
    bookId: string
    memberId: string
    borrowedAt: Date
    periodDays?: number
  }): Loan {
    const period = params.periodDays ?? Loan.PERIOD_DAYS
    const dueAt = new Date(params.borrowedAt.getTime() + period * Loan.DAY_MS)
    return new Loan(params.id, params.bookId, params.memberId, params.borrowedAt, dueAt, null)
  }

  static fromSnapshot(snapshot: LoanSnapshot): Loan {
    return new Loan(
      snapshot.id,
      snapshot.bookId,
      snapshot.memberId,
      snapshot.borrowedAt,
      snapshot.dueAt,
      snapshot.returnedAt,
    )
  }

  get isOpen(): boolean {
    return this.returnedAt === null
  }

  isOverdue(now: Date): boolean {
    return this.isOpen && now.getTime() > this.dueAt.getTime()
  }

  daysUntilDue(now: Date): number {
    return Math.ceil((this.dueAt.getTime() - now.getTime()) / Loan.DAY_MS)
  }

  /** Returns a new, closed Loan. Throws if this one is already closed. */
  returnedOn(now: Date): Loan {
    if (!this.isOpen) throw new LoanAlreadyReturned(this.id)
    return new Loan(this.id, this.bookId, this.memberId, this.borrowedAt, this.dueAt, now)
  }

  toSnapshot(): LoanSnapshot {
    return {
      id: this.id,
      bookId: this.bookId,
      memberId: this.memberId,
      borrowedAt: this.borrowedAt,
      dueAt: this.dueAt,
      returnedAt: this.returnedAt,
    }
  }
}
