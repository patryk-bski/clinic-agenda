import type { Appointment } from '../data'
import AppointmentForm from './AppointmentForm'
import Modal from './Modal'

type Props = {
  times: string[]
  // Pre-fills the patient, e.g. when booking from their record
  patient?: string
  onBook: (appointment: Omit<Appointment, 'id'>) => void
  onClose: () => void
}

export default function BookingDialog({ times, patient, onBook, onClose }: Props) {
  return (
    <Modal labelledBy="booking-title" onClose={onClose}>
      <h2 id="booking-title" className="text-lg font-medium">
        Book appointment
      </h2>
      <p className="mt-1 mb-6 text-sm text-muted">Add a new appointment to today's agenda.</p>
      <AppointmentForm
        initial={patient ? { patient } : undefined}
        times={times}
        submitLabel="Book appointment"
        onSubmit={onBook}
        onCancel={onClose}
      />
    </Modal>
  )
}
