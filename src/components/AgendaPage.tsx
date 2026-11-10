import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  Search,
  Undo2,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { Appointment } from '../data'
import { addDays, dayName, mondayOf, toLocalDate } from '../dates'
import { fade, transition } from '../motion'
import { statusStyles, type Status } from '../status'
import AppointmentList from './AppointmentList'
import BookButton from './BookButton'
import EmptyState from './EmptyState'
import WeekView from './WeekView'

type Filter = 'all' | Status
export type AgendaView = 'day' | 'week'

// One tab per status, with an icon so the tabs aren't told apart by text alone
const filters: { value: Filter; label: string; icon?: typeof Clock }[] = [
  { value: 'all', label: 'All' },
  {
    value: 'confirmed',
    label: statusStyles.confirmed.label,
    icon: CircleCheck,
  },
  { value: 'waiting', label: statusStyles.waiting.label, icon: Clock },
  { value: 'cancelled', label: statusStyles.cancelled.label, icon: CircleX },
]

// Day and week changes: a gentle 24px slide in the direction of travel, with a crossfade.
// `custom` is the direction (1 later, -1 earlier, 0 view switch = fade only).
const slide = {
  initial: 'enter',
  animate: 'center',
  exit: 'exit',
  variants: {
    enter: (direction: number) => ({ opacity: 0, x: direction * 24 }),
    center: { opacity: 1, x: 0 },
    exit: (direction: number) => ({ opacity: 0, x: direction * -24 }),
  },
  transition,
}

const longDate = (date: string) =>
  toLocalDate(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
const dayMonth = (date: string) =>
  toLocalDate(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  })

type Props = {
  appointments: Appointment[] // all dates
  today: string // YYYY-MM-DD
  date: string // the day shown, or a day in the week shown
  view: AgendaView
  onDateChange: (date: string) => void
  onViewChange: (view: AgendaView) => void
  onBook: () => void
  onSelect: (appointment: Appointment) => void
  patientHref: (name: string) => string | undefined
}

export default function AgendaPage({
  appointments,
  today,
  date,
  view,
  onDateChange,
  onViewChange,
  onBook,
  onSelect,
  patientHref,
}: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')

  // Which way the last change went: 1 = to a later date, -1 = earlier, 0 = switched view.
  // Updated during render (React's "previous value" pattern) so the slide uses the new direction.
  const [last, setLast] = useState({ date, view, direction: 0 })
  if (last.date !== date || last.view !== view) {
    setLast({
      date,
      view,
      direction: last.view !== view ? 0 : date > last.date ? 1 : -1,
    })
  }
  const direction = last.direction

  const dayAppointments = appointments.filter((appt) => appt.date === date)
  const monday = mondayOf(date)
  const friday = addDays(monday, 4)
  const weekAppointments = appointments.filter((appt) => appt.date >= monday && appt.date <= friday)

  // e.g. "Today", "Thursday 12 November", "This week" or "Week of 16 November";
  // the exact date or range is shown in the date control below it
  const title =
    view === 'day'
      ? dayName(date, today)
      : monday === mondayOf(today)
        ? 'This week'
        : `Week of ${dayMonth(monday)}`

  const isShowingToday = view === 'day' ? date === today : monday === mondayOf(today)
  const step = view === 'day' ? 1 : 7

  // Day view only: status tab first, then the search (patient's name or appointment type)
  const search = query.trim().toLowerCase()
  const shown = dayAppointments.filter(
    (appt) =>
      (filter === 'all' || appt.status === filter) &&
      (appt.patient.toLowerCase().includes(search) || appt.type.toLowerCase().includes(search)),
  )

  const toolbarButton =
    'flex items-center justify-center px-2 py-1.5 text-sm transition-colors hover:bg-hover'

  // The navigator's label: "Tue 10 Nov", or "9–13 Nov" for a week
  const shortDate = (day: string) =>
    toLocalDate(day).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  const shortMonth = (day: string) =>
    toLocalDate(day).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    })
  const weekRangeShort =
    toLocalDate(monday).getMonth() === toLocalDate(friday).getMonth()
      ? `${toLocalDate(monday).getDate()}–${shortMonth(friday)}`
      : `${shortMonth(monday)} – ${shortMonth(friday)}`

  return (
    <>
      <header className="mb-6 flex items-center justify-between">
        {/* The title crossfades when the day or week changes */}
        <div className="relative">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h1 key={title} className="text-4xl font-semibold tracking-tight" {...fade}>
              {title}
            </motion.h1>
          </AnimatePresence>
        </div>
        <BookButton onClick={onBook} />
      </header>

      {/* Move between days or weeks, and switch between the two views */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* One joined control: previous │ the date shown (click it for a calendar) │ next */}
          <div className="flex items-stretch overflow-hidden rounded-[6px] border border-field bg-white text-sm">
            <button
              onClick={() => onDateChange(addDays(date, -step))}
              aria-label={view === 'day' ? 'Previous day' : 'Previous week'}
              className={`${toolbarButton} rounded-none focus-visible:-outline-offset-2`}
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            {/* Fixed width (fits the longest label, e.g. "30 Nov – 4 Dec"), so the arrows never move */}
            <label className="relative flex w-40 cursor-pointer items-center justify-center gap-2 border-x border-field px-3 font-medium whitespace-nowrap transition-colors hover:bg-hover has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-ink">
              {view === 'day' ? shortDate(date) : `${weekRangeShort}`}
              <CalendarDays size={15} strokeWidth={1.75} className="text-muted" aria-hidden />
              {/* An invisible date field over the label: clicking anywhere opens the browser's calendar */}
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  if (!e.target.value) return
                  onDateChange(e.target.value)
                  // Let go of focus once a date is picked, so the control doesn't stay outlined
                  e.target.blur()
                }}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker()
                  } catch {
                    // Older browsers without showPicker() still let you type the date
                  }
                }}
                aria-label="Choose a date"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            <button
              onClick={() => onDateChange(addDays(date, step))}
              aria-label={view === 'day' ? 'Next day' : 'Next week'}
              className={`${toolbarButton} rounded-none focus-visible:-outline-offset-2`}
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>

          {/* Only shown once you've moved away from today */}
          {!isShowingToday && (
            <button
              onClick={() => onDateChange(today)}
              className="group flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
            >
              <Undo2 size={15} strokeWidth={1.75} aria-hidden />
              <span className="underline-offset-2 group-hover:underline">Back to today</span>
            </button>
          )}
        </div>

        <div role="group" aria-label="View" className="flex rounded-[6px] bg-hover p-0.5">
          {(
            [
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
            ] as const
          ).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onViewChange(value)}
              aria-pressed={view === value}
              className={`rounded-[5px] px-3 py-1 text-sm transition-colors ${
                view === value
                  ? 'bg-white font-medium shadow-[0_1px_2px_rgba(0,0,0,0.08)]'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* The new day (or week) slides in from the direction you moved while the old one fades out
          the other way; "popLayout" lets them overlap, so there's no blank gap in between */}
      <div className="relative flex flex-1 flex-col">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          {view === 'week' ? (
            <motion.div key={`week-${monday}`} custom={direction} {...slide}>
              <WeekView
                monday={monday}
                today={today}
                appointments={weekAppointments}
                onSelect={onSelect}
                onOpenDay={(day) => {
                  onDateChange(day)
                  onViewChange('day')
                }}
              />
            </motion.div>
          ) : dayAppointments.length > 0 ? (
            <motion.div key={`day-${date}`} custom={direction} {...slide}>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                {/* Status tabs, each with how many appointments it holds; the selected one is underlined */}
                <div role="tablist" aria-label="Show" className="flex gap-4">
                  {filters.map(({ value, label, icon: Icon }) => {
                    const count =
                      value === 'all'
                        ? dayAppointments.length
                        : dayAppointments.filter((appt) => appt.status === value).length
                    const isCurrent = filter === value
                    return (
                      <button
                        key={value}
                        role="tab"
                        aria-selected={isCurrent}
                        onClick={() => setFilter(value)}
                        className={`flex items-center gap-1.5 border-b-2 py-1.5 text-sm transition-colors ${
                          isCurrent
                            ? 'border-ink font-medium'
                            : 'border-transparent text-muted hover:text-ink'
                        }`}
                      >
                        {Icon && <Icon size={15} strokeWidth={1.75} aria-hidden />}
                        {label} <span className="text-muted tabular-nums">{count}</span>
                      </button>
                    )
                  })}
                </div>

                <label className="flex w-64 items-center gap-2 rounded-[6px] border border-field bg-white px-2.5 py-1.5 text-sm transition-colors focus-within:border-ink">
                  <Search size={15} strokeWidth={1.75} className="shrink-0 text-muted" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search patient or type"
                    aria-label="Search appointments by patient or type"
                    className="min-w-0 flex-1 bg-transparent placeholder:text-muted focus:outline-none"
                  />
                </label>
              </div>

              <AppointmentList appointments={shown} onSelect={onSelect} patientHref={patientHref} />

              {shown.length === 0 && (
                <p className="py-10 text-center text-sm text-muted">
                  {search
                    ? `No appointments match “${query.trim()}”.`
                    : `No ${statusStyles[filter as Status].label.toLowerCase()} appointments ${
                        date === today ? 'today' : `on ${longDate(date)}`
                      }.`}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${date}`}
              className="flex flex-1 flex-col"
              custom={direction}
              {...slide}
            >
              <EmptyState
                title={
                  date === today ? 'No appointments today' : `No appointments on ${longDate(date)}`
                }
                onBook={onBook}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
