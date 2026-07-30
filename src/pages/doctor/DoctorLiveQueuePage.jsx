import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause, PhoneCall, SkipForward, CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import CallPatientModal from '../../components/doctor/CallPatientModal'
import CompleteConsultationModal from '../../components/doctor/CompleteConsultationModal'
import { useAuth } from '../../context/AuthContext'
import { useQueue } from '../../context/QueueContext'
import { getPatientById } from '../../data/patients'
import { TOKEN_STATUS, TOKEN_TYPE } from '../../data/tokens'
import { showConfirm, showToast } from '../../utils/toast'

export default function DoctorLiveQueuePage() {
  const { session } = useAuth()
  const doctorId = session.profileId
  const {
    getQueueForDoctor,
    callPatient,
    startConsultation,
    completeConsultation,
    skipPatient,
    isQueuePaused,
    pauseQueue,
    resumeQueue,
  } = useQueue()

  const [callTarget, setCallTarget] = useState(null)
  const [completeTarget, setCompleteTarget] = useState(null)

  const queue = getQueueForDoctor(doctorId)
  const inConsultation = queue.find((t) => t.status === TOKEN_STATUS.IN_CONSULTATION)
  const waiting = queue.filter((t) => t.status !== TOKEN_STATUS.IN_CONSULTATION)
  const paused = isQueuePaused(doctorId)

  function handleCallConfirm() {
    callPatient(callTarget.id)
    setCallTarget(null)
    showToast(`${callTarget.patientName} called in.`)
  }

  function handleStartConsultation(token) {
    startConsultation(token.id)
  }

  async function handleSkip(token) {
    const confirmed = await showConfirm({
      title: 'Skip this patient?',
      text: `${token.patientName} (Token ${token.tokenNumber}) will be marked as skipped.`,
      confirmText: 'Skip',
    })
    if (confirmed) {
      skipPatient(token.id)
      showToast('Patient skipped.', 'info')
    }
  }

  function handleCompleteSubmit(data) {
    completeConsultation(completeTarget.id)
    if (completeTarget.patientId) {
      const patient = getPatientById(completeTarget.patientId)
      if (patient) {
        patient.medicalHistory.unshift({
          id: `hist-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          doctor: 'You',
          specialty: '',
          diagnosis: data.diagnosis,
          notes: data.notes,
        })
      }
    }
    setCompleteTarget(null)
    showToast('Consultation completed.')
  }

  async function handleTogglePause() {
    if (paused) {
      resumeQueue(doctorId)
      showToast('Queue resumed.')
      return
    }
    const confirmed = await showConfirm({
      title: 'Pause your queue?',
      text: 'Patients will see the queue as paused until you resume it.',
      confirmText: 'Pause',
    })
    if (confirmed) {
      pauseQueue(doctorId)
      showToast('Queue paused.', 'info')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="h4 fw-bold m-0">Live Queue</h1>
        <button className={`btn btn-sm ${paused ? 'btn-success' : 'btn-outline-danger'}`} onClick={handleTogglePause}>
          {paused ? <Play size={14} className="me-1" /> : <Pause size={14} className="me-1" />}
          {paused ? 'Resume Queue' : 'Pause Queue'}
        </button>
      </div>

      {paused && <div className="alert alert-warning py-2 mb-4">Your queue is currently paused.</div>}

      {inConsultation && (
        <Card className="mb-4" style={{ borderColor: 'var(--shq-green)', borderWidth: 2 }}>
          <div className="text-shq-secondary small mb-1">In Consultation</div>
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <div className="fw-semibold">
                {inConsultation.tokenNumber} · {inConsultation.patientName}
              </div>
            </div>
            <div className="d-flex gap-2">
              {inConsultation.patientId && (
                <Link to={`/doctor/patient/${inConsultation.patientId}`} className="btn btn-outline-primary btn-sm">
                  View Chart
                </Link>
              )}
              <button className="btn btn-success btn-sm" onClick={() => setCompleteTarget(inConsultation)}>
                <CheckCircle2 size={14} className="me-1" />
                Complete
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="d-flex flex-column gap-2">
        {waiting.length === 0 && !inConsultation && (
          <div className="text-shq-secondary text-center py-5">No patients in queue.</div>
        )}
        {waiting.map((token, idx) => (
          <Card key={token.id}>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3">
                <div className="fw-bold text-shq-secondary" style={{ width: 24 }}>
                  {idx + 1}
                </div>
                <div>
                  <div className="fw-semibold">
                    {token.tokenNumber} · {token.patientName}
                    {token.type === TOKEN_TYPE.EMERGENCY && (
                      <span className="badge bg-danger ms-2">Emergency</span>
                    )}
                    {token.type === TOKEN_TYPE.WALK_IN && <span className="badge bg-secondary ms-2">Walk-in</span>}
                  </div>
                  <div className="text-shq-secondary small">Slot {token.slotTime}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <StatusBadge status={token.status} />
                {token.patientId && (
                  <Link to={`/doctor/patient/${token.patientId}`} className="btn btn-outline-primary btn-sm">
                    Chart
                  </Link>
                )}
                {token.status === TOKEN_STATUS.WAITING && (
                  <button className="btn btn-primary btn-sm" onClick={() => setCallTarget(token)}>
                    <PhoneCall size={14} className="me-1" />
                    Call
                  </button>
                )}
                {token.status === TOKEN_STATUS.CALLED && (
                  <button className="btn btn-success btn-sm" onClick={() => handleStartConsultation(token)}>
                    Start
                  </button>
                )}
                <button className="btn btn-outline-secondary btn-sm" onClick={() => handleSkip(token)}>
                  <SkipForward size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <CallPatientModal open={Boolean(callTarget)} onClose={() => setCallTarget(null)} token={callTarget} onConfirm={handleCallConfirm} />
      <CompleteConsultationModal
        open={Boolean(completeTarget)}
        onClose={() => setCompleteTarget(null)}
        token={completeTarget}
        onSubmitConsultation={handleCompleteSubmit}
      />
    </div>
  )
}
