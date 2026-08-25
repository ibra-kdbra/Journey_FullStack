import type { BookRepository } from '@/domain/ports/book-repository'
import { Book, type BookSnapshot } from '@/domain/entities/book'

/**
 * The in-memory adapter is not a test fixture that happens to ship — it is the
 * reference implementation of the port, and the app runs on it. A database
 * adapter would sit beside this file and satisfy the same interface.
 */
export class InMemoryBookRepository implements BookRepository {
  private readonly books = new Map<string, Book>()

  constructor(seed: BookSnapshot[] = []) {
    for (const snapshot of seed) {
      const book = Book.create(snapshot)
      this.books.set(book.id, book)
    }
  }

  async findAll(): Promise<Book[]> {
    return [...this.books.values()].sort((a, b) => a.title.localeCompare(b.title))
  }

  async findById(id: string): Promise<Book | null> {
    return this.books.get(id) ?? null
  }
}
