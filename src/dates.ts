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
