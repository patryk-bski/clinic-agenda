import type { ReactNode } from 'react'

// One keyboard key drawn as a small rounded key cap, e.g. [Ctrl] [K] or [⌘] [K].
// The thin line under it reads as the key's edge, like the shortcuts in Notion or GitHub.
export default function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded-[4px] border border-line bg-sidebar px-1 font-sans text-[11px] leading-none font-medium text-muted shadow-[0_1px_0_var(--color-line)]">
      {children}
    </kbd>
  )
}
