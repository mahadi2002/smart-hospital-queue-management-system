import { Link } from 'react-router-dom'
import { Ticket, ListOrdered, FileText, Package } from 'lucide-react'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useQueue } from '../../context/QueueContext'
import { getPatientById } from '../../data/patients'
import { getDoctorById } from '../../data/doctors'
import { TOKEN_STATUS } from '../../data/tokens'

const QUICK_LINKS = [
  { to: '/patient/book', label: 'Book a Token', icon: Ticket },
  { to: '/patient/queue', label: 'Live Queue', icon: ListOrdered },
  { to: '/patient/records', label: 'Medical Records', icon: FileText },
  { to: '/patient/packages', label: 'Health Packages', icon: Package },
]

export default function PatientDashboardPage() {
  const { session } = useAuth()
  const { getTokensForPatient } = useQueue()
  const patient = getPatientById(session.profileId)

  const tokens = getTokensForPatient(session.profileId)
  const activeToken = tokens.find((t) =>
    [TOKEN_STATUS.WAITING, TOKEN_STATUS.CALLED, TOKEN_STATUS.IN_CONSULTATION].includes(t.status),
  )

  return (
    <div>
      <h1 className="h4 fw-bold mb-1">Welcome back, {patient.name.split(' ')[0]}</h1>
      <p className="text-shq-secondary mb-4">Here's what's happening with your care today.</p>

      {activeToken && (
        <Card className="mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div className="text-shq-secondary small mb-1">Active Token</div>
              <div className="fw-bold fs-5">{activeToken.tokenNumber}</div>
              <div className="text-shq-secondary small">{getDoctorById(activeToken.doctorId)?.name}</div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <StatusBadge status={activeToken.status} />
              <Link to="/patient/queue" className="btn btn-primary btn-sm">
                View Live Queue
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="row g-3 mb-4">
        {QUICK_LINKS.map((q) => (
          <div className="col-6 col-md-3" key={q.to}>
            <Link to={q.to} className="text-decoration-none">
              <Card className="text-center py-4 h-100">
                <q.icon size={24} style={{ color: 'var(--shq-maroon)' }} className="mb-2" />
                <div className="fw-semibold small text-body">{q.label}</div>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      <Card>
        <div className="fw-semibold mb-3">Recent Visit History</div>
        {patient.medicalHistory.length === 0 ? (
          <div className="text-shq-secondary small">No visit history yet.</div>
        ) : (
          patient.medicalHistory.slice(0, 3).map((h) => (
            <div key={h.id} className="d-flex justify-content-between border-bottom py-2">
              <span className="small">{h.diagnosis}</span>
              <span className="text-shq-secondary small">{h.doctor}</span>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
