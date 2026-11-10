import { useEffect, useRef, type ReactNode } from 'react'

type Props = {
  labelledBy: string
  onClose: () => void
  children: ReactNode
}

// A centered popup over a dimmed page. Closes on Escape or a click outside the box.
export default function Modal({ labelledBy, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // showModal() dims the page behind it, keeps focus inside and closes on Escape
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      aria-labelledby={labelledBy}
      className="m-auto w-full max-w-md rounded-lg border border-line bg-page text-ink shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop:bg-ink/20"
    >
      <div className="p-6">{children}</div>
    </dialog>
  )
}
