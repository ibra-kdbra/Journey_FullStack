import type { BookRepository } from '../ports/book-repository'
import type { LoanRepository } from '../ports/loan-repository'
import type { Clock } from '../ports/clock'
import type { IdGenerator } from '../ports/id-generator'
import type { Member } from '../entities/member'
import { Loan } from '../entities/loan'
import { BookNotFound, LoanAllowanceExceeded, NoCopiesAvailable } from '../errors'

export interface BorrowBookRequest {
  bookId: string
  member: Member
}

/**
 * Lend one copy of one book to one member.
 *
 * Three rules, and nothing else: the book must exist, a copy must be free, and
 * the member must be under their allowance. Anything that is not one of those
 * belongs in a different use case.
 */
export class BorrowBook {
  constructor(
    private readonly books: BookRepository,
    private readonly loans: LoanRepository,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
  ) {}

  async execute({ bookId, member }: BorrowBookRequest): Promise<Loan> {
    const book = await this.books.findById(bookId)
    if (!book) throw new BookNotFound(bookId)

    const openForBook = await this.loans.findOpenByBook(bookId)
    if (openForBook.length >= book.totalCopies) throw new NoCopiesAvailable(bookId)

    const openForMember = await this.loans.findOpenByMember(member.id)
    if (!member.canBorrowAlongside(openForMember.length)) {
      throw new LoanAllowanceExceeded(member.id, member.loanAllowance)
    }

    const loan = Loan.open({
      id: this.ids.next(),
      bookId: book.id,
      memberId: member.id,
      borrowedAt: this.clock.now(),
    })

    await this.loans.save(loan)
    return loan
  }
}
