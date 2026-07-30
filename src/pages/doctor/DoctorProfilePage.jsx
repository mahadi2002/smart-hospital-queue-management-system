import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Card from '../../components/ui/Card'
import ChangePasswordModal from '../../components/shared/ChangePasswordModal'
import DeactivateAccountModal from '../../components/shared/DeactivateAccountModal'
import { useAuth } from '../../context/AuthContext'
import { getDoctorById } from '../../data/doctors'
import { getSpecialtyById } from '../../data/specialties'
import { getInitials } from '../../utils/format'
import { showToast } from '../../utils/toast'

export default function DoctorProfilePage() {
  const { session } = useAuth()
  const doctor = getDoctorById(session.profileId)
  const specialty = getSpecialtyById(doctor.specialtyId)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: doctor.name,
      phone: doctor.phone,
      workingHours: doctor.workingHours,
      bio: doctor.bio,
    },
  })

  function onSubmit(data) {
    Object.assign(doctor, data)
    showToast('Changes saved.')
  }

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Profile & Settings</h1>

      <div className="row g-4">
        <div className="col-lg-8">
          <Card>
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
            <div className="text-shq-secondary small">{doctor.qualifications}</div>
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
