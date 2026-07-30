import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { denormalizeConfig, normalizeConfig, normalizeToken } from '../services/normalize'
import { useAuth } from './AuthContext'

const QueueContext = createContext(null)

const DEFAULT_RULES = {
  maxDailyTokensPerDoctor: 40,
  emergencyCapPerDoctorPerDay: 8,
  walkInSlotsPerDoctorPerDay: 5,
  noShowTimeoutMinutes: 15,
  gracePeriodMinutes: 5,
  bookingWindowHours: 24,
}

export function QueueProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [tokens, setTokens] = useState([])
  const [rules, setRules] = useState(DEFAULT_RULES)

  const refetchTokens = useCallback(async () => {
    if (!localStorage.getItem('shq_access_token')) return
    const { data } = await api.get('/tokens')
    setTokens(data.map(normalizeToken))
  }, [])

  useEffect(() => {
    api.get('/config').then(({ data }) => setRules(normalizeConfig(data)))
  }, [])

  async function updateRules(newRules) {
    const { data } = await api.patch('/config', denormalizeConfig(newRules))
    const updated = normalizeConfig(data)
    setRules(updated)
    return updated
  }

  useEffect(() => {
    if (!isAuthenticated) return
    refetchTokens()
    // Poll so a booking made by someone else (a guest, another tab, another
    // patient) shows up here without needing a manual refresh.
    const interval = setInterval(refetchTokens, 6000)
    return () => clearInterval(interval)
  }, [isAuthenticated, refetchTokens])

  function sortQueue(list) {
    const rank = { emergency: 0, 'walk-in': 1, regular: 1 }
    return [...list].sort((a, b) => {
      if (rank[a.type] !== rank[b.type]) return rank[a.type] - rank[b.type]
      return new Date(a.bookedAt) - new Date(b.bookedAt)
    })
  }

  function getQueueForDoctor(doctorId) {
    return sortQueue(
      tokens.filter(
        (t) => t.doctorId === doctorId && ['waiting', 'called', 'in-consultation'].includes(t.status),
      ),
    )
  }

  function getTokensForDoctor(doctorId) {
    return tokens.filter((t) => t.doctorId === doctorId)
  }

  function getTokensForPatient(patientId) {
    return tokens.filter((t) => t.patientId === patientId)
  }

  async function bookToken({ doctorId, patientId = null, patientName, type = 'regular', slotTime }) {
    try {
      const { data } = await api.post('/tokens', {
        doctor_id: doctorId,
        patient_id: patientId,
        patient_name: patientName,
        type,
        slot_time: slotTime,
      })
      const token = normalizeToken(data)
      setTokens((prev) => [token, ...prev])
      return { ok: true, token }
    } catch (err) {
      return { ok: false, error: err.response?.data?.detail || 'Could not book this token.' }
    }
  }

  async function setTokenStatus(tokenId, status) {
    const { data } = await api.patch(`/tokens/${tokenId}/status`, { status })
    const token = normalizeToken(data)
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? token : t)))
    return token
  }

  function cancelToken(tokenId) {
    return setTokenStatus(tokenId, 'cancelled')
  }

  function callPatient(tokenId) {
    return setTokenStatus(tokenId, 'called')
  }

  function startConsultation(tokenId) {
    return setTokenStatus(tokenId, 'in-consultation')
  }

  async function completeConsultation(tokenId, { diagnosis, notes }) {
    const { data } = await api.post(`/tokens/${tokenId}/complete`, { diagnosis, notes })
    const token = normalizeToken(data)
    setTokens((prev) => prev.map((t) => (t.id === tokenId ? token : t)))
    return token
  }

  function skipPatient(tokenId) {
    return setTokenStatus(tokenId, 'skipped')
  }

  function markNoShow(tokenId) {
    return setTokenStatus(tokenId, 'no-show')
  }

  const value = {
    tokens,
    rules,
    updateRules,
    refetchTokens,
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
  }

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>
}

export function useQueue() {
  const ctx = useContext(QueueContext)
  if (!ctx) throw new Error('useQueue must be used within a QueueProvider')
  return ctx
}
