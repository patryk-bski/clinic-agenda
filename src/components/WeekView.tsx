import { Plus } from 'lucide-react'
import { addDays, toLocalDate } from '../dates'
import type { Appointment } from '../data'
import StatusBadge from './StatusBadge'

type Props = {
  monday: string // YYYY-MM-DD
  today: string // YYYY-MM-DD
  appointments: Appointment[] // any dates; only this week's are shown
  onSelect: (appointment: Appointment) => void
  onOpenDay: (date: string) => void
  onBookDay: (date: string) => void
}

// Monday to Friday side by side, each day's appointments as small cards in time order
export default function WeekView({
  monday,
  today,
  appointments,
  onSelect,
  onOpenDay,
  onBookDay,
}: Props) {
  const days = [0, 1, 2, 3, 4].map((offset) => addDays(monday, offset))

  return (
    <div className="grid grid-cols-5 gap-2 border-t border-line pt-4">
      {days.map((date) => {
        const isToday = date === today
        const day = toLocalDate(date)
        const longName = day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
        const ofDay = appointments
          .filter((appt) => appt.date === date)
          .sort((a, b) => a.time.localeCompare(b.time))
        return (
          <section key={date} aria-label={longName} className="group min-w-0">
            <div className="mb-2 flex items-center gap-1">
              {/* Day heading: click it to see that day on its own */}
              <button
                onClick={() => onOpenDay(date)}
                aria-label={`Open ${longName}`}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-[6px] px-2 py-1.5 text-left transition-colors hover:bg-hover"
              >
                <span className={`text-sm ${isToday ? 'font-medium' : 'text-muted'}`}>
                  {day.toLocaleDateString('en-GB', { weekday: 'short' })}
                </span>
                {/* Today's date sits in a dark square, like the sidebar's unread count */}
                <span
                  className={`rounded-[6px] px-1.5 text-sm leading-6 tabular-nums ${
                    isToday ? 'bg-brand font-medium text-white' : ''
                  }`}
                >
                  {day.getDate()}
                </span>
              </button>
              {/* Book straight onto this day. Hidden until you hover the day (or tab to it),
                  so the heading only shows the day */}
              <button
                onClick={() => onBookDay(date)}
                aria-label={`Book appointment on ${longName}`}
                title="Book on this day"
                className="flex size-8 shrink-0 items-center justify-center rounded-[6px] text-muted opacity-0 transition hover:bg-hover hover:text-ink group-hover:opacity-100 focus-visible:opacity-100"
              >
                <Plus size={16} strokeWidth={1.75} />
              </button>
            </div>

            <div className="space-y-1.5">
              {ofDay.map((appt) => (
                <button
                  key={appt.id}
                  onClick={() => onSelect(appt)}
                  aria-label={`Edit appointment: ${appt.time}, ${appt.patient}, ${appt.type}, ${appt.status}`}
                  className={`w-full rounded-[6px] border border-line bg-white p-2 text-left transition-colors hover:border-field ${
                    appt.status === 'cancelled' ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-medium tabular-nums">{appt.time}</span>
                    <StatusBadge status={appt.status} />
                  </div>
                  <div
                    className={`mt-1 truncate text-sm font-medium ${appt.status === 'cancelled' ? 'line-through' : ''}`}
                  >
                    {appt.patient}
                  </div>
                  <div className="truncate text-xs text-muted">{appt.type}</div>
                </button>
              ))}
              {ofDay.length === 0 && <p className="px-2 py-3 text-xs text-muted">No appointments</p>}
            </div>
          </section>
        )
      })}
    </div>
  )
}
