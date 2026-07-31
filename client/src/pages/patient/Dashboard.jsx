import { Link } from 'react-router-dom'
import { Plus, MapPin, ListChecks, CalendarDays, Clock } from 'lucide-react'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useQueue } from '../../context/QueueContext'
import { useDirectory } from '../../context/DirectoryContext'
import { formatDate } from '../../utils/format'
import { TOKEN_STATUS } from '../../constants/tokenStatus'

const ACTIVE_STATUSES = [TOKEN_STATUS.WAITING, TOKEN_STATUS.CALLED, TOKEN_STATUS.IN_CONSULTATION]

export default function PatientDashboard() {
  const { session, profile: patient } = useAuth()
  const { getTokensForPatient } = useQueue()
  const { getDoctorById, getSpecialtyById } = useDirectory()

  const tokens = getTokensForPatient(session.profileId)
  const activeToken = tokens.find((t) => ACTIVE_STATUSES.includes(t.status))
  const activeDoctor = activeToken ? getDoctorById(activeToken.doctorId) : null
  const activeSpecialty = activeDoctor ? getSpecialtyById(activeDoctor.specialtyId) : null

  const completedCount = tokens.filter((t) => t.status === TOKEN_STATUS.COMPLETED).length
  const upcomingCount = tokens.filter((t) => ACTIVE_STATUSES.includes(t.status)).length
  const avgWait = activeSpecialty ? activeSpecialty.consultMinutes : 15

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1" style={{ fontSize: '1.9rem' }}>
            Welcome back, {patient.name.split(' ')[0]}
          </h1>
          <p className="text-shq-secondary mb-0">Here's your care summary for {today}</p>
        </div>
        <Link to="/patient/book" className="btn btn-primary">
          <Plus size={18} className="me-2" />
          Book New Token
        </Link>
      </div>

      {activeToken && (
        <div
          className="p-4 mb-4"
          style={{
            background: '#fdf2f4',
            border: '1px solid #f3c9d1',
            borderRadius: 'var(--shq-radius)',
          }}
        >
          <div
            className="text-uppercase fw-semibold mb-2"
            style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--shq-maroon)' }}
          >
            Active Token · Slot {activeToken.slotTime}
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap mb-2">
            <span className="fw-bold" style={{ fontSize: '3rem', lineHeight: 1, color: 'var(--shq-maroon)' }}>
              {activeToken.tokenNumber}
            </span>
            <StatusBadge status={activeToken.status} />
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
            {activeSpecialty && (
              <span className="fw-semibold" style={{ color: 'var(--shq-maroon)' }}>
                {activeSpecialty.name}
              </span>
            )}
            <span className="fw-semibold">{activeDoctor?.name}</span>
          </div>
          {activeDoctor?.roomNumber && (
            <div className="text-shq-secondary d-flex align-items-center gap-1">
              <MapPin size={15} />
              Room {activeDoctor.roomNumber}
            </div>
          )}
          {activeToken.reason && (
            <div className="text-shq-secondary small mt-2">Reason: {activeToken.reason}</div>
          )}
          <Link to="/patient/queue" className="btn btn-primary mt-3">
            View Live Queue
          </Link>
        </div>
      )}

      <div className="row g-3 mb-4">
        <StatTile icon={ListChecks} tint="#dcfce7" color="#166534" value={completedCount} label="Total visits" />
        <StatTile icon={CalendarDays} tint="#fee2e2" color="#991b1b" value={upcomingCount} label="Upcoming" />
        <StatTile icon={Clock} tint="#fef3c7" color="#92400e" value={`${avgWait} min`} label="Avg wait time" />
      </div>

      <Card className="p-0">
        <div className="p-3 fw-semibold">Recent Tokens</div>
        {tokens.length === 0 ? (
          <div className="px-3 pb-3 text-shq-secondary">You haven't booked any tokens yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Token</th>
                  <th>Doctor</th>
                  <th>Department</th>
                  <th className="text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {tokens.slice(0, 6).map((t) => {
                  const doctor = getDoctorById(t.doctorId)
                  const specialty = doctor ? getSpecialtyById(doctor.specialtyId) : null
                  return (
                    <tr key={t.id}>
                      <td className="text-shq-secondary">{formatDate(t.bookedAt)}</td>
                      <td className="fw-semibold">{t.tokenNumber}</td>
                      <td>{doctor?.name || '—'}</td>
                      <td className="text-shq-secondary">{specialty?.name || '—'}</td>
                      <td className="text-end">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function StatTile({ icon: IconCmp, tint, color, value, label }) {
  return (
    <div className="col-md-4">
      <Card className="d-flex align-items-center gap-3">
        <span
          className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 44, height: 44, borderRadius: 10, background: tint, color }}
        >
          <IconCmp size={22} />
        </span>
        <span>
          <span className="d-block fw-bold fs-4 lh-1">{value}</span>
          <span className="d-block text-shq-secondary small mt-1">{label}</span>
        </span>
      </Card>
    </div>
  )
}
