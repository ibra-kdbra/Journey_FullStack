import { InvalidMember } from '../errors'

export interface MemberSnapshot {
  id: string
  name: string
  loanAllowance: number
}

/**
 * How many books a member may hold at once is a property of the membership, not
 * a constant buried in a use case. Putting it here means a future "staff" or
 * "reference-only" membership changes one entity, not every rule that reads it.
 */
export class Member {
  static readonly DEFAULT_ALLOWANCE = 3

  private constructor(
    readonly id: string,
    readonly name: string,
    readonly loanAllowance: number,
  ) {}

  static create(snapshot: MemberSnapshot): Member {
    const name = snapshot.name.trim()

    if (!snapshot.id.trim()) throw new InvalidMember('id is required')
    if (!name) throw new InvalidMember('name is required')
    if (!Number.isInteger(snapshot.loanAllowance) || snapshot.loanAllowance < 1) {
      throw new InvalidMember('loanAllowance must be a whole number of at least 1')
    }

    return new Member(snapshot.id, name, snapshot.loanAllowance)
  }

  canBorrowAlongside(openLoanCount: number): boolean {
    return openLoanCount < this.loanAllowance
  }
}
