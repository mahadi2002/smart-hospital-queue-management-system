import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../../components/ui/Logo'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'

export default function Register() {
  const { registerPatient } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  async function onSubmit(data) {
    setServerError('')
    const result = await registerPatient(data)
    if (!result.ok) {
      setServerError(result.error)
      return
    }
    navigate('/loading/patient')
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ background: 'var(--shq-bg)' }}>
      <Card style={{ maxWidth: 460 }} className="w-100 p-4">
        <Link to="/" className="d-flex align-items-center justify-content-center gap-2 mb-4 text-decoration-none">
          <Logo size={32} color="#a32638" />
        </Link>

        <h1 className="h4 fw-bold text-center mb-1">Create Patient Account</h1>
        <p className="text-shq-secondary small text-center mb-4">
          Doctor and Admin accounts are provisioned by the hospital.
        </p>

        {serverError && <div className="alert alert-danger py-2 small">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: true })} />
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                {...register('email', { required: true })}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Phone</label>
              <input className={`form-control ${errors.phone ? 'is-invalid' : ''}`} {...register('phone', { required: true })} />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-control" {...register('dob')} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Gender</label>
              <select className="form-select" {...register('gender')}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              {...register('password', { required: true, minLength: 6 })}
            />
            {errors.password && <div className="invalid-feedback">Minimum 6 characters.</div>}
          </div>
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              {...register('confirmPassword', { validate: (v) => v === password || 'Passwords must match' })}
            />
            {errors.confirmPassword && <div className="invalid-feedback">Passwords must match.</div>}
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Create Account
          </button>
        </form>

        <p className="text-center small text-shq-secondary mt-3 mb-0">
          Already have an account? <Link to="/login/patient" className="link-shq">Log in</Link>
        </p>
      </Card>
    </div>
  )
}
