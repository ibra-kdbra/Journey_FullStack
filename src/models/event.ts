export type CalendarEvent = {
  id: number
  name: string
  startDay: Date
  startHour: number
  startMinute: number
  duration: number
  allDay: boolean
  color: string
  createdAt: Date
  updatedAt: Date
}

export type CalendarEventChanges = Omit<
  CalendarEvent,
  'id' | 'createdAt' | 'updatedAt'
>

// The color names that have a matching `event-*` / `form-color-*` CSS class
export const EVENT_COLORS = [
  'gray',
  'red',
  'amber',
  'green',
  'blue',
  'violet',
  'fuchsia',
] as const

export const MAX_EVENT_NAME_LENGTH = 100
