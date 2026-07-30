// Queue/token business rules, matching the Figma prototype.
export const QUEUE_RULES = {
  maxDailyTokensPerDoctor: 40,
  emergencyCapPerDoctorPerDay: 8,
  walkInSlotsPerDoctorPerDay: 5,
  noShowTimeoutMinutes: 15,
  gracePeriodMinutes: 5,
  bookingWindowHours: 24,
}

export const TOKEN_STATUS = {
  WAITING: 'waiting',
  CALLED: 'called',
  IN_CONSULTATION: 'in-consultation',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no-show',
}

export const TOKEN_TYPE = {
  REGULAR: 'regular',
  EMERGENCY: 'emergency',
  WALK_IN: 'walk-in',
}

// Initial mock queue — a mix of statuses/types across a couple of doctors,
// so the Live Queue (patient + doctor) screens have something to show.
export const initialTokens = [
  {
    id: 'tok-1',
    tokenNumber: 'A-014',
    doctorId: 'doc-1',
    patientId: 'pat-1',
    patientName: 'Abdullah Al Mamun',
    type: TOKEN_TYPE.REGULAR,
    status: TOKEN_STATUS.IN_CONSULTATION,
    bookedAt: '2026-07-30T08:10:00',
    slotTime: '09:20',
  },
  {
    id: 'tok-2',
    tokenNumber: 'A-015',
    doctorId: 'doc-1',
    patientId: 'pat-3',
    patientName: 'Rakibul Islam',
    type: TOKEN_TYPE.EMERGENCY,
    status: TOKEN_STATUS.WAITING,
    bookedAt: '2026-07-30T09:05:00',
    slotTime: '09:40',
  },
  {
    id: 'tok-3',
    tokenNumber: 'A-016',
    doctorId: 'doc-1',
    patientId: null,
    patientName: 'Golam Mostofa',
    type: TOKEN_TYPE.WALK_IN,
    status: TOKEN_STATUS.WAITING,
    bookedAt: '2026-07-30T09:15:00',
    slotTime: '09:45',
  },
  {
    id: 'tok-4',
    tokenNumber: 'A-017',
    doctorId: 'doc-1',
    patientId: 'pat-4',
    patientName: 'Tania Ferdous',
    type: TOKEN_TYPE.REGULAR,
    status: TOKEN_STATUS.WAITING,
    bookedAt: '2026-07-29T18:30:00',
    slotTime: '10:00',
  },
  {
    id: 'tok-5',
    tokenNumber: 'B-008',
    doctorId: 'doc-3',
    patientId: 'pat-2',
    patientName: 'Nasrin Sultana',
    type: TOKEN_TYPE.REGULAR,
    status: TOKEN_STATUS.COMPLETED,
    bookedAt: '2026-07-30T08:00:00',
    slotTime: '08:30',
  },
]

let tokenCounter = initialTokens.length

export function generateTokenId() {
  tokenCounter += 1
  return `tok-${tokenCounter}`
}

export function generateTokenNumber(doctorId) {
  const prefix = doctorId.replace('doc-', '')
  const seq = String(100 + tokenCounter).slice(-3)
  return `T${prefix}-${seq}`
}
