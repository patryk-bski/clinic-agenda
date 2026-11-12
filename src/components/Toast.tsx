import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { transition } from '../motion'

export type ToastMessage = {
  id: number // a new id shows a new note, even with the same text
  text: string // e.g. "Appointment booked"
  undo?: () => void // offers an Undo button when set
}

// How long a note stays up, unless the mouse or keyboard is on it
const visibleFor = 5000

type Props = {
  toast: ToastMessage | null
  onDismiss: () => void
}

// A short note at the bottom of the screen confirming what just happened, with Undo
export default function Toast({ toast, onDismiss }: Props) {
  return (
    // Fixed to the bottom, centred under the page (the sidebar takes the first 248px).
    // role="status": screen readers read each new note out without moving focus.
    <div
      role="status"
      className="pointer-events-none fixed right-0 bottom-6 left-[248px] z-40 flex justify-center px-4"
    >
      <AnimatePresence mode="popLayout">
        {/* Each note gets its own timer, so a new one starts the 5 seconds afresh */}
        {toast && <Note key={toast.id} toast={toast} onDismiss={onDismiss} />}
      </AnimatePresence>
    </div>
  )
}

function Note({ toast, onDismiss }: { toast: ToastMessage; onDismiss: () => void }) {
  // Paused while hovered or focused, so it doesn't vanish just as you reach for Undo
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = setTimeout(onDismiss, visibleFor)
    return () => clearTimeout(timer)
  }, [isPaused, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={transition}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="pointer-events-auto flex items-center gap-1 rounded-lg bg-brand py-1.5 pr-1.5 pl-4 text-sm text-white shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
    >
      <span className="mr-2">{toast.text}</span>
      {toast.undo && (
        <button
          onClick={() => {
            toast.undo?.()
            onDismiss()
          }}
          className="rounded-[6px] px-2 py-1 font-medium transition-colors hover:bg-white/15 focus-visible:outline-white"
        >
          Undo
        </button>
      )}
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="rounded-[6px] p-1.5 text-white/70 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-white"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </motion.div>
  )
}
