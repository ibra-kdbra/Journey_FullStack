import type { Clock } from '@/domain/ports/clock'

export class SystemClock implements Clock {
  now(): Date {
    return new Date()
  }
}

/** A clock frozen at a fixed instant. Used by tests to make time deterministic. */
export class FixedClock implements Clock {
  constructor(private current: Date) {}

  now(): Date {
    return this.current
  }

  advanceDays(days: number): void {
    this.current = new Date(this.current.getTime() + days * 24 * 60 * 60 * 1000)
  }
}
