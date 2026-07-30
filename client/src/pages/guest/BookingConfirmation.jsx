import { Link, Navigate, useLocation } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import { useDirectory } from '../../context/DirectoryContext'

export default function BookingConfirmation() {
  const { getSpecialtyById } = useDirectory()
  const { state } = useLocation()

  if (!state?.token) {
    return <Navigate to="/" replace />
  }

  const { token, doctor, phone } = state

  return (
    <div className="container py-5 d-flex justify-content-center">
      <Card style={{ maxWidth: 480 }} className="w-100 text-center p-4">
        <CheckCircle2 size={48} style={{ color: 'var(--shq-green)' }} className="mb-3" />
        <h1 className="h4 fw-bold mb-1">Booking Confirmed</h1>
        <p className="text-shq-secondary mb-4">
          A confirmation has been sent to {phone}. Please arrive 10 minutes before your slot.
        </p>

        <div className="p-3 mb-4" style={{ background: 'var(--shq-bg)', borderRadius: 10 }}>
          <div className="text-shq-secondary small mb-1">Your Token Number</div>
          <div className="fw-bold" style={{ fontSize: '2rem', color: 'var(--shq-maroon)' }}>
            {token.tokenNumber}
          </div>
        </div>

        <div className="text-start mb-4">
          <Row label="Doctor" value={doctor?.name} />
          <Row label="Specialty" value={getSpecialtyById(doctor?.specialtyId)?.name} />
          <Row label="Time Slot" value={token.slotTime} />
        </div>

        <div className="d-flex gap-2 justify-content-center flex-wrap">
          <Link to="/" className="btn btn-outline-primary">
            Back to Home
          </Link>
          <Link to="/register" className="btn btn-primary">
            Create an Account to Track Live Queue
          </Link>
        </div>
      </Card>
    </div>
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
