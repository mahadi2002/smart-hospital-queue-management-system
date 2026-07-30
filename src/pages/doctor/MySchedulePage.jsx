import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import Card from '../../components/ui/Card'
import BlockTimeModal from '../../components/doctor/BlockTimeModal'
import { useAuth } from '../../context/AuthContext'
import { getDoctorById } from '../../data/doctors'
import { getSpecialtyById } from '../../data/specialties'

export default function MySchedulePage() {
  const { session } = useAuth()
  const doctor = getDoctorById(session.profileId)
  const specialty = getSpecialtyById(doctor.specialtyId)
  const [blockOpen, setBlockOpen] = useState(false)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="h4 fw-bold m-0">My Schedule</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setBlockOpen(true)}>
          <CalendarClock size={14} className="me-1" />
          Block Time
        </button>
      </div>

      <Card className="mb-4">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="text-shq-secondary small">Specialty</div>
            <div className="fw-semibold">{specialty?.name}</div>
          </div>
          <div className="col-md-4">
            <div className="text-shq-secondary small">Consult Duration</div>
            <div className="fw-semibold">~{specialty?.consultMinutes} min</div>
          </div>
          <div className="col-md-4">
            <div className="text-shq-secondary small">Daily Token Limit</div>
            <div className="fw-semibold">{doctor.dailyTokenLimit}</div>
          </div>
        </div>
      </Card>

      <div className="row g-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => {
          const active = doctor.workingDays.includes(day)
          return (
            <div className="col-6 col-md-3 col-lg-auto" key={day} style={{ minWidth: 130 }}>
              <Card className={`text-center py-3 ${active ? '' : 'opacity-50'}`}>
                <div className="fw-semibold">{day}</div>
                <div className="text-shq-secondary small">{active ? doctor.workingHours : 'Off'}</div>
              </Card>
            </div>
          )
        })}
      </div>

      <Card className="mt-4">
        <div className="fw-semibold mb-2">Booking Rules</div>
        <ul className="text-shq-secondary small mb-0">
          <li>Up to 5 walk-in slots reserved per day.</li>
          <li>Emergency tokens capped at 8 per day, auto-prioritized.</li>
          <li>No-show timeout: 15 minutes (5-minute grace period).</li>
        </ul>
      </Card>

      <BlockTimeModal open={blockOpen} onClose={() => setBlockOpen(false)} />
    </div>
  )
}
