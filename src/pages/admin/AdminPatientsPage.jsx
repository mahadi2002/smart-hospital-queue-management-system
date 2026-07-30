import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import AddPatientModal from '../../components/admin/AddPatientModal'
import { patients } from '../../data/patients'
import { getInitials } from '../../utils/format'
import { showConfirm, showToast } from '../../utils/toast'

export default function AdminPatientsPage() {
  const [list, setList] = useState(patients)
  const [addOpen, setAddOpen] = useState(false)

  function handleAdd(data) {
    patients.push({
      id: `pat-${patients.length + 1}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: 'password123',
      dob: data.dob || '',
      gender: data.gender || '',
      bloodGroup: '',
      address: '',
      avatarInitials: getInitials(data.name),
      medicalHistory: [],
      reports: [],
    })
    setList([...patients])
    setAddOpen(false)
    showToast('Patient added.')
  }

  async function handleRemove(patient) {
    const confirmed = await showConfirm({
      title: `Remove ${patient.name}?`,
      text: 'This will remove the patient account and their records.',
      confirmText: 'Remove',
    })
    if (!confirmed) return
    const idx = patients.findIndex((p) => p.id === patient.id)
    if (idx !== -1) patients.splice(idx, 1)
    setList([...patients])
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
              {list.map((p) => (
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
