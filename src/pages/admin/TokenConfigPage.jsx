import { useForm } from 'react-hook-form'
import Card from '../../components/ui/Card'
import { useQueue } from '../../context/QueueContext'
import { showToast } from '../../utils/toast'

export default function TokenConfigPage() {
  const { rules } = useQueue()
  const { register, handleSubmit } = useForm({ defaultValues: rules })

  function onSubmit(data) {
    Object.assign(rules, {
      maxDailyTokensPerDoctor: Number(data.maxDailyTokensPerDoctor),
      emergencyCapPerDoctorPerDay: Number(data.emergencyCapPerDoctorPerDay),
      walkInSlotsPerDoctorPerDay: Number(data.walkInSlotsPerDoctorPerDay),
      noShowTimeoutMinutes: Number(data.noShowTimeoutMinutes),
      gracePeriodMinutes: Number(data.gracePeriodMinutes),
      bookingWindowHours: Number(data.bookingWindowHours),
    })
    showToast('Token configuration saved.')
  }

  return (
    <div>
      <h1 className="h4 fw-bold mb-1">Token Configuration</h1>
      <p className="text-shq-secondary mb-4">These rules govern booking and queue behavior hospital-wide.</p>

      <Card style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Max Daily Tokens / Doctor</label>
              <input type="number" className="form-control" {...register('maxDailyTokensPerDoctor')} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Emergency Cap / Doctor / Day</label>
              <input type="number" className="form-control" {...register('emergencyCapPerDoctorPerDay')} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Walk-in Slots / Doctor / Day</label>
              <input type="number" className="form-control" {...register('walkInSlotsPerDoctorPerDay')} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Booking Window (hours)</label>
              <input type="number" className="form-control" {...register('bookingWindowHours')} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">No-show Timeout (minutes)</label>
              <input type="number" className="form-control" {...register('noShowTimeoutMinutes')} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Grace Period (minutes)</label>
              <input type="number" className="form-control" {...register('gracePeriodMinutes')} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Save Configuration
          </button>
        </form>
      </Card>
    </div>
  )
}
