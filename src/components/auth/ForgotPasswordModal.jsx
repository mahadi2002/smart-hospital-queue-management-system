import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'
import { showToast } from '../../utils/toast'

export default function ForgotPasswordModal({ open, onClose }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  function onSubmit(data) {
    reset()
    onClose()
    showToast(`Reset link sent to ${data.email}`)
  }

  return (
    <Modal open={open} onClose={onClose} title="Forgot Password">
      <form onSubmit={handleSubmit(onSubmit)}>
        <p className="text-shq-secondary small mb-3">
          Enter the email linked to your account and we'll send a password reset link.
        </p>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            {...register('email', { required: true })}
          />
          {errors.email && <div className="invalid-feedback">Email is required.</div>}
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Send Reset Link
        </button>
      </form>
    </Modal>
  )
}
