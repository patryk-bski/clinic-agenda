import { CalendarDays, ChevronLeft, ChevronRight, Undo2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import type { Appointment } from '../../data'
import { addDays, isoDate, mondayOf, toLocalDate } from '../../dates'
import { formatMoney } from '../../money'
import { fade } from '../../motion'
import { weeklyReport } from '../../report'
import BarList from './BarList'
import ChartCard from './ChartCard'
import ColumnChart, { type Series } from './ColumnChart'

// Appointment outcomes, bottom to top in each day's column
const outcomeSeries: Series[] = [
  { key: 'seen', label: 'Seen', color: 'var(--color-series-1)' },
  { key: 'no-show', label: 'No-show', color: 'var(--color-series-2)' },
  { key: 'cancelled', label: 'Cancelled', color: 'var(--color-series-3)' },
  { key: 'upcoming', label: 'Still to come', color: 'var(--color-series-4)' },
]

const hourSeries: Series[] = [
  { key: 'value', label: 'Appointments', color: 'var(--color-series-1)' },
]

function StatTile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-lg border border-line p-5">
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-muted">{note}</div>
    </div>
  )
}

function DataTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-line text-left text-xs text-muted">
          {headers.map((header, i) => (
            <th key={header} className={`pb-2 font-normal ${i > 0 ? 'text-right' : ''}`}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row[0])} className="border-b border-line last:border-0">
            {row.map((cell, i) => (
              <td key={i} className={`py-2 ${i > 0 ? 'text-right tabular-nums' : ''}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function plural(count: number, word: string) {
  return `${count} ${count === 1 ? word : `${word}s`}`
}

type Props = {
  // The agenda's appointments, which make up today's numbers
  todaysAppointments: Appointment[]
}

export default function ReportsPage({ todaysAppointments }: Props) {
  // Read the clock once when the screen opens, then work out the week's numbers from it
  const [now] = useState(() => new Date())
  const thisMonday = mondayOf(isoDate(now))
  // The week shown, by its Monday (YYYY-MM-DD). Only this week and earlier ones: a report
  // describes what happened, and future weeks have no outcomes yet.
  const [monday, setMonday] = useState(thisMonday)
  const isThisWeek = monday === thisMonday
  const report = useMemo(
    () => weeklyReport(now, monday, todaysAppointments),
    [now, monday, todaysAppointments],
  )

  // Move to the week holding `date`, never past this week
  const showWeekOf = (date: string) =>
    setMonday(mondayOf(date) > thisMonday ? thisMonday : mondayOf(date))

  // "This week", "Last week" or "3 weeks ago", under the title
  const weeksAgo = Math.round(
    (toLocalDate(thisMonday).getTime() - toLocalDate(monday).getTime()) / (7 * 24 * 60 * 60 * 1000),
  )
  const whichWeek =
    weeksAgo === 0 ? 'This week' : weeksAgo === 1 ? 'Last week' : `${weeksAgo} weeks ago`

  // The navigator's label: "9–13 Nov", or "30 Nov – 4 Dec" when the week crosses into a new month
  const first = toLocalDate(monday)
  const last = toLocalDate(addDays(monday, 4))
  const short = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  const weekLabel =
    first.getMonth() === last.getMonth()
      ? `${first.getDate()}–${short(last)}`
      : `${short(first)} – ${short(last)}`

  // A finished week has nothing still to come, so its chart leaves that series out
  const shownSeries = isThisWeek ? outcomeSeries : outcomeSeries.filter((s) => s.key !== 'upcoming')

  const navButton =
    'flex items-center justify-center rounded-none px-2 py-1.5 text-sm transition-colors hover:bg-hover focus-visible:-outline-offset-2 disabled:cursor-not-allowed disabled:text-field disabled:hover:bg-transparent'

  // "09:00–10:00" for one busiest hour, "09:00 & 11:00" when hours tie
  const hourEnd = (hour: string) => `${String(Number(hour.slice(0, 2)) + 1).padStart(2, '0')}:00`
  const { hours: busiestHours, count: busiestCount } = report.busiest
  const busiestValue =
    busiestHours.length === 1
      ? `${busiestHours[0]}–${hourEnd(busiestHours[0])}`
      : busiestHours.join(' & ')

  return (
    // @container: the layout below adapts to the width of the content area, not the whole window
    <div className="@container">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        {/* Named like Inbox, Patients and Billing; which week it covers goes underneath */}
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Reports</h1>
          <p className="mt-2 text-sm text-muted">{whichWeek}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Only shown once you've moved away from this week */}
          {!isThisWeek && (
            <button
              onClick={() => setMonday(thisMonday)}
              className="group flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
            >
              <Undo2 size={15} strokeWidth={1.75} aria-hidden />
              <span className="underline-offset-2 group-hover:underline">Back to this week</span>
            </button>
          )}

          {/* The same control as the Agenda's: previous │ the week (click it for a calendar) │ next */}
          <div className="flex items-stretch overflow-hidden rounded-[6px] border border-field bg-white text-sm">
            <button
              onClick={() => setMonday(addDays(monday, -7))}
              aria-label="Previous week"
              className={navButton}
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            {/* Fixed width, so the arrows never move */}
            <label className="relative flex w-40 cursor-pointer items-center justify-center gap-2 border-x border-field px-3 font-medium whitespace-nowrap transition-colors hover:bg-hover has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-ink">
              {weekLabel}
              <CalendarDays size={15} strokeWidth={1.75} className="text-muted" aria-hidden />
              {/* An invisible date field over the label: clicking anywhere opens the browser's calendar */}
              <input
                type="date"
                value={monday}
                max={isoDate(now)}
                onChange={(e) => {
                  if (!e.target.value) return
                  showWeekOf(e.target.value)
                  // Let go of focus once a date is picked, so the control doesn't stay outlined
                  e.target.blur()
                }}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker()
                  } catch {
                    // Older browsers without showPicker() still let you type the date
                  }
                }}
                aria-label="Choose a week"
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
            {/* Greyed out on this week: there's no report for weeks that haven't happened */}
            <button
              onClick={() => setMonday(addDays(monday, 7))}
              disabled={isThisWeek}
              aria-label="Next week"
              className={navButton}
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </header>

      {/* The numbers crossfade when you switch weeks */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={monday} {...fade}>
          {/* The one number the Reports screen leads with */}
          <section className="mb-4 rounded-lg border border-line p-6">
            <div className="text-sm text-muted">{isThisWeek ? 'Revenue so far' : 'Revenue'}</div>
            <div className="mt-1 text-5xl font-semibold tracking-tight">
              {formatMoney(report.earned)}
            </div>
            <div className="mt-2 text-sm text-muted">
              From {plural(report.seen, 'appointment')} seen
              {isThisWeek &&
                ` · ${formatMoney(report.booked)} more booked for the rest of the week`}
            </div>
          </section>

          <div className="mb-4 grid gap-4 @xl:grid-cols-3">
            <StatTile
              label="Appointments"
              value={String(report.total)}
              note={
                isThisWeek
                  ? `${report.seen} seen · ${report.upcoming} still to come`
                  : `${report.seen} seen · ${report.noShows} missed`
              }
            />
            <StatTile
              label="No-shows"
              value={String(report.noShows)}
              note={`${Math.round(report.noShowRate * 100)}% of appointments${isThisWeek ? ' so far' : ''}`}
            />
            <StatTile
              label={busiestHours.length === 1 ? 'Busiest hour' : 'Busiest hours'}
              value={busiestValue}
              note={`${plural(busiestCount, 'appointment')}${busiestHours.length > 1 ? ' each' : ''}`}
            />
          </div>

          <div className="space-y-4">
            <ChartCard
              title="Appointments per day"
              subtitle={`${plural(report.cancelled, 'cancellation')} ${isThisWeek ? 'this' : 'that'} week, not counted in the total`}
              legend={shownSeries.map(({ label, color }) => ({ label, color }))}
              table={
                <DataTable
                  headers={['Day', ...shownSeries.map((s) => s.label)]}
                  rows={report.perDay.map((day) => [
                    day.label,
                    ...shownSeries.map((s) => day[s.key as keyof typeof day]),
                  ])}
                />
              }
            >
              <ColumnChart
                columns={report.perDay}
                series={shownSeries}
                showTotals
                describe={(day) =>
                  `${day.label}: ${shownSeries.map((s) => `${day[s.key]} ${s.label.toLowerCase()}`).join(', ')}`
                }
              />
            </ChartCard>

            <div className="grid gap-4 @3xl:grid-cols-2">
              <ChartCard
                title="Busiest hours"
                subtitle="Appointments starting in each hour, all week"
                table={
                  <DataTable
                    headers={['Hour', 'Appointments']}
                    rows={report.perHour.map((slot) => [slot.label, slot.value])}
                  />
                }
              >
                <ColumnChart
                  columns={report.perHour}
                  series={hourSeries}
                  highlight={busiestHours}
                  describe={(slot) => `${slot.label}: ${slot.value} appointments`}
                  // "08:00" → "08" on the axis, so ten hours fit side by side
                  axisLabel={(label) => label.slice(0, 2)}
                />
              </ChartCard>

              <ChartCard
                title="Revenue by appointment type"
                subtitle={isThisWeek ? 'From appointments seen so far' : 'From appointments seen'}
                table={
                  <DataTable
                    headers={['Type', 'Revenue']}
                    rows={report.revenueByType.map((row) => [row.label, formatMoney(row.value)])}
                  />
                }
              >
                <BarList rows={report.revenueByType} format={formatMoney} />
              </ChartCard>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
