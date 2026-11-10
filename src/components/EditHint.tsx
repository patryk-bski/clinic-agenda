import { Pencil } from 'lucide-react'

// A pencil that slides in from the right when its row is hovered (or reached with Tab),
// hinting that clicking opens the editor. The row needs Tailwind's `group` class.
// Its space is always kept, so the row's columns don't move when it appears.
export default function EditHint() {
  return (
    <Pencil
      aria-hidden
      size={15}
      strokeWidth={1.75}
      className="shrink-0 translate-x-2 text-muted opacity-0 transition duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 motion-reduce:translate-x-0"
    />
  )
}
