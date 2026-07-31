import { useMemo, useState } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
import Card from '../../components/ui/Card'
import AddDoctorModal from '../../components/admin/AddDoctorModal'
import api from '../../services/api'
import { useDirectory } from '../../context/DirectoryContext'
import { showConfirm, showCredentials, showError, showToast } from '../../utils/toast'

export default function Doctors() {
  const { doctors, allDoctors, specialties, getSpecialtyById, refetchDoctors } = useDirectory()
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [showRemoved, setShowRemoved] = useState(false)

  const source = showRemoved ? allDoctors : doctors

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return source.filter((d) => {
      const matchesSpecialty = specialtyFilter === 'all' || d.specialtyId === specialtyFilter
      const matchesSearch = !q || d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q)
      return matchesSpecialty && matchesSearch
    })
  }, [source, search, specialtyFilter])

  async function handleAdd(data) {
    try {
      const password = data.password?.trim() || 'doctor123'
      await api.post('/doctors', {
        name: data.name,
        specialty_id: data.specialtyId,
        qualifications: data.qualifications,
        experience_years: Number(data.experienceYears),
        email: data.email,
        phone: data.phone,
        password,
      })
      await refetchDoctors()
      setAddOpen(false)
      await showCredentials({ role: 'Doctor', name: data.name, email: data.email, password })
    } catch (err) {
      showError('Could not add doctor', err.response?.data?.detail || 'Something went wrong.')
    }
  }

  async function handleRemove(doctor) {
    const confirmed = await showConfirm({
      title: `Remove ${doctor.name}?`,
      text:
        'They lose access straight away and stop appearing in the directory and booking flow. ' +
        'Their past consultations stay on record, so patient history is unaffected.',
      confirmText: 'Remove',
    })
    if (!confirmed) return
    try {
      await api.delete(`/doctors/${doctor.id}`)
      await refetchDoctors()
      showToast('Doctor removed.', 'info')
    } catch (err) {
      showError('Could not remove doctor', err.response?.data?.detail || 'Something went wrong.')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h1 className="h4 fw-bold m-0">Doctors</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} className="me-1" />
          Add Doctor
        </button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: 280 }}>
          <span className="input-group-text bg-white">
            <Search size={14} />
          </span>
          <input
            className="form-control"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ maxWidth: 220 }}
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
        >
          <option value="all">All specialties</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <div className="form-check d-flex align-items-center gap-2 ms-1">
          <input
            className="form-check-input mt-0"
            type="checkbox"
            id="showRemoved"
            checked={showRemoved}
            onChange={(e) => setShowRemoved(e.target.checked)}
          />
          <label className="form-check-label text-shq-secondary" htmlFor="showRemoved">
            Include removed
          </label>
        </div>
      </div>

      <p className="text-shq-secondary small mb-3">
        {filtered.length} of {source.length} doctors
      </p>

      <Card className="p-0">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th>Experience</th>
                <th>Room</th>
                <th>Fee</th>
                <th>Email</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const archived = d.status === 'archived'
                return (
                  <tr key={d.id} className={archived ? 'text-shq-secondary' : ''}>
                    <td className="fw-semibold">{d.name}</td>
                    <td>{getSpecialtyById(d.specialtyId)?.name}</td>
                    <td>{d.experienceYears} yrs</td>
                    <td>{d.roomNumber || '—'}</td>
                    <td>৳{d.consultationFee || 0}</td>
                    <td className="text-shq-secondary small">{d.email}</td>
                    <td>
                      <span
                        className={`badge text-capitalize ${
                          archived
                            ? 'bg-secondary-subtle text-secondary-emphasis'
                            : 'bg-success-subtle text-success-emphasis'
                        }`}
                      >
                        {archived ? 'removed' : d.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {!archived && (
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemove(d)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <AddDoctorModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </div>
  )
}
