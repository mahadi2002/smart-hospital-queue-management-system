import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import AddDoctorModal from '../../components/admin/AddDoctorModal'
import { doctors } from '../../data/doctors'
import { getSpecialtyById } from '../../data/specialties'
import { showConfirm, showToast } from '../../utils/toast'

export default function AdminDoctorsPage() {
  const [list, setList] = useState(doctors)
  const [addOpen, setAddOpen] = useState(false)

  function handleAdd(data) {
    doctors.push({
      id: `doc-${doctors.length + 1}`,
      name: data.name,
      specialtyId: data.specialtyId,
      qualifications: data.qualifications,
      experienceYears: Number(data.experienceYears),
      email: data.email,
      phone: data.phone,
      workingDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
      workingHours: '09:00 - 17:00',
      dailyTokenLimit: 40,
      emergencyCap: 8,
      walkInSlots: 5,
      status: 'active',
      bio: '',
    })
    setList([...doctors])
    setAddOpen(false)
    showToast('Doctor added.')
  }

  async function handleRemove(doctor) {
    const confirmed = await showConfirm({
      title: `Remove ${doctor.name}?`,
      text: 'This doctor will no longer appear in the directory or booking flow.',
      confirmText: 'Remove',
    })
    if (!confirmed) return
    const idx = doctors.findIndex((d) => d.id === doctor.id)
    if (idx !== -1) doctors.splice(idx, 1)
    setList([...doctors])
    showToast('Doctor removed.', 'info')
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="h4 fw-bold m-0">Doctors</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} className="me-1" />
          Add Doctor
        </button>
      </div>

      <Card className="p-0">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th>Experience</th>
                <th>Email</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d.id}>
                  <td className="fw-semibold">{d.name}</td>
                  <td>{getSpecialtyById(d.specialtyId)?.name}</td>
                  <td>{d.experienceYears} yrs</td>
                  <td className="text-shq-secondary small">{d.email}</td>
                  <td>
                    <span className="badge bg-success-subtle text-success-emphasis text-capitalize">{d.status}</span>
                  </td>
                  <td className="text-end">
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemove(d)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AddDoctorModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </div>
  )
}
