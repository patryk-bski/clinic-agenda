import { Send } from 'lucide-react'
import type { SentMessage } from '../data'
import Modal from './Modal'

const sentTime = (date: Date) => {
  const day = date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return `${day}, ${time}`
}

type Props = {
  message: SentMessage
  onClose: () => void
}

// A message you wrote, opened from the Sent list or the patient's record
export default function SentMessageDialog({ message, onClose }: Props) {
  return (
    <Modal labelledBy="sent-message-title" onClose={onClose}>
      <p className="flex items-center gap-1.5 text-sm text-muted">
        <Send size={14} strokeWidth={1.75} />
        Sent message
      </p>
      <h2 id="sent-message-title" className="mt-1 text-xl font-semibold tracking-tight">
        {message.subject}
      </h2>

      <dl className="mt-4 grid grid-cols-[5.5rem_1fr] gap-y-1 text-sm">
        <dt className="text-muted">To</dt>
        <dd>{message.to}</dd>
        <dt className="text-muted">Sent</dt>
        <dd>{sentTime(message.sentAt)}</dd>
      </dl>

      <p className="mt-5 border-t border-line pt-5 text-sm whitespace-pre-line">{message.body}</p>

      <div className="mt-8 flex justify-end">
        <button
          autoFocus
          onClick={onClose}
          className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
        >
          Close
        </button>
      </div>
    </Modal>
  )
}
