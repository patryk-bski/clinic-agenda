import { CornerUpLeft, FileText, FlaskConical, MessageSquare, Send } from 'lucide-react'
import type { InboxItem, InboxKind, SentMessage } from './data'

// Name and icon for each kind of inbox item
export const inboxKinds: Record<InboxKind, { label: string; plural: string; icon: typeof FileText }> = {
  message: { label: 'Message', plural: 'Messages', icon: MessageSquare },
  lab: { label: 'Lab result', plural: 'Lab results', icon: FlaskConical },
  referral: { label: 'Referral letter', plural: 'Referrals', icon: FileText },
}

// How you respond to each kind of item, and who it goes to.
// Labs are automated, so instead of replying to the lab you message the patient about the result.
export const responses: Record<
  InboxKind,
  { button: string; icon: typeof FileText; recipient: (item: InboxItem) => string; sent: string }
> = {
  message: { button: 'Reply', icon: CornerUpLeft, recipient: (item) => item.from, sent: 'You replied to' },
  // "Dr. Helen Ward, Cardiology, Riverside Hospital" → "Dr. Helen Ward"
  referral: {
    button: 'Reply',
    icon: CornerUpLeft,
    recipient: (item) => item.from.split(',')[0],
    sent: 'You replied to',
  },
  lab: { button: 'Message patient', icon: Send, recipient: (item) => item.patient, sent: 'You messaged' },
}

export const receivedAt = (item: InboxItem, now: Date) =>
  new Date(now.getTime() - item.receivedMinutesAgo * 60_000)

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

// Short form for the list: "09:12" today, "Yesterday", or "Sun 8 Nov"
export const shortTime = (item: InboxItem, now: Date) => shortDate(receivedAt(item, now), now)

export function shortDate(date: Date, now: Date) {
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

// One row in the Sent list: either a message written with "New message",
// or a reply / "Message patient" sent from an inbox item
export type SentEntry = {
  key: string
  to: string
  subject: string
  body: string
  sentAt: Date
  message?: SentMessage // set for a new message
  item?: InboxItem // set for a reply: opening it shows the item it answers
}

// Everything you've sent, newest first
export function sentEntries(items: InboxItem[], messages: SentMessage[]): SentEntry[] {
  const replies = items.flatMap((item) =>
    (item.replies ?? []).map((reply, i) => ({
      key: `reply-${item.id}-${i}`,
      to: reply.to,
      // Replies get "Re:"; a message about a lab result keeps the result's name
      subject: item.kind === 'lab' ? item.subject : `Re: ${item.subject}`,
      body: reply.body,
      sentAt: reply.sentAt,
      item,
    })),
  )
  const written = messages.map((message) => ({
    key: `message-${message.id}`,
    to: message.to,
    subject: message.subject,
    body: message.body,
    sentAt: message.sentAt,
    message,
  }))
  return [...replies, ...written].sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
}

export const flaggedCount =(item: InboxItem) => item.results?.filter((result) => result.flag).length ?? 0
