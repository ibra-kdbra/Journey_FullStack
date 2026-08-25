import type { LoanRepository } from '../ports/loan-repository'
import type { Clock } from '../ports/clock'
import type { Loan } from '../entities/loan'
import { LoanNotFound } from '../errors'

export interface ReturnBookRequest {
  loanId: string
}

/**
 * Close an open loan. The "already returned" rule lives on the Loan entity, so
 * this use case does not restate it — it just lets the entity refuse.
 */
export class ReturnBook {
  constructor(
    private readonly loans: LoanRepository,
    private readonly clock: Clock,
  ) {}

  async execute({ loanId }: ReturnBookRequest): Promise<Loan> {
    const loan = await this.loans.findById(loanId)
    if (!loan) throw new LoanNotFound(loanId)

    const returned = loan.returnedOn(this.clock.now())
    await this.loans.save(returned)
    return returned
  }
}
