import type { Appointment } from '../data'
import StatusBadge from './StatusBadge'

export default function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  return (
    <ul className="border-t border-line">
      {appointments.map((appt) => (
        <li
          key={appt.id}
          className="flex items-center gap-8 border-b border-line px-2 py-3.5 hover:bg-hover/50"
        >
          <span className="w-12 text-sm text-muted tabular-nums">{appt.time}</span>
          <span className="flex-1 text-sm font-medium">{appt.patient}</span>
          <span className="w-48 text-sm text-muted">{appt.type}</span>
          <span className="w-24 text-right">
            <StatusBadge status={appt.status} />
          </span>
        </li>
      ))}
    </ul>
  )
}
