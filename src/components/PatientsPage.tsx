import {
  ArrowDown,
  ArrowDownAZ,
  ArrowDownZA,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  Search,
  UserPlus,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { Patient } from '../data'
import { ageFrom, formatDay } from '../dates'
import { transition } from '../motion'
import { patientLink } from '../navigation'
import EditHint from './EditHint'

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
  // Name is alphabetical, so it shows A→Z / Z→A; the other columns show plain arrows
  const Arrow =
    column === 'name'
      ? isActive && sort.direction === 'desc'
        ? ArrowDownZA
        : ArrowDownAZ
      : !isActive
        ? ArrowUpDown
        : sort.direction === 'asc'
          ? ArrowUp
          : ArrowDown
  return (
    <button
      onClick={() => onSort(column)}
      aria-label={
        isActive
          ? `Sort by ${label.toLowerCase()}. Sorted ${directionWords[column][sort.direction]}`
          : `Sort by ${label.toLowerCase()}`
      }
      // A light grey pill (darker for the column being sorted). The negative margin cancels the
      // padding, so the label still lines up with the values in the column below
      className={`-mx-2 flex items-center gap-1.5 rounded-[6px] px-2 py-1 text-sm whitespace-nowrap transition-colors hover:bg-line hover:text-ink ${
        isActive ? 'bg-line font-medium text-ink' : 'bg-hover'
      }`}
    >
      {label}
      <Arrow size={14} strokeWidth={2} aria-hidden className={isActive ? '' : 'opacity-60'} />
    </button>
  )
}

type Props = {
  patients: Patient[]
  onNew: () => void
}

export default function PatientsPage({ patients, onNew }: Props) {
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
      <header className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Patients</h1>
          <p className="mt-2 text-sm text-muted">
            {patients.length} {patients.length === 1 ? 'patient' : 'patients'}
          </p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-1.5 rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover"
        >
          <UserPlus size={15} strokeWidth={1.75} />
          New patient
        </button>
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
      <div className="flex items-center gap-8 px-2 pb-2 text-sm text-muted">
        <span className="flex-1">
          <span className="inline-flex">
            <SortButton column="name" label="Name" sort={sort} onSort={sortBy} />
          </span>
        </span>
        <span className="w-16">
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
              {/* The whole row is a link to the patient's record */}
              <a
                href={patientLink(patient.id)}
                className="group flex w-full items-center gap-8 px-2 py-3.5 text-left text-sm transition-colors hover:bg-hover/50 focus-visible:bg-hover/50 focus-visible:-outline-offset-2"
              >
                <span className="flex-1 font-medium">{patient.name}</span>
                <span className="w-16 text-muted tabular-nums">{ageFrom(patient.dateOfBirth)}</span>
                <span className="w-40 text-muted tabular-nums">{patient.phone}</span>
                <span className="w-28 text-muted">
                  {patient.lastVisit ? formatDay(patient.lastVisit) : 'Not yet'}
                </span>
                <EditHint icon={ArrowRight} />
              </a>
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
