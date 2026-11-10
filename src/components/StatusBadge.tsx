export type Status = 'confirmed' | 'waiting' | 'cancelled'

const styles: Record<Status, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-green-50 text-green-700' },
  waiting: { label: 'Waiting', className: 'bg-amber-50 text-amber-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700' },
}

export default function StatusBadge({ status }: { status: Status }) {
  // Unknown values (e.g. from a real API later) show as a gray badge instead of crashing the page
  const { label, className } = styles[status] ?? { label: status, className: 'bg-hover text-muted' }

  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${className}`}>
      {label}
    </span>
  )
}
