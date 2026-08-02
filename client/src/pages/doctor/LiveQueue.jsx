import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause, PhoneCall, SkipForward, CheckCircle2, ArrowRight, Users, Clock, Activity } from 'lucide-react'
import Card from '../../components/ui/Card'
import CallPatientModal from '../../components/doctor/CallPatientModal'
import CompleteConsultationModal from '../../components/doctor/CompleteConsultationModal'
import api from '../../services/api'
import { normalizePatient } from '../../services/normalize'
import { useAuth } from '../../context/AuthContext'
import { useQueue } from '../../context/QueueContext'
import { useDirectory } from '../../context/DirectoryContext'
import { getInitials, todayLocal } from '../../utils/format'
import { TOKEN_STATUS, TOKEN_TYPE } from '../../constants/tokenStatus'
import { showConfirm, showToast } from '../../utils/toast'

function ageFrom(dob) {
  if (!dob) return null
  const birth = new Date(dob)
  const diff = Date.now() - birth.getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

function minutesWaiting(token) {
  const from = token.checkedInAt || token.bookedAt
  if (!from) return 0
  return Math.max(0, Math.round((Date.now() - new Date(from).getTime()) / 60000))
}

export default function DoctorLiveQueue() {
  const { session } = useAuth()
  const doctorId = session.profileId
  const { getQueueForDoctor, getTokensForDoctor, callPatient, startConsultation, completeConsultation, skipPatient } =
    useQueue()
  const { getDoctorById, getSpecialtyById, refetchDoctors } = useDirectory()

  const [callTarget, setCallTarget] = useState(null)
  const [completeTarget, setCompleteTarget] = useState(null)
  const [servingPatient, setServingPatient] = useState(null)

  const doctor = getDoctorById(doctorId)
  const specialty = doctor ? getSpecialtyById(doctor.specialtyId) : null
  const queue = getQueueForDoctor(doctorId)
  const inConsultation = queue.find((t) => t.status === TOKEN_STATUS.IN_CONSULTATION)
  const waiting = queue.filter((t) => t.status !== TOKEN_STATUS.IN_CONSULTATION)
  const paused = Boolean(doctor?.queuePaused)

  // getQueueForDoctor only returns the live queue, so count finished
  // consultations off the doctor's full token list instead.
  const todayPrefix = todayLocal()
  const seenToday = getTokensForDoctor(doctorId).filter(
    (t) => t.status === TOKEN_STATUS.COMPLETED && (t.bookedAt || '').startsWith(todayPrefix),
  ).length
  const emergencyCount = waiting.filter((t) => t.type === TOKEN_TYPE.EMERGENCY).length

  // The Now Serving card shows age/MRN, which only live on the patient record.
  const servingPatientId = inConsultation?.patientId
  useEffect(() => {
    if (!servingPatientId) {
      setServingPatient(null)
      return
    }
    api.get(`/patients/${servingPatientId}`).then(({ data }) => setServingPatient(normalizePatient(data)))
  }, [servingPatientId])

  async function handleCallConfirm() {
    await callPatient(callTarget.id)
    setCallTarget(null)
    showToast(`${callTarget.patientName} called in.`)
  }

  async function handleSkip(token) {
    const confirmed = await showConfirm({
      title: 'Skip this patient?',
      text: `${token.patientName} (Token ${token.tokenNumber}) will be marked as skipped.`,
      confirmText: 'Skip',
    })
    if (confirmed) {
      await skipPatient(token.id)
      showToast('Patient skipped.', 'info')
    }
  }

  async function handleCompleteSubmit(data) {
    await completeConsultation(completeTarget.id, { diagnosis: data.diagnosis, notes: data.notes })
    setCompleteTarget(null)
    showToast('Consultation completed.')
  }

  async function handleTogglePause() {
    if (paused) {
      await api.patch(`/doctors/${doctorId}/queue-pause`, null, { params: { paused: false } })
      await refetchDoctors()
      showToast('Queue resumed.')
      return
    }
    const confirmed = await showConfirm({
      title: 'Pause your queue?',
      text: 'Patients will see the queue as paused until you resume it.',
      confirmText: 'Pause',
    })
    if (confirmed) {
      await api.patch(`/doctors/${doctorId}/queue-pause`, null, { params: { paused: true } })
      await refetchDoctors()
      showToast('Queue paused.', 'info')
    }
  }

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const servingAge = servingPatient ? ageFrom(servingPatient.dob) : null

  return (
    <div>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1" style={{ fontSize: '1.9rem' }}>
            {specialty ? `${specialty.name} Queue` : 'Live Queue'}
          </h1>
          <p className="text-shq-secondary mb-0">
            {today}
            {doctor?.workingHours ? ` · Shift ${doctor.workingHours}` : ''}
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span
            className="badge d-inline-flex align-items-center gap-1"
            style={{
              background: paused ? '#fef3c7' : '#dcfce7',
              color: paused ? '#92400e' : '#166534',
              fontSize: '0.8rem',
              padding: '0.5rem 0.8rem',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: paused ? '#d97706' : '#16a34a',
                display: 'inline-block',
              }}
            />
            {paused ? 'Paused' : 'Available'}
          </span>
          <button className={`btn ${paused ? 'btn-success' : 'btn-outline-primary'}`} onClick={handleTogglePause}>
            {paused ? <Play size={16} className="me-2" /> : <Pause size={16} className="me-2" />}
            {paused ? 'Resume Queue' : 'Pause Queue'}
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <StatTile icon={CheckCircle2} tint="#dcfce7" color="#166534" value={seenToday} label="Patients seen today" />
        <StatTile icon={Users} tint="#fee2e2" color="#991b1b" value={waiting.length} label="Currently in queue" />
        <StatTile icon={Clock} tint="#dbeafe" color="#1e40af" value={`${specialty?.consultMinutes ?? 15} min`} label="Avg consult time" />
        <StatTile icon={Activity} tint="#fee2e2" color="#991b1b" value={emergencyCount} label="Emergency in queue" />
      </div>

      {paused && <div className="alert alert-warning py-2 mb-4">Your queue is currently paused.</div>}

      {inConsultation && (
        <div
          className="p-4 mb-4"
          style={{ background: '#fdf2f4', border: '1px solid #f3c9d1', borderRadius: 'var(--shq-radius)' }}
        >
          <div className="row g-4 align-items-center">
            <div className="col-lg-8">
              <div
                className="text-uppercase fw-semibold mb-3"
                style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--shq-maroon)' }}
              >
                Now Serving
              </div>
              <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
                <span
                  className="d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    background: 'var(--shq-maroon)',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  {getInitials(inConsultation.patientName)}
                </span>
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="fw-bold fs-4">{inConsultation.patientName}</span>
                    {servingPatient && (
                      <span className="badge bg-white text-shq-secondary border">
                        {servingPatient.gender}
                        {servingAge ? ` · ${servingAge} yrs` : ''}
                      </span>
                    )}
                    <span className="fw-semibold" style={{ color: 'var(--shq-maroon)' }}>
                      Token {inConsultation.tokenNumber}
                    </span>
                  </div>
                  <div className="text-shq-secondary small mt-1">
                    Slot {inConsultation.slotTime}
                    {servingPatient?.mrn ? ` · ${servingPatient.mrn}` : ''}
                    {servingPatient?.medicalHistory?.length ? ' · Returning patient' : ' · New patient'}
                  </div>
                </div>
              </div>
              {inConsultation.reason && (
                <div className="mb-2">
                  <span className="fw-semibold">Reason: </span>
                  <span className="text-shq-secondary">{inConsultation.reason}</span>
                </div>
              )}
              {inConsultation.patientId && (
                <Link
                  to={`/doctor/patient/${inConsultation.patientId}`}
                  className="link-shq d-inline-flex align-items-center gap-1"
                >
                  View Full Medical Record <ArrowRight size={15} />
                </Link>
              )}
            </div>
            <div className="col-lg-4">
              <Card className="text-center">
                <div
                  className="text-uppercase text-shq-secondary fw-semibold mb-1"
                  style={{ fontSize: '0.7rem', letterSpacing: '0.06em' }}
                >
                  Consult Slot
                </div>
                <div className="fw-bold mb-3" style={{ fontSize: '2rem', lineHeight: 1 }}>
                  {inConsultation.slotTime}
                </div>
                <button className="btn btn-success w-100 mb-2" onClick={() => setCompleteTarget(inConsultation)}>
                  <CheckCircle2 size={16} className="me-2" />
                  Complete
                </button>
                <button className="btn btn-outline-primary w-100" onClick={() => handleSkip(inConsultation)}>
                  <SkipForward size={16} className="me-2" />
                  Skip
                </button>
              </Card>
            </div>
          </div>
        </div>
      )}

      <Card className="p-0">
        <div className="d-flex align-items-center gap-2 p-3">
          <span className="fw-semibold">Waiting Queue</span>
          <span className="badge bg-light text-shq-secondary border">{waiting.length} patients</span>
        </div>
        {waiting.length === 0 ? (
          <div className="px-3 pb-4 text-shq-secondary text-center">
            {inConsultation ? 'Nobody else waiting right now.' : 'No patients in queue.'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Token</th>
                  <th>Patient</th>
                  <th>Wait</th>
                  <th>Priority</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {waiting.map((token, idx) => (
                  <tr key={token.id}>
                    <td className="text-shq-secondary">{idx + 1}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: '#fdf2f4', color: 'var(--shq-maroon)', fontSize: '0.78rem' }}
                      >
                        {token.tokenNumber}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold">{token.patientName}</div>
                      {token.reason && <div className="text-shq-secondary small">{token.reason}</div>}
                    </td>
                    <td className="text-shq-secondary">{minutesWaiting(token)} min</td>
                    <td>
                      {token.type === TOKEN_TYPE.EMERGENCY ? (
                        <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
                          Emergency
                        </span>
                      ) : token.type === TOKEN_TYPE.WALK_IN ? (
                        <span className="badge bg-light text-shq-secondary border">Walk-in</span>
                      ) : (
                        <span className="text-shq-secondary small">Standard</span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        {token.patientId && (
                          <Link to={`/doctor/patient/${token.patientId}`} className="btn btn-outline-primary btn-sm">
                            Chart
                          </Link>
                        )}
                        {token.status === TOKEN_STATUS.WAITING && (
                          <button className="btn btn-success btn-sm" onClick={() => setCallTarget(token)}>
                            <PhoneCall size={14} className="me-1" />
                            Call
                          </button>
                        )}
                        {token.status === TOKEN_STATUS.CALLED && (
                          <button className="btn btn-primary btn-sm" onClick={() => startConsultation(token.id)}>
                            Start
                          </button>
                        )}
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => handleSkip(token)}>
                          <SkipForward size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CallPatientModal
        open={Boolean(callTarget)}
        onClose={() => setCallTarget(null)}
        token={callTarget}
        onConfirm={handleCallConfirm}
      />
      <CompleteConsultationModal
        open={Boolean(completeTarget)}
        onClose={() => setCompleteTarget(null)}
        token={completeTarget}
        onSubmitConsultation={handleCompleteSubmit}
      />
    </div>
  )
}

function StatTile({ icon: IconCmp, tint, color, value, label }) {
  return (
    <div className="col-6 col-lg-3">
      <Card className="d-flex align-items-center gap-3">
        <span
          className="d-flex align-items-center justify-content-center flex-shrink-0"
          style={{ width: 44, height: 44, borderRadius: 10, background: tint, color }}
        >
          <IconCmp size={22} />
        </span>
        <span>
          <span className="d-block fw-bold fs-4 lh-1">{value}</span>
          <span className="d-block text-shq-secondary small mt-1">{label}</span>
        </span>
      </Card>
    </div>
  )
}
