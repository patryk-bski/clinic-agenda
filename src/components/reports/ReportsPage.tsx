import { useMemo, useState } from 'react'
import type { Appointment } from '../../data'
import { weeklyReport } from '../../report'
import BarList from './BarList'
import ChartCard from './ChartCard'
import ColumnChart, { type Series } from './ColumnChart'

const money = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})
const formatMoney = (value: number) => money.format(value)

// Appointment outcomes, bottom to top in each day's column
const outcomeSeries: Series[] = [
  { key: 'seen', label: 'Seen', color: 'var(--color-series-1)' },
  { key: 'no-show', label: 'No-show', color: 'var(--color-series-2)' },
  { key: 'cancelled', label: 'Cancelled', color: 'var(--color-series-3)' },
  { key: 'upcoming', label: 'Still to come', color: 'var(--color-series-4)' },
]

const hourSeries: Series[] = [{ key: 'value', label: 'Appointments', color: 'var(--color-series-1)' }]

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
  const report = useMemo(() => weeklyReport(now, todaysAppointments), [now, todaysAppointments])

  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  // "9–13 November", or "30 November – 4 December" when the week crosses into a new month
  const month = (date: Date) => date.toLocaleDateString('en-GB', { month: 'long' })
  const weekRange =
    month(monday) === month(friday)
      ? `${monday.getDate()}–${friday.getDate()} ${month(friday)}`
      : `${monday.getDate()} ${month(monday)} – ${friday.getDate()} ${month(friday)}`

  // "09:00–10:00" for one busiest hour, "09:00 & 11:00" when hours tie
  const hourEnd = (hour: string) => `${String(Number(hour.slice(0, 2)) + 1).padStart(2, '0')}:00`
  const { hours: busiestHours, count: busiestCount } = report.busiest
  const busiestValue =
    busiestHours.length === 1 ? `${busiestHours[0]}–${hourEnd(busiestHours[0])}` : busiestHours.join(' & ')

  return (
    // @container: the layout below adapts to the width of the content area, not the whole window
    <div className="@container">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">This week</h1>
        <p className="mt-2 text-sm text-muted">{weekRange} · Monday to Friday</p>
      </header>

      {/* The one number the Reports screen leads with */}
      <section className="mb-4 rounded-lg border border-line p-6">
        <div className="text-sm text-muted">Revenue so far</div>
        <div className="mt-1 text-5xl font-semibold tracking-tight">{formatMoney(report.earned)}</div>
        <div className="mt-2 text-sm text-muted">
          From {plural(report.seen, 'appointment')} seen · {formatMoney(report.booked)} more booked
          for the rest of the week
        </div>
      </section>

      <div className="mb-4 grid gap-4 @xl:grid-cols-3">
        <StatTile
          label="Appointments"
          value={String(report.total)}
          note={`${report.seen} seen · ${report.upcoming} still to come`}
        />
        <StatTile
          label="No-shows"
          value={String(report.noShows)}
          note={`${Math.round(report.noShowRate * 100)}% of appointments so far`}
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
          subtitle={`${plural(report.cancelled, 'cancellation')} this week, not counted in the total`}
          legend={outcomeSeries.map(({ label, color }) => ({ label, color }))}
          table={
            <DataTable
              headers={['Day', ...outcomeSeries.map((s) => s.label)]}
              rows={report.perDay.map((day) => [day.label, ...outcomeSeries.map((s) => day[s.key as keyof typeof day])])}
            />
          }
        >
          <ColumnChart
            columns={report.perDay}
            series={outcomeSeries}
            showTotals
            describe={(day) =>
              `${day.label}: ${outcomeSeries.map((s) => `${day[s.key]} ${s.label.toLowerCase()}`).join(', ')}`
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
            subtitle="From appointments seen so far"
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
    </div>
  )
}
