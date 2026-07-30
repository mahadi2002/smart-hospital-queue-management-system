import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { showError, showToast } from '../../utils/toast'

export default function ReservePackageModal({ open, onClose, pkg }) {
  const { profile, role } = useAuth()
  const isPatient = role === 'patient' && profile
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    values: isPatient ? { name: profile.name, phone: profile.phone } : { name: '', phone: '' },
  })

  if (!pkg) return null

  async function onSubmit(data) {
    try {
      await api.post(`/packages/${pkg.id}/reserve`, { name: data.name, phone: data.phone })
      reset()
      onClose()
      showToast(`${pkg.name} reserved — our team will contact you at ${data.phone} to confirm.`)
    } catch (err) {
      showError('Could not reserve package', err.response?.data?.detail || 'Something went wrong.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Reserve: ${pkg.name}`}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p className="text-shq-secondary small mb-3">
          Leave your contact details and our team will call to confirm your appointment for this package.
        </p>
        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: true })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            placeholder="+880 1XXX-XXXXXX"
            {...register('phone', { required: true })}
          />
          {errors.phone && <div className="invalid-feedback">Phone number is required so we can reach you.</div>}
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Confirm Reservation
        </button>
      </form>
    </Modal>
  )
}
