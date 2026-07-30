import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'

const ICON_OPTIONS = [
  'Heart', 'Activity', 'Shield', 'Zap', 'Droplet', 'Ear', 'Flower2', 'Stethoscope',
  'Brain', 'Bone', 'Eye', 'Pill',
]

export default function AddSpecialtyModal({ open, onClose, onAdd }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  function onSubmit(data) {
    onAdd(data)
    reset()
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Specialty">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: true })} />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Consult Duration (min)</label>
            <input type="number" className={`form-control ${errors.consultMinutes ? 'is-invalid' : ''}`} {...register('consultMinutes', { required: true })} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Icon</label>
            <select className="form-select" {...register('icon')}>
              {ICON_OPTIONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Add Specialty
        </button>
      </form>
    </Modal>
  )
}
