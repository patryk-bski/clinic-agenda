import { Pencil } from 'lucide-react'
import { useState } from 'react'
import type { Appointment } from '../data'
import AppointmentForm from './AppointmentForm'
import Modal from './Modal'
import StatusBadge from './StatusBadge'

type Props = {
  appointment: Appointment
  onSave: (changes: Omit<Appointment, 'id'>) => void
  onClose: () => void
}

export default function AppointmentDetails({ appointment, onSave, onClose }: Props) {
  const [isEditing, setIsEditing] = useState(false)

  function save(changes: Omit<Appointment, 'id'>) {
    onSave(changes)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Modal labelledBy="details-title" onClose={onClose}>
        <h2 id="details-title" className="mb-6 text-lg font-medium">
          Edit appointment
        </h2>
        <AppointmentForm
          initial={appointment}
          showStatus
          submitLabel="Save changes"
          onSubmit={save}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>
    )
  }

  return (
    <Modal labelledBy="details-title" onClose={onClose}>
      <p className="text-sm text-muted">Appointment</p>
      <h2 id="details-title" className="mt-1 text-2xl font-semibold tracking-tight">
        {appointment.patient}
      </h2>

      <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
        <div className="flex py-3">
          <dt className="w-32 text-muted">Time</dt>
          <dd className="tabular-nums">Today at {appointment.time}</dd>
        </div>
        <div className="flex py-3">
          <dt className="w-32 text-muted">Type</dt>
          <dd>{appointment.type}</dd>
        </div>
        <div className="flex items-center py-3">
          <dt className="w-32 text-muted">Status</dt>
          <dd>
            <StatusBadge status={appointment.status} />
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-[6px] bg-hover px-3 py-2 text-sm hover:bg-line">
          Close
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1.5 rounded-[6px] bg-[#C2410C] px-3 py-2 text-sm text-white hover:bg-[#9A3412]"
        >
          <Pencil size={14} strokeWidth={1.75} />
          Edit
        </button>
      </div>
    </Modal>
  )
}
