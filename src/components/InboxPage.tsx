import { CornerUpLeft, Send, SquarePen, TriangleAlert } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { InboxItem, InboxKind } from '../data'
import { flaggedCount, inboxKinds, responses, shortDate, shortTime, type SentEntry } from '../inbox'
import { transition } from '../motion'

type Filter = 'all' | InboxKind | 'sent'

// "All" has no icon; each kind uses the same icon as its rows in the list
const filters: { value: Filter; label: string; icon?: typeof CornerUpLeft }[] = [
  { value: 'all', label: 'All' },
  ...(Object.keys(inboxKinds) as InboxKind[]).map((kind) => ({
    value: kind,
    label: inboxKinds[kind].plural,
    icon: inboxKinds[kind].icon,
  })),
]

const rowMotion = {
  layout: true,
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: 'auto' },
  exit: { opacity: 0, height: 0 },
  transition,
  className: 'overflow-hidden border-b border-line',
}

const rowClass =
  'flex w-full items-center gap-4 px-2 py-3.5 text-left text-sm transition-colors hover:bg-hover/50 focus-visible:bg-hover/50 focus-visible:-outline-offset-2'

const tabClass = (isCurrent: boolean) =>
  `flex items-center gap-1.5 border-b-2 py-1.5 text-sm transition-colors ${
    isCurrent ? 'border-ink font-medium' : 'border-transparent text-muted hover:text-ink'
  }`

type Props = {
  items: InboxItem[]
  sent: SentEntry[] // everything you've sent, newest first
  now: Date
  onOpen: (item: InboxItem) => void
  onOpenSent: (entry: SentEntry) => void
  onMarkAllRead: () => void
  onNewMessage: () => void
}

export default function InboxPage({
  items,
  sent,
  now,
  onOpen,
  onOpenSent,
  onMarkAllRead,
  onNewMessage,
}: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const shown = filter === 'all' ? items : items.filter((item) => item.kind === filter)
  const unread = items.filter((item) => !item.read).length

  // After you send a new message, show the Sent list so you can see it went.
  // Updated during render (React's "previous value" pattern), like the Agenda's slide direction.
  const writtenCount = sent.filter((entry) => entry.message).length
  const [lastWrittenCount, setLastWrittenCount] = useState(writtenCount)
  if (writtenCount !== lastWrittenCount) {
    setLastWrittenCount(writtenCount)
    if (writtenCount > lastWrittenCount) setFilter('sent')
  }

  return (
    <>
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Inbox</h1>
          <p className="mt-2 text-sm text-muted">
            {unread === 0 ? 'All caught up' : `${unread} unread`}
          </p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button
              onClick={onMarkAllRead}
              className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={onNewMessage}
            className="flex items-center gap-1.5 rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover"
          >
            <SquarePen size={15} strokeWidth={1.75} />
            New message
          </button>
        </div>
      </header>

      {/* Filter tabs, each with how many items it holds; the selected one is underlined.
          What you've received comes first; a thin line sets "Sent" apart. */}
      <div role="tablist" aria-label="Show" className="mb-4 flex items-center gap-4">
        {filters.map(({ value, label, icon: Icon }) => {
          const count =
            value === 'all' ? items.length : items.filter((item) => item.kind === value).length
          return (
            <button
              key={value}
              role="tab"
              aria-selected={filter === value}
              onClick={() => setFilter(value)}
              className={tabClass(filter === value)}
            >
              {Icon && <Icon size={15} strokeWidth={1.75} aria-hidden />}
              {label} <span className="text-muted tabular-nums">{count}</span>
            </button>
          )
        })}
        <span aria-hidden className="h-4 w-px bg-line" />
        <button
          role="tab"
          aria-selected={filter === 'sent'}
          onClick={() => setFilter('sent')}
          className={tabClass(filter === 'sent')}
        >
          <Send size={15} strokeWidth={1.75} aria-hidden />
          Sent <span className="text-muted tabular-nums">{sent.length}</span>
        </button>
      </div>

      {filter === 'sent' ? (
        <>
          <ul className="border-t border-line">
            <AnimatePresence initial={false}>
              {sent.map((entry) => (
                <motion.li key={entry.key} {...rowMotion}>
                  <button
                    onClick={() => onOpenSent(entry)}
                    aria-label={`Sent to ${entry.to}: ${entry.subject}`}
                    className={rowClass}
                  >
                    {/* Same spacing as the unread dot in the received list, so the columns line up */}
                    <span className="size-2 shrink-0" />
                    <Send size={16} strokeWidth={1.75} className="shrink-0 text-muted" />
                    <span className="w-36 shrink-0 truncate">
                      <span className="text-muted">To </span>
                      {entry.to}
                    </span>
                    <span className="min-w-0 flex-1 truncate">
                      {entry.subject}
                      <span className="text-muted"> — {entry.body.replace(/\s+/g, ' ')}</span>
                    </span>
                    <span className="w-20 shrink-0 text-right text-muted tabular-nums">
                      {shortDate(entry.sentAt, now)}
                    </span>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {sent.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">
              Nothing sent yet. Messages and replies you send will show up here.
            </p>
          )}
        </>
      ) : (
        <>
          <ul className="border-t border-line">
            <AnimatePresence initial={false}>
              {shown.map((item) => {
                const Icon = inboxKinds[item.kind].icon
                const ResponseIcon = responses[item.kind].icon
                const flagged = flaggedCount(item)
                return (
                  <motion.li key={item.id} {...rowMotion}>
                    <button
                      onClick={() => onOpen(item)}
                      aria-label={`${item.read ? '' : 'Unread. '}${inboxKinds[item.kind].label} about ${item.patient}: ${item.subject}${
                        item.replies?.length
                          ? item.kind === 'lab'
                            ? ', patient messaged'
                            : ', replied'
                          : ''
                      }`}
                      className={rowClass}
                    >
                      {/* Unread dot; the space stays when read, so rows line up */}
                      <span
                        className={`size-2 shrink-0 rounded-full ${item.read ? '' : 'bg-brand'}`}
                      />
                      <Icon size={16} strokeWidth={1.75} className="shrink-0 text-muted" />
                      <span className={`w-36 shrink-0 truncate ${item.read ? '' : 'font-medium'}`}>
                        {item.patient}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        <span className={item.read ? '' : 'font-medium'}>{item.subject}</span>
                        <span className="text-muted"> — {item.body.replace(/\s+/g, ' ')}</span>
                      </span>
                      {flagged > 0 && (
                        <span className="flex shrink-0 items-center gap-1 rounded-[6px] bg-red-50 px-2 py-0.5 text-xs text-red-700">
                          <TriangleAlert size={12} strokeWidth={2} />
                          Flagged
                        </span>
                      )}
                      {/* Shows you've responded: a reply arrow, or a paper plane for a messaged patient */}
                      {item.replies && item.replies.length > 0 && (
                        <ResponseIcon
                          size={14}
                          strokeWidth={1.75}
                          aria-hidden
                          className="shrink-0 text-muted"
                        />
                      )}
                      <span className="w-20 shrink-0 text-right text-muted tabular-nums">
                        {shortTime(item, now)}
                      </span>
                    </button>
                  </motion.li>
                )
              })}
            </AnimatePresence>
          </ul>

          {shown.length === 0 && (
            <p className="py-10 text-center text-sm text-muted">Nothing here yet.</p>
          )}
        </>
      )}
    </>
  )
}
