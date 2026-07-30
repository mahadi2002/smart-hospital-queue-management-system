import Modal from '../ui/Modal'

export default function CallPatientModal({ open, onClose, token, onConfirm }) {
  if (!token) return null
  return (
    <Modal open={open} onClose={onClose} title="Call Patient">
      <p className="mb-3">
        Call <strong>{token.patientName}</strong> (Token {token.tokenNumber}) to the consultation room?
      </p>
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-outline-primary flex-fill" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary flex-fill" onClick={onConfirm}>
          Call Patient
        </button>
      </div>
    </Modal>
  )
}
