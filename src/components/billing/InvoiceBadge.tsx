import { statusStyles, type InvoiceStatus } from '../../billing'

// Paid / Unpaid / Overdue label, styled like the appointment status badges
export default function InvoiceBadge({ status }: { status: InvoiceStatus }) {
  const { label, className } = statusStyles[status]
  return (
    <span className={`inline-block rounded-[6px] px-2.5 py-0.5 text-xs transition-colors duration-300 ${className}`}>
      {label}
    </span>
  )
}
