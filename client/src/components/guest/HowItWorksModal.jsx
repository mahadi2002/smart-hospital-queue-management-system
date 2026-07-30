import { UserPlus, Ticket, Bell, Stethoscope } from 'lucide-react'
import Modal from '../ui/Modal'

const STEPS = [
  { icon: UserPlus, title: 'Create an account (or continue as guest)', text: 'Register in under a minute, or book instantly with just your name and phone number.' },
  { icon: Ticket, title: 'Book a token', text: 'Pick a specialty, choose a doctor, and reserve a time slot up to 24 hours ahead.' },
  { icon: Bell, title: 'Track your position live', text: 'Registered patients can watch the queue update in real time and get notified as their turn approaches.' },
  { icon: Stethoscope, title: 'See the doctor', text: 'Arrive for your slot and get called in turn — emergency cases are always prioritized.' },
]

export default function HowItWorksModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="How It Works">
      <div className="d-flex flex-column gap-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="d-flex gap-3">
            <div
              className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(163,38,56,0.1)', color: '#a32638' }}
            >
              <step.icon size={20} />
            </div>
            <div>
              <div className="fw-semibold">
                {i + 1}. {step.title}
              </div>
              <div className="text-shq-secondary small">{step.text}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
