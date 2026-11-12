import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'
import AgendaPage, { type AgendaView } from './components/AgendaPage'
import BillingPage from './components/billing/BillingPage'
import InvoiceDialog from './components/billing/InvoiceDialog'
import NewInvoiceDialog, { type NewInvoice } from './components/billing/NewInvoiceDialog'
import BookingDialog from './components/BookingDialog'
import ReportsPage from './components/reports/ReportsPage'
import EditAppointmentDialog from './components/EditAppointmentDialog'
import EditPatientDialog from './components/EditPatientDialog'
import InboxItemDialog from './components/InboxItemDialog'
import InboxPage from './components/InboxPage'
import NewMessageDialog from './components/NewMessageDialog'
import NewPatientDialog from './components/NewPatientDialog'
import SentMessageDialog from './components/SentMessageDialog'
import PatientRecordPage from './components/PatientRecordPage'
import PatientsPage from './components/PatientsPage'
import SettingsPage from './components/SettingsPage'
import Sidebar from './components/Sidebar'
import Toast, { type ToastMessage } from './components/Toast'
import { sampleInvoices, type Invoice } from './billing'
import {
  inboxItems,
  patients,
  sampleAppointments,
  type Appointment,
  type Patient,
  type SentMessage,
} from './data'
import { sentEntries, type SentEntry } from './inbox'
import { shortDayName, todayIso } from './dates'
import { entrance, fade } from './motion'
import { pageLinks, patientLink, useCurrentRoute } from './navigation'
import { initialNotes, visitHistory, type Note } from './records'
import { loadSettings, saveSettings, timeSlots } from './settings'

// Earliest first: by date, then by time
const byDateTime = (a: Appointment, b: Appointment) =>
  a.date.localeCompare(b.date) || a.time.localeCompare(b.time)

export default function App() {
  // The screen to show; patientId is set when a patient's record is open (#/patients/3)
  const route = useCurrentRoute()
  const page = route.page

  // Settings shape the rest of the app: the sidebar profile and the bookable times.
  // They're loaded from this browser on start and saved again whenever they change.
  const [settings, setSettings] = useState(loadSettings)
  const bookableTimes = timeSlots(settings)

  useEffect(() => saveSettings(settings), [settings])

  // Today's date, read once when the app opens
  const [today] = useState(todayIso)

  // The note at the bottom confirming the last action ("Appointment booked · Undo").
  // A new one replaces the old one; `undo` puts things back the way they were.
  const [toast, setToast] = useState<ToastMessage | null>(null)
  const notify = (text: string, undo?: () => void) => setToast({ id: Date.now(), text, undo })
  // Stable, so the note's 5-second timer isn't restarted every time the app redraws
  const dismissToast = useCallback(() => setToast(null), [])

  // The agenda starts with the fake data; bookings and edits are kept here (until the page reloads).
  // They live in App, not AgendaPage, so they survive switching to Patients and back.
  const [appointmentList, setAppointmentList] = useState(() => sampleAppointments(today).sort(byDateTime))
  const todaysAppointments = appointmentList.filter((appt) => appt.date === today)
  // Which day the Agenda shows, and whether as a single day or the whole week
  const [agendaDate, setAgendaDate] = useState(today)
  const [agendaView, setAgendaView] = useState<AgendaView>('day')
  // The booking popup is open when this is set; it starts on `date`, and `patient` pre-fills it
  const [booking, setBooking] = useState<{ date: string; patient?: string } | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = appointmentList.find((appt) => appt.id === selectedId)

  function bookAppointment(appointment: Omit<Appointment, 'id'>) {
    const id = Date.now()
    setAppointmentList((list) => [...list, { ...appointment, id }].sort(byDateTime))
    setBooking(null)
    // e.g. "Booked Sofia Rossi, today at 15:30" or "…, Fri 20 Nov at 09:00"
    const day = shortDayName(appointment.date, today)
    notify(
      `Booked ${appointment.patient}, ${day === 'Today' || day === 'Tomorrow' ? day.toLowerCase() : day} at ${appointment.time}`,
      () => setAppointmentList((list) => list.filter((appt) => appt.id !== id)),
    )
  }

  // Puts an appointment back as it was (after an edit or a delete)
  const restoreAppointment = (previous: Appointment) =>
    setAppointmentList((list) =>
      [...list.filter((appt) => appt.id !== previous.id), previous].sort(byDateTime),
    )

  function updateAppointment(id: number, changes: Omit<Appointment, 'id'>) {
    const previous = appointmentList.find((appt) => appt.id === id)
    setAppointmentList((list) =>
      list.map((appt) => (appt.id === id ? { ...changes, id } : appt)).sort(byDateTime),
    )
    setSelectedId(null)
    if (previous) notify('Appointment saved', () => restoreAppointment(previous))
  }

  function deleteAppointment(id: number) {
    const previous = appointmentList.find((appt) => appt.id === id)
    setAppointmentList((list) => list.filter((appt) => appt.id !== id))
    setSelectedId(null)
    if (previous) notify('Appointment deleted', () => restoreAppointment(previous))
  }

  // Patients work the same way: edits are kept here until the page reloads
  const [patientList, setPatientList] = useState(patients)
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)
  const selectedPatient = patientList.find((patient) => patient.id === selectedPatientId)

  function updatePatient(id: number, changes: Omit<Patient, 'id'>) {
    const previous = patientList.find((patient) => patient.id === id)
    if (!previous) return
    const replace = (with_: Patient) =>
      setPatientList((list) => list.map((patient) => (patient.id === id ? with_ : patient)))
    replace({ ...changes, id })
    const renamed = previous.name !== changes.name
    if (renamed) renamePatientEverywhere(previous.name, changes.name)
    setSelectedPatientId(null)
    // Undo also changes the name back everywhere it was copied to
    notify('Patient details saved', () => {
      replace(previous)
      if (renamed) renamePatientEverywhere(changes.name, previous.name)
    })
  }

  // Appointments, inbox items, sent messages and invoices store the patient's name, so a rename
  // is copied to all of them; otherwise they'd lose their link to the patient's record.
  // (Names are unique: New patient and Edit patient both refuse a name that's already taken.)
  function renamePatientEverywhere(oldName: string, newName: string) {
    const rename = (name: string) => (name === oldName ? newName : name)
    setAppointmentList((list) => list.map((appt) => ({ ...appt, patient: rename(appt.patient) })))
    setInbox((list) =>
      list.map((item) => ({
        ...item,
        patient: rename(item.patient),
        from: rename(item.from), // a message the patient sent
        replies: item.replies?.map((reply) => ({ ...reply, to: rename(reply.to) })),
      })),
    )
    setSentMessages((list) => list.map((message) => ({ ...message, to: rename(message.to) })))
    setInvoices((list) => list.map((invoice) => ({ ...invoice, patient: rename(invoice.patient) })))
  }

  // "New patient" on the Patients screen
  const [isAddingPatient, setIsAddingPatient] = useState(false)

  function addPatient(patient: Omit<Patient, 'id'>) {
    const id = Math.max(0, ...patientList.map((p) => p.id)) + 1
    setPatientList((list) => [...list, { ...patient, id }])
    setIsAddingPatient(false)
    // Open the new patient's record straight away, ready to book or add notes
    window.location.hash = patientLink(id)
    notify(`Added ${patient.name}`, () => {
      setPatientList((list) => list.filter((p) => p.id !== id))
      // Undone while on their record: go back to the list rather than an empty page
      if (window.location.hash === patientLink(id)) window.location.hash = pageLinks.patients
    })
  }

  function deletePatient(id: number) {
    const index = patientList.findIndex((patient) => patient.id === id)
    const previous = patientList[index]
    setPatientList((list) => list.filter((patient) => patient.id !== id))
    setSelectedPatientId(null)
    // Deleted from their own record: go back to the patient list
    const wasOnRecord = route.patientId === id
    if (wasOnRecord) window.location.hash = pageLinks.patients
    if (!previous) return
    // Their appointments, messages and notes were never removed, so putting the patient back
    // reconnects everything. Undo also returns to their record if that's where you were.
    notify(`Deleted ${previous.name}`, () => {
      setPatientList((list) => [...list.slice(0, index), previous, ...list.slice(index)])
      if (wasOnRecord) window.location.hash = patientLink(id)
    })
  }

  // The patient whose record is open, if any
  const recordPatient = patientList.find((patient) => patient.id === route.patientId)

  // Appointments, inbox items and invoices store the patient's name; this finds their record.
  // It keeps working after a rename because renamePatientEverywhere updates those names too.
  const patientHref = (name: string) => {
    const patient = patientList.find((p) => p.name === name)
    return patient && patientLink(patient.id)
  }

  // Clinical notes per patient id, kept here until the page reloads
  const [notes, setNotes] = useState(initialNotes)
  function addNote(patientId: number, text: string) {
    const id = Date.now()
    setNotes((all) => ({
      ...all,
      [patientId]: [...(all[patientId] ?? []), { id, text, written: new Date() } satisfies Note],
    }))
    notify('Note added', () =>
      setNotes((all) => ({
        ...all,
        [patientId]: (all[patientId] ?? []).filter((note) => note.id !== id),
      })),
    )
  }

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

  function markAllRead() {
    const unreadIds = inbox.filter((item) => !item.read).map((item) => item.id)
    setInbox((list) => list.map((item) => ({ ...item, read: true })))
    notify(`Marked ${unreadIds.length} as read`, () =>
      setInbox((list) =>
        list.map((item) => (unreadIds.includes(item.id) ? { ...item, read: false } : item)),
      ),
    )
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

  // Messages you write from scratch: kept here (until the page reloads); they aren't sent anywhere
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([])
  // The "New message" form, with the patient filled in when opened from their record
  const [composing, setComposing] = useState<{ to?: string } | null>(null)
  const [openSentId, setOpenSentId] = useState<number | null>(null)
  const openSent = sentMessages.find((message) => message.id === openSentId)
  const sent = sentEntries(inbox, sentMessages)

  function sendMessage(message: Omit<SentMessage, 'id' | 'sentAt'>) {
    const id = Date.now()
    setSentMessages((list) => [...list, { ...message, id, sentAt: new Date() }])
    setComposing(null)
    notify(`Message sent to ${message.to}`, () =>
      setSentMessages((list) => list.filter((sentMessage) => sentMessage.id !== id)),
    )
  }

  // A sent row opens the message itself, or for a reply the inbox item it answers
  function openSentEntry(entry: SentEntry) {
    if (entry.message) setOpenSentId(entry.message.id)
    else if (entry.item) openInboxItem(entry.item.id)
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
          {/* When the app opens, the page arrives just after the sidebar: a fade and a 6px rise */}
          <motion.div {...entrance(0.12)} className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
            {/* Crossfade between screens */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={`${page}-${route.patientId ?? ''}`} className="flex flex-1 flex-col" {...fade}>
                {page === 'settings' ? (
                  <SettingsPage settings={settings} onChange={setSettings} />
                ) : page === 'inbox' ? (
                  <InboxPage
                    items={inbox}
                    sent={sent}
                    now={now}
                    onOpen={(item) => openInboxItem(item.id)}
                    onOpenSent={openSentEntry}
                    onMarkAllRead={markAllRead}
                    onNewMessage={() => setComposing({})}
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
                      today={today}
                      appointments={appointmentList.filter((appt) => appt.patient === recordPatient.name)}
                      visits={visitHistory[recordPatient.id] ?? []}
                      notes={notes[recordPatient.id] ?? []}
                      inboxItems={inbox.filter((item) => item.patient === recordPatient.name)}
                      sentMessages={sentMessages.filter((message) => message.to === recordPatient.name)}
                      invoices={invoices.filter((invoice) => invoice.patient === recordPatient.name)}
                      onEdit={() => setSelectedPatientId(recordPatient.id)}
                      onBook={() => setBooking({ date: today, patient: recordPatient.name })}
                      onOpenAppointment={(appt) => setSelectedId(appt.id)}
                      onAddNote={(text) => addNote(recordPatient.id, text)}
                      onOpenInboxItem={(item) => openInboxItem(item.id)}
                      onMessage={() => setComposing({ to: recordPatient.name })}
                      onOpenSentMessage={(message) => setOpenSentId(message.id)}
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
                  <PatientsPage patients={patientList} onNew={() => setIsAddingPatient(true)} />
                ) : (
                  <AgendaPage
                    appointments={appointmentList}
                    today={today}
                    date={agendaDate}
                    view={agendaView}
                    onDateChange={setAgendaDate}
                    onViewChange={setAgendaView}
                    // Books on the given day (from a day's "+" in Week view), or the day shown
                    onBook={(day) => setBooking({ date: day ?? agendaDate })}
                    onSelect={(appt) => setSelectedId(appt.id)}
                    patientHref={patientHref}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>

        {/* AnimatePresence keeps a closing popup on screen until its exit animation finishes */}
        <AnimatePresence>
          {booking && (
            <BookingDialog
              key="booking"
              times={bookableTimes}
              patients={patientList.map((patient) => patient.name)}
              date={booking.date}
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
              patients={patientList.map((patient) => patient.name)}
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
              // Everyone else's names: keeping your own name is fine
              otherNames={patientList.filter((p) => p.id !== selectedPatient.id).map((p) => p.name)}
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
          {isAddingPatient && (
            <NewPatientDialog
              key="new-patient"
              existingNames={patientList.map((patient) => patient.name)}
              onAdd={addPatient}
              onClose={() => setIsAddingPatient(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {composing && (
            <NewMessageDialog
              key="new-message"
              patients={patientList.map((patient) => patient.name)}
              to={composing.to}
              onSend={sendMessage}
              onClose={() => setComposing(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {openSent && (
            <SentMessageDialog key={openSent.id} message={openSent} onClose={() => setOpenSentId(null)} />
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

        <Toast toast={toast} onDismiss={dismissToast} />
      </div>
    </MotionConfig>
  )
}
