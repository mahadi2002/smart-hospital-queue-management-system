import Card from '../../components/ui/Card'
import { HeartHandshake, ShieldCheck, Users, Clock } from 'lucide-react'

const VALUES = [
  { icon: HeartHandshake, title: 'Compassionate Care', text: 'Every patient is treated with dignity, regardless of background or circumstance.' },
  { icon: ShieldCheck, title: 'Transparency', text: 'Clear queue positions, honest wait estimates, and no hidden priority.' },
  { icon: Users, title: 'Accessibility', text: 'Guest booking, multi-language support, and no-account options for urgent visits.' },
  { icon: Clock, title: 'Efficiency', text: 'A queue system designed to respect patients\' time as much as their health.' },
]

export default function AboutPage() {
  return (
    <div className="container py-5" style={{ maxWidth: 900 }}>
      <h1 className="fw-bold h3 mb-3">About Us</h1>

      <p className="mb-3">
        Martyr Sharif Osman Bin Hadi Hospital is a community hospital committed to accessible,
        dignified healthcare for every patient who walks through our doors.
      </p>

      <p className="text-shq-secondary mb-4">
        The hospital is named in tribute to Sharif Osman bin Hadi, a leader of Bangladesh's July
        2024 student uprising.
      </p>

      <h2 className="fw-bold h5 mb-3">Our Mission</h2>
      <p className="mb-4">
        To make quality healthcare predictable and stress-free — starting with how patients wait
        to see a doctor. The Smart Hospital Queue Management System removes the uncertainty of
        physical queues, giving patients control over their time without compromising care quality
        or fairness.
      </p>

      <h2 className="fw-bold h5 mb-3">What We Value</h2>
      <div className="row g-3 mb-4">
        {VALUES.map((v) => (
          <div className="col-md-6" key={v.title}>
            <Card className="h-100">
              <div className="d-flex align-items-center gap-2 mb-2">
                <v.icon size={20} style={{ color: 'var(--shq-maroon)' }} />
                <span className="fw-semibold">{v.title}</span>
              </div>
              <div className="text-shq-secondary small">{v.text}</div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
