import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center" style={{ minHeight: '100vh', padding: 24 }}>
      <div className="fw-bold mb-2" style={{ fontSize: '3rem', color: 'var(--shq-maroon)' }}>
        404
      </div>
      <p className="text-shq-secondary mb-4">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  )
}
