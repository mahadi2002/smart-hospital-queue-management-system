import Card from '../../components/ui/Card'
import { useDirectory } from '../../context/DirectoryContext'
import { showToast } from '../../utils/toast'
import { CheckCircle2 } from 'lucide-react'

export default function Packages() {
  const { packages } = useDirectory()

  function handleReserve(pkg) {
    showToast(`${pkg.name} reserved! We'll contact you to confirm.`)
  }

  return (
    <div className="container py-5">
      <h1 className="fw-bold h3 mb-1">Health Packages</h1>
      <p className="text-shq-secondary mb-4">
        Preventive checkup bundles designed by our specialists — reserve one and our team will follow up.
      </p>

      <div className="row g-3">
        {packages.map((p) => (
          <div className="col-md-6 col-lg-4" key={p.id}>
            <Card className="h-100 d-flex flex-column">
              <div className="fw-semibold fs-5 mb-1">{p.name}</div>
              <div className="text-shq-secondary small mb-3">{p.description}</div>
              <ul className="list-unstyled mb-3 flex-grow-1">
                {p.tests.map((t) => (
                  <li key={t} className="d-flex align-items-center gap-2 small mb-1">
                    <CheckCircle2 size={14} style={{ color: 'var(--shq-green)' }} />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="d-flex align-items-center justify-content-between mt-auto">
                <span className="fw-bold fs-5" style={{ color: 'var(--shq-green)' }}>
                  ৳{p.price.toLocaleString()}
                </span>
                <button className="btn btn-primary btn-sm" onClick={() => handleReserve(p)}>
                  Reserve
                </button>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
