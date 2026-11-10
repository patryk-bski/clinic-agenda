export type Status = 'confirmed' | 'waiting' | 'cancelled'

// Label and badge colors for each status
export const statusStyles: Record<Status, { label: string; className: string }> = {
  confirmed: { label: 'Confirmed', className: 'bg-green-50 text-green-700' },
  waiting: { label: 'Waiting', className: 'bg-amber-50 text-amber-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700' },
}
