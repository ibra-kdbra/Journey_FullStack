/**
 * Domain errors are part of the domain vocabulary, not transport concerns.
 * They carry no HTTP status and no framework type — the outer layers decide how
 * to present them.
 */
export abstract class DomainError extends Error {
  protected constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export class InvalidBook extends DomainError {
  constructor(reason: string) {
    super(`Invalid book: ${reason}`)
  }
}

export class InvalidMember extends DomainError {
  constructor(reason: string) {
    super(`Invalid member: ${reason}`)
  }
}

export class BookNotFound extends DomainError {
  constructor(readonly bookId: string) {
    super(`No book with id "${bookId}".`)
  }
}

export class LoanNotFound extends DomainError {
  constructor(readonly loanId: string) {
    super(`No loan with id "${loanId}".`)
  }
}

export class NoCopiesAvailable extends DomainError {
  constructor(readonly bookId: string) {
    super(`Every copy of "${bookId}" is on loan.`)
  }
}

export class LoanAllowanceExceeded extends DomainError {
  constructor(readonly memberId: string, readonly allowance: number) {
    super(`Member "${memberId}" already holds the maximum of ${allowance} loans.`)
  }
}

export class LoanAlreadyReturned extends DomainError {
  constructor(readonly loanId: string) {
    super(`Loan "${loanId}" was already returned.`)
  }
}
