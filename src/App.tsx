import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useState } from 'react'
import AgendaPage from './components/AgendaPage'
import BookingDialog from './components/BookingDialog'
import EditAppointmentDialog from './components/EditAppointmentDialog'
import EditPatientDialog from './components/EditPatientDialog'
import PatientsPage from './components/PatientsPage'
import Sidebar from './components/Sidebar'
import { appointments, patients, type Appointment, type Patient } from './data'
import { fade } from './motion'
import { useCurrentPage } from './navigation'

const byTime = (a: Appointment, b: Appointment) => a.time.localeCompare(b.time)

export default function App() {
  const page = useCurrentPage()

  // The agenda starts with the fake data; bookings and edits are kept here (until the page reloads).
  // They live in App, not AgendaPage, so they survive switching to Patients and back.
  const [todaysAppointments, setTodaysAppointments] = useState(appointments)
  const [isBooking, setIsBooking] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = todaysAppointments.find((appt) => appt.id === selectedId)

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

  // Patients work the same way: edits are kept here until the page reloads
  const [patientList, setPatientList] = useState(patients)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const selectedPatient = patientList.find((patient) => patient.id === selectedPatientId)

  function updatePatient(id: number, changes: Omit<Patient, 'id'>) {
    setPatientList((list) => list.map((patient) => (patient.id === id ? { ...changes, id } : patient)))
    setSelectedPatientId(null)
  }

  function deletePatient(id: number) {
    setPatientList((list) => list.filter((patient) => patient.id !== id))
    setSelectedPatientId(null)
  }

  return (
    // reducedMotion="user": people who turn off animations in their system settings get only simple fades
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen">
        <Sidebar currentPage={page} />

        <main className="flex flex-1 flex-col px-16 py-14">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
            {/* Crossfade between screens */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={page} className="flex flex-1 flex-col" {...fade}>
                {page === 'patients' ? (
                  <PatientsPage
                    patients={patientList}
                    onSelect={(patient) => setSelectedPatientId(patient.id)}
                  />
                ) : (
                  <AgendaPage
                    appointments={todaysAppointments}
                    onBook={() => setIsBooking(true)}
                    onSelect={(appt) => setSelectedId(appt.id)}
                  />
                )}
              </motion.div>
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

        <AnimatePresence>
          {selectedPatient && (
            <EditPatientDialog
              key={selectedPatient.id}
              patient={selectedPatient}
              onSave={(changes) => updatePatient(selectedPatient.id, changes)}
              onDelete={() => deletePatient(selectedPatient.id)}
              onClose={() => setSelectedPatientId(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
