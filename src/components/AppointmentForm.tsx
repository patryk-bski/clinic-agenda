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

// Bookable times: every 15 minutes from 07:00 to 19:45
const timeSlots = Array.from({ length: 52 }, (_, i) => {
  const minutes = 7 * 60 + i * 15
  const hh = String(Math.floor(minutes / 60)).padStart(2, '0')
  const mm = String(minutes % 60).padStart(2, '0')
  return `${hh}:${mm}`
})

const fieldClass =
  'mt-1.5 w-full rounded-[6px] border border-line bg-white px-2.5 py-2 text-sm transition-colors focus:border-muted focus:outline-none'

type Props = {
  // Filled in when editing an existing appointment; empty when booking a new one
  initial?: Omit<Appointment, 'id'>
  showStatus?: boolean
  submitLabel: string
  onSubmit: (appointment: Omit<Appointment, 'id'>) => void
  onCancel: () => void
  ref?: Ref<HTMLFormElement>
}

// The fields shared by "Book appointment" and "Edit appointment"
export default function AppointmentForm({
  initial,
  showStatus,
  submitLabel,
  onSubmit,
  onCancel,
  ref,
}: Props) {
  // Keep an existing appointment's time in the list even if it isn't on the 15-minute grid
  const times =
    initial && !timeSlots.includes(initial.time) ? [...timeSlots, initial.time].sort() : timeSlots

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
          className="rounded-[6px] bg-[#C2410C] px-3 py-2 text-sm text-white transition-colors hover:bg-[#9A3412]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
