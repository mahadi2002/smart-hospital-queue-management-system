import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import Card from '../../components/ui/Card'
import { useDirectory } from '../../context/DirectoryContext'

export default function Departments() {
  const { specialties, getDoctorsBySpecialty } = useDirectory()
  return (
    <div className="container py-5">
      <h1 className="fw-bold h3 mb-1">Departments</h1>
      <p className="text-shq-secondary mb-4">Eight specialties, each staffed by dedicated consultants.</p>

      <div className="row g-3">
        {specialties.map((s) => {
          const doctorCount = getDoctorsBySpecialty(s.id).length
          return (
            <div className="col-md-6 col-lg-4" key={s.id}>
              <Card className="h-100">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div
                    className="d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(15,107,79,0.1)', color: 'var(--shq-green)' }}
                  >
                    <Icon name={s.icon} size={22} />
                  </div>
                  <div>
                    <div className="fw-semibold">{s.name}</div>
                    <div className="text-shq-secondary small">
                      {doctorCount} doctor{doctorCount !== 1 ? 's' : ''} · ~{s.consultMinutes} min consult
                    </div>
                  </div>
                </div>
                <Link to={`/doctors?specialty=${s.id}`} className="link-shq small">
                  View doctors →
                </Link>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
