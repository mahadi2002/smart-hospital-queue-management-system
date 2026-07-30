import Modal from '../ui/Modal'
import { useDirectory } from '../../context/DirectoryContext'

export default function ConfirmBookingModal({ open, onClose, onConfirm, doctor, slotTime, type }) {
  const { getSpecialtyById } = useDirectory()
  if (!doctor) return null
  const specialty = getSpecialtyById(doctor.specialtyId)

  return (
    <Modal open={open} onClose={onClose} title="Confirm Booking">
      <div className="mb-3">
        <Row label="Doctor" value={doctor.name} />
        <Row label="Specialty" value={specialty?.name} />
        <Row label="Consult Duration" value={`~${specialty?.consultMinutes} min`} />
        <Row label="Time Slot" value={slotTime} />
        <Row label="Type" value={type === 'emergency' ? 'Emergency' : 'Regular'} />
      </div>
      <div className="d-flex gap-2">
        <button type="button" className="btn btn-outline-primary flex-fill" onClick={onClose}>
          Back
        </button>
        <button type="button" className="btn btn-primary flex-fill" onClick={onConfirm}>
          Confirm & Book
        </button>
      </div>
    </Modal>
  )
}

function Row({ label, value }) {
  return (
    <div className="d-flex justify-content-between border-bottom py-2">
      <span className="text-shq-secondary small">{label}</span>
      <span className="fw-semibold small">{value}</span>
    </div>
  )
}
