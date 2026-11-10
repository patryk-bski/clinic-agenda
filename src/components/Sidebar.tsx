import { BarChart3, Calendar, Inbox, Settings, Users } from 'lucide-react'
import { pageLinks, type Page } from '../navigation'
import Logo from './Logo'

const navItems: { label: string; icon: typeof Calendar; page: Page }[] = [
  { label: 'Agenda', icon: Calendar, page: 'agenda' },
  { label: 'Inbox', icon: Inbox, page: 'inbox' },
  { label: 'Patients', icon: Users, page: 'patients' },
  { label: 'Reports', icon: BarChart3, page: 'reports' },
  { label: 'Settings', icon: Settings, page: 'settings' },
]

type Props = {
  currentPage: Page
  clinicianName: string
  specialty: string
  unreadCount: number
}

export default function Sidebar({ currentPage, clinicianName, specialty, unreadCount }: Props) {
  return (
    // Pinned to the window: stays put, full height, while the page content scrolls
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-line bg-sidebar">
      <div className="px-5 pt-5 pb-4">
        <Logo className="block h-6 w-auto" />
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {navItems.map(({ label, icon: Icon, page }) => {
          const isCurrent = page === currentPage
          return (
            <a
              key={label}
              href={pageLinks[page]}
              aria-current={isCurrent ? 'page' : undefined}
              // The current screen also gets a dark bar on its left edge, so it doesn't rely on
              // the faint gray background alone
              className={`relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors hover:bg-hover ${
                isCurrent
                  ? 'bg-hover font-medium before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-ink'
                  : 'text-muted'
              }`}
            >
              <Icon size={16} strokeWidth={1.75} />
              {label}
              {/* How many inbox items haven't been opened yet */}
              {page === 'inbox' && unreadCount > 0 && (
                <span
                  aria-label={`${unreadCount} unread`}
                  className="ml-auto rounded-full bg-brand px-1.5 text-xs leading-5 font-medium text-white tabular-nums"
                >
                  {unreadCount}
                </span>
              )}
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
