import {
  BarChart3,
  Calendar,
  CalendarClock,
  FilePlus2,
  Inbox,
  Plus,
  Receipt,
  Search,
  Settings,
  SquarePen,
  User,
  UserPlus,
  Users,
} from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { inboxKinds } from '../inbox'
import type { Page } from '../navigation'
import {
  plain,
  search,
  wordsOf,
  type SearchAction,
  type SearchData,
  type SearchResult,
  type SearchTarget,
} from '../search'
import Modal from './Modal'

// The same icons as the sidebar and the buttons these results stand for
const pageIcons: Record<Page, typeof Search> = {
  agenda: Calendar,
  inbox: Inbox,
  patients: Users,
  billing: Receipt,
  reports: BarChart3,
  settings: Settings,
}
const actionIcons: Record<SearchAction, typeof Search> = {
  book: Plus,
  'new-patient': UserPlus,
  'new-message': SquarePen,
  'new-invoice': FilePlus2,
}

function iconFor(target: SearchTarget) {
  switch (target.kind) {
    case 'action':
      return actionIcons[target.action]
    case 'page':
      return pageIcons[target.page]
    case 'patient':
      return User
    case 'appointment':
      return CalendarClock
    case 'invoice':
      return Receipt
    case 'inbox':
      return inboxKinds[target.inboxKind].icon
  }
}

// The title with every part that matches a typed word in bold, e.g. "**Sof**ia Rossi"
function Highlight({ text, words }: { text: string; words: string[] }) {
  const lower = plain(text) // same length as `text`, so positions line up
  const bold = new Array<boolean>(text.length).fill(false)
  for (const word of words) {
    for (let at = lower.indexOf(word); at !== -1; at = lower.indexOf(word, at + 1)) {
      bold.fill(true, at, at + word.length)
    }
  }
  // Split into runs of plain and bold characters
  const parts: { text: string; bold: boolean }[] = []
  ;[...text].forEach((char, i) => {
    const last = parts[parts.length - 1]
    if (last && last.bold === bold[i]) last.text += char
    else parts.push({ text: char, bold: bold[i] })
  })
  return (
    <>
      {parts.map((part, i) =>
        part.bold ? (
          <strong key={i} className="font-semibold">
            {part.text}
          </strong>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  )
}

type Props = {
  data: SearchData
  onChoose: (target: SearchTarget) => void
  onClose: () => void
}

// Search everything: patients, appointments, invoices, inbox items, actions and screens
export default function SearchDialog({ data, onChoose, onClose }: Props) {
  const [query, setQuery] = useState('')
  // Which result ↑ and ↓ have moved to; Enter opens it
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  const groups = search(query, data)
  const results: SearchResult[] = groups.flatMap((group) => group.results)
  const words = wordsOf(query)
  const activeResult = results[Math.min(active, results.length - 1)]

  // Keep the highlighted result in view when moving with the arrow keys
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, query])

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault() // don't move the text cursor
      const step = e.key === 'ArrowDown' ? 1 : -1
      // Wrap around from the last result to the first and back
      setActive((index) => (index + step + results.length) % results.length)
    } else if (e.key === 'Enter' && activeResult) {
      e.preventDefault()
      onChoose(activeResult.target)
    }
  }

  return (
    <Modal labelledBy="search-title" onClose={onClose} variant="search">
      <h2 id="search-title" className="sr-only">
        Search everything
      </h2>

      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search size={18} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
        {/* A combobox: typing filters the list below; the highlighted result is announced */}
        <input
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-activedescendant={activeResult ? `search-${activeResult.key}` : undefined}
          aria-label="Search patients, appointments, invoices and more"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0) // start again at the top of the new results
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search patients, appointments, invoices…"
          className="min-w-0 flex-1 bg-transparent py-4 text-base placeholder:text-muted focus:outline-none"
        />
      </div>

      <div
        ref={listRef}
        id="search-results"
        role="listbox"
        aria-label="Results"
        className="max-h-[min(26rem,60vh)] overflow-y-auto p-2"
      >
        {groups.map((group) => (
          <div
            key={group.label}
            role="group"
            aria-labelledby={`search-group-${group.label.replace(/\s/g, '-')}`}
          >
            <div
              id={`search-group-${group.label.replace(/\s/g, '-')}`}
              className="px-2 pt-2 pb-1 text-xs font-medium text-muted"
            >
              {group.label}
            </div>
            {group.results.map((result) => {
              const Icon = iconFor(result.target)
              const isActive = result === activeResult
              return (
                <div
                  key={result.key}
                  id={`search-${result.key}`}
                  role="option"
                  aria-selected={isActive}
                  // Hovering moves the highlight, so the mouse and keyboard never disagree
                  onMouseMove={() => setActive(results.indexOf(result))}
                  onClick={() => onChoose(result.target)}
                  className={`flex cursor-pointer items-center gap-3 rounded-[6px] px-2 py-2 text-sm ${
                    isActive ? 'bg-hover' : ''
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden />
                  <span className="min-w-0 truncate">
                    <Highlight text={result.title} words={words} />
                  </span>
                  {result.detail && (
                    <span className="ml-auto shrink-0 pl-2 text-xs text-muted tabular-nums">
                      {result.detail}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ))}

        {results.length === 0 && (
          <p className="px-2 py-8 text-center text-sm text-muted">
            No results for “{query.trim()}”
          </p>
        )}
      </div>

      {/* How to use it without a mouse */}
      <div className="flex gap-4 border-t border-line px-4 py-2.5 text-xs text-muted">
        <span>
          <kbd className="font-sans">↑</kbd> <kbd className="font-sans">↓</kbd> to move
        </span>
        <span>
          <kbd className="font-sans">Enter</kbd> to open
        </span>
        <span>
          <kbd className="font-sans">Esc</kbd> to close
        </span>
      </div>
    </Modal>
  )
}
