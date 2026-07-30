import { createContext, useContext, useEffect, useState } from 'react'
import {
  initialTokens,
  generateTokenId,
  generateTokenNumber,
  TOKEN_STATUS,
  TOKEN_TYPE,
  QUEUE_RULES,
} from '../data/tokens'

const QueueContext = createContext(null)
const STORAGE_KEY = 'shq_tokens'
const PAUSED_KEY = 'shq_paused_doctors'

export function QueueProvider({ children }) {
  const [tokens, setTokens] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : initialTokens
  })
  const [pausedDoctors, setPausedDoctors] = useState(() => {
    const raw = localStorage.getItem(PAUSED_KEY)
    return raw ? JSON.parse(raw) : []
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))
  }, [tokens])

  useEffect(() => {
    localStorage.setItem(PAUSED_KEY, JSON.stringify(pausedDoctors))
  }, [pausedDoctors])

  function sortQueue(list) {
    const rank = { [TOKEN_TYPE.EMERGENCY]: 0, [TOKEN_TYPE.WALK_IN]: 1, [TOKEN_TYPE.REGULAR]: 1 }
    return [...list].sort((a, b) => {
      if (rank[a.type] !== rank[b.type]) return rank[a.type] - rank[b.type]
      return new Date(a.bookedAt) - new Date(b.bookedAt)
    })
  }

  function getQueueForDoctor(doctorId) {
    return sortQueue(
      tokens.filter(
        (t) =>
          t.doctorId === doctorId &&
          [TOKEN_STATUS.WAITING, TOKEN_STATUS.CALLED, TOKEN_STATUS.IN_CONSULTATION].includes(t.status),
      ),
    )
  }

  function getTokensForDoctor(doctorId) {
    return tokens.filter((t) => t.doctorId === doctorId)
  }

  function getTokensForPatient(patientId) {
    return tokens.filter((t) => t.patientId === patientId)
  }

  function countEmergencyTokensToday(doctorId) {
    const today = new Date().toDateString()
    return tokens.filter(
      (t) =>
        t.doctorId === doctorId &&
        t.type === TOKEN_TYPE.EMERGENCY &&
        new Date(t.bookedAt).toDateString() === today,
    ).length
  }

  function bookToken({ doctorId, patientId = null, patientName, type = TOKEN_TYPE.REGULAR, slotTime }) {
    if (type === TOKEN_TYPE.EMERGENCY && countEmergencyTokensToday(doctorId) >= QUEUE_RULES.emergencyCapPerDoctorPerDay) {
      return { ok: false, error: `Emergency token limit (${QUEUE_RULES.emergencyCapPerDoctorPerDay}/day) reached for this doctor.` }
    }
    const newToken = {
      id: generateTokenId(),
      tokenNumber: generateTokenNumber(doctorId),
      doctorId,
      patientId,
      patientName,
      type,
      status: TOKEN_STATUS.WAITING,
      bookedAt: new Date().toISOString(),
      slotTime: slotTime || '--:--',
    }
    setTokens((prev) => [...prev, newToken])
    return { ok: true, token: newToken }
  }

  function updateTokenStatus(tokenId, status) {
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? { ...t, status } : t)))
  }

  function cancelToken(tokenId) {
    updateTokenStatus(tokenId, TOKEN_STATUS.CANCELLED)
  }

  function callPatient(tokenId) {
    updateTokenStatus(tokenId, TOKEN_STATUS.CALLED)
  }

  function startConsultation(tokenId) {
    updateTokenStatus(tokenId, TOKEN_STATUS.IN_CONSULTATION)
  }

  function completeConsultation(tokenId) {
    updateTokenStatus(tokenId, TOKEN_STATUS.COMPLETED)
  }

  function skipPatient(tokenId) {
    updateTokenStatus(tokenId, TOKEN_STATUS.SKIPPED)
  }

  function markNoShow(tokenId) {
    updateTokenStatus(tokenId, TOKEN_STATUS.NO_SHOW)
  }

  function isQueuePaused(doctorId) {
    return pausedDoctors.includes(doctorId)
  }

  function pauseQueue(doctorId) {
    setPausedDoctors((prev) => (prev.includes(doctorId) ? prev : [...prev, doctorId]))
  }

  function resumeQueue(doctorId) {
    setPausedDoctors((prev) => prev.filter((id) => id !== doctorId))
  }

  const value = {
    tokens,
    rules: QUEUE_RULES,
    getQueueForDoctor,
    getTokensForDoctor,
    getTokensForPatient,
    bookToken,
    cancelToken,
    callPatient,
    startConsultation,
    completeConsultation,
    skipPatient,
    markNoShow,
    isQueuePaused,
    pauseQueue,
    resumeQueue,
  }

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
}

export function useQueue() {
  const ctx = useContext(QueueContext)
  if (!ctx) throw new Error('useQueue must be used within a QueueProvider')
  return ctx
}
