import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import Icon from '../../components/ui/Icon'
import AddSpecialtyModal from '../../components/admin/AddSpecialtyModal'
import api from '../../services/api'
import { useDirectory } from '../../context/DirectoryContext'
import { showConfirm, showToast, showError } from '../../utils/toast'

export default function Specialties() {
  const { specialties, getDoctorsBySpecialty, refetchSpecialties } = useDirectory()
  const [addOpen, setAddOpen] = useState(false)

  async function handleAdd(data) {
    await api.post('/specialties', {
      name: data.name,
      consult_minutes: Number(data.consultMinutes),
      icon: data.icon,
    })
    await refetchSpecialties()
    setAddOpen(false)
    showToast('Specialty added.')
  }

  async function handleRemove(specialty) {
    const confirmed = await showConfirm({
      title: `Remove ${specialty.name}?`,
      confirmText: 'Remove',
    })
    if (!confirmed) return
    try {
      await api.delete(`/specialties/${specialty.id}`)
      await refetchSpecialties()
      showToast('Specialty removed.', 'info')
    } catch (err) {
      showError('Cannot remove', err.response?.data?.detail || 'Something went wrong.')
    }
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
        {specialties.map((s) => (
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
