import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Card from '../../components/ui/Card'
import ChangePasswordModal from '../../components/shared/ChangePasswordModal'
import DeactivateAccountModal from '../../components/shared/DeactivateAccountModal'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { getInitials, formatDate } from '../../utils/format'
import { showToast } from '../../utils/toast'

export default function AdminProfile() {
  const { session, profile: admin, refreshProfile } = useAuth()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const { register, handleSubmit } = useForm({
    defaultValues: { name: admin.name, phone: admin.phone, department: admin.department },
  })

  async function onSubmit(data) {
    await api.patch(`/admins/${session.profileId}`, {
      name: data.name,
      phone: data.phone,
      department: data.department,
    })
    await refreshProfile()
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
                  <input className="form-control" value={admin.email} disabled />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input className="form-control" {...register('phone')} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Department</label>
                  <input className="form-control" {...register('department')} />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Role</label>
                  <input className="form-control" value={admin.role} disabled />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Joined</label>
                  <input className="form-control" value={formatDate(admin.joinDate) || '—'} disabled />
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
              style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--shq-green)', color: '#fff', fontWeight: 700, fontSize: '1.3rem' }}
            >
              {admin.avatarInitials || getInitials(admin.name)}
            </div>
            <div className="fw-semibold">{admin.name}</div>
            <div className="text-shq-secondary small">{admin.role}</div>
            <div className="text-shq-secondary small">{admin.department}</div>
            <div className="text-shq-secondary small">{admin.phone}</div>
            <div className="text-shq-secondary small">Joined {formatDate(admin.joinDate)}</div>
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
