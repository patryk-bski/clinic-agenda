import type { Appointment } from '../data'
import StatusBadge from './StatusBadge'

type Props = {
  appointments: Appointment[]
  onSelect: (appointment: Appointment) => void
}

export default function AppointmentList({ appointments, onSelect }: Props) {
  return (
    <ul className="border-t border-line">
      {appointments.map((appt) => (
        <li key={appt.id} className="border-b border-line">
          {/* The whole row is a button that opens the appointment's details */}
          <button
            onClick={() => onSelect(appt)}
            className="flex w-full cursor-pointer items-center gap-8 px-2 py-3.5 text-left hover:bg-hover/50 focus-visible:bg-hover/50 focus-visible:outline-none"
          >
            <span className="w-12 text-sm text-muted tabular-nums">{appt.time}</span>
            <span className="flex-1 text-sm font-medium">{appt.patient}</span>
            <span className="w-48 text-sm text-muted">{appt.type}</span>
            <span className="w-24 text-right">
              <StatusBadge status={appt.status} />
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
