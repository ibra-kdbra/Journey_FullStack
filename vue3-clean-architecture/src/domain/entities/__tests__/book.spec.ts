import { describe, it, expect } from 'vitest'
import { Book } from '../book'
import { InvalidBook } from '../../errors'

describe('Book', () => {
  const valid = { id: 'ddd', title: 'Domain-Driven Design', author: 'Eric Evans', totalCopies: 1 }

  it('trims whitespace off title and author', () => {
    const book = Book.create({ ...valid, title: '  Refactoring  ', author: '  Fowler  ' })
    expect(book.title).toBe('Refactoring')
    expect(book.author).toBe('Fowler')
  })

  it.each([
    ['a blank id', { ...valid, id: '   ' }],
    ['a blank title', { ...valid, title: '  ' }],
    ['a blank author', { ...valid, author: '' }],
    ['zero copies', { ...valid, totalCopies: 0 }],
    ['a negative copy count', { ...valid, totalCopies: -2 }],
    ['a fractional copy count', { ...valid, totalCopies: 1.5 }],
  ])('refuses %s', (_label, snapshot) => {
    expect(() => Book.create(snapshot)).toThrow(InvalidBook)
  })

  it('round-trips through a snapshot', () => {
    expect(Book.create(valid).toSnapshot()).toEqual(valid)
  })
})
