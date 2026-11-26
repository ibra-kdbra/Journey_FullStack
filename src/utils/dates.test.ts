import { describe, expect, test } from 'bun:test'
import { parseShortDate } from '@/utils/dates'

describe('parseShortDate', () => {
  test('parses a valid date', () => {
    const d = parseShortDate('2025-03-09')!
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2025, 2, 9])
  })

  test('accepts the last day of a month, including leap days', () => {
    expect(parseShortDate('2025-04-30')).toBeDefined()
    expect(parseShortDate('2024-02-29')).toBeDefined()
  })

  test.each([
    '2025-02-31',
    '2025-02-29',
    '2025-04-31',
    '2025-06-31',
    '2025-13-01',
    '2025-00-10',
    '2025-01-00',
    '0000-01-01',
    'nope',
    '',
  ])('rejects %p', (value) => {
    expect(parseShortDate(value)).toBeUndefined()
  })
})
