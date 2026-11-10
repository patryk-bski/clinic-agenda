import { useState, type ReactNode } from 'react'

export type LegendItem = { label: string; color: string }

type Props = {
  title: string
  subtitle?: string
  // Shown when there are two or more series, so colors are never the only way to tell them apart
  legend?: LegendItem[]
  // The same numbers as a table, for anyone who'd rather read than look (or can't see the colors)
  table: ReactNode
  children: ReactNode
}

export default function ChartCard({ title, subtitle, legend, table, children }: Props) {
  const [showTable, setShowTable] = useState(false)

  return (
    <section className="rounded-lg border border-line p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        <button
          onClick={() => setShowTable((shown) => !shown)}
          aria-pressed={showTable}
          className="shrink-0 rounded-[6px] px-2 py-1 text-xs text-muted transition-colors hover:bg-hover"
        >
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </div>

      {legend && !showTable && (
        <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          {legend.map((item) => (
            <li key={item.label} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px]" style={{ background: item.color }} />
              {item.label}
            </li>
          ))}
        </ul>
      )}

      {showTable ? table : children}
    </section>
  )
}
