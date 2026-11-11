import { Send } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import Modal from './Modal'

const fieldClass =
  'mt-1.5 w-full rounded-[6px] border border-field bg-white px-2.5 py-2 text-sm transition-colors placeholder:text-muted focus:border-ink focus:outline-none'

type Props = {
  patients: string[] // who you can write to
  to?: string // pre-fills the patient, e.g. when writing from their record
  onSend: (message: { to: string; subject: string; body: string }) => void
  onClose: () => void
}

// Write a message to a patient from scratch
export default function NewMessageDialog({ patients, to: initialTo, onSend, onClose }: Props) {
  const [to, setTo] = useState(initialTo ?? '')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const canSend = to !== '' && subject.trim() !== '' && body.trim() !== ''

  function send(e: FormEvent) {
    e.preventDefault()
    if (!canSend) return
    onSend({ to, subject: subject.trim(), body: body.trim() })
  }

  return (
    <Modal labelledBy="new-message-title" onClose={onClose}>
      <h2 id="new-message-title" className="text-lg font-medium">
        New message
      </h2>
      <p className="mt-1 mb-6 text-sm text-muted">Write to one of your patients.</p>

      <form onSubmit={send} className="space-y-4">
        <label className="block text-sm">
          To
          <select
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={fieldClass}
          >
            <option value="" disabled>
              Select a patient
            </option>
            {[...patients]
              .sort((a, b) => a.localeCompare(b))
              .map((name) => (
                <option key={name}>{name}</option>
              ))}
          </select>
        </label>

        <label className="block text-sm">
          Subject
          <input
            required
            // Start here when the patient is already chosen (otherwise the pop-up starts on "To")
            data-autofocus={initialTo ? true : undefined}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Time to book your follow-up"
            className={fieldClass}
          />
        </label>

        <label className="block text-sm">
          Message
          <textarea
            required
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            // Ctrl+Enter (Cmd+Enter on Mac) sends, like replies do
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(e)
            }}
            placeholder="Write your message…"
            className={`${fieldClass} resize-y`}
          />
        </label>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSend}
            className="flex items-center gap-1.5 rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={15} strokeWidth={1.75} />
            Send message
          </button>
        </div>
      </form>
    </Modal>
  )
}
