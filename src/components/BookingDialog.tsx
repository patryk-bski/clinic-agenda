import type { Appointment } from '../data'
import AppointmentForm from './AppointmentForm'
import Modal from './Modal'

type Props = {
  times: string[]
  // The day the form starts on, e.g. the day shown in the Agenda
  date: string
  // Pre-fills the patient, e.g. when booking from their record
  patient?: string
  onBook: (appointment: Omit<Appointment, 'id'>) => void
  onClose: () => void
}

export default function BookingDialog({ times, date, patient, onBook, onClose }: Props) {
  return (
    <Modal labelledBy="booking-title" onClose={onClose}>
      <h2 id="booking-title" className="text-lg font-medium">
        Book appointment
      </h2>
      <p className="mt-1 mb-6 text-sm text-muted">Add a new appointment to the agenda.</p>
      <AppointmentForm
        initial={{ date, patient }}
        times={times}
        submitLabel="Book appointment"
        onSubmit={onBook}
        onCancel={onClose}
      />
    </Modal>
  )
}
