import { ArrowLeft, Pencil, Plus } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { formatDate, statusOf, totalOf, type Invoice } from '../billing'
import type { Appointment, InboxItem, Patient } from '../data'
import { ageFrom, formatDay } from '../dates'
import { inboxKinds, shortTime } from '../inbox'
import { formatMoney } from '../money'
import { pageLinks } from '../navigation'
import type { Note, Visit } from '../records'
import InvoiceBadge from './billing/InvoiceBadge'
import EditHint from './EditHint'
import StatusBadge from './StatusBadge'

const rowClass =
  'group flex w-full items-center gap-6 px-2 py-3 text-left text-sm transition-colors hover:bg-hover/50 focus-visible:bg-hover/50 focus-visible:-outline-offset-2'

// A titled block of the record; shows `empty` when there's nothing in it
function Section({ title, empty, children }: { title: string; empty?: string; children?: ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">{title}</h2>
      {empty ? (
        <p className="border-t border-line py-4 text-sm text-muted">{empty}</p>
      ) : (
        <div className="border-t border-line">{children}</div>
      )}
    </section>
  )
}

function Fact({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border border-line p-4">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
      {note && <div className="mt-0.5 text-sm text-muted">{note}</div>}
    </div>
  )
}

type Props = {
  patient: Patient
  now: Date
  appointments: Appointment[] // today's, for this patient
  visits: Visit[]
  notes: Note[]
  inboxItems: InboxItem[]
  invoices: Invoice[]
  onEdit: () => void
  onBook: () => void
  onOpenAppointment: (appointment: Appointment) => void
  onAddNote: (text: string) => void
  onOpenInboxItem: (item: InboxItem) => void
  onOpenInvoice: (invoice: Invoice) => void
}

export default function PatientRecordPage({
  patient,
  now,
  appointments,
  visits,
  notes,
  inboxItems,
  invoices,
  onEdit,
  onBook,
  onOpenAppointment,
  onAddNote,
  onOpenInboxItem,
  onOpenInvoice,
}: Props) {
  const [draft, setDraft] = useState('')

  const born = formatDay(patient.dateOfBirth)
  // The next appointment still to come today (earlier ones have already happened)
  const currentTime = now.toTimeString().slice(0, 5) // "HH:MM"
  const next = appointments.find((appt) => appt.status !== 'cancelled' && appt.time >= currentTime)
  const unpaid = invoices.filter((invoice) => statusOf(invoice, now) !== 'paid')
  const overdue = unpaid.filter((invoice) => statusOf(invoice, now) === 'overdue')
  const balance = unpaid.reduce((sum, invoice) => sum + totalOf(invoice), 0)
  const sortedInvoices = [...invoices].sort((a, b) => b.issued.getTime() - a.issued.getTime())

  function addNote(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    onAddNote(draft.trim())
    setDraft('')
  }

  return (
    <>
      <a
        href={pageLinks.patients}
        className="-ml-1 mb-6 flex w-fit items-center gap-1.5 rounded-[6px] px-1 text-sm text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} strokeWidth={1.75} />
        All patients
      </a>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">{patient.name}</h1>
          <p className="mt-2 text-sm text-muted">
            {ageFrom(patient.dateOfBirth)} years · Born {born} · {patient.phone}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
          >
            <Pencil size={14} strokeWidth={1.75} />
            Edit details
          </button>
          <button
            onClick={onBook}
            className="flex items-center gap-1.5 rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover"
          >
            <Plus size={15} strokeWidth={1.75} />
            Book appointment
          </button>
        </div>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Fact label="Last visit" value={formatDay(patient.lastVisit)} note={visits[0]?.type} />
        <Fact
          label="Next appointment"
          value={next ? `Today at ${next.time}` : 'None booked'}
          note={next?.type}
        />
        <Fact
          label="Balance"
          value={formatMoney(balance)}
          note={
            balance === 0
              ? 'Nothing owed'
              : overdue.length > 0
                ? `${formatMoney(overdue.reduce((sum, i) => sum + totalOf(i), 0))} overdue`
                : `${unpaid.length} unpaid ${unpaid.length === 1 ? 'invoice' : 'invoices'}`
          }
        />
      </div>

      <Section title="Today" empty={appointments.length === 0 ? 'No appointments today.' : undefined}>
        {appointments.map((appt) => (
          <button
            key={appt.id}
            onClick={() => onOpenAppointment(appt)}
            className={`${rowClass} border-b border-line`}
          >
            <span className="w-12 text-muted tabular-nums">{appt.time}</span>
            <span className="flex-1">{appt.type}</span>
            <StatusBadge status={appt.status} />
            <EditHint />
          </button>
        ))}
      </Section>

      <Section title="Notes">
        {notes.map((note) => (
          <div key={note.id} className="border-b border-line px-2 py-3 text-sm">
            <p className="whitespace-pre-line">{note.text}</p>
            <p className="mt-1 text-xs text-muted">Written {formatDate(note.written)}</p>
          </div>
        ))}
        <form onSubmit={addNote} className="pt-4">
          <label className="block text-sm">
            <span className="sr-only">New note</span>
            <textarea
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Add a note about ${patient.name.split(' ')[0]}…`}
              className="w-full resize-y rounded-[6px] border border-field bg-white px-2.5 py-2 text-sm transition-colors placeholder:text-muted focus:border-ink focus:outline-none"
            />
          </label>
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add note
            </button>
          </div>
        </form>
      </Section>

      <Section title="Past visits" empty={visits.length === 0 ? 'No visits recorded yet.' : undefined}>
        {visits.map((visit) => (
          <div key={visit.date + visit.type} className="flex gap-6 border-b border-line px-2 py-3 text-sm">
            <span className="w-28 shrink-0 text-muted">{formatDay(visit.date)}</span>
            <div>
              <div className="font-medium">{visit.type}</div>
              <p className="mt-0.5 text-muted">{visit.summary}</p>
            </div>
          </div>
        ))}
      </Section>

      <Section
        title="Inbox"
        empty={inboxItems.length === 0 ? 'No messages, results or letters.' : undefined}
      >
        {inboxItems.map((item) => {
          const Icon = inboxKinds[item.kind].icon
          return (
            <button key={item.id} onClick={() => onOpenInboxItem(item)} className={`${rowClass} border-b border-line`}>
              <Icon size={16} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
              <span className={`min-w-0 flex-1 truncate ${item.read ? '' : 'font-medium'}`}>
                <span className="sr-only">{inboxKinds[item.kind].label}: </span>
                {item.subject}
              </span>
              <span className="w-20 shrink-0 text-right text-muted tabular-nums">{shortTime(item, now)}</span>
            </button>
          )
        })}
      </Section>

      <Section title="Billing" empty={invoices.length === 0 ? 'No invoices.' : undefined}>
        {sortedInvoices.map((invoice) => (
          <button
            key={invoice.id}
            onClick={() => onOpenInvoice(invoice)}
            className={`${rowClass} border-b border-line`}
          >
            <span className="w-20 text-muted tabular-nums">{invoice.number}</span>
            <span className="min-w-0 flex-1 truncate">
              {invoice.lines.map((line) => line.description).join(', ')}
            </span>
            <span className="w-24 text-muted">{formatDate(invoice.issued)}</span>
            <span className="w-16 text-right tabular-nums">{formatMoney(totalOf(invoice))}</span>
            <span className="w-20 text-right">
              <InvoiceBadge status={statusOf(invoice, now)} />
            </span>
          </button>
        ))}
      </Section>
    </>
  )
}
