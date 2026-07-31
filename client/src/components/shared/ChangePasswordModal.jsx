import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Info, Lock, Eye, EyeOff } from 'lucide-react'
import Modal from '../ui/Modal'
import api from '../../services/api'
import { showError, showToast } from '../../utils/toast'

// One password row: lock icon on the left, show/hide toggle on the right.
function PasswordField({ label, name, register, rules, error, errorText }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <div className="position-relative">
        <Lock
          size={16}
          className="position-absolute text-shq-secondary"
          style={{ left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 5 }}
        />
        <input
          type={visible ? 'text' : 'password'}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          style={{ paddingLeft: 40, paddingRight: 44 }}
          {...register(name, rules)}
        />
        <button
          type="button"
          className="btn p-0 position-absolute text-shq-secondary"
          style={{ right: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 5, border: 'none' }}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {error && <div className="text-danger small mt-1">{errorText}</div>}
    </div>
  )
}

export default function ChangePasswordModal({ open, onClose }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()

  function handleClose() {
    reset()
    onClose()
  }

  async function onSubmit(data) {
    try {
      await api.post('/auth/change-password', {
        current_password: data.currentPassword,
        new_password: data.newPassword,
      })
      reset()
      onClose()
      showToast('Password updated.')
    } catch (err) {
      showError('Could not update password', err.response?.data?.detail || 'Something went wrong.')
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Change Password">
      <p className="text-shq-secondary" style={{ marginTop: -10 }}>
        Choose a new password for your account
      </p>

      <div
        className="d-flex gap-2 p-3 mb-4"
        style={{ background: 'rgba(163,38,56,0.06)', borderRadius: 10, color: 'var(--shq-maroon)' }}
      >
        <Info size={18} className="flex-shrink-0" style={{ marginTop: 2 }} />
        <span className="small">Use at least 8 characters with a mix of letters and numbers.</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <PasswordField
          label="Current password"
          name="currentPassword"
          register={register}
          rules={{ required: true }}
          error={errors.currentPassword}
          errorText="Enter your current password."
        />
        <PasswordField
          label="New password"
          name="newPassword"
          register={register}
          rules={{ required: true, minLength: 8 }}
          error={errors.newPassword}
          errorText="New password must be at least 8 characters."
        />
        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          register={register}
          rules={{ required: true, validate: (value) => value === watch('newPassword') }}
          error={errors.confirmPassword}
          errorText="Both passwords must match."
        />

        <div
          className="d-flex justify-content-between gap-2 pt-3 mt-4"
          style={{ borderTop: '1px solid var(--shq-border)' }}
        >
          <button type="button" className="btn btn-outline-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
