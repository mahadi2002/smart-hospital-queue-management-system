import { useForm } from 'react-hook-form'
import { MapPin, Phone, Mail } from 'lucide-react'
import Card from '../../components/ui/Card'
import { showToast } from '../../utils/toast'

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  function onSubmit() {
    reset()
    showToast('Message sent! Our team will get back to you shortly.')
  }

  return (
    <div className="container py-5">
      <h1 className="fw-bold h3 mb-1">Contact Us</h1>
      <p className="text-shq-secondary mb-4">Questions about a booking or the hospital? Reach out.</p>

      <div className="row g-4">
        <div className="col-md-5">
          <Card>
            <div className="d-flex gap-3 mb-3">
              <MapPin size={20} style={{ color: 'var(--shq-maroon)' }} />
              <div>
                <div className="fw-semibold">Address</div>
                <div className="text-shq-secondary small">Mirpur Road, Dhaka-1216, Bangladesh</div>
              </div>
            </div>
            <div className="d-flex gap-3 mb-3">
              <Phone size={20} style={{ color: 'var(--shq-maroon)' }} />
              <div>
                <div className="fw-semibold">Phone</div>
                <div className="text-shq-secondary small">+880 9611-000000</div>
              </div>
            </div>
            <div className="d-flex gap-3">
              <Mail size={20} style={{ color: 'var(--shq-maroon)' }} />
              <div>
                <div className="fw-semibold">Email</div>
                <div className="text-shq-secondary small">support@moh-hospital.example</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-md-7">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: true })} />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email', { required: true })}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Message</label>
                <textarea
                  rows={4}
                  className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                  {...register('message', { required: true })}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
