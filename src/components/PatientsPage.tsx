import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { Patient } from '../data'
import { transition } from '../motion'
import EditHint from './EditHint'

// Dates are stored as YYYY-MM-DD; adding a time makes the browser read them in local time, not UTC
const toLocalDate = (date: string) => new Date(`${date}T00:00`)

function ageFrom(dateOfBirth: string) {
  const birth = toLocalDate(dateOfBirth)
  const now = new Date()
  const hadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate())
  return now.getFullYear() - birth.getFullYear() - (hadBirthdayThisYear ? 0 : 1)
}

function formatDate(date: string) {
  return toLocalDate(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

type SortKey = 'name' | 'age' | 'lastVisit'
type Sort = { key: SortKey; direction: 'asc' | 'desc' }

// How each column orders patients when sorted ascending
const compare: Record<SortKey, (a: Patient, b: Patient) => number> = {
  name: (a, b) => a.name.localeCompare(b.name), // A to Z
  age: (a, b) => b.dateOfBirth.localeCompare(a.dateOfBirth), // youngest first
  lastVisit: (a, b) => a.lastVisit.localeCompare(b.lastVisit), // oldest first
}

// The direction a column starts in when you first click it
const firstDirection: Record<SortKey, Sort['direction']> = {
  name: 'asc', // A to Z
  age: 'asc', // youngest first
  lastVisit: 'desc', // most recent first
}

// Words for screen readers, e.g. "Sorted by last visit, most recent first"
const directionWords: Record<SortKey, Record<Sort['direction'], string>> = {
  name: { asc: 'A to Z', desc: 'Z to A' },
  age: { asc: 'youngest first', desc: 'oldest first' },
  lastVisit: { asc: 'oldest first', desc: 'most recent first' },
}

// A column label that sorts the list when clicked
function SortButton({
  column,
  label,
  sort,
  onSort,
}: {
  column: SortKey
  label: string
  sort: Sort
  onSort: (column: SortKey) => void
}) {
  const isActive = sort.key === column
  const Arrow = !isActive ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown
  return (
    <button
      onClick={() => onSort(column)}
      aria-label={
        isActive
          ? `Sort by ${label.toLowerCase()}. Sorted ${directionWords[column][sort.direction]}`
          : `Sort by ${label.toLowerCase()}`
      }
      className={`-mx-1 flex items-center gap-1 rounded px-1 transition-colors hover:text-ink ${
        isActive ? 'font-medium text-ink' : ''
      }`}
    >
      {label}
      <Arrow size={12} strokeWidth={2} aria-hidden className={isActive ? '' : 'opacity-50'} />
    </button>
  )
}

type Props = {
  patients: Patient[]
  onSelect: (patient: Patient) => void
}

export default function PatientsPage({ patients, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>({ key: 'name', direction: 'asc' })

  const matches = patients
    .filter((patient) => patient.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => compare[sort.key](a, b) * (sort.direction === 'asc' ? 1 : -1))

  // Clicking the current column flips its order; clicking another column starts it fresh
  function sortBy(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: firstDirection[key] },
    )
  }


  return (
    <>
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Patients</h1>
        <p className="mt-2 text-sm text-muted">
          {patients.length} {patients.length === 1 ? 'patient' : 'patients'}
        </p>
      </header>

      <label className="mb-6 flex items-center gap-2 rounded-[6px] border border-field bg-white px-2.5 py-2 text-sm transition-colors focus-within:border-ink">
        <Search size={15} strokeWidth={1.75} className="text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search patients by name"
          aria-label="Search patients by name"
          className="flex-1 bg-transparent placeholder:text-muted focus:outline-none"
        />
      </label>

      {/* Column labels, lined up with the columns in each row; click one to sort by it */}
      <div className="flex gap-8 px-2 pb-2 text-xs text-muted">
        <span className="flex-1">
          <SortButton column="name" label="Name" sort={sort} onSort={sortBy} />
        </span>
        <span className="w-12">
          <SortButton column="age" label="Age" sort={sort} onSort={sortBy} />
        </span>
        <span className="w-40">Phone</span>
        <span className="w-28">
          <SortButton column="lastVisit" label="Last visit" sort={sort} onSort={sortBy} />
        </span>
        {/* Same width as the edit pencil in each row */}
        <span className="w-[15px]" />
      </div>

      <ul className="border-t border-line">
        <AnimatePresence initial={false}>
          {matches.map((patient) => (
            <motion.li
              key={patient.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={transition}
              className="overflow-hidden border-b border-line"
            >
              {/* The whole row is a button that opens the patient for editing */}
              <button
                onClick={() => onSelect(patient)}
                className="group flex w-full items-center gap-8 px-2 py-3.5 text-left text-sm transition-colors hover:bg-hover/50 focus-visible:bg-hover/50 focus-visible:-outline-offset-2"
              >
                <span className="flex-1 font-medium">{patient.name}</span>
                <span className="w-12 text-muted tabular-nums">{ageFrom(patient.dateOfBirth)}</span>
                <span className="w-40 text-muted tabular-nums">{patient.phone}</span>
                <span className="w-28 text-muted">{formatDate(patient.lastVisit)}</span>
                <EditHint />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {matches.length === 0 && (
        <p className="py-10 text-center text-sm text-muted">
          {patients.length === 0 ? 'No patients yet.' : `No patients match “${query.trim()}”.`}
        </p>
      )}
    </>
  )
}
