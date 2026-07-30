import { Link } from 'react-router-dom'
import { Stethoscope, Users, Layers, Ticket } from 'lucide-react'
import Card from '../../components/ui/Card'
import { useQueue } from '../../context/QueueContext'
import { doctors } from '../../data/doctors'
import { patients } from '../../data/patients'
import { specialties } from '../../data/specialties'
import { TOKEN_STATUS } from '../../data/tokens'

export default function AdminDashboardPage() {
  const { tokens } = useQueue()
  const activeTokens = tokens.filter((t) =>
    [TOKEN_STATUS.WAITING, TOKEN_STATUS.CALLED, TOKEN_STATUS.IN_CONSULTATION].includes(t.status),
  ).length

  const stats = [
    { label: 'Doctors', value: doctors.length, icon: Stethoscope, to: '/admin/doctors' },
    { label: 'Patients', value: patients.length, icon: Users, to: '/admin/patients' },
    { label: 'Specialties', value: specialties.length, icon: Layers, to: '/admin/specialties' },
    { label: 'Active Tokens', value: activeTokens, icon: Ticket, to: '/admin/reports' },
  ]

  return (
    <div>
      <h1 className="h4 fw-bold mb-1">Admin Dashboard</h1>
      <p className="text-shq-secondary mb-4">Hospital-wide overview.</p>

      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div className="col-6 col-md-3" key={s.label}>
            <Link to={s.to} className="text-decoration-none">
              <Card className="text-center py-4 h-100">
                <s.icon size={24} style={{ color: 'var(--shq-maroon)' }} className="mb-2" />
                <div className="fw-bold fs-4 text-body">{s.value}</div>
                <div className="text-shq-secondary small">{s.label}</div>
              </Card>
            </Link>
          </div>
        ))}
      </div>

      <Card>
        <div className="fw-semibold mb-3">Recent Bookings</div>
        {tokens
          .slice()
          .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
          .slice(0, 5)
          .map((t) => (
            <div key={t.id} className="d-flex justify-content-between border-bottom py-2">
              <span className="small">
                {t.tokenNumber} · {t.patientName}
              </span>
              <span className="text-shq-secondary small text-capitalize">{t.status.replace('-', ' ')}</span>
            </div>
          ))}
      </Card>
    </div>
  )
}
