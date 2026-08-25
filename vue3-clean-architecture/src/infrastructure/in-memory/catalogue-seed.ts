import type { BookSnapshot } from '@/domain/entities/book'

export const CATALOGUE_SEED: BookSnapshot[] = [
  { id: 'clean-architecture', title: 'Clean Architecture', author: 'Robert C. Martin', totalCopies: 2 },
  { id: 'ddd', title: 'Domain-Driven Design', author: 'Eric Evans', totalCopies: 1 },
  { id: 'refactoring', title: 'Refactoring', author: 'Martin Fowler', totalCopies: 3 },
  { id: 'working-effectively', title: 'Working Effectively with Legacy Code', author: 'Michael Feathers', totalCopies: 1 },
  { id: 'tdd-by-example', title: 'Test-Driven Development by Example', author: 'Kent Beck', totalCopies: 2 },
]
