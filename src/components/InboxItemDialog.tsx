import { ArrowDown, ArrowUp } from 'lucide-react'
import type { InboxItem } from '../data'
import { inboxKinds, longTime } from '../inbox'
import Modal from './Modal'

type Props = {
  item: InboxItem
  now: Date
  onMarkUnread: () => void
  onClose: () => void
}

export default function InboxItemDialog({ item, now, onMarkUnread, onClose }: Props) {
  const { label, icon: Icon } = inboxKinds[item.kind]

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

      <div className="mt-8 flex justify-between gap-2">
        <button
          onClick={onMarkUnread}
          // Ghost button: no fill, a gray outline (3.2:1) so it still reads as a button
          className="rounded-[6px] border border-field px-3 py-2 text-sm transition-colors hover:bg-hover"
        >
          Mark as unread
        </button>
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
