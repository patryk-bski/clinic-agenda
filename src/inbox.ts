import { FileText, FlaskConical, MessageSquare } from 'lucide-react'
import type { InboxItem, InboxKind } from './data'

// Name and icon for each kind of inbox item
export const inboxKinds: Record<InboxKind, { label: string; plural: string; icon: typeof FileText }> = {
  message: { label: 'Message', plural: 'Messages', icon: MessageSquare },
  lab: { label: 'Lab result', plural: 'Lab results', icon: FlaskConical },
  referral: { label: 'Referral letter', plural: 'Referrals', icon: FileText },
}

export const receivedAt = (item: InboxItem, now: Date) =>
  new Date(now.getTime() - item.receivedMinutesAgo * 60_000)

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

// Short form for the list: "09:12" today, "Yesterday", or "Sun 8 Nov"
export function shortTime(item: InboxItem, now: Date) {
  const date = receivedAt(item, now)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(date, now)) return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  if (sameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

// Long form for the opened item: "Tuesday 10 November, 09:12"
export function longTime(item: InboxItem, now: Date) {
  const date = receivedAt(item, now)
  const day = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${day}, ${time}`
}

export const flaggedCount = (item: InboxItem) => item.results?.filter((result) => result.flag).length ?? 0
