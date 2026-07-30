import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock, Users } from 'lucide-react'
import Icon from '../../components/ui/Icon'
import Card from '../../components/ui/Card'
import GuestBookingModal from '../../components/guest/GuestBookingModal'
import api from '../../services/api'
import { normalizeQueueStatus } from '../../services/normalize'
import { useDirectory } from '../../context/DirectoryContext'
import { getInitials } from '../../utils/format'

export default function Doctors() {
  const { doctors, specialties, getSpecialtyById } = useDirectory()
  const [searchParams] = useSearchParams()
  const [specialtyFilter, setSpecialtyFilter] = useState(searchParams.get('specialty') || 'all')
  const [bookingDoctorId, setBookingDoctorId] = useState(null)
  const [queueStatus, setQueueStatus] = useState({})

  useEffect(() => {
    api.get('/doctors/queue-status').then(({ data }) => {
      const byDoctorId = {}
      data.map(normalizeQueueStatus).forEach((q) => {
        byDoctorId[q.doctorId] = q
      })
      setQueueStatus(byDoctorId)
    })
  }, [])

  const filtered = useMemo(
    () => (specialtyFilter === 'all' ? doctors : doctors.filter((d) => d.specialtyId === specialtyFilter)),
    [specialtyFilter, doctors],
  )

  return (
    <div className="container py-5">
      <h1 className="fw-bold h3 mb-1">Our Doctors</h1>
      <p className="text-shq-secondary mb-4">Browse specialists and book a token instantly — no account required.</p>

      <div className="d-flex gap-2 flex-wrap mb-4">
        <button
          className={`btn btn-sm ${specialtyFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setSpecialtyFilter('all')}
        >
          All
        </button>
        {specialties.map((s) => (
          <button
            key={s.id}
            className={`btn btn-sm ${specialtyFilter === s.id ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setSpecialtyFilter(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="row g-3">
        {filtered.map((d) => {
          const status = queueStatus[d.id]
          return (
            <div className="col-md-6 col-lg-4" key={d.id}>
              <Card className="h-100">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--shq-maroon)', color: '#fff', fontWeight: 700 }}
                  >
                    {getInitials(d.name)}
                  </div>
                  <div>
                    <div className="fw-semibold">{d.name}</div>
                    <div className="text-shq-secondary small">{d.qualifications}</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2 text-shq-secondary small mb-2">
                  <Icon name={getSpecialtyById(d.specialtyId)?.icon} size={16} />
                  {getSpecialtyById(d.specialtyId)?.name} · {d.experienceYears} yrs exp.
                </div>
                <div className="text-shq-secondary small mb-3">
                  {d.workingDays.join(', ')} · {d.workingHours}
                </div>

                {status && (
                  <div className="p-2 mb-3" style={{ background: 'var(--shq-bg)', borderRadius: 8 }}>
                    <div className="small fw-semibold mb-1">
                      {status.currentToken
                        ? `Now serving: ${status.currentToken}`
                        : 'No patient being seen right now'}
                    </div>
                    <div className="d-flex align-items-center gap-3 text-shq-secondary small">
                      <span className="d-flex align-items-center gap-1">
                        <Users size={13} />
                        {status.waitingCount} waiting
                      </span>
                      <span className="d-flex align-items-center gap-1">
                        <Clock size={13} />
                        {status.estimatedWaitMinutes > 0
                          ? `~${status.estimatedWaitMinutes} min if booked now`
                          : 'No wait if booked now'}
                      </span>
                    </div>
                  </div>
                )}

                <button className="btn btn-primary btn-sm w-100" onClick={() => setBookingDoctorId(d.id)}>
                  Book Token
                </button>
              </Card>
            </div>
          )
        })}
      </div>

      <GuestBookingModal
        open={Boolean(bookingDoctorId)}
        onClose={() => setBookingDoctorId(null)}
        doctorId={bookingDoctorId}
      />
    </div>
  )
}
