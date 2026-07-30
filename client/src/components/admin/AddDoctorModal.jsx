import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'
import { useDirectory } from '../../context/DirectoryContext'

export default function AddDoctorModal({ open, onClose, onAdd }) {
  const { specialties } = useDirectory()
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
    <Modal open={open} onClose={onClose} title="Add Doctor">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: true })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Qualifications</label>
          <input className={`form-control ${errors.qualifications ? 'is-invalid' : ''}`} {...register('qualifications', { required: true })} />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Specialty</label>
            <select className={`form-select ${errors.specialtyId ? 'is-invalid' : ''}`} {...register('specialtyId', { required: true })}>
              <option value="">Select</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Experience (years)</label>
            <input type="number" className={`form-control ${errors.experienceYears ? 'is-invalid' : ''}`} {...register('experienceYears', { required: true })} />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Email</label>
            <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email', { required: true })} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Phone</label>
            <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} {...register('phone', { required: true })} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Add Doctor
        </button>
      </form>
    </Modal>
  )
}
