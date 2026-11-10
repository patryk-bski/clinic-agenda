import AppointmentList from './components/AppointmentList'
import Sidebar from './components/Sidebar'
import { appointments } from './data'

export default function App() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Today's agenda</h1>
            <p className="text-sm text-slate-500">
              {today} · {appointments.length} appointments
            </p>
          </div>
          <button
            onClick={() => alert('Booking form coming soon')}
            className="rounded-xl bg-[#2563EB] px-6 py-3 text-base font-medium text-white hover:bg-[#1D4ED8]"
          >
            Book appointment
          </button>
        </header>

        <AppointmentList appointments={appointments} />
      </main>
    </div>
  )
}
