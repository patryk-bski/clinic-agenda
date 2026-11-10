import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useEffect, useState } from 'react'
import AgendaPage from './components/AgendaPage'
import BillingPage from './components/billing/BillingPage'
import InvoiceDialog from './components/billing/InvoiceDialog'
import NewInvoiceDialog, { type NewInvoice } from './components/billing/NewInvoiceDialog'
import BookingDialog from './components/BookingDialog'
import ReportsPage from './components/reports/ReportsPage'
import EditAppointmentDialog from './components/EditAppointmentDialog'
import EditPatientDialog from './components/EditPatientDialog'
import InboxItemDialog from './components/InboxItemDialog'
import InboxPage from './components/InboxPage'
import PatientRecordPage from './components/PatientRecordPage'
import PatientsPage from './components/PatientsPage'
import SettingsPage from './components/SettingsPage'
import Sidebar from './components/Sidebar'
import { sampleInvoices, type Invoice } from './billing'
import { appointments, inboxItems, patients, type Appointment, type Patient } from './data'
import { fade } from './motion'
import { pageLinks, patientLink, useCurrentRoute } from './navigation'
import { initialNotes, visitHistory, type Note } from './records'
import { loadSettings, saveSettings, timeSlots } from './settings'

const byTime = (a: Appointment, b: Appointment) => a.time.localeCompare(b.time)

export default function App() {
  // The screen to show; patientId is set when a patient's record is open (#/patients/3)
  const route = useCurrentRoute()
  const page = route.page

  // Settings shape the rest of the app: the sidebar profile and the bookable times.
  // They're loaded from this browser on start and saved again whenever they change.
  const [settings, setSettings] = useState(loadSettings)
  const bookableTimes = timeSlots(settings)

  useEffect(() => saveSettings(settings), [settings])

  // The agenda starts with the fake data; bookings and edits are kept here (until the page reloads).
  // They live in App, not AgendaPage, so they survive switching to Patients and back.
  const [todaysAppointments, setTodaysAppointments] = useState(appointments)
  // The booking popup is open when this is set; `patient` pre-fills it (booking from a record)
  const [booking, setBooking] = useState<{ patient?: string } | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = todaysAppointments.find((appt) => appt.id === selectedId)

  function bookAppointment(appointment: Omit<Appointment, 'id'>) {
    setTodaysAppointments((list) => [...list, { ...appointment, id: Date.now() }].sort(byTime))
    setBooking(null)
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
    // Deleted from their own record: go back to the patient list
    if (route.patientId === id) window.location.hash = pageLinks.patients
  }

  // The patient whose record is open, if any
  const recordPatient = patientList.find((patient) => patient.id === route.patientId)

  // Appointments, inbox items and invoices store the patient's name; this finds their record
  const patientHref = (name: string) => {
    const patient = patientList.find((p) => p.name === name)
    return patient && patientLink(patient.id)
  }

  // Clinical notes per patient id, kept here until the page reloads
  const [notes, setNotes] = useState(initialNotes)
  const addNote = (patientId: number, text: string) =>
    setNotes((all) => ({
      ...all,
      [patientId]: [...(all[patientId] ?? []), { id: Date.now(), text, written: new Date() } satisfies Note],
    }))

  // Inbox: opening an item marks it as read; read/unread is kept here until the page reloads.
  // The clock is read once, so "received" times don't shift while the app is open.
  const [now] = useState(() => new Date())
  const [inbox, setInbox] = useState(inboxItems)
  const [openItemId, setOpenItemId] = useState<number | null>(null)
  const openItem = inbox.find((item) => item.id === openItemId)
  const unreadCount = inbox.filter((item) => !item.read).length

  const setRead = (id: number, read: boolean) =>
    setInbox((list) => list.map((item) => (item.id === id ? { ...item, read } : item)))

  function openInboxItem(id: number) {
    setRead(id, true)
    setOpenItemId(id)
  }

  function markUnread(id: number) {
    setRead(id, false)
    setOpenItemId(null)
  }

  // Replies are only kept here (until the page reloads); they aren't sent anywhere
  function replyTo(id: number, to: string, body: string) {
    setInbox((list) =>
      list.map((item) =>
        item.id === id
          ? { ...item, replies: [...(item.replies ?? []), { to, body, sentAt: new Date() }] }
          : item,
      ),
    )
  }

  // Billing: invoices are kept here (until the page reloads); payments and reminders aren't real
  const [invoices, setInvoices] = useState(() => sampleInvoices(now))
  const [openInvoiceId, setOpenInvoiceId] = useState<number | null>(null)
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false)
  const openInvoice = invoices.find((invoice) => invoice.id === openInvoiceId)

  const updateInvoice = (id: number, change: (invoice: Invoice) => Invoice) =>
    setInvoices((list) => list.map((invoice) => (invoice.id === id ? change(invoice) : invoice)))

  function createInvoice({ patient, payer, lines, dueInDays }: NewInvoice) {
    const id = Math.max(0, ...invoices.map((invoice) => invoice.id)) + 1
    const issued = new Date()
    const due = new Date(issued.getTime() + dueInDays * 24 * 60 * 60 * 1000)
    setInvoices((list) => [
      ...list,
      { id, number: `INV-${id}`, patient, payer, lines, issued, due, reminders: [] },
    ])
    setIsCreatingInvoice(false)
    setOpenInvoiceId(id) // show the new invoice straight away
  }

  return (
    // reducedMotion="user": people who turn off animations in their system settings get only simple fades
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen">
        <Sidebar
          currentPage={page}
          clinicianName={settings.clinicianName}
          specialty={settings.specialty}
          unreadCount={unreadCount}
        />

        {/* min-w-0 lets the content area shrink to the window, so long one-line text is cut off with "…" */}
        <main className="flex min-w-0 flex-1 flex-col px-16 py-14">
          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
            {/* Crossfade between screens */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${page}-${route.patientId ?? ''}`} className="flex flex-1 flex-col" {...fade}>
                {page === 'settings' ? (
                  <SettingsPage settings={settings} onChange={setSettings} />
                ) : page === 'inbox' ? (
                  <InboxPage
                    items={inbox}
                    now={now}
                    onOpen={(item) => openInboxItem(item.id)}
                    onMarkAllRead={() => setInbox((list) => list.map((item) => ({ ...item, read: true })))}
                  />
                ) : page === 'billing' ? (
                  <BillingPage
                    invoices={invoices}
                    now={now}
                    onOpen={(invoice) => setOpenInvoiceId(invoice.id)}
                    onNew={() => setIsCreatingInvoice(true)}
                  />
                ) : page === 'reports' ? (
                  <ReportsPage todaysAppointments={todaysAppointments} />
                ) : page === 'patients' && route.patientId !== undefined ? (
                  recordPatient ? (
                    <PatientRecordPage
                      patient={recordPatient}
                      now={now}
                      appointments={todaysAppointments.filter((appt) => appt.patient === recordPatient.name)}
                      visits={visitHistory[recordPatient.id] ?? []}
                      notes={notes[recordPatient.id] ?? []}
                      inboxItems={inbox.filter((item) => item.patient === recordPatient.name)}
                      invoices={invoices.filter((invoice) => invoice.patient === recordPatient.name)}
                      onEdit={() => setSelectedPatientId(recordPatient.id)}
                      onBook={() => setBooking({ patient: recordPatient.name })}
                      onOpenAppointment={(appt) => setSelectedId(appt.id)}
                      onAddNote={(text) => addNote(recordPatient.id, text)}
                      onOpenInboxItem={(item) => openInboxItem(item.id)}
                      onOpenInvoice={(invoice) => setOpenInvoiceId(invoice.id)}
                    />
                  ) : (
                    <div className="py-20 text-center">
                      <p className="text-sm text-muted">This patient isn't in your list.</p>
                      <a href={pageLinks.patients} className="mt-2 inline-block text-sm underline underline-offset-2">
                        Back to all patients
                      </a>
                    </div>
                  )
                ) : page === 'patients' ? (
                  <PatientsPage patients={patientList} />
                ) : (
                  <AgendaPage
                    appointments={todaysAppointments}
                    onBook={() => setBooking({})}
                    onSelect={(appt) => setSelectedId(appt.id)}
                    patientHref={patientHref}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* AnimatePresence keeps a closing popup on screen until its exit animation finishes */}
        <AnimatePresence>
          {booking && (
            <BookingDialog
              key="booking"
              times={bookableTimes}
              patient={booking.patient}
              onBook={bookAppointment}
              onClose={() => setBooking(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selected && (
            <EditAppointmentDialog
              key={selected.id}
              appointment={selected}
              times={bookableTimes}
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

        <AnimatePresence>
          {openItem && (
            <InboxItemDialog
              key={openItem.id}
              item={openItem}
              now={now}
              onMarkUnread={() => markUnread(openItem.id)}
              onReply={(to, body) => replyTo(openItem.id, to, body)}
              onClose={() => setOpenItemId(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {openInvoice && (
            <InvoiceDialog
              key={openInvoice.id}
              invoice={openInvoice}
              now={now}
              onMarkPaid={(method) =>
                updateInvoice(openInvoice.id, (invoice) => ({ ...invoice, paid: { on: new Date(), method } }))
              }
              onMarkUnpaid={() => updateInvoice(openInvoice.id, (invoice) => ({ ...invoice, paid: undefined }))}
              onSendReminder={() =>
                updateInvoice(openInvoice.id, (invoice) => ({
                  ...invoice,
                  reminders: [...invoice.reminders, new Date()],
                }))
              }
              onClose={() => setOpenInvoiceId(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCreatingInvoice && (
            <NewInvoiceDialog
              key="new-invoice"
              patientNames={patientList.map((patient) => patient.name)}
              onCreate={createInvoice}
              onClose={() => setIsCreatingInvoice(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
