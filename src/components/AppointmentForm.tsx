import type { FormEvent, Ref } from 'react'
import type { Appointment } from '../data'
import { readAppointmentForm } from '../formValues'
import { statusStyles } from '../status'

const appointmentTypes = [
  'Follow-up',
  'New patient',
  'Annual check-up',
  'Blood test review',
  'Vaccination',
  'Telehealth call',
  'Prescription renewal',
]

const fieldClass =
  'mt-1.5 w-full rounded-[6px] border border-field bg-white px-2.5 py-2 text-sm transition-colors focus:border-ink focus:outline-none'

type Props = {
  // Filled in when editing an existing appointment; empty (or just the patient) when booking
  initial?: Partial<Omit<Appointment, 'id'>>
  // Bookable times, from the working hours in Settings
  times: string[]
  showStatus?: boolean
  submitLabel: string
  onSubmit: (appointment: Omit<Appointment, 'id'>) => void
  onCancel: () => void
  ref?: Ref<HTMLFormElement>
}

// The fields shared by "Book appointment" and "Edit appointment"
export default function AppointmentForm({
  initial,
  times: bookableTimes,
  showStatus,
  submitLabel,
  onSubmit,
  onCancel,
  ref,
}: Props) {
  // Keep an existing appointment's time in the list even if it's outside the current working hours
  const times =
    initial?.time && !bookableTimes.includes(initial.time)
      ? [...bookableTimes, initial.time].sort()
      : bookableTimes

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSubmit(readAppointmentForm(e.currentTarget))
  }

  return (
    <form ref={ref} onSubmit={handleSubmit}>
      <div className="space-y-4">
        <label className="block text-sm">
          Patient name
          <input
            name="patient"
            required
            autoFocus
            pattern=".*\S.*"
            title="Enter the patient's name"
            placeholder="e.g. Jane Doe"
            defaultValue={initial?.patient}
            className={fieldClass}
          />
        </label>

        <label className="block text-sm">
          Time
          <select name="time" required defaultValue={initial?.time ?? ''} className={fieldClass}>
            <option value="" disabled>
              Select a time
            </option>
            {times.map((time) => (
              <option key={time}>{time}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          Appointment type
          <select name="type" defaultValue={initial?.type} className={fieldClass}>
            {appointmentTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        {showStatus && (
          <label className="block text-sm">
            Status
            <select name="status" defaultValue={initial?.status} className={fieldClass}>
              {Object.entries(statusStyles).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="mt-8 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
