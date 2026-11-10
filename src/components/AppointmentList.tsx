import type { Appointment, AppointmentStatus } from '../data'

const statusColors: Record<AppointmentStatus, string> = {
  'Checked in': 'bg-blue-100 text-blue-800',
  Confirmed: 'bg-green-100 text-green-800',
  Pending: 'bg-amber-100 text-amber-800',
  Cancelled: 'bg-red-100 text-red-800',
  Completed: 'bg-slate-200 text-slate-700',
}

export default function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  return (
    <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
      {appointments.map((appt) => (
        <li key={appt.id} className="flex items-center gap-6 px-5 py-4">
          <span className="w-14 font-mono text-sm font-semibold text-slate-900">{appt.time}</span>
          <div className="flex-1">
            <div className="font-medium text-slate-900">{appt.patient}</div>
            <div className="text-sm text-slate-500">{appt.type}</div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[appt.status]}`}>
            {appt.status}
          </span>
        </li>
      ))}
    </ul>
  )
}
