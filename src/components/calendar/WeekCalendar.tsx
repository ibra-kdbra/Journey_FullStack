import addDays from 'date-fns/addDays'
import addWeeks from 'date-fns/addWeeks'
import isToday from 'date-fns/isToday'
import format from 'date-fns/format'
import { FC } from 'hono/jsx'
import { CalendarEvent } from '@/models/event'
import WeekNavigation from '@/components/calendar/WeekNavigation'
import DayCalendar from '@/components/calendar/DayCalendar'
import { mapRange } from '@/utils/arrays'
import { formatHour } from '@/utils/dates'

export interface WeekCalendarProps {
  startDate: Date
  events: CalendarEvent[]
}

const WeekCalendar: FC<WeekCalendarProps> = ({ startDate, events }) => {
  const monthName = format(startDate, 'MMMM')
  const year = format(startDate, 'yyyy')

  const dateString = format(startDate, 'yyyy-MM-dd')

  return (
    <div
      id="calendar"
      class="week-calendar"
      hx-get={`/events?date=${dateString}`}
      hx-swap="outerHTML"
      hx-trigger="calendar:eventsChanged from:body"
    >
      <div class="calendar-header">
        <div class="month-year-header">
          <span class="month-label">{monthName}</span>
          <span class="year-label">{year}</span>
          <button
            id="add-event-btn"
            class="toolbar-button"
            hx-get="/events/add"
            hx-target="body"
            hx-swap="beforeend"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d={`M 11 5 L 13 5 L 13 11 L 19 11 L 19 13 L 13 13 L 13 19 L 11 19 L 11 13 L 5 13 L 5 11 L 11 11 Z`}
              />
            </svg>
          </button>
        </div>
        <WeekNavigation
          prevWeek={addWeeks(startDate, -1)}
          nextWeek={addWeeks(startDate, 1)}
        />
      </div>
      <div class="day-grid">
        <div class="time-legend-grid">
          <div class="time-legend-cell">
            <label class="time-legend-label all-day-legend">all-day</label>
          </div>
          {
            // Since we're using a 24-hour clock, we can just create 24 cells
            // This is a workaround for the fact that we don't have a way to
            // do a for loop in JSX
            mapRange(24, (hour) => {
              return (
                <div class="time-legend-cell">
                  <label class="time-legend-label">{formatHour(hour)}</label>
                </div>
              )
            })
          }
        </div>
        {
          // Since we're using a 7-day week, we can just create 7 cells
          // This is a workaround for the fact that we don't have a way to
          // do a for loop in JSX
          mapRange(7, (dayOffset) => {
            // Filter events to only those that are on this day, and sort
            // them by start time
            const day = addDays(startDate, dayOffset)
            const dayEvents = events
              .filter((e) => e.startDay.getDay() === day.getDay())
              .sort(
                (a, b) =>
                  a.startHour + a.startMinute - (b.startHour + b.startMinute)
              )
            return (
              <div class="day-column">
                <div class="day-column-header">
                  <span>{format(day, 'EE')}</span>
                  <span class={isToday(day) ? 'today-date' : null}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div class="day-column-content">
                  <DayCalendar startDate={day} events={dayEvents} />
                </div>
              </div>
            )
          })
        }
      </div>
    </div>
  )
}

export default WeekCalendar
