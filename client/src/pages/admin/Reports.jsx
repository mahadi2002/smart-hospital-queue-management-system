import { FileBarChart, Download, FileSpreadsheet } from 'lucide-react'
import Card from '../../components/ui/Card'
import { useQueue } from '../../context/QueueContext'
import { useDirectory } from '../../context/DirectoryContext'
import { showToast } from '../../utils/toast'
import { TOKEN_STATUS } from '../../constants/tokenStatus'

const REPORT_TYPES = [
  { id: 'daily-queue', name: 'Daily Queue Summary', description: 'Tokens issued, completed, and no-shows per doctor today.' },
  { id: 'doctor-utilization', name: 'Doctor Utilization Report', description: 'Consultation counts and average wait time per doctor.' },
  { id: 'specialty-demand', name: 'Specialty Demand Report', description: 'Booking volume broken down by specialty.' },
]

export default function Reports() {
  const { tokens } = useQueue()
  const { doctors } = useDirectory()

  function handleGenerate(report) {
    showToast(`${report.name} generated.`)
  }

  function handleExport() {
    showToast('Export successful.')
  }

  function handleDownloadPdf() {
    showToast('PDF downloaded (demo).')
  }

  const completedToday = tokens.filter((t) => t.status === TOKEN_STATUS.COMPLETED).length
  const noShowToday = tokens.filter((t) => t.status === TOKEN_STATUS.NO_SHOW).length

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Reports</h1>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Card className="text-center">
            <div className="text-shq-secondary small">Total Tokens</div>
            <div className="fw-bold fs-3">{tokens.length}</div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="text-center">
            <div className="text-shq-secondary small">Completed</div>
            <div className="fw-bold fs-3" style={{ color: 'var(--shq-green)' }}>{completedToday}</div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card className="text-center">
            <div className="text-shq-secondary small">No-Shows</div>
            <div className="fw-bold fs-3 text-danger">{noShowToday}</div>
          </Card>
        </div>
      </div>

      <div className="d-flex flex-column gap-3">
        {REPORT_TYPES.map((r) => (
          <Card key={r.id}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <div className="fw-semibold">{r.name}</div>
                <div className="text-shq-secondary small">{r.description}</div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={() => handleGenerate(r)}>
                  <FileBarChart size={14} className="me-1" />
                  Generate
                </button>
                <button className="btn btn-outline-primary btn-sm" onClick={handleExport}>
                  <FileSpreadsheet size={14} className="me-1" />
                  Export
                </button>
                <button className="btn btn-outline-primary btn-sm" onClick={handleDownloadPdf}>
                  <Download size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-shq-secondary small mt-3">{doctors.length} doctors included in reporting scope.</div>
    </div>
  )
}
