import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Modal from '../ui/Modal'
import { useDirectory } from '../../context/DirectoryContext'
import { useQueue } from '../../context/QueueContext'
import { showError } from '../../utils/toast'

const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00']

export default function GuestBookingModal({ open, onClose, doctorId }) {
  const { doctors, getDoctorById, getSpecialtyById } = useDirectory()
  const { bookToken } = useQueue()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { doctorId: doctorId || '' } })

  async function onSubmit(data) {
    const result = await bookToken({
      doctorId: data.doctorId,
      patientName: data.name,
      slotTime: data.slotTime,
    })
    if (!result.ok) {
      showError('Booking failed', result.error)
      return
    }
    reset()
    onClose()
    navigate('/booking-confirmation', {
      state: {
        token: result.token,
        doctor: getDoctorById(data.doctorId),
        phone: data.phone,
      },
    })
  }

  return (
    <Modal open={open} onClose={onClose} title="Book a Token as Guest">
      <form onSubmit={handleSubmit(onSubmit)}>
        <p className="text-shq-secondary small mb-3">
          No account needed. Bookings made as a guest can't be tracked in a live queue or token
          history — create a free account for that.
        </p>

        <div className="mb-3">
          <label className="form-label">Full Name</label>
          <input
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            {...register('name', { required: true })}
          />
          {errors.name && <div className="invalid-feedback">Name is required.</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            placeholder="+880 1XXX-XXXXXX"
            {...register('phone', { required: true })}
          />
          {errors.phone && <div className="invalid-feedback">Phone number is required.</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Doctor</label>
          <select
            className={`form-select ${errors.doctorId ? 'is-invalid' : ''}`}
            {...register('doctorId', { required: true })}
          >
            <option value="">Select a doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} — {getSpecialtyById(d.specialtyId)?.name}
              </option>
            ))}
          </select>
          {errors.doctorId && <div className="invalid-feedback">Please select a doctor.</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Preferred Time (tomorrow)</label>
          <select
            className={`form-select ${errors.slotTime ? 'is-invalid' : ''}`}
            {...register('slotTime', { required: true })}
          >
            <option value="">Select a time slot</option>
            {SLOTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.slotTime && <div className="invalid-feedback">Please select a time slot.</div>}
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Confirm Booking
        </button>
      </form>
    </Modal>
  )
}
