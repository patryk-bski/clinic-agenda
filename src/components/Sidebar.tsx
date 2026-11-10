import { Calendar, Settings, Users } from 'lucide-react'
import { pageLinks, type Page } from '../navigation'

const navItems: { label: string; icon: typeof Calendar; page: Page }[] = [
  { label: 'Agenda', icon: Calendar, page: 'agenda' },
  { label: 'Patients', icon: Users, page: 'patients' },
  { label: 'Settings', icon: Settings, page: 'settings' },
]

type Props = {
  currentPage: Page
  clinicianName: string
  specialty: string
}

export default function Sidebar({ currentPage, clinicianName, specialty }: Props) {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-sidebar">
      <div className="px-5 pt-5 pb-4 text-sm font-semibold">Clinic Agenda</div>

      <nav className="flex-1 space-y-0.5 px-2">
        {navItems.map(({ label, icon: Icon, page }) => {
          const isCurrent = page === currentPage
          return (
            <a
              key={label}
              href={pageLinks[page]}
              aria-current={isCurrent ? 'page' : undefined}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-hover ${
                isCurrent ? 'bg-hover font-medium' : 'text-muted'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
            </a>
          )
        })}
      </nav>

      {/* Name and specialty come from Settings */}
      <div className="px-5 py-4 text-sm">
        <div className="font-medium">{clinicianName.trim() || 'Your name'}</div>
        {specialty.trim() && <div className="text-muted">{specialty}</div>}
      </div>
    </aside>
  )
}
