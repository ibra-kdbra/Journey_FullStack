import type { BookRepository } from '../ports/book-repository'
import type { LoanRepository } from '../ports/loan-repository'
import type { Clock } from '../ports/clock'
import type { Loan } from '../entities/loan'
import type { Book } from '../entities/book'

export interface MemberLoan {
  loan: Loan
  book: Book | null
  isOverdue: boolean
  daysUntilDue: number
}

export class ListMemberLoans {
  constructor(
    private readonly loans: LoanRepository,
    private readonly books: BookRepository,
    private readonly clock: Clock,
  ) {}

  async execute(memberId: string): Promise<MemberLoan[]> {
    const now = this.clock.now()
    const loans = await this.loans.findByMember(memberId)

    const decorated = await Promise.all(
      loans.map(async (loan) => ({
        loan,
        book: await this.books.findById(loan.bookId),
        isOverdue: loan.isOverdue(now),
        daysUntilDue: loan.daysUntilDue(now),
      })),
    )

    // Open loans first, most urgent at the top; returned loans last.
    return decorated.sort((a, b) => {
      if (a.loan.isOpen !== b.loan.isOpen) return a.loan.isOpen ? -1 : 1
      return a.daysUntilDue - b.daysUntilDue
    })
  }
}
