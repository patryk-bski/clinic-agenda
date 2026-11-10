import { Search } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import type { Patient } from '../data'
import { transition } from '../motion'

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

type Props = {
  patients: Patient[]
  onSelect: (patient: Patient) => void
}

export default function PatientsPage({ patients, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const matches = patients.filter((patient) =>
    patient.name.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <>
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Patients</h1>
        <p className="mt-2 text-sm text-muted">
          {patients.length} {patients.length === 1 ? 'patient' : 'patients'}
        </p>
      </header>

      <label className="mb-6 flex items-center gap-2 rounded-[6px] border border-line bg-white px-2.5 py-2 text-sm transition-colors focus-within:border-muted">
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

      {/* Column labels, lined up with the columns in each row */}
      <div className="flex gap-8 px-2 pb-2 text-xs text-muted">
        <span className="flex-1">Name</span>
        <span className="w-12">Age</span>
        <span className="w-40">Phone</span>
        <span className="w-28">Last visit</span>
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
                className="flex w-full items-center gap-8 px-2 py-3.5 text-left text-sm transition-colors hover:bg-hover/50 focus-visible:bg-hover/50 focus-visible:outline-none"
              >
                <span className="flex-1 font-medium">{patient.name}</span>
                <span className="w-12 text-muted tabular-nums">{ageFrom(patient.dateOfBirth)}</span>
                <span className="w-40 text-muted tabular-nums">{patient.phone}</span>
                <span className="w-28 text-muted">{formatDate(patient.lastVisit)}</span>
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
