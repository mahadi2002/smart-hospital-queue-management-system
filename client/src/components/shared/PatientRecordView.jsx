import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import Card from '../ui/Card'
import StatusBadge from '../ui/StatusBadge'
import api from '../../services/api'
import { normalizePatient, normalizeToken } from '../../services/normalize'
import { useDirectory } from '../../context/DirectoryContext'
import { formatDate, formatDateTime } from '../../utils/format'

const ACTIVE_STATUSES = ['waiting', 'called', 'in-consultation']
const MISSED_STATUSES = ['skipped', 'no-show']

// Full patient record — demographics, past & present bookings (including
// skipped/no-show), visit history, and test reports. Used by both the
// doctor's Patient Chart page and the admin's Patient Detail page.
export default function PatientRecordView({ patientId, backTo, backLabel }) {
  const { getDoctorById } = useDirectory()
  const [patient, setPatient] = useState(null)
  const [bookings, setBookings] = useState([])
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api
      .get(`/patients/${patientId}`)
      .then(({ data }) => setPatient(normalizePatient(data)))
      .catch(() => setNotFound(true))
    api
      .get('/tokens', { params: { patient_id: patientId } })
      .then(({ data }) => setBookings(data.map(normalizeToken)))
      .catch(() => setBookings([]))
  }, [patientId])

  if (notFound) return <Navigate to={backTo} replace />
  if (!patient) return null

  const missedCount = bookings.filter((b) => MISSED_STATUSES.includes(b.status)).length
  const activeCount = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length
  const sortedBookings = [...bookings].sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))

  return (
    <div>
      <Link to={backTo} className="link-shq d-inline-flex align-items-center gap-1 mb-3">
        <ArrowLeft size={16} /> {backLabel}
      </Link>

      <Card className="mb-4">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="text-shq-secondary small">Name</div>
            <div className="fw-semibold">{patient.name}</div>
          </div>
          <div className="col-md-3">
            <div className="text-shq-secondary small">Date of Birth</div>
            <div className="fw-semibold">{formatDate(patient.dob)}</div>
          </div>
          <div className="col-md-2">
            <div className="text-shq-secondary small">Gender</div>
            <div className="fw-semibold">{patient.gender}</div>
          </div>
          <div className="col-md-2">
            <div className="text-shq-secondary small">Blood Group</div>
            <div className="fw-semibold">{patient.bloodGroup || '—'}</div>
          </div>
          <div className="col-md-2">
            <div className="text-shq-secondary small">Phone</div>
            <div className="fw-semibold">{patient.phone}</div>
          </div>
          {patient.address && (
            <div className="col-12">
              <div className="text-shq-secondary small">Address</div>
              <div className="fw-semibold">{patient.address}</div>
            </div>
          )}
        </div>
      </Card>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="text-center">
            <div className="text-shq-secondary small">Total Bookings</div>
            <div className="fw-bold fs-4">{bookings.length}</div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="text-center">
            <div className="text-shq-secondary small">Skipped / No-show</div>
            <div className="fw-bold fs-4 text-danger">{missedCount}</div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="text-center">
            <div className="text-shq-secondary small">Active Right Now</div>
            <div className="fw-bold fs-4" style={{ color: 'var(--shq-green)' }}>
              {activeCount}
            </div>
          </Card>
        </div>
      </div>

      <h2 className="h6 fw-bold mb-3">Booking History (Past & Present)</h2>
      {sortedBookings.length === 0 ? (
        <p className="text-shq-secondary mb-4">No bookings yet.</p>
      ) : (
        <div className="d-flex flex-column gap-2 mb-4">
          {sortedBookings.map((b) => (
            <Card key={b.id}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <div className="fw-semibold small">
                    {b.tokenNumber} · {getDoctorById(b.doctorId)?.name || 'Doctor no longer on staff'}
                  </div>
                  <div className="text-shq-secondary small">
                    Slot {b.slotTime} · Booked {formatDateTime(b.bookedAt)}
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </div>
            </Card>
          ))}
        </div>
      )}

      <h2 className="h6 fw-bold mb-3">Visit History</h2>
      {patient.medicalHistory.length === 0 ? (
        <p className="text-shq-secondary mb-4">No visit history yet.</p>
      ) : (
        <div className="d-flex flex-column gap-3 mb-4">
          {patient.medicalHistory.map((h, i) => (
            <Card key={i}>
              <div className="d-flex justify-content-between flex-wrap gap-2 mb-1">
                <div className="fw-semibold">{h.diagnosis}</div>
                <div className="text-shq-secondary small">{formatDate(h.date)}</div>
              </div>
              <div className="text-shq-secondary small mb-2">
                {h.doctor} {h.specialty && `· ${h.specialty}`}
              </div>
              <div className="small">{h.notes}</div>
            </Card>
          ))}
        </div>
      )}

      <h2 className="h6 fw-bold mb-3">Test Reports</h2>
      {patient.reports.length === 0 ? (
        <p className="text-shq-secondary">No reports uploaded yet.</p>
      ) : (
        <div className="d-flex flex-column gap-2">
          {patient.reports.map((r, i) => (
            <Card key={i} className="d-flex flex-row align-items-center gap-2">
              <FileText size={18} style={{ color: 'var(--shq-maroon)' }} />
              <div>
                <div className="fw-semibold small">{r.name}</div>
                <div className="text-shq-secondary small">
                  {formatDate(r.date)} · {r.type}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
