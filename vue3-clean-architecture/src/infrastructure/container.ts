import { InMemoryBookRepository } from './in-memory/in-memory-book-repository'
import { InMemoryLoanRepository } from './in-memory/in-memory-loan-repository'
import { CATALOGUE_SEED } from './in-memory/catalogue-seed'
import { SystemClock } from './system-clock'
import { RandomIdGenerator } from './id-generator'

import { Member } from '@/domain/entities/member'
import { BorrowBook } from '@/domain/usecases/borrow-book'
import { ReturnBook } from '@/domain/usecases/return-book'
import { ListCatalogue } from '@/domain/usecases/list-catalogue'
import { ListMemberLoans } from '@/domain/usecases/list-member-loans'

export interface Container {
  borrowBook: BorrowBook
  returnBook: ReturnBook
  listCatalogue: ListCatalogue
  listMemberLoans: ListMemberLoans
  currentMember: Member
}

/**
 * The composition root: the one place that knows every concrete class. Nothing
 * else in the application imports an adapter directly, which is what makes
 * swapping the in-memory repositories for HTTP ones a single-file change.
 */
export function createContainer(): Container {
  const books = new InMemoryBookRepository(CATALOGUE_SEED)
  const loans = new InMemoryLoanRepository()
  const clock = new SystemClock()
  const ids = new RandomIdGenerator()

  return {
    borrowBook: new BorrowBook(books, loans, clock, ids),
    returnBook: new ReturnBook(loans, clock),
    listCatalogue: new ListCatalogue(books, loans),
    listMemberLoans: new ListMemberLoans(loans, books, clock),
    currentMember: Member.create({
      id: 'member-1',
      name: 'Ada Lovelace',
      loanAllowance: Member.DEFAULT_ALLOWANCE,
    }),
  }
}
