import type { Appointment } from '../data'
import AppointmentForm from './AppointmentForm'
import Modal from './Modal'

type Props = {
  times: string[]
  onBook: (appointment: Omit<Appointment, 'id'>) => void
  onClose: () => void
}

export default function BookingDialog({ times, onBook, onClose }: Props) {
  return (
    <Modal labelledBy="booking-title" onClose={onClose}>
      <h2 id="booking-title" className="text-lg font-medium">
        Book appointment
      </h2>
      <p className="mt-1 mb-6 text-sm text-muted">Add a new appointment to today's agenda.</p>
      <AppointmentForm
        times={times}
        submitLabel="Book appointment"
        onSubmit={onBook}
        onCancel={onClose}
      />
    </Modal>
  )
}
