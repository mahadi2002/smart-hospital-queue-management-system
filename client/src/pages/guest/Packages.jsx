import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import ReservePackageModal from '../../components/guest/ReservePackageModal'
import { useDirectory } from '../../context/DirectoryContext'

export default function Packages() {
  const { packages } = useDirectory()
  const [reservingPackage, setReservingPackage] = useState(null)

  return (
    <div className="container py-5">
      <h1 className="fw-bold h3 mb-1">Health Packages</h1>
      <p className="text-shq-secondary mb-4">
        Reserve a package below and leave your phone number. Someone from our team will call you
        back to confirm a date and walk you through what's included.
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
                <button className="btn btn-primary btn-sm" onClick={() => setReservingPackage(p)}>
                  Reserve
                </button>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <ReservePackageModal
        open={Boolean(reservingPackage)}
        onClose={() => setReservingPackage(null)}
        pkg={reservingPackage}
      />
    </div>
  )
}
