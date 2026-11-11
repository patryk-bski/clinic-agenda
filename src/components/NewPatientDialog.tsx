import { type FormEvent, type MouseEvent } from 'react'
import type { Patient } from '../data'
import { todayIso } from '../dates'
import Modal from './Modal'

const fieldClass =
  'mt-1.5 w-full rounded-[6px] border border-field bg-white px-2.5 py-2 text-sm transition-colors placeholder:text-muted focus:border-ink focus:outline-none'

// Open the calendar from a click anywhere on the date field, not just the calendar icon
function openPicker(e: MouseEvent<HTMLInputElement>) {
  try {
    e.currentTarget.showPicker()
  } catch {
    // Older browsers without showPicker() still let you type the date
  }
}

type Props = {
  existingNames: string[] // names already in use
  onAdd: (patient: Omit<Patient, 'id'>) => void
  onClose: () => void
}

// Add someone to your patients. They have no visits yet, so there's no "Last visit" field.
export default function NewPatientDialog({ existingNames, onAdd, onClose }: Props) {
  const taken = new Set(existingNames.map((name) => name.trim().toLowerCase()))

  // Appointments, messages and invoices find a patient by name, so two patients can't share one
  function checkName(input: HTMLInputElement) {
    input.setCustomValidity(
      taken.has(input.value.trim().toLowerCase()) ? 'A patient with this name already exists' : '',
    )
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    onAdd({
      name: String(data.get('name')).trim().replace(/\s+/g, ' '),
      dateOfBirth: String(data.get('dateOfBirth')),
      phone: String(data.get('phone')).trim(),
      lastVisit: '', // not seen yet
    })
  }

  return (
    <Modal labelledBy="new-patient-title" onClose={onClose}>
      <h2 id="new-patient-title" className="text-lg font-medium">
        New patient
      </h2>
      <p className="mt-1 mb-6 text-sm text-muted">Add someone to your patients.</p>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <label className="block text-sm">
            Full name
            <input
              name="name"
              required
              pattern=".*\S.*"
              title="Enter the patient's name"
              autoComplete="off"
              placeholder="e.g. Anna Kowalski"
              onInput={(e) => checkName(e.currentTarget)}
              className={fieldClass}
            />
          </label>

          <label className="block text-sm">
            Date of birth
            <input
              name="dateOfBirth"
              type="date"
              required
              max={todayIso()}
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
              autoComplete="off"
              placeholder="e.g. +44 7700 900123"
              className={fieldClass}
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
            Add patient
          </button>
        </div>
      </form>
    </Modal>
  )
}
