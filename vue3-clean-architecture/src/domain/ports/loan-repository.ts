import type { Loan } from '../entities/loan'

export interface LoanRepository {
  save(loan: Loan): Promise<void>
  findById(id: string): Promise<Loan | null>
  findOpenByBook(bookId: string): Promise<Loan[]>
  findOpenByMember(memberId: string): Promise<Loan[]>
  findByMember(memberId: string): Promise<Loan[]>
}
