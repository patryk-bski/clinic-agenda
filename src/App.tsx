import { Plus } from 'lucide-react'
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
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 px-16 py-14">
        <div className="mx-auto max-w-4xl">
          <header className="mb-10 flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">Today</h1>
              <p className="mt-2 text-sm text-muted">
                {today} · {appointments.length} appointments
              </p>
            </div>
            <button
              onClick={() => alert('Booking form coming soon')}
              className="flex items-center gap-1.5 rounded-[6px] bg-[#C2410C] px-3 py-2 text-sm font-normal text-white hover:bg-[#9A3412]"
            >
              <Plus size={15} strokeWidth={1.75} />
              Book appointment
            </button>
          </header>

          <AppointmentList appointments={appointments} />
        </div>
      </main>
    </div>
  )
}
