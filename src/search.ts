// Search everything (Ctrl+K): turns what you type into a list of results, grouped by kind.
// This file only decides what matches and in which order; SearchDialog draws it.
import { statusOf, statusStyles, totalOf, type Invoice } from './billing'
import type { Appointment, InboxItem, Patient } from './data'
import { ageFrom, shortDayName } from './dates'
import { inboxKinds } from './inbox'
import { formatMoney } from './money'
import type { Page } from './navigation'

export type SearchAction = 'book' | 'new-patient' | 'new-message' | 'new-invoice'

// What a result opens when chosen; App knows how to open each kind
export type SearchTarget =
  | { kind: 'action'; action: SearchAction }
  | { kind: 'page'; page: Page }
  | { kind: 'patient'; id: number }
  | { kind: 'appointment'; id: number }
  | { kind: 'invoice'; id: number }
  | { kind: 'inbox'; id: number; inboxKind: InboxItem['kind'] }

export type SearchResult = {
  key: string
  title: string // the main line; the part matching your search is shown in bold
  detail?: string // a quieter second part, e.g. "Fri 20 Nov · 09:00"
  target: SearchTarget
}

export type SearchGroup = { label: string; results: SearchResult[] }

// Things you can do, with other words people might type for them
const actions: { action: SearchAction; title: string; words: string }[] = [
  { action: 'book', title: 'Book appointment', words: 'schedule new appointment' },
  { action: 'new-patient', title: 'New patient', words: 'add register' },
  { action: 'new-message', title: 'New message', words: 'write send email compose' },
  { action: 'new-invoice', title: 'New invoice', words: 'bill charge create' },
]

const pages: { page: Page; title: string; words: string }[] = [
  { page: 'agenda', title: 'Agenda', words: 'calendar today week schedule' },
  { page: 'inbox', title: 'Inbox', words: 'messages lab results referrals' },
  { page: 'patients', title: 'Patients', words: 'people list' },
  { page: 'billing', title: 'Billing', words: 'invoices payments money' },
  { page: 'reports', title: 'Reports', words: 'charts revenue stats' },
  { page: 'settings', title: 'Settings', words: 'profile working hours preferences' },
]

// Up to this many results per group, so the list stays short; refine the search to see others
const perGroup = 5

// Lowercase without accents, one character for one character, so "tomas" finds "Tomás"
// and a match's position in the plain text is the same as in the original
export const plain = (text: string) =>
  [...text]
    .map((char) => char.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()[0] ?? char)
    .join('')

// The words typed, e.g. "sofia follow" → ["sofia", "follow"]
export const wordsOf = (query: string) => plain(query).split(/\s+/).filter(Boolean)

// Every word typed has to appear somewhere in the text (in any order)
const matches = (words: string[], ...texts: (string | undefined)[]) => {
  const haystack = plain(texts.filter(Boolean).join(' '))
  return words.every((word) => haystack.includes(word))
}

// Results whose title starts with the first word come first; otherwise keep the given order
function rank(results: SearchResult[], words: string[]) {
  const first = words[0] ?? ''
  const startsWith = (result: SearchResult) =>
    plain(result.title)
      .split(/[\s·]+/)
      .some((part) => part.startsWith(first))
  return [...results.filter(startsWith), ...results.filter((r) => !startsWith(r))]
}

// The keyboard shortcut as people know it on their computer: ⌘K on a Mac, Ctrl K elsewhere
export const searchShortcut =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl K'

export type SearchData = {
  patients: Patient[]
  appointments: Appointment[]
  invoices: Invoice[]
  inboxItems: InboxItem[]
  today: string // YYYY-MM-DD
  now: Date
}

export function search(query: string, data: SearchData): SearchGroup[] {
  const words = wordsOf(query)

  const toAction = ({ action, title }: (typeof actions)[number]): SearchResult => ({
    key: `action-${action}`,
    title,
    target: { kind: 'action', action },
  })
  const toPage = ({ page, title }: (typeof pages)[number]): SearchResult => ({
    key: `page-${page}`,
    title,
    target: { kind: 'page', page },
  })

  // Nothing typed yet: offer the everyday actions and screens
  if (words.length === 0) {
    return [
      { label: 'Actions', results: actions.map(toAction) },
      { label: 'Go to', results: pages.map(toPage) },
    ]
  }

  const { today, now } = data

  const patients = data.patients
    .filter((patient) => matches(words, patient.name, patient.phone))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((patient) => ({
      key: `patient-${patient.id}`,
      title: patient.name,
      detail: `${ageFrom(patient.dateOfBirth)} years · ${patient.phone}`,
      target: { kind: 'patient', id: patient.id } as const,
    }))

  // Upcoming ones first (soonest first), then past ones (most recent first)
  const upcoming = data.appointments.filter((appt) => appt.date >= today)
  const past = data.appointments.filter((appt) => appt.date < today).reverse()
  const appointments = [...upcoming, ...past]
    .filter((appt) => matches(words, appt.patient, appt.type))
    .map((appt) => ({
      key: `appointment-${appt.id}`,
      title: `${appt.patient} · ${appt.type}`,
      detail: `${shortDayName(appt.date, today)} · ${appt.time}${appt.status === 'cancelled' ? ' · Cancelled' : ''}`,
      target: { kind: 'appointment', id: appt.id } as const,
    }))

  // Newest first
  const invoices = [...data.invoices]
    .sort((a, b) => b.issued.getTime() - a.issued.getTime())
    .filter((invoice) => matches(words, invoice.number, invoice.patient))
    .map((invoice) => ({
      key: `invoice-${invoice.id}`,
      title: `${invoice.number} · ${invoice.patient}`,
      detail: `${formatMoney(totalOf(invoice))} · ${statusStyles[statusOf(invoice, now)].label}`,
      target: { kind: 'invoice', id: invoice.id } as const,
    }))

  // Already newest first
  const inbox = data.inboxItems
    .filter((item) => matches(words, item.subject, item.patient, item.from))
    .map((item) => ({
      key: `inbox-${item.id}`,
      title: item.subject,
      detail: `${inboxKinds[item.kind].label} · ${item.patient}`,
      target: { kind: 'inbox', id: item.id, inboxKind: item.kind } as const,
    }))

  const matchingActions = actions
    .filter(({ title, words: extra }) => matches(words, title, extra))
    .map(toAction)
  const matchingPages = pages
    .filter(({ title, words: extra }) => matches(words, title, extra))
    .map(toPage)

  return [
    { label: 'Patients', results: rank(patients, words) },
    { label: 'Appointments', results: rank(appointments, words) },
    { label: 'Invoices', results: rank(invoices, words) },
    { label: 'Inbox', results: rank(inbox, words) },
    { label: 'Actions', results: matchingActions },
    { label: 'Go to', results: matchingPages },
  ]
    .map((group) => ({ ...group, results: group.results.slice(0, perGroup) }))
    .filter((group) => group.results.length > 0)
}
