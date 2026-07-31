import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { normalizeDoctor, normalizeSpecialty } from '../services/normalize'

const DirectoryContext = createContext(null)

export function DirectoryProvider({ children }) {
  // We fetch removed doctors too, otherwise a patient's old bookings would
  // lose the name of who they saw. `doctors` below hides them again so
  // nothing can browse or book an archived doctor by accident.
  const [allDoctors, setAllDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  const doctors = allDoctors.filter((d) => d.status !== 'archived')

  const refetchDoctors = useCallback(async () => {
    const { data } = await api.get('/doctors', { params: { include_archived: true } })
    setAllDoctors(data.map(normalizeDoctor))
  }, [])

  const refetchSpecialties = useCallback(async () => {
    const { data } = await api.get('/specialties')
    setSpecialties(data.map(normalizeSpecialty))
  }, [])

  useEffect(() => {
    async function loadAll() {
      const [doctorsRes, specialtiesRes, packagesRes] = await Promise.all([
        api.get('/doctors', { params: { include_archived: true } }),
        api.get('/specialties'),
        api.get('/packages'),
      ])
      setAllDoctors(doctorsRes.data.map(normalizeDoctor))
      setSpecialties(specialtiesRes.data.map(normalizeSpecialty))
      setPackages(packagesRes.data)
      setLoading(false)
    }
    loadAll()
  }, [])

  // Searches archived doctors too, so past bookings keep showing the name of
  // whoever the patient actually saw.
  function getDoctorById(id) {
    return allDoctors.find((d) => d.id === id)
  }

  function getDoctorsBySpecialty(specialtyId) {
    return doctors.filter((d) => d.specialtyId === specialtyId)
  }

  function getSpecialtyById(id) {
    return specialties.find((s) => s.id === id)
  }

  const value = {
    doctors,
    allDoctors,
    specialties,
    packages,
    loading,
    refetchDoctors,
    refetchSpecialties,
    getDoctorById,
    getDoctorsBySpecialty,
    getSpecialtyById,
  }

  return <DirectoryContext.Provider value={value}>{children}</DirectoryContext.Provider>
}

export function useDirectory() {
  const ctx = useContext(DirectoryContext)
  if (!ctx) throw new Error('useDirectory must be used within a DirectoryProvider')
  return ctx
}
