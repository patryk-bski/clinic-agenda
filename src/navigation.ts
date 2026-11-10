import { useEffect, useState } from 'react'

export type Page = 'agenda' | 'inbox' | 'patients' | 'billing' | 'reports' | 'settings'

// Each screen has its own address after the #, so the back button and reloading both work
export const pageLinks: Record<Page, string> = {
  agenda: '#/',
  inbox: '#/inbox',
  patients: '#/patients',
  billing: '#/billing',
  reports: '#/reports',
  settings: '#/settings',
}

function pageFromAddress(): Page {
  const page = (Object.keys(pageLinks) as Page[]).find(
    (key) => pageLinks[key] === window.location.hash,
  )
  return page ?? 'agenda'
}

// The screen to show, kept in sync with the address bar
export function useCurrentPage() {
  const [page, setPage] = useState(pageFromAddress)

  useEffect(() => {
    const onAddressChange = () => setPage(pageFromAddress())
    window.addEventListener('hashchange', onAddressChange)
    return () => window.removeEventListener('hashchange', onAddressChange)
  }, [])

  return page
}
