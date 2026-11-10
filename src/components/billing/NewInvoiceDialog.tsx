import { useState, type FormEvent } from 'react'
import { lineFor, paymentTermsDays, payers, type InvoiceLine } from '../../billing'
import { formatMoney } from '../../money'
import { fees } from '../../report'
import Modal from '../Modal'

const fieldClass =
  'mt-1.5 w-full rounded-[6px] border border-field bg-white px-2.5 py-2 text-sm transition-colors focus:border-ink focus:outline-none'

export type NewInvoice = { patient: string; payer: string; lines: InvoiceLine[]; dueInDays: number }

type Props = {
  patientNames: string[]
  onCreate: (invoice: NewInvoice) => void
  onClose: () => void
}

export default function NewInvoiceDialog({ patientNames, onCreate, onClose }: Props) {
  const [patient, setPatient] = useState(patientNames[0] ?? '')
  const [payer, setPayer] = useState(payers[0])
  const [services, setServices] = useState<string[]>([])
  const [dueInDays, setDueInDays] = useState(paymentTermsDays)

  const lines = services.map(lineFor)
  const total = lines.reduce((sum, line) => sum + line.amount, 0)

  const toggle = (service: string) =>
    setServices((current) =>
      current.includes(service) ? current.filter((s) => s !== service) : [...current, service],
    )

  function create(e: FormEvent) {
    e.preventDefault()
    if (!patient || lines.length === 0) return
    onCreate({ patient, payer, lines, dueInDays })
  }

  return (
    <Modal labelledBy="new-invoice-title" onClose={onClose}>
      <h2 id="new-invoice-title" className="text-lg font-medium">
        New invoice
      </h2>
      <p className="mt-1 mb-6 text-sm text-muted">Dated today. It starts as unpaid.</p>

      <form onSubmit={create}>
        <div className="space-y-4">
          <label className="block text-sm">
            Patient
            <select value={patient} onChange={(e) => setPatient(e.target.value)} className={fieldClass}>
              {patientNames.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm">
            Billed to
            <select value={payer} onChange={(e) => setPayer(e.target.value)} className={fieldClass}>
              {payers.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          {/* Tick every service to bill; the total adds up below */}
          <fieldset>
            <legend className="text-sm">Services</legend>
            <div className="mt-1.5 divide-y divide-line rounded-[6px] border border-field bg-white">
              {Object.entries(fees).map(([service, fee]) => (
                <label key={service} className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={services.includes(service)}
                    onChange={() => toggle(service)}
                    className="size-4 accent-brand"
                  />
                  <span className="flex-1">{service}</span>
                  <span className="text-muted tabular-nums">{formatMoney(fee)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm">
            Payment due within
            <select
              value={dueInDays}
              onChange={(e) => setDueInDays(Number(e.target.value))}
              className={fieldClass}
            >
              {[7, 14, 30].map((days) => (
                <option key={days} value={days}>
                  {days} days
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-baseline justify-between border-t border-line pt-4">
          <span className="text-sm text-muted">Total</span>
          <span className="text-xl font-semibold tabular-nums" aria-live="polite">
            {formatMoney(total)}
          </span>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={lines.length === 0}
            className="rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Create invoice
          </button>
        </div>
      </form>
    </Modal>
  )
}
