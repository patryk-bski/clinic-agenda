import { CircleCheck, Clock, Plus, Search, TriangleAlert } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import {
  billingSummary,
  formatDate,
  statusOf,
  totalOf,
  type Invoice,
  type InvoiceStatus,
} from '../../billing'
import { formatMoney } from '../../money'
import { transition } from '../../motion'
import InvoiceBadge from './InvoiceBadge'

type Filter = 'all' | InvoiceStatus

// One tab per status, with an icon so the tabs aren't told apart by text alone
const filters: { value: Filter; label: string; icon?: typeof Clock }[] = [
  { value: 'all', label: 'All' },
  { value: 'unpaid', label: 'Unpaid', icon: Clock },
  { value: 'overdue', label: 'Overdue', icon: TriangleAlert },
  { value: 'paid', label: 'Paid', icon: CircleCheck },
]

const plural = (count: number, word: string) => `${count} ${count === 1 ? word : `${word}s`}`

function SummaryTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border border-line p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-muted">{note}</div>
    </div>
  )
}

type Props = {
  invoices: Invoice[]
  now: Date
  onOpen: (invoice: Invoice) => void
  onNew: () => void
}

export default function BillingPage({ invoices, now, onOpen, onNew }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const summary = billingSummary(invoices, now)

  // Newest first; the status tab, then the search (patient name or invoice number)
  const search = query.trim().toLowerCase()
  const shown = invoices
    .filter(
      (invoice) =>
        (filter === 'all' || statusOf(invoice, now) === filter) &&
        (invoice.patient.toLowerCase().includes(search) || invoice.number.toLowerCase().includes(search)),
    )
    .sort((a, b) => b.issued.getTime() - a.issued.getTime() || b.id - a.id)

  return (
    <div className="@container">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Billing</h1>
          <p className="mt-2 text-sm text-muted">{plural(invoices.length, 'invoice')}</p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover"
        >
          <Plus size={15} strokeWidth={1.75} />
          New invoice
        </button>
      </header>

      <div className="mb-10 grid gap-4 @xl:grid-cols-3">
        <SummaryTile
          label="Outstanding"
          value={formatMoney(summary.outstanding.total)}
          note={`${plural(summary.outstanding.count, 'invoice')} not yet paid`}
        />
        <SummaryTile
          label="Overdue"
          value={formatMoney(summary.overdue.total)}
          note={
            summary.overdue.count === 0
              ? 'Nothing overdue'
              : `${plural(summary.overdue.count, 'invoice')} · up to ${plural(summary.overdue.mostDaysLate, 'day')} late`
          }
        />
        <SummaryTile
          label="Paid in the last 30 days"
          value={formatMoney(summary.paidLast30Days.total)}
          note={plural(summary.paidLast30Days.count, 'invoice')}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        {/* Status tabs, each with how many invoices it holds; the selected one is underlined */}
        <div role="tablist" aria-label="Show" className="flex gap-4">
          {filters.map(({ value, label, icon: Icon }) => {
            const count =
              value === 'all'
                ? invoices.length
                : invoices.filter((invoice) => statusOf(invoice, now) === value).length
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
            placeholder="Search patient or invoice"
            aria-label="Search invoices by patient or invoice number"
            className="min-w-0 flex-1 bg-transparent placeholder:text-muted focus:outline-none"
          />
        </label>
      </div>

      {/* Column labels, lined up with the columns in each row */}
      <div className="flex gap-6 px-2 pb-2 text-xs text-muted">
        <span className="w-20">Invoice</span>
        <span className="flex-1">Patient</span>
        <span className="hidden w-44 @3xl:block">Services</span>
        <span className="w-24">Issued</span>
        <span className="w-16 text-right">Amount</span>
        <span className="w-20 text-right">Status</span>
      </div>

      <ul className="border-t border-line">
        <AnimatePresence initial={false}>
          {shown.map((invoice) => {
            const status = statusOf(invoice, now)
            const [first, ...more] = invoice.lines
            return (
              <motion.li
                key={invoice.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={transition}
                className="overflow-hidden border-b border-line"
              >
                {/* The whole row is a button that opens the invoice */}
                <button
                  onClick={() => onOpen(invoice)}
                  aria-label={`${invoice.number}, ${invoice.patient}, ${formatMoney(totalOf(invoice))}, ${status}`}
                  className="flex w-full items-center gap-6 px-2 py-3.5 text-left text-sm transition-colors hover:bg-hover/50 focus-visible:bg-hover/50 focus-visible:-outline-offset-2"
                >
                  <span className="w-20 text-muted tabular-nums">{invoice.number}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{invoice.patient}</span>
                  <span className="hidden w-44 truncate text-muted @3xl:block">
                    {first?.description}
                    {more.length > 0 && ` +${more.length} more`}
                  </span>
                  <span className="w-24 text-muted">{formatDate(invoice.issued)}</span>
                  <span className="w-16 text-right tabular-nums">{formatMoney(totalOf(invoice))}</span>
                  <span className="w-20 text-right">
                    <InvoiceBadge status={status} />
                  </span>
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>

      {shown.length === 0 && (
        <p className="py-10 text-center text-sm text-muted">
          {search
            ? `No invoices match “${query.trim()}”.`
            : filter === 'all'
              ? 'No invoices yet.'
              : `No ${filter} invoices.`}
        </p>
      )}
    </div>
  )
}
