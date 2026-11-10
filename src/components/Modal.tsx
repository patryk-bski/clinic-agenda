import { motion } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { transition } from '../motion'

type Props = {
  labelledBy: string
  onClose: () => void
  children: ReactNode
}

// A centered popup over a dimmed page. Closes on Escape or a click outside the box.
// Render it inside <AnimatePresence> so it can animate out before it's removed.
export default function Modal({ labelledBy, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  // showModal() keeps focus inside the popup and makes the page behind it unclickable
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || dialog.open) return
    dialog.showModal()
    // Start in the first field (e.g. Patient name) rather than the first button, like Delete
    dialog.querySelector<HTMLElement>('input, select, textarea')?.focus()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      // On Escape, let React remove the popup instead of the browser, so the closing animation plays
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onClose={onClose}
      aria-labelledby={labelledBy}
      className="m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-transparent"
    >
      {/* Dimmed background; clicking it closes the popup */}
      <motion.div
        className="fixed inset-0 bg-ink/20"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      />

      <div className="pointer-events-none fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          className="pointer-events-auto w-full max-w-md rounded-lg border border-line bg-page text-ink shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={transition}
        >
          <AnimatedHeight>
            <div className="p-6">{children}</div>
          </AnimatedHeight>
        </motion.div>
      </div>
    </dialog>
  )
}

// Smoothly grows or shrinks the popup when its content changes size
function AnimatedHeight({ children }: { children: ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | 'auto'>('auto')

  useEffect(() => {
    const content = contentRef.current
    if (!content) return
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height))
    observer.observe(content)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div className="overflow-hidden" animate={{ height }} transition={transition}>
      <div ref={contentRef}>{children}</div>
    </motion.div>
  )
}
