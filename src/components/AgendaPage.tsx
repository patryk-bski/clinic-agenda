import { CircleCheck, CircleX, Clock, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { Appointment } from '../data'
import { fade } from '../motion'
import { statusStyles, type Status } from '../status'
import AppointmentList from './AppointmentList'
import BookButton from './BookButton'
import EmptyState from './EmptyState'

type Filter = 'all' | Status

// One tab per status, with an icon so the tabs aren't told apart by text alone
const filters: { value: Filter; label: string; icon?: typeof Clock }[] = [
  { value: 'all', label: 'All' },
  { value: 'confirmed', label: statusStyles.confirmed.label, icon: CircleCheck },
  { value: 'waiting', label: statusStyles.waiting.label, icon: Clock },
  { value: 'cancelled', label: statusStyles.cancelled.label, icon: CircleX },
]

type Props = {
  appointments: Appointment[]
  onBook: () => void
  onSelect: (appointment: Appointment) => void
}

export default function AgendaPage({ appointments, onBook, onSelect }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const hasAppointments = appointments.length > 0

  // Status tab first, then the search box: it matches the patient's name or the appointment type
  const search = query.trim().toLowerCase()
  const shown = appointments.filter(
    (appt) =>
      (filter === 'all' || appt.status === filter) &&
      (appt.patient.toLowerCase().includes(search) || appt.type.toLowerCase().includes(search)),
  )

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Today</h1>
          <p className="mt-2 text-sm text-muted">
            {today} · {appointments.length}{' '}
            {appointments.length === 1 ? 'appointment' : 'appointments'}
          </p>
        </div>
        <AnimatePresence initial={false}>
          {hasAppointments && (
            <motion.div key="book" {...fade}>
              <BookButton onClick={onBook} />
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Crossfade between the list and the empty state */}
      <AnimatePresence mode="wait" initial={false}>
        {hasAppointments ? (
          <motion.div key="list" {...fade}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              {/* Status tabs, each with how many appointments it holds; the selected one is underlined */}
              <div role="tablist" aria-label="Show" className="flex gap-4">
                {filters.map(({ value, label, icon: Icon }) => {
                  const count =
                    value === 'all'
                      ? appointments.length
                      : appointments.filter((appt) => appt.status === value).length
                  const isCurrent = filter === value
                  return (
                    <button
                      key={value}
                      role="tab"
                      aria-selected={isCurrent}
                      onClick={() => setFilter(value)}
                      className={`flex items-center gap-1.5 border-b-2 py-1.5 text-sm transition-colors ${
                        isCurrent ? 'border-ink font-medium' : 'border-transparent text-muted hover:text-ink'
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

            <AppointmentList appointments={shown} onSelect={onSelect} />

            {shown.length === 0 && (
              <p className="py-10 text-center text-sm text-muted">
                {search
                  ? `No appointments match “${query.trim()}”.`
                  : `No ${statusStyles[filter as Status].label.toLowerCase()} appointments today.`}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div key="empty" className="flex flex-1 flex-col" {...fade}>
            <EmptyState onBook={onBook} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
