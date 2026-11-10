import { BellRing, CircleCheck, Receipt, TriangleAlert } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import {
  daysBetween,
  formatDate,
  paymentMethods,
  statusOf,
  totalOf,
  type Invoice,
  type PaymentMethod,
} from '../../billing'
import { formatMoney } from '../../money'
import { fade } from '../../motion'
import Modal from '../Modal'
import InvoiceBadge from './InvoiceBadge'

const plural = (count: number, word: string) => `${count} ${count === 1 ? word : `${word}s`}`

type Props = {
  invoice: Invoice
  now: Date
  onMarkPaid: (method: PaymentMethod) => void
  onMarkUnpaid: () => void
  onSendReminder: () => void
  onClose: () => void
}

export default function InvoiceDialog({
  invoice,
  now,
  onMarkPaid,
  onMarkUnpaid,
  onSendReminder,
  onClose,
}: Props) {
  const status = statusOf(invoice, now)
  const [isRecordingPayment, setIsRecordingPayment] = useState(false)
  // Insured patients are usually paid by the insurer; everyone else most often by card
  const [method, setMethod] = useState<PaymentMethod>(invoice.payer === 'Patient' ? 'Card' : 'Insurance')

  const daysUntilDue = daysBetween(now, invoice.due)
  const dueNote =
    status === 'paid'
      ? null
      : status === 'overdue'
        ? `${plural(-daysUntilDue, 'day')} overdue`
        : daysUntilDue === 0
          ? 'due today'
          : `in ${plural(daysUntilDue, 'day')}`

  function confirmPayment(e: FormEvent) {
    e.preventDefault()
    onMarkPaid(method)
    setIsRecordingPayment(false)
  }

  const fieldClass =
    'mt-1.5 w-full rounded-[6px] border border-field bg-white px-2.5 py-2 text-sm transition-colors focus:border-ink focus:outline-none'

  return (
    <Modal labelledBy="invoice-title" onClose={onClose}>
      <p className="flex items-center gap-1.5 text-sm text-muted">
        <Receipt size={14} strokeWidth={1.75} />
        Invoice {invoice.number}
      </p>
      <div className="mt-1 flex items-center gap-3">
        <h2 id="invoice-title" className="text-2xl font-semibold tracking-tight">
          {formatMoney(totalOf(invoice))}
        </h2>
        <InvoiceBadge status={status} />
      </div>

      <dl className="mt-4 grid grid-cols-[6.5rem_1fr] gap-y-1 text-sm">
        <dt className="text-muted">Patient</dt>
        <dd>{invoice.patient}</dd>
        <dt className="text-muted">Billed to</dt>
        <dd>{invoice.payer}</dd>
        <dt className="text-muted">Issued</dt>
        <dd>{formatDate(invoice.issued)}</dd>
        <dt className="text-muted">Due</dt>
        <dd>
          {formatDate(invoice.due)}
          {dueNote && (
            <span
              className={`ml-1.5 inline-flex items-center gap-1 ${status === 'overdue' ? 'text-red-700' : 'text-muted'}`}
            >
              {status === 'overdue' && <TriangleAlert size={12} strokeWidth={2} aria-hidden />}· {dueNote}
            </span>
          )}
        </dd>
        {invoice.paid && (
          <>
            <dt className="text-muted">Paid</dt>
            <dd className="flex items-center gap-1.5">
              <CircleCheck size={14} strokeWidth={1.75} className="text-green-700" aria-hidden />
              {formatDate(invoice.paid.on)} · {invoice.paid.method}
            </dd>
          </>
        )}
        {invoice.reminders.length > 0 && (
          <>
            <dt className="text-muted">Reminders</dt>
            <dd>
              {plural(invoice.reminders.length, 'reminder')} sent, last on{' '}
              {formatDate(invoice.reminders[invoice.reminders.length - 1])}
            </dd>
          </>
        )}
      </dl>

      {/* Line items */}
      <table className="mt-5 w-full border-t border-line text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th className="pt-4 pb-2 font-normal">Service</th>
            <th className="pt-4 pb-2 text-right font-normal">Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line, i) => (
            <tr key={i} className="border-b border-line">
              <td className="py-2">{line.description}</td>
              <td className="py-2 text-right tabular-nums">{formatMoney(line.amount)}</td>
            </tr>
          ))}
          <tr>
            <td className="pt-2 font-medium">Total</td>
            <td className="pt-2 text-right font-medium tabular-nums">{formatMoney(totalOf(invoice))}</td>
          </tr>
        </tbody>
      </table>

      {/* Fade between the actions and the "record payment" form */}
      <AnimatePresence mode="wait" initial={false}>
        {isRecordingPayment ? (
          <motion.form key="pay" onSubmit={confirmPayment} className="mt-6" {...fade}>
            <label className="block text-sm">
              How was it paid?
              <select
                autoFocus
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className={fieldClass}
              >
                {paymentMethods.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <p className="mt-2 text-xs text-muted">Recorded as paid today.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRecordingPayment(false)}
                className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover"
              >
                Confirm payment
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div key="actions" className="mt-8 flex justify-between gap-2" {...fade}>
            {status === 'paid' ? (
              <button
                onClick={onMarkUnpaid}
                // Ghost button: no fill, a gray outline (3.2:1) so it still reads as a button
                className="rounded-[6px] border border-field px-3 py-2 text-sm transition-colors hover:bg-hover"
              >
                Mark as unpaid
              </button>
            ) : (
              <button
                onClick={onSendReminder}
                className="flex items-center gap-1.5 rounded-[6px] border border-field px-3 py-2 text-sm transition-colors hover:bg-hover"
              >
                <BellRing size={14} strokeWidth={1.75} />
                {invoice.reminders.length > 0 ? 'Send another reminder' : 'Send reminder'}
              </button>
            )}
            <div className="flex gap-2">
              <button
                autoFocus={status === 'paid'}
                onClick={onClose}
                className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
              >
                Close
              </button>
              {status !== 'paid' && (
                <button
                  autoFocus
                  onClick={() => setIsRecordingPayment(true)}
                  className="flex items-center gap-1.5 rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover"
                >
                  <CircleCheck size={15} strokeWidth={1.75} />
                  Mark as paid
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
