import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Card from '../../components/ui/Card'
import StatusBadge from '../../components/ui/StatusBadge'
import ChangePasswordModal from '../../components/shared/ChangePasswordModal'
import DeactivateAccountModal from '../../components/shared/DeactivateAccountModal'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useDirectory } from '../../context/DirectoryContext'
import { useQueue } from '../../context/QueueContext'
import { getInitials } from '../../utils/format'
import { showToast } from '../../utils/toast'

const ACTIVE_STATUSES = ['waiting', 'called', 'in-consultation']

export default function DoctorProfile() {
  const { session, profile: doctor, refreshProfile } = useAuth()
  const { getSpecialtyById, refetchDoctors } = useDirectory()
  const { tokens } = useQueue()
  const specialty = getSpecialtyById(doctor.specialtyId)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: doctor.name,
      phone: doctor.phone,
      workingHours: doctor.workingHours,
      bio: doctor.bio,
      consultationFee: doctor.consultationFee,
      roomNumber: doctor.roomNumber,
      languages: (doctor.languages || []).join(', '),
    },
  })

  const currentPatients = useMemo(
    () => tokens.filter((t) => ACTIVE_STATUSES.includes(t.status)),
    [tokens],
  )

  const pastPatients = useMemo(() => {
    const seen = new Map()
    tokens
      .filter((t) => t.status === 'completed' && t.patientId)
      .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt))
      .forEach((t) => {
        if (!seen.has(t.patientId)) {
          seen.set(t.patientId, t)
        }
      })
    return Array.from(seen.values())
  }, [tokens])

  async function onSubmit(data) {
    await api.patch(`/doctors/${session.profileId}`, {
      name: data.name,
      phone: data.phone,
      working_hours: data.workingHours,
      bio: data.bio,
      consultation_fee: Number(data.consultationFee) || 0,
      room_number: data.roomNumber,
      languages: data.languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
    })
    await Promise.all([refreshProfile(), refetchDoctors()])
    showToast('Changes saved.')
  }

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Profile & Settings</h1>

      <div className="row g-4">
        <div className="col-lg-8">
          <Card className="mb-4">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" {...register('name')} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={doctor.email} disabled />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input className="form-control" {...register('phone')} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Working Hours</label>
                  <input className="form-control" {...register('workingHours')} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Room Number</label>
                  <input className="form-control" {...register('roomNumber')} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Consultation Fee (৳)</label>
                  <input type="number" className="form-control" {...register('consultationFee')} />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Languages</label>
                  <input className="form-control" placeholder="Bengali, English" {...register('languages')} />
                </div>
                <div className="col-12 mb-3">
                  <label className="form-label">Bio</label>
                  <textarea rows={3} className="form-control" {...register('bio')} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </form>
          </Card>

          <h2 className="h6 fw-bold mb-3">Currently in Queue ({currentPatients.length})</h2>
          {currentPatients.length === 0 ? (
            <p className="text-shq-secondary mb-4">No patients waiting or in consultation right now.</p>
          ) : (
            <div className="d-flex flex-column gap-2 mb-4">
              {currentPatients.map((t) => (
                <Card key={t.id}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <div className="fw-semibold small">
                        {t.tokenNumber} · {t.patientName}
                      </div>
                      <div className="text-shq-secondary small">Slot {t.slotTime}</div>
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

          <h2 className="h6 fw-bold mb-3">Patients I've Treated ({pastPatients.length})</h2>
          {pastPatients.length === 0 ? (
            <p className="text-shq-secondary">No completed consultations yet.</p>
          ) : (
            <div className="d-flex flex-column gap-2">
              {pastPatients.map((t) => (
                <Card key={t.id}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div className="fw-semibold small">{t.patientName}</div>
                    <Link to={`/doctor/patient/${t.patientId}`} className="btn btn-outline-primary btn-sm">
                      View Chart
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <Card className="text-center mb-3">
            <div
              className="mx-auto mb-2 d-flex align-items-center justify-content-center"
              style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--shq-maroon)', color: '#fff', fontWeight: 700, fontSize: '1.3rem' }}
            >
              {getInitials(doctor.name)}
            </div>
            <div className="fw-semibold">{doctor.name}</div>
            <div className="text-shq-secondary small">{specialty?.name}</div>
            <div className="text-shq-secondary small mb-2">{doctor.qualifications}</div>
            <div className="text-shq-secondary small">Room {doctor.roomNumber || '—'}</div>
            <div className="text-shq-secondary small">৳{doctor.consultationFee || 0} / consultation</div>
            <div className="text-shq-secondary small">{(doctor.languages || []).join(', ')}</div>
          </Card>

          <Card>
            <button className="btn btn-outline-primary w-100 mb-2" onClick={() => setChangePasswordOpen(true)}>
              Change Password
            </button>
            <button className="btn btn-outline-danger w-100" onClick={() => setDeactivateOpen(true)}>
              Deactivate Account
            </button>
          </Card>
        </div>
      </div>

      <ChangePasswordModal open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
      <DeactivateAccountModal open={deactivateOpen} onClose={() => setDeactivateOpen(false)} />
    </div>
  )
}
