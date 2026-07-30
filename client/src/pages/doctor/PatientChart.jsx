import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import Card from '../../components/ui/Card'
import api from '../../services/api'
import { normalizePatient } from '../../services/normalize'
import { formatDate } from '../../utils/format'

export default function PatientChart() {
  const { patientId } = useParams()
  const [patient, setPatient] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api
      .get(`/patients/${patientId}`)
      .then(({ data }) => setPatient(normalizePatient(data)))
      .catch(() => setNotFound(true))
  }, [patientId])

  if (notFound) return <Navigate to="/doctor/queue" replace />
  if (!patient) return null

  return (
    <div>
      <Link to="/doctor/queue" className="link-shq d-inline-flex align-items-center gap-1 mb-3">
        <ArrowLeft size={16} /> Back to Queue
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
        </div>
      </Card>

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
                <div className="text-shq-secondary small">{formatDate(r.date)} · {r.type}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
