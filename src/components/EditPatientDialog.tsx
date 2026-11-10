import { Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState, type FormEvent, type MouseEvent } from 'react'
import type { Patient } from '../data'
import { fade } from '../motion'
import Modal from './Modal'

const fieldClass =
  'mt-1.5 w-full rounded-[6px] border border-field bg-white px-2.5 py-2 text-sm transition-colors focus:border-ink focus:outline-none'

// Today as YYYY-MM-DD, so dates in the future can't be picked
const now = new Date()
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-')

// Open the calendar from a click anywhere on a date field, not just the calendar icon
function openPicker(e: MouseEvent<HTMLInputElement>) {
  try {
    e.currentTarget.showPicker()
  } catch {
    // Older browsers without showPicker() still let you type the date
  }
}

function readPatientForm(form: HTMLFormElement): Omit<Patient, 'id'> {
  const data = new FormData(form)
  return {
    name: String(data.get('name')).trim(),
    dateOfBirth: String(data.get('dateOfBirth')),
    phone: String(data.get('phone')).trim(),
    lastVisit: String(data.get('lastVisit')),
  }
}

type Props = {
  patient: Patient
  onSave: (changes: Omit<Patient, 'id'>) => void
  onDelete: () => void
  onClose: () => void
}

export default function EditPatientDialog({ patient, onSave, onDelete, onClose }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  // What the form shows; holds unsaved edits while the delete question is on screen
  const [draft, setDraft] = useState<Omit<Patient, 'id'>>(patient)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  function askToDelete() {
    // Remember unsaved edits so "Keep patient" brings them back
    if (formRef.current) setDraft(readPatientForm(formRef.current))
    setIsConfirmingDelete(true)
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSave(readPatientForm(e.currentTarget))
  }

  return (
    <Modal
      labelledBy={isConfirmingDelete ? 'delete-patient-title' : 'edit-patient-title'}
      onClose={onClose}
    >
      {/* Fade out one view, then fade in the other */}
      <AnimatePresence mode="wait" initial={false}>
        {isConfirmingDelete ? (
          <motion.div key="confirm" {...fade}>
            <h2 id="delete-patient-title" className="text-lg font-medium">
              Delete this patient?
            </h2>
            <p className="mt-2 text-sm text-muted">
              {patient.name} will be removed from your patients. This can't be undone.
            </p>
            <div className="mt-8 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                onClick={() => setIsConfirmingDelete(false)}
                className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
              >
                Keep patient
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-[6px] bg-[#B91C1C] px-3 py-2 text-sm text-white transition-colors hover:bg-[#991B1B]"
              >
                Delete patient
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="edit" {...fade}>
            <div className="mb-6 flex items-center justify-between">
              <h2 id="edit-patient-title" className="text-lg font-medium">
                Edit patient
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

            <form ref={formRef} onSubmit={handleSubmit}>
              <div className="space-y-4">
                <label className="block text-sm">
                  Full name
                  <input
                    name="name"
                    required
                    autoFocus
                    pattern=".*\S.*"
                    title="Enter the patient's name"
                    defaultValue={draft.name}
                    className={fieldClass}
                  />
                </label>

                <label className="block text-sm">
                  Date of birth
                  <input
                    name="dateOfBirth"
                    type="date"
                    required
                    max={today}
                    defaultValue={draft.dateOfBirth}
                    onClick={openPicker}
                    className={`${fieldClass} cursor-pointer`}
                  />
                </label>

                <label className="block text-sm">
                  Phone
                  <input
                    name="phone"
                    type="tel"
                    required
                    pattern="[0-9+ \-]{6,20}"
                    title="Use digits, spaces, + and -"
                    defaultValue={draft.phone}
                    className={fieldClass}
                  />
                </label>

                <label className="block text-sm">
                  Last visit
                  <input
                    name="lastVisit"
                    type="date"
                    required
                    max={today}
                    defaultValue={draft.lastVisit}
                    onClick={openPicker}
                    className={`${fieldClass} cursor-pointer`}
                  />
                </label>
              </div>

              <div className="mt-8 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover"
                >
                  Save changes
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
