import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'

export default function AddPatientModal({ open, onClose, onAdd }) {
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
    <Modal open={open} onClose={onClose} title="Add Patient">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: true })} />
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
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Date of Birth</label>
            <input type="date" className="form-control" {...register('dob')} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Gender</label>
            <select className="form-select" {...register('gender')}>
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Add Patient
        </button>
      </form>
    </Modal>
  )
}
