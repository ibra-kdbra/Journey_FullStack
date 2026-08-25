import type { BookRepository } from '../ports/book-repository'
import type { LoanRepository } from '../ports/loan-repository'
import type { Book } from '../entities/book'

export interface CatalogueEntry {
  book: Book
  availableCopies: number
  isAvailable: boolean
}

/**
 * Availability is computed here rather than stored on Book, which is why this is
 * a use case and not a repository method: it composes two sources.
 */
export class ListCatalogue {
  constructor(
    private readonly books: BookRepository,
    private readonly loans: LoanRepository,
  ) {}

  async execute(): Promise<CatalogueEntry[]> {
    const books = await this.books.findAll()

    return Promise.all(
      books.map(async (book) => {
        const onLoan = await this.loans.findOpenByBook(book.id)
        const availableCopies = Math.max(0, book.totalCopies - onLoan.length)
        return { book, availableCopies, isAvailable: availableCopies > 0 }
      }),
    )
  }
}
