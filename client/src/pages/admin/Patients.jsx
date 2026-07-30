import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Search } from 'lucide-react'
import Card from '../../components/ui/Card'
import AddPatientModal from '../../components/admin/AddPatientModal'
import api from '../../services/api'
import { normalizePatient } from '../../services/normalize'
import { showConfirm, showError, showToast } from '../../utils/toast'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [addOpen, setAddOpen] = useState(false)
  const [search, setSearch] = useState('')

  const refetch = useCallback(async () => {
    const { data } = await api.get('/patients')
    setPatients(data.map(normalizePatient))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(
      (p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.phone.includes(q),
    )
  }, [patients, search])

  async function handleAdd(data) {
    try {
      await api.post('/patients', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        dob: data.dob,
        gender: data.gender,
      })
      await refetch()
      setAddOpen(false)
      showToast('Patient added.')
    } catch (err) {
      showError('Could not add patient', err.response?.data?.detail || 'Something went wrong.')
    }
  }

  async function handleRemove(patient) {
    const confirmed = await showConfirm({
      title: `Remove ${patient.name}?`,
      text: 'This will remove the patient account and their records.',
      confirmText: 'Remove',
    })
    if (!confirmed) return
    await api.delete(`/patients/${patient.id}`)
    await refetch()
    showToast('Patient removed.', 'info')
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h1 className="h4 fw-bold m-0">Patients</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} className="me-1" />
          Add Patient
        </button>
      </div>

      <div className="mb-3" style={{ maxWidth: 320 }}>
        <div className="input-group">
          <span className="input-group-text bg-white">
            <Search size={14} />
          </span>
          <input
            className="form-control"
            placeholder="Search by name, email, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <p className="text-shq-secondary small mb-3">
        {filtered.length} of {patients.length} patients
      </p>

      <Card className="p-0">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="fw-semibold">
                    <Link to={`/admin/patients/${p.id}`} className="link-shq">
                      {p.name}
                    </Link>
                  </td>
                  <td className="text-shq-secondary small">{p.email}</td>
                  <td>{p.phone}</td>
                  <td>{p.gender || '—'}</td>
                  <td className="text-end">
                    <Link to={`/admin/patients/${p.id}`} className="btn btn-outline-primary btn-sm me-2">
                      View
                    </Link>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemove(p)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddPatientModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </div>
  )
}
