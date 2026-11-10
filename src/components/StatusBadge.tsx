import { statusStyles, type Status } from '../status'

export default function StatusBadge({ status }: { status: Status }) {
  // Unknown values (e.g. from a real API later) show as a gray badge instead of crashing the page
  const { label, className } = statusStyles[status] ?? { label: status, className: 'bg-hover text-muted' }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${className}`}>
      {label}
    </span>
  )
}
