import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import AddPatientModal from '../../components/admin/AddPatientModal'
import api from '../../services/api'
import { normalizePatient } from '../../services/normalize'
import { showConfirm, showError, showToast } from '../../utils/toast'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [addOpen, setAddOpen] = useState(false)

  const refetch = useCallback(async () => {
    const { data } = await api.get('/patients')
    setPatients(data.map(normalizePatient))
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

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
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="h4 fw-bold m-0">Patients</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} className="me-1" />
          Add Patient
        </button>
      </div>

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
              {patients.map((p) => (
                <tr key={p.id}>
                  <td className="fw-semibold">{p.name}</td>
                  <td className="text-shq-secondary small">{p.email}</td>
                  <td>{p.phone}</td>
                  <td>{p.gender || '—'}</td>
                  <td className="text-end">
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
