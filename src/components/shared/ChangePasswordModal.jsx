import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'
import { showToast } from '../../utils/toast'

export default function ChangePasswordModal({ open, onClose }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm()
  const newPassword = watch('newPassword')

  function onSubmit() {
    reset()
    onClose()
    showToast('Password changed successfully.')
  }

  return (
    <Modal open={open} onClose={onClose} title="Change Password">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
            {...register('currentPassword', { required: true })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
            {...register('newPassword', { required: true, minLength: 6 })}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
            {...register('confirmPassword', { validate: (v) => v === newPassword || 'Passwords must match' })}
          />
          {errors.confirmPassword && <div className="invalid-feedback">Passwords must match.</div>}
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Update Password
        </button>
      </form>
    </Modal>
  )
}
