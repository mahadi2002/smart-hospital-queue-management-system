import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Users, Stethoscope, Clock, TriangleAlert, FileText, CheckCircle2, CalendarDays } from 'lucide-react'
import Card from '../../components/ui/Card'
import { useQueue } from '../../context/QueueContext'
import { useDirectory } from '../../context/DirectoryContext'
import { TOKEN_STATUS } from '../../constants/tokenStatus'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const BRAND_GREEN = '#0f6b4f'
const ACTIVE = [TOKEN_STATUS.WAITING, TOKEN_STATUS.CALLED, TOKEN_STATUS.IN_CONSULTATION]
const CHART_HOURS = ['8a', '9a', '10a', '11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p']

// Anything past 20 waiting is a department in trouble; under 8 is a normal morning.
function loadLabel(waiting) {
  if (waiting >= 20) return { text: 'Overloaded', bg: '#fee2e2', color: '#991b1b', dot: '#dc2626' }
  if (waiting >= 8) return { text: 'Busy', bg: '#fef3c7', color: '#92400e', dot: '#d97706' }
  return { text: 'Normal', bg: '#dcfce7', color: '#166534', dot: '#16a34a' }
}

export default function AdminDashboard() {
  const { tokens } = useQueue()
  const { doctors, specialties, getSpecialtyById } = useDirectory()

  const todayPrefix = new Date().toISOString().slice(0, 10)
  const todayTokens = useMemo(
    () => tokens.filter((t) => (t.bookedAt || '').startsWith(todayPrefix)),
    [tokens, todayPrefix],
  )

  const activeTokens = tokens.filter((t) => ACTIVE.includes(t.status))
  const emergencyToday = todayTokens.filter((t) => t.type === 'emergency').length
  const busyDoctorIds = new Set(activeTokens.map((t) => t.doctorId))

  // Weighted by each department's own consult time, so a 30-minute neuro slot
  // doesn't get averaged as if it were a 10-minute medicine slot.
  const avgWait = useMemo(() => {
    if (activeTokens.length === 0) return 0
    const total = activeTokens.reduce((sum, t) => {
      const doctor = doctors.find((d) => d.id === t.doctorId)
      const specialty = doctor ? getSpecialtyById(doctor.specialtyId) : null
      return sum + (specialty?.consultMinutes ?? 15)
    }, 0)
    return Math.round(total / activeTokens.length)
  }, [activeTokens, doctors, getSpecialtyById])

  const hourlyCounts = useMemo(() => {
    const buckets = new Array(CHART_HOURS.length).fill(0)
    todayTokens.forEach((t) => {
      const hour = new Date(t.bookedAt).getHours()
      const idx = hour - 8
      if (idx >= 0 && idx < buckets.length) buckets[idx] += 1
    })
    return buckets
  }, [todayTokens])

  const departmentRows = useMemo(
    () =>
      specialties
        .map((s) => {
          const deptDoctorIds = doctors.filter((d) => d.specialtyId === s.id).map((d) => d.id)
          const waiting = activeTokens.filter((t) => deptDoctorIds.includes(t.doctorId)).length
          const onDuty = doctors.filter((d) => deptDoctorIds.includes(d.id) && busyDoctorIds.has(d.id))
          // Doctors in a department see patients in parallel, so the queue
          // clears roughly consult-time × waiting ÷ however many are on duty.
          const parallel = Math.max(onDuty.length, 1)
          return {
            id: s.id,
            name: s.name,
            onDuty: onDuty[0]?.name || '—',
            onDutyCount: onDuty.length,
            waiting,
            avgWait: Math.round((waiting * s.consultMinutes) / parallel),
          }
        })
        .sort((a, b) => b.waiting - a.waiting),
    [specialties, doctors, activeTokens, busyDoctorIds],
  )

  const recentActivity = useMemo(
    () =>
      tokens
        .slice()
        .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
        .slice(0, 6),
    [tokens],
  )

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
            Hospital Overview
          </h1>
          <p className="text-shq-secondary mb-0">Live status across all departments · {today}</p>
        </div>
        <Link to="/admin/reports" className="btn btn-success">
          <FileText size={18} className="me-2" />
          Generate Report
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <StatTile
          icon={Users}
          tint="#dcfce7"
          color="#166534"
          value={todayTokens.length}
          label="Total patients today"
          badge={`${activeTokens.length} in queue`}
        />
        <StatTile
          icon={Stethoscope}
          tint="#fee2e2"
          color="#991b1b"
          value={`${busyDoctorIds.size} / ${doctors.length}`}
          label="Doctors on duty"
          badge={`${doctors.length - busyDoctorIds.size} free`}
        />
        <StatTile
          icon={Clock}
          tint="#dbeafe"
          color="#1e40af"
          value={`${avgWait} min`}
          label="Avg. wait time"
          badge="across queues"
        />
        <StatTile
          icon={TriangleAlert}
          tint="#fee2e2"
          color="#991b1b"
          value={emergencyToday}
          label="Emergency cases"
          badge="today"
        />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-8">
          <Card className="h-100">
            <div className="fw-semibold">Queue Analytics</div>
            <div className="text-shq-secondary small mb-3">Tokens booked per hour today</div>
            <Bar
              data={{
                labels: CHART_HOURS,
                datasets: [{ label: 'Tokens', data: hourlyCounts, backgroundColor: BRAND_GREEN, borderRadius: 6 }],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
              }}
            />
          </Card>
        </div>

        <div className="col-lg-4">
          <Card className="h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="fw-semibold">Recent Activity</span>
              <Link to="/admin/reports" className="link-shq small">
                View all
              </Link>
            </div>
            {recentActivity.length === 0 ? (
              <div className="text-shq-secondary small">Nothing booked yet today.</div>
            ) : (
              recentActivity.map((t) => (
                <div key={t.id} className="d-flex gap-2 align-items-start mb-3">
                  <span
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: t.type === 'emergency' ? '#fee2e2' : '#f3f4f6',
                      color: t.type === 'emergency' ? '#991b1b' : '#4b5563',
                    }}
                  >
                    {t.status === TOKEN_STATUS.COMPLETED ? (
                      <CheckCircle2 size={16} />
                    ) : t.type === 'emergency' ? (
                      <TriangleAlert size={16} />
                    ) : (
                      <CalendarDays size={16} />
                    )}
                  </span>
                  <span className="small">
                    <span className="d-block">
                      {t.tokenNumber} · {t.patientName}
                    </span>
                    <span className="d-block text-shq-secondary">
                      <span className="text-capitalize">{t.status.replace('-', ' ')}</span>
                      {t.reason ? ` — ${t.reason}` : ''}
                    </span>
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>

      <Card className="p-0">
        <div className="d-flex justify-content-between align-items-center p-3 flex-wrap gap-2">
          <span className="fw-semibold">Live Queues by Department</span>
          <span className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
            Auto-refresh · 6s
          </span>
        </div>
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Department</th>
                <th>Doctor on duty</th>
                <th>Waiting</th>
                <th>Est. clear time</th>
                <th className="text-end">Status</th>
              </tr>
            </thead>
            <tbody>
              {departmentRows.map((row) => {
                const load = loadLabel(row.waiting)
                return (
                  <tr key={row.id}>
                    <td className="fw-semibold">{row.name}</td>
                    <td className="text-shq-secondary">
                      {row.onDuty}
                      {row.onDutyCount > 1 && (
                        <span className="text-shq-secondary small"> +{row.onDutyCount - 1} more</span>
                      )}
                    </td>
                    <td>{row.waiting}</td>
                    <td className="text-shq-secondary">{row.avgWait} min</td>
                    <td className="text-end">
                      <span
                        className="badge d-inline-flex align-items-center gap-1"
                        style={{ background: load.bg, color: load.color }}
                      >
                        <span
                          style={{ width: 6, height: 6, borderRadius: '50%', background: load.dot, display: 'inline-block' }}
                        />
                        {load.text}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function StatTile({ icon: IconCmp, tint, color, value, label, badge }) {
  return (
    <div className="col-6 col-lg-3">
      <Card className="h-100">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <span
            className="d-flex align-items-center justify-content-center"
            style={{ width: 42, height: 42, borderRadius: 10, background: tint, color }}
          >
            <IconCmp size={21} />
          </span>
          {badge && (
            <span className="badge bg-light text-shq-secondary border" style={{ fontWeight: 500 }}>
              {badge}
            </span>
          )}
        </div>
        <div className="fw-bold" style={{ fontSize: '1.7rem', lineHeight: 1 }}>
          {value}
        </div>
        <div className="text-shq-secondary small mt-1">{label}</div>
      </Card>
    </div>
  )
}
