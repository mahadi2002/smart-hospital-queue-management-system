import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { normalizeDoctor, normalizeSpecialty } from '../services/normalize'

const DirectoryContext = createContext(null)

export function DirectoryProvider({ children }) {
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)

  const refetchDoctors = useCallback(async () => {
    const { data } = await api.get('/doctors')
    setDoctors(data.map(normalizeDoctor))
  }, [])

  const refetchSpecialties = useCallback(async () => {
    const { data } = await api.get('/specialties')
    setSpecialties(data.map(normalizeSpecialty))
  }, [])

  useEffect(() => {
    async function loadAll() {
      const [doctorsRes, specialtiesRes, packagesRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/specialties'),
        api.get('/packages'),
      ])
      setDoctors(doctorsRes.data.map(normalizeDoctor))
      setSpecialties(specialtiesRes.data.map(normalizeSpecialty))
      setPackages(packagesRes.data)
      setLoading(false)
    }
    loadAll()
  }, [])

  function getDoctorById(id) {
    return doctors.find((d) => d.id === id)
  }

  function getDoctorsBySpecialty(specialtyId) {
    return doctors.filter((d) => d.specialtyId === specialtyId)
  }

  function getSpecialtyById(id) {
    return specialties.find((s) => s.id === id)
  }

  const value = {
    doctors,
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
