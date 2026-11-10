// Billing: invoices for the practice's patients and the numbers the Billing screen shows.
// The sample invoices are dated relative to today, so they always look current.
// Nothing here is connected to real payments or email.
import { fees } from './report'

export type PaymentMethod = 'Card' | 'Cash' | 'Bank transfer' | 'Insurance'
export const paymentMethods: PaymentMethod[] = ['Card', 'Cash', 'Bank transfer', 'Insurance']

// Who an invoice is sent to: the patient, or one of these (made-up) insurers
export const payers = ['Patient', 'Meridian Health Insurance', 'Northstar Insurance']

export type InvoiceLine = { description: string; amount: number }

export type Invoice = {
  id: number
  number: string // e.g. INV-1051
  patient: string
  payer: string
  lines: InvoiceLine[]
  issued: Date
  due: Date
  paid?: { on: Date; method: PaymentMethod }
  reminders: Date[] // when payment reminders were sent
}

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue'

const day = 24 * 60 * 60 * 1000
const daysAgo = (now: Date, days: number) => new Date(now.getTime() - days * day)
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

// Days between two dates, counting calendar days (e.g. due yesterday → 1)
export const daysBetween = (from: Date, to: Date) =>
  Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / day)

export const lineFor = (service: string): InvoiceLine => ({ description: service, amount: fees[service] ?? 0 })
export const totalOf = (invoice: Invoice) => invoice.lines.reduce((sum, line) => sum + line.amount, 0)

// Unpaid invoices become overdue the day after their due date
export function statusOf(invoice: Invoice, now: Date): InvoiceStatus {
  if (invoice.paid) return 'paid'
  return daysBetween(invoice.due, now) > 0 ? 'overdue' : 'unpaid'
}

export const statusStyles: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: { label: 'Paid', className: 'bg-green-50 text-green-700' },
  unpaid: { label: 'Unpaid', className: 'bg-hover text-muted' },
  overdue: { label: 'Overdue', className: 'bg-red-50 text-red-700' },
}

export const paymentTermsDays = 14

export function sampleInvoices(now: Date): Invoice[] {
  // [number, patient, payer, services, issued days ago, paid (days ago + method), reminders (days ago)]
  const rows: [number, string, string, string[], number, [number, PaymentMethod]?, number[]?][] = [
    [1058, 'Maria Kowalska', 'Patient', ['Follow-up'], 0],
    [1057, 'James Carter', 'Patient', ['New patient'], 0, [0, 'Card']],
    [1056, 'Aisha Rahman', 'Meridian Health Insurance', ['Blood test review'], 1],
    [1055, 'Grace Okafor', 'Patient', ['Telehealth call'], 3, [2, 'Bank transfer']],
    [1054, 'Lucas Martin', 'Northstar Insurance', ['Follow-up', 'Blood test review'], 6],
    [1053, 'Emily Nguyen', 'Meridian Health Insurance', ['Annual check-up', 'Blood test review'], 9, [5, 'Insurance']],
    [1052, 'Daniel Becker', 'Patient', ['Follow-up'], 12],
    [1051, 'Sofia Rossi', 'Patient', ['Annual check-up'], 18, undefined, [2]],
    [1050, 'Piotr Nowak', 'Patient', ['New patient'], 21, [10, 'Card']],
    [1049, 'Tomás Silva', 'Patient', ['Vaccination'], 24, [24, 'Cash']],
    [1048, 'Maria Kowalska', 'Patient', ['Annual check-up'], 30, undefined, [14, 5]],
    [1047, 'Grace Okafor', 'Patient', ['Follow-up'], 35, [20, 'Card']],
    [1046, 'Lucas Martin', 'Patient', ['Prescription renewal'], 40, undefined, [20]],
    [1045, 'Aisha Rahman', 'Meridian Health Insurance', ['Follow-up'], 45, [33, 'Insurance']],
  ]

  return rows.map(([number, patient, payer, services, issuedAgo, paid, reminders = []]) => {
    const issued = daysAgo(now, issuedAgo)
    return {
      id: number,
      number: `INV-${number}`,
      patient,
      payer,
      lines: services.map(lineFor),
      issued,
      due: new Date(issued.getTime() + paymentTermsDays * day),
      paid: paid && { on: daysAgo(now, paid[0]), method: paid[1] },
      reminders: reminders.map((ago) => daysAgo(now, ago)),
    }
  })
}

// The key numbers at the top of the Billing screen
export function billingSummary(invoices: Invoice[], now: Date) {
  const withStatus = invoices.map((invoice) => ({ invoice, status: statusOf(invoice, now) }))
  const sum = (list: typeof withStatus) => list.reduce((total, { invoice }) => total + totalOf(invoice), 0)

  const unpaid = withStatus.filter(({ status }) => status !== 'paid')
  const overdue = withStatus.filter(({ status }) => status === 'overdue')
  const paidRecently = withStatus.filter(
    ({ invoice }) => invoice.paid && daysBetween(invoice.paid.on, now) <= 30,
  )
  const mostDaysLate = Math.max(0, ...overdue.map(({ invoice }) => daysBetween(invoice.due, now)))

  return {
    outstanding: { total: sum(unpaid), count: unpaid.length },
    overdue: { total: sum(overdue), count: overdue.length, mostDaysLate },
    paidLast30Days: { total: sum(paidRecently), count: paidRecently.length },
  }
}

export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
