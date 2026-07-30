import { useForm } from 'react-hook-form'
import Modal from '../ui/Modal'
import { showToast } from '../../utils/toast'

export default function BlockTimeModal({ open, onClose }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  function onSubmit(data) {
    reset()
    onClose()
    showToast(`Time blocked: ${data.date} ${data.from}–${data.to}`)
  }

  return (
    <Modal open={open} onClose={onClose} title="Block Time">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Date</label>
          <input type="date" className={`form-control ${errors.date ? 'is-invalid' : ''}`} {...register('date', { required: true })} />
        </div>
        <div className="row">
          <div className="col-6 mb-3">
            <label className="form-label">From</label>
            <input type="time" className={`form-control ${errors.from ? 'is-invalid' : ''}`} {...register('from', { required: true })} />
          </div>
          <div className="col-6 mb-3">
            <label className="form-label">To</label>
            <input type="time" className={`form-control ${errors.to ? 'is-invalid' : ''}`} {...register('to', { required: true })} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Reason (optional)</label>
          <input className="form-control" {...register('reason')} />
        </div>
        <button type="submit" className="btn btn-primary w-100">
          Block Time
        </button>
      </form>
    </Modal>
  )
}
