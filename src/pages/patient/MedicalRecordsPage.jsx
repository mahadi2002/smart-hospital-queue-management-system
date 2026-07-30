import { FileText, Download } from 'lucide-react'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { getPatientById } from '../../data/patients'
import { formatDate } from '../../utils/format'
import { showToast } from '../../utils/toast'

export default function MedicalRecordsPage() {
  const { session } = useAuth()
  const patient = getPatientById(session.profileId)

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Medical Records</h1>

      <h2 className="h6 fw-bold mb-3">Visit History</h2>
      {patient.medicalHistory.length === 0 ? (
        <p className="text-shq-secondary mb-4">No visit history yet.</p>
      ) : (
        <div className="d-flex flex-column gap-3 mb-4">
          {patient.medicalHistory.map((h) => (
            <Card key={h.id}>
              <div className="d-flex justify-content-between flex-wrap gap-2 mb-1">
                <div className="fw-semibold">{h.diagnosis}</div>
                <div className="text-shq-secondary small">{formatDate(h.date)}</div>
              </div>
              <div className="text-shq-secondary small mb-2">
                {h.doctor} · {h.specialty}
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
          {patient.reports.map((r) => (
            <Card key={r.id} className="d-flex flex-row align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <FileText size={18} style={{ color: 'var(--shq-maroon)' }} />
                <div>
                  <div className="fw-semibold small">{r.name}</div>
                  <div className="text-shq-secondary small">{formatDate(r.date)} · {r.type}</div>
                </div>
              </div>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => showToast('PDF downloaded (demo).')}
              >
                <Download size={14} className="me-1" />
                Download
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
