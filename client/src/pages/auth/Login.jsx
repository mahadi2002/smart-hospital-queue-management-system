import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../components/ui/Logo'
import Card from '../../components/ui/Card'
import RoleTabs from '../../components/auth/RoleTabs'
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal'
import { useAuth } from '../../context/AuthContext'

export default function Login({ role }) {
  const { loginPatient, loginDoctor, loginAdmin } = useAuth()
  const navigate = useNavigate()
  const [forgotOpen, setForgotOpen] = useState(false)
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  async function onSubmit(data) {
    setServerError('')
    const loginFn = { patient: loginPatient, doctor: loginDoctor, admin: loginAdmin }[role]
    const result = await loginFn(data.email, data.password)
    if (!result.ok) {
      setServerError(result.error)
      return
    }
    navigate(`/loading/${role}`)
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ background: 'var(--shq-bg)' }}>
      <Card style={{ maxWidth: 420 }} className="w-100 p-4">
        <Link to="/" className="d-flex align-items-center justify-content-center gap-2 mb-4 text-decoration-none">
          <Logo size={32} color="#a32638" />
        </Link>

        <RoleTabs />

        <h1 className="h4 fw-bold text-center mb-4">
          {role === 'patient' ? 'Patient Login' : role === 'doctor' ? 'Doctor Login' : 'Admin Login'}
        </h1>

        {serverError && <div className="alert alert-danger py-2 small">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              {...register('email', { required: true })}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              {...register('password', { required: true })}
            />
          </div>
          <div className="text-end mb-3">
            <button type="button" className="btn btn-link btn-sm p-0 link-shq" onClick={() => setForgotOpen(true)}>
              Forgot password?
            </button>
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Log In
          </button>
        </form>

        {role === 'patient' && (
          <p className="text-center small text-shq-secondary mt-3 mb-0">
            Don't have an account? <Link to="/register" className="link-shq">Register</Link>
          </p>
        )}
        {role !== 'patient' && (
          <p className="text-center small text-shq-secondary mt-3 mb-0">
            {role === 'doctor' ? 'Doctor' : 'Admin'} accounts are provisioned by the hospital administration.
          </p>
        )}
      </Card>

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  )
}
