import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import { useQueue } from '../../context/QueueContext'
import { useAuth } from '../../context/AuthContext'
import { getDoctorById } from '../../data/doctors'
import { getSpecialtyById } from '../../data/specialties'
import { TOKEN_STATUS } from '../../data/tokens'

export default function PatientLiveQueuePage() {
  const { session } = useAuth()
  const { getTokensForPatient, getQueueForDoctor } = useQueue()

  const activeTokens = getTokensForPatient(session.profileId).filter((t) =>
    [TOKEN_STATUS.WAITING, TOKEN_STATUS.CALLED, TOKEN_STATUS.IN_CONSULTATION].includes(t.status),
  )

  if (activeTokens.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-shq-secondary mb-3">You have no active tokens right now.</p>
        <Link to="/patient/book" className="btn btn-primary">
          Book a Token
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Live Queue</h1>
      {activeTokens.map((token) => {
        const doctor = getDoctorById(token.doctorId)
        const waitingQueue = getQueueForDoctor(token.doctorId).filter(
          (t) => t.status !== TOKEN_STATUS.IN_CONSULTATION,
        )
        const position = waitingQueue.findIndex((t) => t.id === token.id)

        return (
          <Card key={token.id} className="mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
              <div>
                <div className="fw-semibold">{doctor?.name}</div>
                <div className="text-shq-secondary small">{getSpecialtyById(doctor?.specialtyId)?.name}</div>
              </div>
              <span className="badge" style={{ background: 'var(--shq-maroon)' }}>
                Token {token.tokenNumber}
              </span>
            </div>

            {token.status === TOKEN_STATUS.IN_CONSULTATION ? (
              <div className="alert alert-success py-2 mb-0">You are being seen now.</div>
            ) : token.status === TOKEN_STATUS.CALLED ? (
              <div className="alert alert-warning py-2 mb-0">You've been called — please proceed to the consultation room.</div>
            ) : (
              <div className="p-3 text-center" style={{ background: 'var(--shq-bg)', borderRadius: 10 }}>
                <div className="text-shq-secondary small">Your position in queue</div>
                <div className="fw-bold" style={{ fontSize: '2rem', color: 'var(--shq-maroon)' }}>
                  {position >= 0 ? position + 1 : '—'}
                </div>
                <div className="text-shq-secondary small">of {waitingQueue.length} waiting</div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
