import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Card from '../../components/ui/Card'
import ConfirmBookingModal from '../../components/patient/ConfirmBookingModal'
import { useDirectory } from '../../context/DirectoryContext'
import { useQueue } from '../../context/QueueContext'
import { useAuth } from '../../context/AuthContext'
import { showError, showToast } from '../../utils/toast'

const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']

export default function BookToken() {
  const { profile: patient } = useAuth()
  const { specialties, getDoctorsBySpecialty, getDoctorById } = useDirectory()
  const { bookToken } = useQueue()
  const navigate = useNavigate()

  const [specialtyId, setSpecialtyId] = useState(null)
  const [doctorId, setDoctorId] = useState(null)
  const [slotTime, setSlotTime] = useState(null)
  const [isEmergency, setIsEmergency] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const doctorsForSpecialty = useMemo(() => (specialtyId ? getDoctorsBySpecialty(specialtyId) : []), [specialtyId])
  const selectedDoctor = doctorId ? getDoctorById(doctorId) : null

  async function handleConfirm() {
    const result = await bookToken({
      doctorId,
      patientId: patient.id,
      patientName: patient.name,
      type: isEmergency ? 'emergency' : 'regular',
      slotTime,
    })
    if (!result.ok) {
      showError('Booking failed', result.error)
      setConfirmOpen(false)
      return
    }
    setConfirmOpen(false)
    showToast(`Token ${result.token.tokenNumber} booked!`)
    navigate('/patient/tokens')
  }

  return (
    <div>
      <h1 className="h4 fw-bold mb-1">Book a Token</h1>
      <p className="text-shq-secondary mb-4">Booking window: up to 24 hours ahead.</p>

      <h2 className="h6 fw-bold mb-3">1. Choose a Specialty</h2>
      <div className="row g-3 mb-4">
        {specialties.map((s) => (
          <div className="col-6 col-md-3" key={s.id}>
            <Card
              role="button"
              className="h-100 text-center py-3"
              style={{
                cursor: 'pointer',
                borderColor: specialtyId === s.id ? 'var(--shq-maroon)' : undefined,
                borderWidth: specialtyId === s.id ? 2 : 1,
              }}
              onClick={() => {
                setSpecialtyId(s.id)
                setDoctorId(null)
              }}
            >
              <Icon name={s.icon} size={22} style={{ color: 'var(--shq-maroon)' }} />
              <div className="fw-semibold small mt-1">{s.name}</div>
            </Card>
          </div>
        ))}
      </div>

      {specialtyId && (
        <>
          <h2 className="h6 fw-bold mb-3">2. Choose a Doctor</h2>
          <div className="row g-3 mb-4">
            {doctorsForSpecialty.map((d) => (
              <div className="col-md-6" key={d.id}>
                <Card
                  role="button"
                  className="h-100"
                  style={{
                    cursor: 'pointer',
                    borderColor: doctorId === d.id ? 'var(--shq-maroon)' : undefined,
                    borderWidth: doctorId === d.id ? 2 : 1,
                  }}
                  onClick={() => setDoctorId(d.id)}
                >
                  <div className="fw-semibold">{d.name}</div>
                  <div className="text-shq-secondary small">{d.qualifications}</div>
                  <div className="text-shq-secondary small">
                    {d.workingDays.join(', ')} · {d.workingHours}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}

      {doctorId && (
        <>
          <h2 className="h6 fw-bold mb-3">3. Choose a Time Slot</h2>
          <div className="d-flex gap-2 flex-wrap mb-3">
            {SLOTS.map((s) => (
              <button
                key={s}
                type="button"
                className={`btn btn-sm ${slotTime === s ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSlotTime(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="form-check mb-4">
            <input
              type="checkbox"
              className="form-check-input"
              id="emergency"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
            />
            <label htmlFor="emergency" className="form-check-label small">
              This is an emergency (moves to top of queue — capped at 8/doctor/day)
            </label>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            disabled={!slotTime}
            onClick={() => setConfirmOpen(true)}
          >
            Review Booking
          </button>
        </>
      )}

      <ConfirmBookingModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        doctor={selectedDoctor}
        slotTime={slotTime}
        type={isEmergency ? 'emergency' : 'regular'}
      />
    </div>
  )
}
