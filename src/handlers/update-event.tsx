import { HandlerContext } from '@/types'
import { parseEventForm } from '@/utils/event-form'

export default async function updateEvent(c: HandlerContext) {
  const eventId = Number(c.req.param('id'))
  if (isNaN(eventId)) {
    return c.text('Event ID is required', 400)
  }

  const body = await c.req.formData()

  const parsed = parseEventForm(body)
  if (!parsed.ok) {
    return c.text(parsed.errors.join('\n'), 400)
  }

  const { eventService } = c.var
  const didUpdate = await eventService.update(eventId, parsed.value)

  if (!didUpdate) {
    return c.text('Event not found', 404)
  }

  c.res.headers.set('HX-Trigger', 'calendar:eventsChanged')
  return c.text('Event updated successfully')
}
