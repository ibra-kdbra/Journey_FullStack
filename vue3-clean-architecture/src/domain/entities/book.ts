import { InvalidBook } from '../errors'

export interface BookSnapshot {
  id: string
  title: string
  author: string
  totalCopies: number
}

/**
 * A book in the catalogue.
 *
 * Note what is *absent*: there is no `availableCopies` field. Availability is
 * derived from the open loans against this book, so there is exactly one source
 * of truth for it. An entity that caches derived state is an entity that can
 * disagree with itself.
 */
export class Book {
  private constructor(
    readonly id: string,
    readonly title: string,
    readonly author: string,
    readonly totalCopies: number,
  ) {}

  static create(snapshot: BookSnapshot): Book {
    const title = snapshot.title.trim()
    const author = snapshot.author.trim()

    if (!snapshot.id.trim()) throw new InvalidBook('id is required')
    if (!title) throw new InvalidBook('title is required')
    if (!author) throw new InvalidBook('author is required')
    if (!Number.isInteger(snapshot.totalCopies)) {
      throw new InvalidBook('totalCopies must be a whole number')
    }
    if (snapshot.totalCopies < 1) {
      throw new InvalidBook('a book needs at least one copy to be lendable')
    }

    return new Book(snapshot.id, title, author, snapshot.totalCopies)
  }

  toSnapshot(): BookSnapshot {
    return { id: this.id, title: this.title, author: this.author, totalCopies: this.totalCopies }
  }
}
