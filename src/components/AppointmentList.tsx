import { AnimatePresence, motion } from 'motion/react'
import type { Appointment } from '../data'
import { transition } from '../motion'
import EditHint from './EditHint'
import StatusBadge from './StatusBadge'

type Props = {
  appointments: Appointment[]
  onSelect: (appointment: Appointment) => void
  // Address of a patient's record, if they're one of the practice's patients
  patientHref?: (name: string) => string | undefined
}

export default function AppointmentList({ appointments, onSelect, patientHref }: Props) {
  return (
    <ul className="border-t border-line">
      {/* New rows unfold in, deleted rows fold away, and moved rows glide to their new place */}
      <AnimatePresence initial={false}>
        {appointments.map((appt) => {
          const href = patientHref?.(appt.patient)
          return (
            <motion.li
              key={appt.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={transition}
              className="group relative overflow-hidden border-b border-line"
            >
              {/* Two targets side by side (a link can't sit inside a button): the whole row is a
                  button that opens the appointment, and the patient's name on top links to their record */}
              <button
                onClick={() => onSelect(appt)}
                aria-label={`Edit appointment: ${appt.time}, ${appt.patient}, ${appt.type}`}
                className="absolute inset-0 transition-colors group-hover:bg-hover/50 focus-visible:bg-hover/50 focus-visible:-outline-offset-2"
              />
              <div className="pointer-events-none relative flex items-center gap-8 px-2 py-3.5">
                <span className="w-12 text-sm text-muted tabular-nums">{appt.time}</span>
                <span className="flex-1 text-sm font-medium">
                  {href ? (
                    <a
                      href={href}
                      className="pointer-events-auto rounded-sm underline-offset-2 hover:underline"
                    >
                      {appt.patient}
                    </a>
                  ) : (
                    appt.patient
                  )}
                </span>
                <span className="w-48 text-sm text-muted">{appt.type}</span>
                <span className="w-24 text-right">
                  <StatusBadge status={appt.status} />
                </span>
                <EditHint />
              </div>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ul>
  )
}
