export type Settings = {
  clinicianName: string
  specialty: string
  dayStart: string // HH:MM
  dayEnd: string // HH:MM
  slotMinutes: number
}

export const defaultSettings: Settings = {
  clinicianName: 'Dr. Anna Lewis',
  specialty: 'General Practice',
  dayStart: '07:00',
  dayEnd: '20:00',
  slotMinutes: 15,
}

export const slotLengths = [10, 15, 20, 30, 45, 60]

const toMinutes = (time: string) => {
  const [hh, mm] = time.split(':').map(Number)
  return hh * 60 + mm
}

const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

// Choices for when the day starts and ends: every half hour from 06:00 to 22:00
export const workingHourOptions = Array.from({ length: 33 }, (_, i) => toTime(6 * 60 + i * 30))

// Settings are remembered in this browser (localStorage), so they survive a page reload
const storageKey = 'clinic-agenda:settings'

export function loadSettings(): Settings {
  try {
    const saved = window.localStorage.getItem(storageKey)
    if (!saved) return defaultSettings
    // Fill in anything missing (e.g. a setting added in a later version) with the defaults
    const settings: Settings = { ...defaultSettings, ...JSON.parse(saved) }
    // If the saved hours don't leave any bookable time, fall back to the default hours
    return timeSlots(settings).length > 0 ? settings : { ...settings, ...defaultHours }
  } catch {
    // Storage can be blocked (e.g. some private windows) or hold broken data: use the defaults
    return defaultSettings
  }
}

export function saveSettings(settings: Settings) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(settings))
  } catch {
    // If storage is blocked, settings still work until the page reloads
  }
}

const defaultHours = {
  dayStart: defaultSettings.dayStart,
  dayEnd: defaultSettings.dayEnd,
  slotMinutes: defaultSettings.slotMinutes,
}

// Bookable times: one every slot length, from the start of the day until the last slot that
// still ends by the end of the day (e.g. 07:00 to 19:45 for 07:00–20:00 in 15-minute slots)
export function timeSlots({ dayStart, dayEnd, slotMinutes }: Settings) {
  const slots: string[] = []
  for (let t = toMinutes(dayStart); t + slotMinutes <= toMinutes(dayEnd); t += slotMinutes) {
    slots.push(toTime(t))
  }
  return slots
}
