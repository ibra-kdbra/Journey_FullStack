import { HandlerContext } from '@/types'
import EventCard from '@/components/calendar/EventCard'
import { parseEventForm } from '@/utils/event-form'

export default async function createEvent(c: HandlerContext) {
  const body = await c.req.formData()

  const parsed = parseEventForm(body)
  if (!parsed.ok) {
    return c.text(parsed.errors.join('\n'), 400)
  }

  const { eventService } = c.var
  const createdEvent = await eventService.create(parsed.value)

  c.res.headers.set('HX-Trigger', 'calendar:eventsChanged')

  return c.html(<EventCard event={createdEvent} />)
}
