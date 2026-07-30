import { Phone, Mail } from 'lucide-react'
import Modal from '../ui/Modal'

export default function SupportModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Contact Support">
      <p className="text-shq-secondary mb-3">
        Need help with the Smart Hospital Queue Management System? Reach our support desk directly.
      </p>
      <div className="d-flex align-items-center gap-2 mb-3">
        <Phone size={18} className="text-success" />
        <a href="tel:+8809611000000" className="link-shq">
          +880 9611-000000
        </a>
      </div>
      <div className="d-flex align-items-center gap-2">
        <Mail size={18} className="text-success" />
        <a href="mailto:support@moh-hospital.example" className="link-shq">
          support@moh-hospital.example
        </a>
      </div>
    </Modal>
  )
}
