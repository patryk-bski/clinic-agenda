import { CalendarCheck } from 'lucide-react'

type Props = {
  title?: string // e.g. "No appointments on Thursday 12 November"
}

// Shown on a day with no appointments. It has no button of its own: the Agenda's
// "Book appointment" button is always just above it.
export default function EmptyState({ title = 'No appointments today' }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center pb-24 text-center">
      <CalendarCheck size={40} strokeWidth={1.25} className="text-muted" />
      <h2 className="mt-5 text-lg font-medium">{title}</h2>
      <p className="mt-1.5 text-sm text-muted">Enjoy the quiet, or book a new appointment.</p>
    </div>
  )
}
