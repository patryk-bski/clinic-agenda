// Patient records: past visits and clinical notes (made-up sample data).
// The latest visit for each patient matches their "Last visit" date in data.ts.

export type Visit = { date: string; type: string; summary: string } // date is YYYY-MM-DD
export type Note = { id: number; text: string; written: Date }

// Past visits by patient id, newest first
export const visitHistory: Record<number, Visit[]> = {
  1: [
    { date: '2026-10-28', type: 'Annual check-up', summary: 'Blood pressure 138/86. Fasting lipid profile ordered.' },
    { date: '2026-06-12', type: 'Follow-up', summary: 'Knee pain improving with physiotherapy. Continue exercises.' },
    { date: '2025-11-04', type: 'Vaccination', summary: 'Seasonal flu vaccine given. No reaction.' },
  ],
  2: [
    { date: '2026-11-03', type: 'New patient', summary: 'Registered with the practice. Generally well; no regular medication.' },
  ],
  3: [
    { date: '2026-09-15', type: 'Follow-up', summary: 'Tiredness for 2 months. Full blood count requested.' },
    { date: '2026-03-02', type: 'Telehealth call', summary: 'Mild asthma, well controlled. Inhaler repeat issued.' },
  ],
  4: [
    { date: '2026-10-07', type: 'Vaccination', summary: 'Routine childhood vaccination given. Sore arm for a day afterwards.' },
    { date: '2026-04-18', type: 'Follow-up', summary: 'Ear infection resolved after antibiotics.' },
  ],
  5: [
    { date: '2025-11-12', type: 'Annual check-up', summary: 'HbA1c 46, up from 43. Diet advice given; recheck in a year.' },
    { date: '2025-05-20', type: 'Blood test review', summary: 'Results within range apart from slightly raised HbA1c.' },
  ],
  6: [
    { date: '2026-08-22', type: 'Follow-up', summary: 'Intermittent palpitations. ECG normal; referred to cardiology.' },
    { date: '2026-02-14', type: 'Annual check-up', summary: 'Blood pressure normal. Advised to cut down on caffeine.' },
  ],
  7: [
    { date: '2026-11-06', type: 'Telehealth call', summary: 'Recurring migraines. New preventive medication started.' },
    { date: '2026-07-09', type: 'Follow-up', summary: 'Migraines about twice a month. Headache diary started.' },
  ],
  8: [
    { date: '2026-10-19', type: 'Blood test review', summary: 'Kidney function stable but eGFR just below normal. Repeat in 3 months.' },
    { date: '2026-07-01', type: 'Prescription renewal', summary: 'Blood pressure medication renewed for 6 months.' },
    { date: '2026-01-15', type: 'Annual check-up', summary: 'Mobility good. Blood and urine tests ordered.' },
  ],
  9: [
    { date: '2026-06-30', type: 'Annual check-up', summary: 'All observations normal. No concerns raised.' },
  ],
  10: [
    { date: '2026-10-31', type: 'Follow-up', summary: 'Sprained ankle healing well. Return to sport in 2 weeks.' },
    { date: '2026-10-20', type: 'New patient', summary: 'Ankle injury playing football. X-ray: no fracture.' },
  ],
}

// Clinical notes by patient id: things worth knowing at every visit
export const initialNotes: Record<number, Note[]> = {
  1: [{ id: 1, text: 'Allergic to penicillin.', written: new Date('2024-03-10T09:00') }],
  4: [{ id: 2, text: 'Usually attends with his mother, Ana Silva.', written: new Date('2025-09-02T10:30') }],
  6: [{ id: 3, text: 'Prefers morning appointments.', written: new Date('2026-02-14T11:15') }],
  8: [
    { id: 4, text: 'Hard of hearing in the left ear — please speak clearly and face him.', written: new Date('2025-06-03T14:00') },
  ],
}
