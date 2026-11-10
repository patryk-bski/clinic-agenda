import { AnimatePresence, motion } from 'motion/react'
import type { Appointment } from '../data'
import { transition } from '../motion'
import EditHint from './EditHint'
import StatusBadge from './StatusBadge'

type Props = {
  appointments: Appointment[]
  onSelect: (appointment: Appointment) => void
}

export default function AppointmentList({ appointments, onSelect }: Props) {
  return (
    <ul className="border-t border-line">
      {/* New rows unfold in, deleted rows fold away, and moved rows glide to their new place */}
      <AnimatePresence initial={false}>
        {appointments.map((appt) => (
          <motion.li
            key={appt.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={transition}
            className="overflow-hidden border-b border-line"
          >
            {/* The whole row is a button that opens the appointment for editing */}
            <button
              onClick={() => onSelect(appt)}
              className="group flex w-full items-center gap-8 px-2 py-3.5 text-left transition-colors hover:bg-hover/50 focus-visible:bg-hover/50 focus-visible:outline-none"
            >
              <span className="w-12 text-sm text-muted tabular-nums">{appt.time}</span>
              <span className="flex-1 text-sm font-medium">{appt.patient}</span>
              <span className="w-48 text-sm text-muted">{appt.type}</span>
              <span className="w-24 text-right">
                <StatusBadge status={appt.status} />
              </span>
              <EditHint />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
