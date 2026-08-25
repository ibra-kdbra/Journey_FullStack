import { describe, it, expect } from 'vitest'
import { Member } from '../member'
import { InvalidMember } from '../../errors'

const valid = { id: 'member-1', name: 'Ada Lovelace', loanAllowance: 3 }

describe('Member', () => {
  it('allows borrowing below the allowance', () => {
    const member = Member.create(valid)
    expect(member.canBorrowAlongside(0)).toBe(true)
    expect(member.canBorrowAlongside(2)).toBe(true)
  })

  it('refuses borrowing at or above the allowance', () => {
    const member = Member.create(valid)
    expect(member.canBorrowAlongside(3)).toBe(false)
    expect(member.canBorrowAlongside(4)).toBe(false)
  })

  it.each([
    ['a blank name', { ...valid, name: ' ' }],
    ['a zero allowance', { ...valid, loanAllowance: 0 }],
    ['a fractional allowance', { ...valid, loanAllowance: 2.5 }],
  ])('refuses %s', (_label, snapshot) => {
    expect(() => Member.create(snapshot)).toThrow(InvalidMember)
  })
})
