import type { Status } from './components/StatusBadge'

export type Appointment = {
  id: number
  time: string
  patient: string
  type: string
  status: Status
}

// Fake data: today's appointments for one clinician
export const appointments: Appointment[] = [
  { id: 1, time: '08:30', patient: 'Maria Kowalska', type: 'Follow-up', status: 'confirmed' },
  { id: 2, time: '09:00', patient: 'James Carter', type: 'New patient', status: 'cancelled' },
  { id: 3, time: '09:45', patient: 'Aisha Rahman', type: 'Blood test review', status: 'waiting' },
  { id: 4, time: '10:30', patient: 'Tomás Silva', type: 'Vaccination', status: 'confirmed' },
  { id: 5, time: '11:15', patient: 'Emily Nguyen', type: 'Annual check-up', status: 'waiting' },
  { id: 6, time: '13:00', patient: 'Piotr Nowak', type: 'Telehealth call', status: 'confirmed' },
  { id: 7, time: '14:00', patient: 'Grace Okafor', type: 'Follow-up', status: 'cancelled' },
  { id: 8, time: '15:30', patient: 'Lucas Martin', type: 'Prescription renewal', status: 'waiting' },
]
