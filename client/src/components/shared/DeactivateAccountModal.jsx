import { useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Modal from '../ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { showToast } from '../../utils/toast'

export default function DeactivateAccountModal({ open, onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleDeactivate() {
    onClose()
    logout()
    showToast('Account deactivated.', 'info')
    navigate('/')
  }

  return (
    <Modal open={open} onClose={onClose} title="Deactivate Account">
      <div className="d-flex gap-3 mb-3">
        <AlertTriangle size={28} style={{ color: '#dc2626', flexShrink: 0 }} />
        <p className="text-shq-secondary small m-0">
          This will deactivate your account and log you out. This action is for demo purposes only
          — no data is actually deleted.
        </p>
      </div>
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-outline-primary flex-fill" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger flex-fill" onClick={handleDeactivate}>
          Deactivate
        </button>
      </div>
    </Modal>
  )
}
