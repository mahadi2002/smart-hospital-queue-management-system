// The API speaks snake_case (Python/FastAPI convention); the rest of this
// app was written expecting camelCase (JS convention). These functions are
// the seam between the two, so the page components don't need to care
// which side of the wire a field came from.

export function normalizeDoctor(d) {
  return {
    id: d.id,
    name: d.name,
    specialtyId: d.specialty_id,
    qualifications: d.qualifications,
    experienceYears: d.experience_years,
    email: d.email,
    phone: d.phone,
    workingDays: d.working_days,
    workingHours: d.working_hours,
    dailyTokenLimit: d.daily_token_limit,
    emergencyCap: d.emergency_cap,
    walkInSlots: d.walk_in_slots,
    status: d.status,
    bio: d.bio,
    queuePaused: d.queue_paused,
  }
}

export function normalizeQueueStatus(q) {
  return {
    doctorId: q.doctor_id,
    currentToken: q.current_token,
    waitingCount: q.waiting_count,
    estimatedWaitMinutes: q.estimated_wait_minutes,
  }
}

export function normalizeSpecialty(s) {
  return {
    id: s.id,
    name: s.name,
    consultMinutes: s.consult_minutes,
    icon: s.icon,
  }
}

export function normalizePatient(p) {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone,
    dob: p.dob,
    gender: p.gender,
    bloodGroup: p.blood_group,
    address: p.address,
    avatarInitials: p.avatar_initials,
    medicalHistory: p.medical_history || [],
    reports: p.reports || [],
  }
}

export function normalizeAdmin(a) {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    role: a.role,
    avatarInitials: a.avatar_initials,
  }
}

export function normalizeToken(t) {
  return {
    id: t.id,
    tokenNumber: t.token_number,
    doctorId: t.doctor_id,
    patientId: t.patient_id,
    patientName: t.patient_name,
    type: t.type,
    status: t.status,
    bookedAt: t.booked_at,
    slotTime: t.slot_time,
  }
}

export function normalizeNotification(n) {
  return {
    id: n.id,
    role: n.role,
    profileId: n.profile_id,
    title: n.title,
    body: n.body,
    time: n.time,
    read: n.read,
  }
}

export function normalizeConfig(c) {
  return {
    maxDailyTokensPerDoctor: c.max_daily_tokens_per_doctor,
    emergencyCapPerDoctorPerDay: c.emergency_cap_per_doctor_per_day,
    walkInSlotsPerDoctorPerDay: c.walk_in_slots_per_doctor_per_day,
    noShowTimeoutMinutes: c.no_show_timeout_minutes,
    gracePeriodMinutes: c.grace_period_minutes,
    bookingWindowHours: c.booking_window_hours,
  }
}

export function denormalizeConfig(c) {
  return {
    max_daily_tokens_per_doctor: c.maxDailyTokensPerDoctor,
    emergency_cap_per_doctor_per_day: c.emergencyCapPerDoctorPerDay,
    walk_in_slots_per_doctor_per_day: c.walkInSlotsPerDoctorPerDay,
    no_show_timeout_minutes: c.noShowTimeoutMinutes,
    grace_period_minutes: c.gracePeriodMinutes,
    booking_window_hours: c.bookingWindowHours,
  }
}
