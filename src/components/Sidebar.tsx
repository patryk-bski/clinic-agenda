import { BarChart3, Calendar, Inbox, Receipt, Search, Settings, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { Fragment } from 'react'
import { entrance } from '../motion'
import { pageLinks, type Page } from '../navigation'
import { searchShortcut } from '../search'
import Logo from './Logo'

const navItems: { label: string; icon: typeof Calendar; page: Page }[] = [
  { label: 'Agenda', icon: Calendar, page: 'agenda' },
  { label: 'Inbox', icon: Inbox, page: 'inbox' },
  { label: 'Patients', icon: Users, page: 'patients' },
  { label: 'Billing', icon: Receipt, page: 'billing' },
  { label: 'Reports', icon: BarChart3, page: 'reports' },
  { label: 'Settings', icon: Settings, page: 'settings' },
]

type Props = {
  currentPage: Page
  clinicianName: string
  specialty: string
  unreadCount: number
  onSearch: () => void
}

export default function Sidebar({
  currentPage,
  clinicianName,
  specialty,
  unreadCount,
  onSearch,
}: Props) {
  return (
    // A floating panel pinned to the window: 8px clear of the top, bottom and left edges,
    // it stays put while the page content scrolls. When the app opens it fades in, drifting
    // a few pixels in from the left.
    <motion.aside
      {...entrance(0, { x: -6 })}
      className="sticky top-2 my-2 ml-2 flex h-[calc(100vh-1rem)] w-60 shrink-0 flex-col overflow-y-auto rounded-lg border border-line bg-sidebar"
    >
      <div className="px-5 pt-5 pb-4">
        <Logo className="block h-6 w-auto" />
      </div>

      {/* Search everything. It looks like a search box, and shows its keyboard shortcut so
          people learn they can press it from anywhere. */}
      <div className="px-2 pb-3">
        <button
          onClick={onSearch}
          aria-keyshortcuts="Control+K Meta+K"
          className="flex w-full items-center gap-2 rounded-md border border-line bg-white px-3 py-1.5 text-sm text-muted transition-colors hover:border-field hover:text-ink"
        >
          <Search size={15} strokeWidth={1.75} aria-hidden />
          Search
          <kbd className="ml-auto font-sans text-xs text-muted">{searchShortcut}</kbd>
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {navItems.map(({ label, icon: Icon, page }) => {
          const isCurrent = page === currentPage
          return (
            <Fragment key={label}>
              {/* A divider sets Settings apart from the everyday screens above it */}
              {page === 'settings' && <hr className="mx-3 my-2 border-line" />}
              <a
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
                    className="ml-auto rounded-[6px] bg-brand px-1.5 text-xs leading-5 font-medium text-white tabular-nums"
                  >
                    {unreadCount}
                  </span>
                )}
              </a>
            </Fragment>
          )
        })}
      </nav>

      {/* Name and specialty come from Settings */}
      <div className="px-5 py-4 text-sm">
        <div className="font-medium">{clinicianName.trim() || 'Your name'}</div>
        {specialty.trim() && <div className="text-muted">{specialty}</div>}
      </div>
    </motion.aside>
  )
}
