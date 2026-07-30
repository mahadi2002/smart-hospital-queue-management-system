import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import { useQueue } from '../../context/QueueContext'
import { useAuth } from '../../context/AuthContext'
import { getDoctorById } from '../../data/doctors'
import { getSpecialtyById } from '../../data/specialties'
import { formatDateTime } from '../../utils/format'
import { showConfirm, showToast } from '../../utils/toast'
import { TOKEN_STATUS } from '../../data/tokens'

export default function MyTokensPage() {
  const { session } = useAuth()
  const { getTokensForPatient, cancelToken } = useQueue()

  const tokens = getTokensForPatient(session.profileId).sort(
    (a, b) => new Date(b.bookedAt) - new Date(a.bookedAt),
  )

  async function handleCancel(token) {
    const confirmed = await showConfirm({
      title: 'Cancel this token?',
      text: `Token ${token.tokenNumber} will be cancelled.`,
      confirmText: 'Yes, cancel',
    })
    if (confirmed) {
      cancelToken(token.id)
      showToast('Token cancelled.')
    }
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-shq-secondary mb-3">You haven't booked any tokens yet.</p>
        <Link to="/patient/book" className="btn btn-primary">
          Book a Token
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">My Tokens</h1>
      <div className="d-flex flex-column gap-3">
        {tokens.map((token) => {
          const doctor = getDoctorById(token.doctorId)
          const canCancel = [TOKEN_STATUS.WAITING, TOKEN_STATUS.CALLED].includes(token.status)
          return (
            <Card key={token.id}>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                  <div className="fw-semibold">
                    {token.tokenNumber} · {doctor?.name}
                  </div>
                  <div className="text-shq-secondary small">
                    {getSpecialtyById(doctor?.specialtyId)?.name} · {token.slotTime} · Booked {formatDateTime(token.bookedAt)}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <StatusBadge status={token.status} />
                  {canCancel && (
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancel(token)}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
