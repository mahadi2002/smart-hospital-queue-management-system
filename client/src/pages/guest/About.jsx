import Card from '../../components/ui/Card'
import { HeartHandshake, ShieldCheck, Users, Clock } from 'lucide-react'

const VALUES = [
  { icon: HeartHandshake, title: 'Compassionate Care', text: 'Whether you\'ve been coming here for years or you just walked in off the street, you get treated the same way.' },
  { icon: ShieldCheck, title: 'Transparency', text: 'You can check your token number and wait time from your phone instead of asking the front desk every twenty minutes.' },
  { icon: Users, title: 'Accessibility', text: 'No account needed to book. If it\'s urgent, just give your name and phone number at the counter.' },
  { icon: Clock, title: 'Efficiency', text: 'Doctors run consultations at their own pace, and the queue adjusts around that instead of pretending everyone gets exactly ten minutes.' },
]

export default function About() {
  return (
    <div className="container py-5" style={{ maxWidth: 900 }}>
      <h1 className="fw-bold h3 mb-3">About Us</h1>

      <p className="mb-3">
        Martyr Sharif Osman Bin Hadi Hospital is a specialist outpatient center in Dhaka —
        consultations, diagnostics, and day procedures across eight departments. Most people who
        visit us are here to see a specialist or get lab work done, not for a long inpatient stay.
      </p>

      <p className="text-shq-secondary mb-4">
        The hospital is named in tribute to Sharif Osman bin Hadi, a leader of Bangladesh's July
        2024 student uprising.
      </p>

      <h2 className="fw-bold h5 mb-3">Our Mission</h2>
      <p className="mb-4">
        The waiting room is usually the worst part of a hospital visit, not the appointment itself.
        You just don't know how long you'll be sitting there. That's the one problem this system
        is built to solve: you get a token, you can see where you actually are in line, and you
        show up when it's close to your turn instead of two hours early just in case.
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
