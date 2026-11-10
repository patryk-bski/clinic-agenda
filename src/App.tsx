import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useState } from 'react'
import AppointmentList from './components/AppointmentList'
import BookButton from './components/BookButton'
import BookingDialog from './components/BookingDialog'
import EditAppointmentDialog from './components/EditAppointmentDialog'
import EmptyState from './components/EmptyState'
import Sidebar from './components/Sidebar'
import { appointments, type Appointment } from './data'
import { fade } from './motion'

const byTime = (a: Appointment, b: Appointment) => a.time.localeCompare(b.time)

export default function App() {
  // The agenda starts with the fake data; bookings and edits are kept here (until the page reloads)
  const [todaysAppointments, setTodaysAppointments] = useState(appointments)
  const [isBooking, setIsBooking] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = todaysAppointments.find((appt) => appt.id === selectedId)
  const hasAppointments = todaysAppointments.length > 0

  function bookAppointment(appointment: Omit<Appointment, 'id'>) {
    setTodaysAppointments((list) => [...list, { ...appointment, id: Date.now() }].sort(byTime))
    setIsBooking(false)
  }

  function updateAppointment(id: number, changes: Omit<Appointment, 'id'>) {
    setTodaysAppointments((list) =>
      list.map((appt) => (appt.id === id ? { ...changes, id } : appt)).sort(byTime),
    )
    setSelectedId(null)
  }

  function deleteAppointment(id: number) {
    setTodaysAppointments((list) => list.filter((appt) => appt.id !== id))
    setSelectedId(null)
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    // reducedMotion="user": people who turn off animations in their system settings get only simple fades
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex flex-1 flex-col px-16 py-14">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
            <header className="mb-10 flex items-end justify-between">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">Today</h1>
                <p className="mt-2 text-sm text-muted">
                  {today} · {todaysAppointments.length}{' '}
                  {todaysAppointments.length === 1 ? 'appointment' : 'appointments'}
                </p>
              </div>
              <AnimatePresence initial={false}>
                {hasAppointments && (
                  <motion.div key="book" {...fade}>
                    <BookButton onClick={() => setIsBooking(true)} />
                  </motion.div>
                )}
              </AnimatePresence>
            </header>

            {/* Crossfade between the list and the empty state */}
            <AnimatePresence mode="wait" initial={false}>
              {hasAppointments ? (
                <motion.div key="list" {...fade}>
                  <AppointmentList
                    appointments={todaysAppointments}
                    onSelect={(appt) => setSelectedId(appt.id)}
                  />
                </motion.div>
              ) : (
                <motion.div key="empty" className="flex flex-1 flex-col" {...fade}>
                  <EmptyState onBook={() => setIsBooking(true)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* AnimatePresence keeps a closing popup on screen until its exit animation finishes */}
        <AnimatePresence>
          {isBooking && (
            <BookingDialog
              key="booking"
              onBook={bookAppointment}
              onClose={() => setIsBooking(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selected && (
            <EditAppointmentDialog
              key={selected.id}
              appointment={selected}
              onSave={(changes) => updateAppointment(selected.id, changes)}
              onDelete={() => deleteAppointment(selected.id)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
