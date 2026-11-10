import { Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'
import type { Appointment } from '../data'
import { formatDay } from '../dates'
import { readAppointmentForm } from '../formValues'
import { fade } from '../motion'
import AppointmentForm from './AppointmentForm'
import Modal from './Modal'

type Props = {
  appointment: Appointment
  times: string[]
  onSave: (changes: Omit<Appointment, 'id'>) => void
  onDelete: () => void
  onClose: () => void
}

export default function EditAppointmentDialog({
  appointment,
  times,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  // What the form shows; holds unsaved edits while the delete question is on screen
  const [draft, setDraft] = useState<Omit<Appointment, 'id'>>(appointment)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  function askToDelete() {
    // Remember unsaved edits so "Keep appointment" brings them back
    if (formRef.current) setDraft(readAppointmentForm(formRef.current))
    setIsConfirmingDelete(true)
  }

  return (
    <Modal labelledBy={isConfirmingDelete ? 'delete-title' : 'edit-title'} onClose={onClose}>
      {/* Fade out one view, then fade in the other */}
      <AnimatePresence mode="wait" initial={false}>
        {isConfirmingDelete ? (
          <motion.div key="confirm" {...fade}>
            <h2 id="delete-title" className="text-lg font-medium">
              Delete this appointment?
            </h2>
            <p className="mt-2 text-sm text-muted">
              {appointment.patient}'s appointment on {formatDay(appointment.date)} at{' '}
              {appointment.time} will be removed from the agenda. This can't be undone.
            </p>
            <div className="mt-8 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setIsConfirmingDelete(false)}
                className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
              >
                Keep appointment
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-[6px] bg-[#B91C1C] px-3 py-2 text-sm text-white transition-colors hover:bg-[#991B1B]"
              >
                Delete appointment
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="edit" {...fade}>
            <div className="mb-6 flex items-center justify-between">
              <h2 id="edit-title" className="text-lg font-medium">
                Edit appointment
              </h2>
              <button
                type="button"
                onClick={askToDelete}
                className="flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-sm text-muted transition-colors hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 size={14} strokeWidth={1.75} />
                Delete
              </button>
            </div>
            <AppointmentForm
              ref={formRef}
              initial={draft}
              times={times}
              showStatus
              submitLabel="Save changes"
              onSubmit={onSave}
              onCancel={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
