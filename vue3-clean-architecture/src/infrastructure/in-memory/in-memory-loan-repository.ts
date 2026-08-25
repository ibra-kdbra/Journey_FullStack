import type { LoanRepository } from '@/domain/ports/loan-repository'
import type { Loan } from '@/domain/entities/loan'

export class InMemoryLoanRepository implements LoanRepository {
  private readonly loans = new Map<string, Loan>()

  constructor(seed: Loan[] = []) {
    for (const loan of seed) this.loans.set(loan.id, loan)
  }

  async save(loan: Loan): Promise<void> {
    this.loans.set(loan.id, loan)
  }

  async findById(id: string): Promise<Loan | null> {
    return this.loans.get(id) ?? null
  }

  async findOpenByBook(bookId: string): Promise<Loan[]> {
    return this.all().filter((loan) => loan.bookId === bookId && loan.isOpen)
  }

  async findOpenByMember(memberId: string): Promise<Loan[]> {
    return this.all().filter((loan) => loan.memberId === memberId && loan.isOpen)
  }

  async findByMember(memberId: string): Promise<Loan[]> {
    return this.all().filter((loan) => loan.memberId === memberId)
  }

  private all(): Loan[] {
    return [...this.loans.values()]
  }
}
