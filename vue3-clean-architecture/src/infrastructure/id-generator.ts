import type { IdGenerator } from '@/domain/ports/id-generator'

export class RandomIdGenerator implements IdGenerator {
  next(): string {
    return globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : `loan-${Math.random().toString(36).slice(2, 10)}`
  }
}

/** Predictable ids, so assertions can name the loan they expect. */
export class SequentialIdGenerator implements IdGenerator {
  private count = 0

  constructor(private readonly prefix = 'loan') {}

  next(): string {
    this.count += 1
    return `${this.prefix}-${this.count}`
  }
}
