import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'
import AddSpecialtyModal from '../../components/admin/AddSpecialtyModal'
import { specialties } from '../../data/specialties'
import { getDoctorsBySpecialty } from '../../data/doctors'
import { showConfirm, showToast, showError } from '../../utils/toast'

export default function AdminSpecialtiesPage() {
  const [list, setList] = useState(specialties)
  const [addOpen, setAddOpen] = useState(false)

  function handleAdd(data) {
    specialties.push({
      id: `spec-${specialties.length + 1}`,
      name: data.name,
      consultMinutes: Number(data.consultMinutes),
      icon: data.icon,
    })
    setList([...specialties])
    setAddOpen(false)
    showToast('Specialty added.')
  }

  async function handleRemove(specialty) {
    const doctorCount = getDoctorsBySpecialty(specialty.id).length
    if (doctorCount > 0) {
      showError('Cannot remove', `${doctorCount} doctor(s) are still assigned to ${specialty.name}.`)
      return
    }
    const confirmed = await showConfirm({
      title: `Remove ${specialty.name}?`,
      confirmText: 'Remove',
    })
    if (!confirmed) return
    const idx = specialties.findIndex((s) => s.id === specialty.id)
    if (idx !== -1) specialties.splice(idx, 1)
    setList([...specialties])
    showToast('Specialty removed.', 'info')
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="h4 fw-bold m-0">Specialties</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} className="me-1" />
          Add Specialty
        </button>
      </div>

      <div className="row g-3">
        {list.map((s) => (
          <div className="col-md-6 col-lg-4" key={s.id}>
            <Card className="h-100">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <Icon name={s.icon} size={20} style={{ color: 'var(--shq-maroon)' }} />
                  <span className="fw-semibold">{s.name}</span>
                </div>
                <button className="btn btn-outline-danger btn-sm" onClick={() => handleRemove(s)}>
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="text-shq-secondary small">
                ~{s.consultMinutes} min consult · {getDoctorsBySpecialty(s.id).length} doctor(s)
              </div>
            </Card>
          </div>
        ))}
      </div>

      <AddSpecialtyModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </div>
  )
}
