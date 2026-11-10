import { ArrowDown, ArrowUp, CornerUpLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import type { InboxItem } from '../data'
import { inboxKinds, longTime } from '../inbox'
import { fade } from '../motion'
import Modal from './Modal'

const time = (date: Date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

type Props = {
  item: InboxItem
  now: Date
  onMarkUnread: () => void
  onReply: (body: string) => void
  onClose: () => void
}

export default function InboxItemDialog({ item, now, onMarkUnread, onReply, onClose }: Props) {
  const { label, icon: Icon } = inboxKinds[item.kind]
  const canReply = item.kind === 'message'
  const [isReplying, setIsReplying] = useState(false)
  const [draft, setDraft] = useState('')

  function send(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    onReply(draft.trim())
    setDraft('')
    setIsReplying(false)
  }

  return (
    <Modal labelledBy="inbox-item-title" onClose={onClose}>
      <p className="flex items-center gap-1.5 text-sm text-muted">
        <Icon size={14} strokeWidth={1.75} />
        {label}
      </p>
      <h2 id="inbox-item-title" className="mt-1 text-xl font-semibold tracking-tight">
        {item.subject}
      </h2>

      <dl className="mt-4 grid grid-cols-[5.5rem_1fr] gap-y-1 text-sm">
        <dt className="text-muted">From</dt>
        <dd>{item.from}</dd>
        <dt className="text-muted">Patient</dt>
        <dd>{item.patient}</dd>
        <dt className="text-muted">Received</dt>
        <dd>{longTime(item, now)}</dd>
      </dl>

      <p className="mt-5 border-t border-line pt-5 text-sm whitespace-pre-line">{item.body}</p>

      {item.results && (
        <table className="mt-5 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="pb-2 font-normal">Test</th>
              <th className="pb-2 text-right font-normal">Result</th>
              <th className="pb-2 pl-4 text-right font-normal">Normal range</th>
            </tr>
          </thead>
          <tbody>
            {item.results.map((result) => (
              <tr key={result.test} className="border-b border-line last:border-0">
                <td className="py-2">{result.test}</td>
                <td className="py-2 text-right tabular-nums">
                  <span className={result.flag ? 'font-medium text-red-700' : ''}>
                    {result.value} {result.unit}
                  </span>
                  {/* Flagged values say High or Low with an arrow, not just a color */}
                  {result.flag && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-red-700">
                      {result.flag === 'high' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      {result.flag === 'high' ? 'High' : 'Low'}
                    </span>
                  )}
                </td>
                <td className="py-2 pl-4 text-right text-muted">{result.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Replies sent from this popup, oldest first */}
      {item.replies?.map((reply, i) => (
        <div key={i} className="mt-5 rounded-lg border border-line bg-white p-4 text-sm">
          <p className="mb-2 flex items-center gap-1.5 text-xs text-muted">
            <CornerUpLeft size={12} strokeWidth={2} />
            You replied at {time(reply.sentAt)}
          </p>
          <p className="whitespace-pre-line">{reply.body}</p>
        </div>
      ))}

      {/* Fade between the buttons and the reply box */}
      <AnimatePresence mode="wait" initial={false}>
        {isReplying ? (
          <motion.form key="reply" onSubmit={send} className="mt-6" {...fade}>
            <label className="block text-sm">
              Reply to {item.from}
              <textarea
                autoFocus
                rows={5}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                // Ctrl+Enter (Cmd+Enter on Mac) sends, like most email apps
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(e)
                }}
                placeholder="Write your reply…"
                className="mt-1.5 w-full resize-y rounded-[6px] border border-field bg-white px-2.5 py-2 text-sm transition-colors placeholder:text-muted focus:border-ink focus:outline-none"
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!draft.trim()}
                className="rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send reply
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div key="buttons" className="mt-8 flex justify-between gap-2" {...fade}>
            <button
              onClick={onMarkUnread}
              // Ghost button: no fill, a gray outline (3.2:1) so it still reads as a button
              className="rounded-[6px] border border-field px-3 py-2 text-sm transition-colors hover:bg-hover"
            >
              Mark as unread
            </button>
            <div className="flex gap-2">
              <button
                autoFocus={!canReply}
                onClick={onClose}
                className="rounded-[6px] bg-hover px-3 py-2 text-sm transition-colors hover:bg-line"
              >
                Close
              </button>
              {canReply && (
                <button
                  autoFocus
                  onClick={() => setIsReplying(true)}
                  className="flex items-center gap-1.5 rounded-[6px] bg-brand px-3 py-2 text-sm text-white transition-colors hover:bg-brand-hover"
                >
                  <CornerUpLeft size={15} strokeWidth={1.75} />
                  Reply
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  )
}
