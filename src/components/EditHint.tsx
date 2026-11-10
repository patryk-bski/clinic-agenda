import { Pencil } from 'lucide-react'

// An icon that slides in from the right when its row is hovered (or reached with Tab), hinting
// what a click does: a pencil to edit (the default), or an arrow to open something.
// The row needs Tailwind's `group` class. Its space is always kept, so the columns don't move.
export default function EditHint({ icon: Icon = Pencil }: { icon?: typeof Pencil }) {
  return (
    <Icon
      aria-hidden
      size={15}
      strokeWidth={1.75}
      // Shows on hover, and when the row (or a button inside it) is reached with Tab
      className="shrink-0 translate-x-2 text-muted opacity-0 transition duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 group-has-[button:focus-visible]:translate-x-0 group-has-[button:focus-visible]:opacity-100 motion-reduce:translate-x-0"
    />
  )
}
