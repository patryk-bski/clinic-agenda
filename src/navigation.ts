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

// A patient's record lives under Patients, e.g. #/patients/3
export const patientLink = (id: number) => `#/patients/${id}`

// The screen to show; patientId is set when a patient's record is open
export type Route = { page: Page; patientId?: number }

function routeFromAddress(): Route {
  const hash = window.location.hash
  const record = hash.match(/^#\/patients\/(\d+)$/)
  if (record) return { page: 'patients', patientId: Number(record[1]) }
  const page = (Object.keys(pageLinks) as Page[]).find((key) => pageLinks[key] === hash)
  return { page: page ?? 'agenda' }
}

// The screen to show, kept in sync with the address bar
export function useCurrentRoute() {
  const [route, setRoute] = useState(routeFromAddress)

  useEffect(() => {
    const onAddressChange = () => setRoute(routeFromAddress())
    window.addEventListener('hashchange', onAddressChange)
    return () => window.removeEventListener('hashchange', onAddressChange)
  }, [])

  return route
}
