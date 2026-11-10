import type { Appointment, AppointmentStatus } from '../data'

const statusColors: Record<AppointmentStatus, string> = {
  'Checked in': 'bg-blue-50 text-blue-700',
  Confirmed: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-700',
  Cancelled: 'bg-red-50 text-red-700',
  Completed: 'bg-hover text-muted',
}

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
          <span className={`w-24 rounded px-2 py-0.5 text-center text-xs ${statusColors[appt.status]}`}>
            {appt.status}
          </span>
        </li>
      ))}
    </ul>
  )
}
