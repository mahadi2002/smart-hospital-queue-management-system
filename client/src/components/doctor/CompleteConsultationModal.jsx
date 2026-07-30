import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'

export default function CompleteConsultationModal({ open, onClose, token, onSubmitConsultation }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  if (!token) return null

  function onSubmit(data) {
    onSubmitConsultation(data)
    reset()
  }

  return (
    <Modal open={open} onClose={onClose} title="Complete Consultation">
      <p className="text-shq-secondary small mb-3">
        {token.patientName} · Token {token.tokenNumber}
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Diagnosis</label>
          <input className={`form-control ${errors.diagnosis ? 'is-invalid' : ''}`} {...register('diagnosis', { required: true })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea rows={3} className={`form-control ${errors.notes ? 'is-invalid' : ''}`} {...register('notes', { required: true })} />
        </div>
        <button type="submit" className="btn btn-success w-100">
          Complete & Save to Record
        </button>
      </form>
    </Modal>
  )
}
