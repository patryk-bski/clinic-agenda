// Dates stored as YYYY-MM-DD (dates of birth, visits). Adding a time makes the browser read them
// in local time, not UTC, so they never shift by a day.
export const toLocalDate = (date: string) => new Date(`${date}T00:00`)

export function ageFrom(dateOfBirth: string) {
  const birth = toLocalDate(dateOfBirth)
  const now = new Date()
  const hadBirthdayThisYear =
    now.getMonth() > birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate())
  return now.getFullYear() - birth.getFullYear() - (hadBirthdayThisYear ? 0 : 1)
}

// "28 Oct 2026"
export const formatDay = (date: string) =>
  toLocalDate(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// A Date as YYYY-MM-DD in local time (not UTC, which could be a different day)
export const isoDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')

export const todayIso = () => isoDate(new Date())

// YYYY-MM-DD plus a number of days (negative goes back)
export function addDays(date: string, days: number) {
  const next = toLocalDate(date)
  next.setDate(next.getDate() + days)
  return isoDate(next)
}

// The Monday of the week a date falls in
export function mondayOf(date: string) {
  const weekday = (toLocalDate(date).getDay() + 6) % 7 // 0 = Monday … 6 = Sunday
  return addDays(date, -weekday)
}

// "Today", "Tomorrow", "Yesterday", or e.g. "Thursday 12 November"
export function dayName(date: string, today = todayIso()) {
  if (date === today) return 'Today'
  if (date === addDays(today, 1)) return 'Tomorrow'
  if (date === addDays(today, -1)) return 'Yesterday'
  return toLocalDate(date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

// Short form for lists: "Today", "Tomorrow", or e.g. "Thu 12 Nov"
export function shortDayName(date: string, today = todayIso()) {
  if (date === today || date === addDays(today, 1)) return dayName(date, today)
  return toLocalDate(date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
