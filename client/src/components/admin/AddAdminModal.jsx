import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'

const DEPARTMENTS = [
  'Operations', 'IT Support', 'Patient Records', 'Billing & Finance',
  'Human Resources', 'Front Desk', 'Compliance', 'Facilities',
]

export default function AddAdminModal({ open, onClose, onAdd }) {
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
    <Modal open={open} onClose={onClose} title="Add Admin">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: true })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} {...register('email', { required: true })} />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Phone</label>
            <input className="form-control" {...register('phone')} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Department</label>
            <select className="form-select" {...register('department')}>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select className="form-select" {...register('role')}>
            <option value="Admin">Admin</option>
            <option value="Super Admin">Super Admin</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Temporary Password</label>
          <input
            className="form-control"
            placeholder="Leave blank to use admin123"
            {...register('password')}
          />
          <div className="form-text">
            You'll get the login details to pass on once the account is created.
          </div>
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Add Admin
        </button>
      </form>
    </Modal>
  )
}
