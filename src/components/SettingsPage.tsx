import type { ReactNode } from 'react'
import { slotLengths, timeSlots, workingHourOptions, type Settings } from '../settings'

const fieldClass =
  'w-56 rounded-[6px] border border-field bg-white px-2.5 py-2 text-sm transition-colors focus:border-ink focus:outline-none'

const toMinutes = (time: string) => {
  const [hh, mm] = time.split(':').map(Number)
  return hh * 60 + mm
}

// One setting: label and explanation on the left, the control on the right
function SettingRow({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-8 border-b border-line py-4">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-0.5 block text-sm text-muted">{hint}</span>
      </span>
      {children}
    </label>
  )
}

type Props = {
  settings: Settings
  onChange: (settings: Settings) => void
}

// Changes apply straight away, so there's no Save button
export default function SettingsPage({ settings, onChange }: Props) {
  const update = (changes: Partial<Settings>) => onChange({ ...settings, ...changes })

  const start = toMinutes(settings.dayStart)
  const end = toMinutes(settings.dayEnd)
  const slots = timeSlots(settings)

  return (
    <>
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted">Your profile and working hours</p>
      </header>

      <section className="mb-12">
        <h2 className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">Profile</h2>
        <div className="border-t border-line">
          <SettingRow label="Name" hint="Shown at the bottom of the sidebar">
            <input
              value={settings.clinicianName}
              onChange={(e) => update({ clinicianName: e.target.value })}
              placeholder="e.g. Dr. Jane Doe"
              className={fieldClass}
            />
          </SettingRow>
          <SettingRow label="Specialty" hint="Shown under your name">
            <input
              value={settings.specialty}
              onChange={(e) => update({ specialty: e.target.value })}
              placeholder="e.g. General Practice"
              className={fieldClass}
            />
          </SettingRow>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
          Working hours
        </h2>
        <div className="border-t border-line">
          <SettingRow label="Day starts" hint="The earliest time you can book">
            <select
              value={settings.dayStart}
              onChange={(e) => update({ dayStart: e.target.value })}
              className={fieldClass}
            >
              {/* Only times that leave room for at least one slot before the day ends */}
              {workingHourOptions
                .filter((time) => toMinutes(time) + settings.slotMinutes <= end)
                .map((time) => (
                  <option key={time}>{time}</option>
                ))}
            </select>
          </SettingRow>
          <SettingRow label="Day ends" hint="The last appointment finishes by this time">
            <select
              value={settings.dayEnd}
              onChange={(e) => update({ dayEnd: e.target.value })}
              className={fieldClass}
            >
              {workingHourOptions
                .filter((time) => toMinutes(time) >= start + settings.slotMinutes)
                .map((time) => (
                  <option key={time}>{time}</option>
                ))}
            </select>
          </SettingRow>
          <SettingRow label="Time slot length" hint="How far apart bookable times are">
            <select
              value={settings.slotMinutes}
              onChange={(e) => update({ slotMinutes: Number(e.target.value) })}
              className={fieldClass}
            >
              {/* Hide lengths too long to fit in the working day */}
              {slotLengths
                .filter((minutes) => start + minutes <= end)
                .map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes} minutes
                  </option>
                ))}
            </select>
          </SettingRow>
        </div>
        <p className="mt-4 text-sm text-muted">
          Bookable times: {slots[0]} to {slots[slots.length - 1]} · {slots.length}{' '}
          {slots.length === 1 ? 'slot' : 'slots'} a day
        </p>
      </section>
    </>
  )
}
