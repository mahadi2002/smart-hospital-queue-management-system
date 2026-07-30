export const initialNotifications = [
  {
    id: 'notif-1',
    role: 'patient',
    profileId: 'pat-1',
    title: 'Token confirmed',
    body: 'Your token A-014 with Dr. Farhana Kabir is confirmed for today.',
    time: '2026-07-30T08:10:00',
    read: false,
  },
  {
    id: 'notif-2',
    role: 'doctor',
    profileId: 'doc-1',
    title: 'Emergency token added',
    body: 'An emergency token (A-015) was added to your queue.',
    time: '2026-07-30T09:05:00',
    read: false,
  },
  {
    id: 'notif-3',
    role: 'admin',
    profileId: 'adm-1',
    title: 'New patient registered',
    body: 'Tania Ferdous created a new patient account.',
    time: '2026-07-29T16:40:00',
    read: true,
  },
]
