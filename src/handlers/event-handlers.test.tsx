import { describe, expect, test } from 'bun:test'
import { Hono } from 'hono'
import { ContextVars } from '@/types'
import { CalendarEvent, CalendarEventChanges } from '@/models/event'
import { IEventService } from '@/services/event-service'
import createEvent from '@/handlers/create-event'
import updateEvent from '@/handlers/update-event'

function makeApp() {
  const calls: CalendarEventChanges[] = []
  const service: IEventService = {
    findById: async () => null,
    findBetween: async () => [],
    create: async (event) => {
      calls.push(event)
      return {
        id: 1,
        ...event,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as CalendarEvent
    },
    update: async (_id, event) => {
      calls.push(event)
      return true
    },
    delete: async () => true,
  }
  const app = new Hono<{ Variables: ContextVars }>()
  app.use('*', async (c, next) => {
    c.set('eventService', service)
    await next()
  })
  app.post('/events', createEvent)
  app.put('/events/:id', updateEvent)
  return { app, calls }
}

const valid = {
  name: 'Standup',
  startDay: '2025-03-09',
  startHour: '9',
  startMinute: '30',
  amPm: 'pm',
  duration: '45',
  color: 'blue',
}

function send(
  app: Hono<any>,
  method: 'POST' | 'PUT',
  fields: Record<string, string>
) {
  const url = method === 'POST' ? '/events' : '/events/7'
  return app.request(url, { method, body: new URLSearchParams(fields) })
}

describe.each(['POST', 'PUT'] as const)('%s handler validation', (method) => {
  test('accepts a valid form and converts PM to 24 hour time', async () => {
    const { app, calls } = makeApp()
    const res = await send(app, method, valid)
    expect(res.status).toBe(200)
    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatchObject({
      name: 'Standup',
      startHour: 21,
      startMinute: 30,
      duration: 45,
      allDay: false,
      color: 'blue',
    })
  })

  const invalidCases: [string, Record<string, string>][] = [
    ['impossible date', { startDay: '2025-02-31' }],
    ['malformed date', { startDay: 'abc' }],
    ['missing date', { startDay: '' }],
    ['non-numeric hour', { startHour: 'abc' }],
    ['empty hour', { startHour: '' }],
    ['hour out of range', { startHour: '24' }],
    ['minute out of range', { startMinute: '60' }],
    ['negative duration', { duration: '-5' }],
    ['non-numeric duration', { duration: 'x' }],
    ['unknown color', { color: 'pink; background:url(x)' }],
    ['empty name', { name: '   ' }],
    ['overlong name', { name: 'x'.repeat(101) }],
  ]

  test.each(invalidCases)(
    'returns 400 and does not save: %s',
    async (_label, override) => {
      const { app, calls } = makeApp()
      const res = await send(app, method, { ...valid, ...override })
      expect(res.status).toBe(400)
      expect(calls).toHaveLength(0)
    }
  )

  test('all-day events ignore the time fields', async () => {
    const { app, calls } = makeApp()
    const res = await send(app, method, {
      ...valid,
      allDay: 'on',
      startHour: '',
      duration: '',
    })
    expect(res.status).toBe(200)
    expect(calls[0]).toMatchObject({
      allDay: true,
      startHour: 0,
      startMinute: 0,
      duration: 0,
    })
  })
})
