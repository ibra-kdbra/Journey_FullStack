import type { Book } from '../entities/book'

/**
 * Declared here, beside the use cases that consume it — not beside the in-memory
 * class that satisfies it. That direction is what makes the dependency rule hold:
 * infrastructure depends on the domain, never the reverse.
 */
export interface BookRepository {
  findAll(): Promise<Book[]>
  findById(id: string): Promise<Book | null>
}
