import { BarChart3, Calendar, MessageSquare, Settings, Users } from 'lucide-react'

const navItems = [
  { label: 'Agenda', icon: Calendar },
  { label: 'Patients', icon: Users },
  { label: 'Messages', icon: MessageSquare },
  { label: 'Reports', icon: BarChart3 },
  { label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-sidebar">
      <div className="px-5 pt-5 pb-4 text-sm font-semibold">Clinic Agenda</div>

      <nav className="flex-1 space-y-0.5 px-2">
        {navItems.map(({ label, icon: Icon }) => (
          <a
            key={label}
            href="#"
            className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-hover ${
              label === 'Agenda' ? 'bg-hover font-medium' : 'text-muted'
            }`}
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </a>
        ))}
      </nav>

      <div className="px-5 py-4 text-sm">
        <div className="font-medium">Dr. Anna Lewis</div>
        <div className="text-muted">General Practice</div>
      </div>
    </aside>
  )
}
