import {
  CalendarEventChanges,
  EVENT_COLORS,
  MAX_EVENT_NAME_LENGTH,
} from '@/models/event'
import { parseShortDate } from '@/utils/dates'
import { isPmString, isTrueString } from '@/utils/strings'

export type EventFormResult =
  | { ok: true; value: CalendarEventChanges }
  | { ok: false; errors: string[] }

const MAX_DURATION_MINUTES = 24 * 60

function getString(body: FormData, key: string): string | undefined {
  const value = body.get(key)
  return typeof value === 'string' ? value : undefined
}

// Strictly parses a non-negative integer; Number('') and Number(' ') are 0 and
// Number('abc') is NaN, neither of which is acceptable here.
function parseIntegerInRange(
  value: string | undefined,
  min: number,
  max: number
): number | undefined {
  if (value == null || !/^\d{1,5}$/.test(value.trim())) {
    return undefined
  }
  const n = Number(value.trim())
  return n >= min && n <= max ? n : undefined
}

/**
 * Validates the create/update event form and converts it to event changes.
 * Shared by both handlers so they cannot drift apart.
 */
export function parseEventForm(body: FormData): EventFormResult {
  const errors: string[] = []

  const name = (getString(body, 'name') ?? '').trim()
  if (name.length === 0 || name.length > MAX_EVENT_NAME_LENGTH) {
    errors.push(
      `Name is required and must be at most ${MAX_EVENT_NAME_LENGTH} characters`
    )
  }

  const startDay = parseShortDate((getString(body, 'startDay') ?? '').trim())
  if (!startDay) {
    errors.push('Start day must be a valid date in the format yyyy-mm-dd')
  }

  const color = getString(body, 'color')
  if (!color || !(EVENT_COLORS as readonly string[]).includes(color)) {
    errors.push(`Color must be one of: ${EVENT_COLORS.join(', ')}`)
  }

  const allDay = isTrueString(getString(body, 'allDay'))

  let startHour = 0
  let startMinute = 0
  let duration = 0

  if (!allDay) {
    const hour = parseIntegerInRange(getString(body, 'startHour'), 0, 23)
    const minute = parseIntegerInRange(getString(body, 'startMinute'), 0, 59)
    const length = parseIntegerInRange(
      getString(body, 'duration'),
      0,
      MAX_DURATION_MINUTES
    )

    if (hour === undefined)
      errors.push('Start hour must be a whole number from 0 to 23')
    if (minute === undefined)
      errors.push('Start minute must be a whole number from 0 to 59')
    if (length === undefined)
      errors.push(
        `Duration must be a whole number of minutes from 0 to ${MAX_DURATION_MINUTES}`
      )

    startHour = hour ?? 0
    startMinute = minute ?? 0
    duration = length ?? 0

    if (isPmString(getString(body, 'amPm')) && startHour < 12) {
      startHour += 12
    }
  }

  if (errors.length > 0 || !startDay || !color) {
    return { ok: false, errors }
  }

  return {
    ok: true,
    value: { name, startDay, startHour, startMinute, duration, allDay, color },
  }
}
