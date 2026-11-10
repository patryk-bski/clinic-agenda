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
