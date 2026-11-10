import { useState } from 'react'

export type Series = { key: string; label: string; color: string }
export type Column = { label: string } & Record<string, number | string>

type Props = {
  columns: Column[]
  // One series for plain columns, several for stacked ones (drawn bottom to top in this order)
  series: Series[]
  // Plain columns only: these columns keep their color and get their value printed; the rest go gray
  highlight?: string[]
  // Stacked columns: print each column's total on top
  showTotals?: boolean
  // Describes a column for screen readers, e.g. "Tue: 12 appointments"
  describe: (column: Column) => string
  // A shorter label for the axis when space is tight (the tooltip keeps the full one)
  axisLabel?: (label: string) => string
}

const plotHeight = 160

// Round the top of the scale up to a clean number whose half is a whole number too
// (e.g. 3 → 4, 9 → 10, 16 → 20), so the three ticks read like 0 / 10 / 20
function niceMax(value: number) {
  if (value <= 4) return 4
  if (value <= 10) return 10
  return Math.ceil(value / 10) * 10
}

export default function ColumnChart({
  columns,
  series,
  highlight,
  showTotals,
  describe,
  axisLabel = (label) => label,
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null)

  const totalOf = (column: Column) => series.reduce((sum, s) => sum + Number(column[s.key]), 0)
  const max = niceMax(Math.max(...columns.map(totalOf)))
  const ticks = [max, max / 2, 0]

  return (
    <div className="flex gap-3">
      {/* Y axis labels */}
      <div className="relative w-6 shrink-0 text-right text-xs text-muted tabular-nums" style={{ height: plotHeight }}>
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute right-0 -translate-y-1/2"
            style={{ top: `${100 - (tick / max) * 100}%` }}
          >
            {tick}
          </span>
        ))}
      </div>

      <div className="flex-1">
        <div className="relative" style={{ height: plotHeight }}>
          {/* Hairline gridlines; the bottom one is the baseline */}
          {ticks.map((tick) => (
            <div
              key={tick}
              className="absolute inset-x-0 h-px bg-chart-grid"
              style={{ top: `${100 - (tick / max) * 100}%` }}
            />
          ))}

          <div className="absolute inset-0 flex">
            {columns.map((column, i) => {
              const total = totalOf(column)
              const isHighlighted = highlight === undefined || highlight.includes(column.label)
              const showValue = (highlight !== undefined && isHighlighted) || showTotals
              return (
                <div
                  key={column.label}
                  tabIndex={0}
                  aria-label={describe(column)}
                  onPointerEnter={() => setHovered(i)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  // The whole band is the hover target, not just the thin column
                  className="relative flex flex-1 items-end justify-center focus-visible:-outline-offset-2"
                >
                  <div
                    // At most 24px wide, and narrower when space is tight, so columns never touch
                    className={`relative flex w-3/5 max-w-6 flex-col-reverse gap-[2px] transition-[filter] ${hovered === i ? 'brightness-110' : ''}`}
                    style={{ height: `${(total / max) * 100}%` }}
                  >
                    {/* Segments stack bottom to top, with a 2px gap of background between them */}
                    {series.map(
                      (s) =>
                        Number(column[s.key]) > 0 && (
                          <div
                            key={s.key}
                            // Rounded only at the top end; square where it meets the baseline
                            className="last:rounded-t-[4px]"
                            style={{
                              flexGrow: Number(column[s.key]),
                              background: isHighlighted ? s.color : 'var(--color-chart-rest)',
                            }}
                          />
                        ),
                    )}
                  </div>
                  {showValue && total > 0 && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 pb-1 text-xs font-medium"
                      style={{ bottom: `${(total / max) * 100}%` }}
                    >
                      {total}
                    </span>
                  )}

                  {hovered === i && (
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full z-10 mb-2 rounded-[6px] border border-line bg-white px-2.5 py-1.5 text-xs whitespace-nowrap shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
                    >
                      <div className="font-medium">{column.label}</div>
                      {series.map((s) => (
                        <div key={s.key} className="mt-0.5 flex items-center gap-1.5 text-muted">
                          {/* A short line in the series color, not a box */}
                          <span className="h-0.5 w-2.5 rounded-full" style={{ background: s.color }} />
                          <span className="font-medium text-ink">{Number(column[s.key])}</span>
                          {series.length > 1 && s.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* X axis labels */}
        <div className="mt-2 flex text-xs text-muted">
          {columns.map((column) => (
            <span key={column.label} className="flex-1 text-center">
              {axisLabel(column.label)}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
