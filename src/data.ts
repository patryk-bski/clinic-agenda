import type { Status } from './status'

export type Appointment = {
  id: number
  time: string
  patient: string
  type: string
  status: Status
}

// Fake data: today's appointments for one clinician
export const appointments: Appointment[] = []

export type Patient = {
  id: number
  name: string
  dateOfBirth: string // YYYY-MM-DD
  phone: string
  lastVisit: string // YYYY-MM-DD
}

// Fake data: the clinician's patients (phone numbers are from a range reserved for fiction)
export const patients: Patient[] = [
  { id: 1, name: 'Maria Kowalska', dateOfBirth: '1958-03-14', phone: '+44 7700 900101', lastVisit: '2026-10-28' },
  { id: 2, name: 'James Carter', dateOfBirth: '1991-07-02', phone: '+44 7700 900102', lastVisit: '2026-11-03' },
  { id: 3, name: 'Aisha Rahman', dateOfBirth: '1984-11-21', phone: '+44 7700 900103', lastVisit: '2026-09-15' },
  { id: 4, name: 'Tomás Silva', dateOfBirth: '2016-05-09', phone: '+44 7700 900104', lastVisit: '2026-10-07' },
  { id: 5, name: 'Emily Nguyen', dateOfBirth: '1973-01-30', phone: '+44 7700 900105', lastVisit: '2025-11-12' },
  { id: 6, name: 'Piotr Nowak', dateOfBirth: '1966-08-17', phone: '+44 7700 900106', lastVisit: '2026-08-22' },
  { id: 7, name: 'Grace Okafor', dateOfBirth: '1999-12-05', phone: '+44 7700 900107', lastVisit: '2026-11-06' },
  { id: 8, name: 'Lucas Martin', dateOfBirth: '1947-04-26', phone: '+44 7700 900108', lastVisit: '2026-10-19' },
  { id: 9, name: 'Sofia Rossi', dateOfBirth: '1988-09-11', phone: '+44 7700 900109', lastVisit: '2026-06-30' },
  { id: 10, name: 'Daniel Becker', dateOfBirth: '2003-02-18', phone: '+44 7700 900110', lastVisit: '2026-10-31' },
]
