import { useState } from 'react'

type Props = {
  rows: { label: string; value: number }[]
  format: (value: number) => string
}

// Horizontal bars, one per row, with the value printed at the end of each bar
export default function BarList({ rows, format }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const max = Math.max(...rows.map((row) => row.value), 1)

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => (
        <li
          key={row.label}
          tabIndex={0}
          aria-label={`${row.label}: ${format(row.value)}`}
          onPointerEnter={() => setHovered(row.label)}
          onPointerLeave={() => setHovered(null)}
          onFocus={() => setHovered(row.label)}
          onBlur={() => setHovered(null)}
          className="grid grid-cols-[9.5rem_1fr] items-center gap-3 text-sm outline-none"
        >
          <span className="truncate text-muted">{row.label}</span>
          <span className="flex items-center gap-2">
            {row.value > 0 && (
              <span
                // Rounded at the value end; square where it starts
                className={`h-3 max-w-full rounded-r-[4px] bg-series-1 transition-[filter] ${hovered === row.label ? 'brightness-110' : ''}`}
                style={{ width: `calc((100% - 3.5rem) * ${row.value / max})` }}
              />
            )}
            <span className="text-xs font-medium tabular-nums">{format(row.value)}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
