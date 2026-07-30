import { createContext, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { normalizeAdmin, normalizeDoctor, normalizePatient } from '../services/normalize'

const AuthContext = createContext(null)

const TOKEN_KEY = 'shq_access_token'
const ROLE_KEY = 'shq_role'
const PROFILE_ID_KEY = 'shq_profile_id'

const NORMALIZERS = {
  patient: normalizePatient,
  doctor: normalizeDoctor,
  admin: normalizeAdmin,
}

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || 'guest')
  const [profileId, setProfileId] = useState(() => localStorage.getItem(PROFILE_ID_KEY) || null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function bootstrap() {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) {
        setLoading(false)
        return
      }
      try {
        await fetchAndSetProfile()
      } catch {
        clearSession()
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchAndSetProfile() {
    const { data } = await api.get('/auth/me')
    setProfile(NORMALIZERS[data.role](data.profile))
  }

  function storeSession({ access_token, role: newRole, profile_id }) {
    localStorage.setItem(TOKEN_KEY, access_token)
    localStorage.setItem(ROLE_KEY, newRole)
    localStorage.setItem(PROFILE_ID_KEY, profile_id)
    setRole(newRole)
    setProfileId(profile_id)
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(ROLE_KEY)
    localStorage.removeItem(PROFILE_ID_KEY)
    setRole('guest')
    setProfileId(null)
    setProfile(null)
  }

  async function loginPatient(email, password) {
    try {
      const { data } = await api.post('/auth/login/patient', { email, password })
      storeSession(data)
      await fetchAndSetProfile()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.response?.data?.detail || 'Invalid email or password.' }
    }
  }

  async function loginDoctor(email, password) {
    try {
      const { data } = await api.post('/auth/login/doctor', { email, password })
      storeSession(data)
      await fetchAndSetProfile()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.response?.data?.detail || 'Invalid email or password.' }
    }
  }

  async function loginAdmin(email, password) {
    try {
      const { data } = await api.post('/auth/login/admin', { email, password })
      storeSession(data)
      await fetchAndSetProfile()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.response?.data?.detail || 'Invalid email or password.' }
    }
  }

  async function registerPatient({ name, email, phone, password, dob, gender }) {
    try {
      const { data } = await api.post('/auth/register', { name, email, phone, password, dob, gender })
      storeSession(data)
      await fetchAndSetProfile()
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err.response?.data?.detail || 'Could not create account.' }
    }
  }

  function logout() {
    clearSession()
  }

  const value = {
    session: profileId ? { role, profileId } : null,
    role,
    profile,
    loading,
    isAuthenticated: Boolean(profileId),
    loginPatient,
    loginDoctor,
    loginAdmin,
    registerPatient,
    refreshProfile: fetchAndSetProfile,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
