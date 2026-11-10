import { useEffect, useState } from 'react'

export type Page = 'agenda' | 'patients'

// Each screen has its own address after the #, so the back button and reloading both work
export const pageLinks: Record<Page, string> = {
  agenda: '#/',
  patients: '#/patients',
}

function pageFromAddress(): Page {
  return window.location.hash === pageLinks.patients ? 'patients' : 'agenda'
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
