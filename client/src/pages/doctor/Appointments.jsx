import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { useQueue } from '../../context/QueueContext'
import { formatDateTime } from '../../utils/format'

const FILTERS = ['all', 'waiting', 'called', 'in-consultation', 'completed', 'cancelled', 'skipped', 'no-show']

export default function Appointments() {
  const { session } = useAuth()
  const { getTokensForDoctor } = useQueue()
  const [filter, setFilter] = useState('all')

  const tokens = getTokensForDoctor(session.profileId)
    .filter((t) => filter === 'all' || t.status === filter)
    .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Appointments</h1>

      <div className="d-flex gap-2 flex-wrap mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`btn btn-sm text-capitalize ${filter === f ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setFilter(f)}
          >
            {f.replace('-', ' ')}
          </button>
        ))}
      </div>

      {tokens.length === 0 ? (
        <div className="text-shq-secondary text-center py-5">No appointments match this filter.</div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {tokens.map((t) => (
            <Card key={t.id}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <div className="fw-semibold">
                    {t.tokenNumber} · {t.patientName}
                  </div>
                  <div className="text-shq-secondary small">
                    Slot {t.slotTime} · Booked {formatDateTime(t.bookedAt)}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <StatusBadge status={t.status} />
                  {t.patientId && (
                    <Link to={`/doctor/patient/${t.patientId}`} className="btn btn-outline-primary btn-sm">
                      Chart
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
