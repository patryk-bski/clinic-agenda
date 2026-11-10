import type { Appointment } from './data'
import type { Status } from './status'

// Reads the appointment fields from a filled-in AppointmentForm
export function readAppointmentForm(form: HTMLFormElement): Omit<Appointment, 'id'> {
  const data = new FormData(form)
  return {
    patient: String(data.get('patient')).trim(),
    date: String(data.get('date')),
    time: String(data.get('time')),
    type: String(data.get('type')),
    // New bookings start as confirmed; edits keep whatever status was picked
    status: (data.get('status') as Status | null) ?? 'confirmed',
  }
}
