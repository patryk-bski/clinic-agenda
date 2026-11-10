import { CalendarCheck } from 'lucide-react'
import BookButton from './BookButton'

type Props = {
  title?: string // e.g. "No appointments on Thursday 12 November"
  onBook: () => void
}

export default function EmptyState({ title = 'No appointments today', onBook }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center pb-24 text-center">
      <CalendarCheck size={40} strokeWidth={1.25} className="text-muted" />
      <h2 className="mt-5 text-lg font-medium">{title}</h2>
      <p className="mt-1.5 mb-6 text-sm text-muted">Enjoy the quiet, or book a new appointment.</p>
      <BookButton onClick={onBook} />
    </div>
  )
}
