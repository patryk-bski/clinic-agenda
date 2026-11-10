import type { Status } from './status'

export type Appointment = {
  id: number
  time: string
  patient: string
  type: string
  status: Status
}

// Fake data: today's appointments for one clinician, one for each patient below.
// The Reports screen counts these as today's appointments, so the two always agree.
export const appointments: Appointment[] = [
  { id: 1, time: '08:30', patient: 'Maria Kowalska', type: 'Follow-up', status: 'confirmed' },
  { id: 2, time: '09:00', patient: 'James Carter', type: 'New patient', status: 'confirmed' },
  { id: 3, time: '09:30', patient: 'Aisha Rahman', type: 'Blood test review', status: 'confirmed' },
  { id: 4, time: '10:00', patient: 'Tomás Silva', type: 'Vaccination', status: 'confirmed' },
  { id: 5, time: '10:30', patient: 'Emily Nguyen', type: 'Annual check-up', status: 'confirmed' },
  { id: 6, time: '11:15', patient: 'Piotr Nowak', type: 'Prescription renewal', status: 'cancelled' },
  { id: 7, time: '13:00', patient: 'Grace Okafor', type: 'Telehealth call', status: 'confirmed' },
  { id: 8, time: '14:00', patient: 'Lucas Martin', type: 'Follow-up', status: 'waiting' },
  { id: 9, time: '15:30', patient: 'Sofia Rossi', type: 'Follow-up', status: 'waiting' },
  { id: 10, time: '16:15', patient: 'Daniel Becker', type: 'New patient', status: 'confirmed' },
]

export type Patient = {
  id: number
  name: string
  dateOfBirth: string // YYYY-MM-DD
  phone: string
  lastVisit: string // YYYY-MM-DD
}

// Fake data: the clinician's patients (phone numbers are from a range reserved for fiction)
export const patients: Patient[] = [
  { id: 1, name: 'Maria Kowalska', dateOfBirth: '1958-03-14', phone: '+44 7700 900101', lastVisit: '2026-10-28' },
  { id: 2, name: 'James Carter', dateOfBirth: '1991-07-02', phone: '+44 7700 900102', lastVisit: '2026-11-03' },
  { id: 3, name: 'Aisha Rahman', dateOfBirth: '1984-11-21', phone: '+44 7700 900103', lastVisit: '2026-09-15' },
  { id: 4, name: 'Tomás Silva', dateOfBirth: '2016-05-09', phone: '+44 7700 900104', lastVisit: '2026-10-07' },
  { id: 5, name: 'Emily Nguyen', dateOfBirth: '1973-01-30', phone: '+44 7700 900105', lastVisit: '2025-11-12' },
  { id: 6, name: 'Piotr Nowak', dateOfBirth: '1966-08-17', phone: '+44 7700 900106', lastVisit: '2026-08-22' },
  { id: 7, name: 'Grace Okafor', dateOfBirth: '1999-12-05', phone: '+44 7700 900107', lastVisit: '2026-11-06' },
  { id: 8, name: 'Lucas Martin', dateOfBirth: '1947-04-26', phone: '+44 7700 900108', lastVisit: '2026-10-19' },
  { id: 9, name: 'Sofia Rossi', dateOfBirth: '1988-09-11', phone: '+44 7700 900109', lastVisit: '2026-06-30' },
  { id: 10, name: 'Daniel Becker', dateOfBirth: '2003-02-18', phone: '+44 7700 900110', lastVisit: '2026-10-31' },
]

export type InboxKind = 'message' | 'lab' | 'referral'

export type LabResult = {
  test: string
  value: string
  unit: string
  range: string
  flag?: 'high' | 'low'
}

export type InboxItem = {
  id: number
  kind: InboxKind
  from: string
  patient: string // one of the patients above
  subject: string
  body: string
  receivedMinutesAgo: number // so the sample inbox always looks recent
  read: boolean
  results?: LabResult[] // lab results only
}

// Fake data: messages from patients, lab results and referral letters, newest first.
// Clinicians and hospitals here are made up.
export const inboxItems: InboxItem[] = [
  {
    id: 1,
    kind: 'lab',
    from: 'Central Pathology Lab',
    patient: 'Maria Kowalska',
    subject: 'Lipid profile',
    body: 'Fasting sample taken on the morning of the visit. Two values are above the target range.',
    receivedMinutesAgo: 35,
    read: false,
    results: [
      { test: 'Total cholesterol', value: '6.4', unit: 'mmol/L', range: 'under 5.0', flag: 'high' },
      { test: 'LDL cholesterol', value: '4.1', unit: 'mmol/L', range: 'under 3.0', flag: 'high' },
      { test: 'HDL cholesterol', value: '1.3', unit: 'mmol/L', range: 'over 1.0' },
      { test: 'Triglycerides', value: '1.6', unit: 'mmol/L', range: 'under 1.7' },
    ],
  },
  {
    id: 2,
    kind: 'message',
    from: 'Sofia Rossi',
    patient: 'Sofia Rossi',
    subject: 'Can I move my appointment?',
    body: "Hello,\n\nI have a follow-up booked with you at 15:30 but something has come up at work. Would it be possible to move it to Thursday morning instead?\n\nThank you,\nSofia",
    receivedMinutesAgo: 80,
    read: false,
  },
  {
    id: 3,
    kind: 'referral',
    from: 'Dr. Helen Ward, Cardiology, Riverside Hospital',
    patient: 'Piotr Nowak',
    subject: 'Cardiology clinic letter',
    body: "Dear colleague,\n\nThank you for referring Mr Nowak with intermittent palpitations. His ECG and 24-hour monitor showed occasional ectopic beats only, with no sustained arrhythmia. Echocardiogram was normal.\n\nI have reassured him and advised reducing caffeine. No cardiology follow-up is needed; please re-refer if symptoms change.\n\nKind regards,\nDr. Helen Ward",
    receivedMinutesAgo: 150,
    read: false,
  },
  {
    id: 4,
    kind: 'lab',
    from: 'Central Pathology Lab',
    patient: 'Lucas Martin',
    subject: 'Kidney function',
    body: 'Routine monitoring. eGFR is slightly below the normal range, similar to the last result.',
    receivedMinutesAgo: 240,
    read: false,
    results: [
      { test: 'Creatinine', value: '98', unit: 'µmol/L', range: '60–110' },
      { test: 'eGFR', value: '58', unit: 'mL/min', range: 'over 60', flag: 'low' },
      { test: 'Potassium', value: '4.6', unit: 'mmol/L', range: '3.5–5.3' },
      { test: 'Sodium', value: '139', unit: 'mmol/L', range: '133–146' },
    ],
  },
  {
    id: 5,
    kind: 'message',
    from: 'Grace Okafor',
    patient: 'Grace Okafor',
    subject: 'Question about my prescription',
    body: "Hi,\n\nShould I take the new tablets you prescribed with food or on an empty stomach? The leaflet isn't clear.\n\nThanks,\nGrace",
    receivedMinutesAgo: 300,
    read: false,
  },
  {
    id: 6,
    kind: 'lab',
    from: 'Central Pathology Lab',
    patient: 'Aisha Rahman',
    subject: 'Full blood count',
    body: 'Platelets are slightly raised. All other values are within range.',
    receivedMinutesAgo: 1300,
    read: true,
    results: [
      { test: 'Haemoglobin', value: '128', unit: 'g/L', range: '115–165' },
      { test: 'White cells', value: '7.2', unit: '×10⁹/L', range: '4.0–11.0' },
      { test: 'Platelets', value: '412', unit: '×10⁹/L', range: '150–400', flag: 'high' },
    ],
  },
  {
    id: 7,
    kind: 'message',
    from: 'Ana Silva (parent)',
    patient: 'Tomás Silva',
    subject: 'Question before his vaccination',
    body: "Hello doctor,\n\nTomás had a sore, slightly red arm for a day after his last vaccination. Is that anything to worry about before the next one?\n\nAna",
    receivedMinutesAgo: 1450,
    read: true,
  },
  {
    id: 8,
    kind: 'referral',
    from: 'Dr. Samuel Osei, Endocrinology, Riverside Hospital',
    patient: 'Emily Nguyen',
    subject: 'Endocrinology referral accepted',
    body: "Dear colleague,\n\nThank you for your referral regarding Mrs Nguyen's rising HbA1c. She has been booked into the diabetes clinic in four weeks. In the meantime, please continue her current treatment and repeat the HbA1c before the appointment if possible.\n\nYours sincerely,\nDr. Samuel Osei",
    receivedMinutesAgo: 2900,
    read: true,
  },
  {
    id: 9,
    kind: 'lab',
    from: 'Central Pathology Lab',
    patient: 'Emily Nguyen',
    subject: 'HbA1c',
    body: 'Result is above the target range and higher than the previous test.',
    receivedMinutesAgo: 3100,
    read: true,
    results: [{ test: 'HbA1c', value: '52', unit: 'mmol/mol', range: '20–41', flag: 'high' }],
  },
  {
    id: 10,
    kind: 'message',
    from: 'Daniel Becker',
    patient: 'Daniel Becker',
    subject: 'Thank you',
    body: "Just wanted to say thanks for fitting me in last week — I'm feeling much better.\n\nDaniel",
    receivedMinutesAgo: 4400,
    read: true,
  },
]
