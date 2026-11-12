// Weekly practice report: appointments for one week (Monday to Friday) and the numbers the
// Reports screen shows. In the current week, today's appointments come from the agenda; every
// other day is made up (generated, so any week can be shown).
import type { Appointment } from './data'
import { isoDate, mondayOf } from './dates'

export type Outcome = 'seen' | 'no-show' | 'cancelled' | 'upcoming'

type WeekAppointment = {
  day: number // 0 = Monday … 4 = Friday
  time: string // HH:MM
  type: string
  outcome: Outcome
}

// Made-up fees per appointment type, in euros
export const fees: Record<string, number> = {
  'New patient': 120,
  'Annual check-up': 90,
  'Follow-up': 60,
  'Blood test review': 50,
  'Telehealth call': 45,
  Vaccination: 40,
  'Prescription renewal': 30,
}

export const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

// A tiny seeded random number generator, so the fake week looks the same on every reload
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// How likely each half-hour slot is to be booked: mornings, especially 10–11, are busiest
const bookingChance: Record<number, number> = {
  8: 0.5, 9: 0.75, 10: 0.95, 11: 0.85, 12: 0.4, 13: 0.45, 14: 0.65, 15: 0.7, 16: 0.55, 17: 0.3,
}

// Days are generated; in the current week today comes from the agenda, so Reports and the agenda agree.
// `monday` (YYYY-MM-DD) picks the week: each week has its own seed, so it always looks the same.
function generateWeek(now: Date, monday: string, todaysAppointments: Appointment[]): WeekAppointment[] {
  const random = seededRandom(Number(monday.replaceAll('-', ''))) // e.g. 20261109
  const types = Object.keys(fees)
  const isCurrentWeek = monday === mondayOf(isoDate(now))
  // Which weekday is today (0 = Monday … 6 = Sunday). In a past week every day has already
  // happened, so "today" is treated as after Sunday.
  const today = isCurrentWeek ? (now.getDay() + 6) % 7 : 7
  const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const week: WeekAppointment[] = []
  for (let day = 0; day < 5; day++) {
    for (let hour = 8; hour <= 17; hour++) {
      for (const minutes of ['00', '30']) {
        // Always draw the same numbers in the same order, so the week doesn't change with the clock
        const booked = random() < bookingChance[hour]
        const type = types[Math.floor(random() * types.length)]
        const roll = random()
        if (!booked || day === today) continue

        const time = `${String(hour).padStart(2, '0')}:${minutes}`
        const isPast = day < today || (day === today && time < nowTime)
        const outcome: Outcome = !isPast
          ? 'upcoming'
          : roll < 0.08
            ? 'no-show'
            : roll < 0.15
              ? 'cancelled'
              : 'seen'
        week.push({ day, time, type, outcome })
      }
    }
  }

  // Today's agenda: earlier appointments count as seen, later ones as still to come
  if (today < 5) {
    for (const appt of todaysAppointments) {
      const outcome: Outcome =
        appt.status === 'cancelled' ? 'cancelled' : appt.time < nowTime ? 'seen' : 'upcoming'
      week.push({ day: today, time: appt.time, type: appt.type, outcome })
    }
  }
  return week
}

// The report for the week starting `monday` (YYYY-MM-DD): the current week or an earlier one
export function weeklyReport(now: Date, monday: string, todaysAppointments: Appointment[]) {
  const week = generateWeek(now, monday, todaysAppointments)
  const count = (outcome: Outcome) => week.filter((appt) => appt.outcome === outcome).length
  // Cancelled appointments don't take up the clinician's time, so they're left out of totals
  const scheduled = week.filter((appt) => appt.outcome !== 'cancelled')

  const seen = count('seen')
  const noShows = count('no-show')
  const upcoming = count('upcoming')

  const earned = week
    .filter((appt) => appt.outcome === 'seen')
    .reduce((sum, appt) => sum + (fees[appt.type] ?? 0), 0)
  const booked = week
    .filter((appt) => appt.outcome === 'upcoming')
    .reduce((sum, appt) => sum + (fees[appt.type] ?? 0), 0)

  // Appointments per weekday, split by outcome
  const perDay = weekdays.map((label, day) => {
    const ofDay = week.filter((appt) => appt.day === day)
    const by = (outcome: Outcome) => ofDay.filter((appt) => appt.outcome === outcome).length
    return {
      label,
      seen: by('seen'),
      'no-show': by('no-show'),
      cancelled: by('cancelled'),
      upcoming: by('upcoming'),
    }
  })

  // Scheduled appointments per hour of the day (08:00 means 08:00–08:59)
  const perHour = Array.from({ length: 10 }, (_, i) => {
    const hour = String(8 + i).padStart(2, '0')
    return { label: `${hour}:00`, value: scheduled.filter((appt) => appt.time.startsWith(hour)).length }
  })
  // Every hour that shares the top count (there can be a tie)
  const peak = Math.max(...perHour.map((slot) => slot.value))
  const busiest = { hours: perHour.filter((slot) => slot.value === peak).map((slot) => slot.label), count: peak }

  // Money earned from seen appointments, per appointment type, largest first
  const revenueByType = Object.keys(fees)
    .map((type) => ({
      label: type,
      value: week
        .filter((appt) => appt.outcome === 'seen' && appt.type === type)
        .reduce((sum, appt) => sum + (fees[appt.type] ?? 0), 0),
    }))
    .sort((a, b) => b.value - a.value)

  return {
    total: scheduled.length,
    seen,
    upcoming,
    noShows,
    // Share of appointments that should have happened but the patient didn't come
    noShowRate: seen + noShows > 0 ? noShows / (seen + noShows) : 0,
    cancelled: count('cancelled'),
    earned,
    booked,
    perDay,
    perHour,
    busiest,
    revenueByType,
  }
}

export type WeeklyReport = ReturnType<typeof weeklyReport>
