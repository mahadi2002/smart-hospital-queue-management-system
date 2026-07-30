import { createContext, useContext, useEffect, useState } from 'react'
import { patients, getPatientByEmail } from '../data/patients'
import { getDoctorByEmail, DOCTOR_DEMO_PASSWORD } from '../data/doctors'
import { getAdminByEmail } from '../data/admins'

const AuthContext = createContext(null)
const STORAGE_KEY = 'shq_session'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  function loginPatient(email, password) {
    const patient = getPatientByEmail(email)
    if (!patient || patient.password !== password) {
      return { ok: false, error: 'Invalid email or password.' }
    }
    setSession({ role: 'patient', profileId: patient.id })
    return { ok: true }
  }

  function loginDoctor(email, password) {
    const doctor = getDoctorByEmail(email)
    if (!doctor || password !== DOCTOR_DEMO_PASSWORD) {
      return { ok: false, error: 'Invalid email or password.' }
    }
    setSession({ role: 'doctor', profileId: doctor.id })
    return { ok: true }
  }

  function loginAdmin(email, password) {
    const admin = getAdminByEmail(email)
    if (!admin || admin.password !== password) {
      return { ok: false, error: 'Invalid email or password.' }
    }
    setSession({ role: 'admin', profileId: admin.id })
    return { ok: true }
  }

  function registerPatient({ name, email, phone, password, dob, gender }) {
    if (getPatientByEmail(email)) {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    const newPatient = {
      id: `pat-${patients.length + 1}`,
      name,
      email,
      phone,
      password,
      dob: dob || '',
      gender: gender || '',
      bloodGroup: '',
      address: '',
      avatarInitials: name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      medicalHistory: [],
      reports: [],
    }
    patients.push(newPatient)
    setSession({ role: 'patient', profileId: newPatient.id })
    return { ok: true }
  }

  function logout() {
    setSession(null)
  }

  const value = {
    session,
    role: session?.role ?? 'guest',
    isAuthenticated: Boolean(session),
    loginPatient,
    loginDoctor,
    loginAdmin,
    registerPatient,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
