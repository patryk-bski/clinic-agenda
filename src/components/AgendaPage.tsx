import { AnimatePresence, motion } from 'motion/react'
import type { Appointment } from '../data'
import { fade } from '../motion'
import AppointmentList from './AppointmentList'
import BookButton from './BookButton'
import EmptyState from './EmptyState'

type Props = {
  appointments: Appointment[]
  onBook: () => void
  onSelect: (appointment: Appointment) => void
}

export default function AgendaPage({ appointments, onBook, onSelect }: Props) {
  const hasAppointments = appointments.length > 0

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
            <AppointmentList appointments={appointments} onSelect={onSelect} />
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
