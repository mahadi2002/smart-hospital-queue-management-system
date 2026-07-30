import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Info, Clock, Users, Layers, ArrowRight } from 'lucide-react'
import Icon from '../../components/ui/Icon'
import Card from '../../components/ui/Card'
import GuestBookingModal from '../../components/guest/GuestBookingModal'
import HowItWorksModal from '../../components/guest/HowItWorksModal'
import { useDirectory } from '../../context/DirectoryContext'
import { getInitials } from '../../utils/format'

export default function Home() {
  const { doctors, specialties, packages, getDoctorsBySpecialty } = useDirectory()
  const [bookingOpen, setBookingOpen] = useState(false)
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(135deg, #7a1b29 0%, #a32638 60%, #0f6b4f 130%)',
          color: '#fff',
          padding: '72px 64px',
        }}
      >
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <h1 className="fw-bold mb-3" style={{ fontSize: '2.6rem' }}>
                Skip the wait. Get in line before you leave home.
              </h1>
              <p className="mb-4" style={{ fontSize: '1.05rem', opacity: 0.9 }}>
                Martyr Sharif Osman Bin Hadi Hospital's Smart Hospital Queue Management System
                lets you book a token, track your position live, and see the right specialist —
                without standing in a physical line.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <button className="btn btn-light btn-lg fw-semibold" onClick={() => setBookingOpen(true)}>
                  <Ticket size={18} className="me-2" />
                  Book a Token
                </button>
                <button
                  className="btn btn-outline-light btn-lg"
                  onClick={() => setHowItWorksOpen(true)}
                >
                  <Info size={18} className="me-2" />
                  How It Works
                </button>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="row g-3">
                <StatTile icon={Users} value={`${doctors.length}+`} label="Doctors" />
                <StatTile icon={Layers} value={`${specialties.length}`} label="Specialties" />
                <StatTile icon={Clock} value="24h" label="Advance booking" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="container py-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="fw-bold h3 m-0">Browse by Specialty</h2>
          <Link to="/departments" className="link-shq d-flex align-items-center gap-1">
            View all departments <ArrowRight size={16} />
          </Link>
        </div>
        <div className="row g-3">
          {specialties.map((s) => (
            <div className="col-6 col-md-4 col-lg-3" key={s.id}>
              <Card className="h-100 text-center py-4">
                <div
                  className="mx-auto mb-2 d-flex align-items-center justify-content-center"
                  style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(163,38,56,0.1)', color: '#a32638' }}
                >
                  <Icon name={s.icon} size={22} />
                </div>
                <div className="fw-semibold">{s.name}</div>
                <div className="text-shq-secondary small">
                  {getDoctorsBySpecialty(s.id).length} doctors · ~{s.consultMinutes} min
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Featured doctors */}
      <section className="py-5" style={{ background: '#fff' }}>
        <div className="container">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="fw-bold h3 m-0">Featured Doctors</h2>
            <Link to="/doctors" className="link-shq d-flex align-items-center gap-1">
              View all doctors <ArrowRight size={16} />
            </Link>
          </div>
          <div className="row g-3">
            {doctors.slice(0, 4).map((d) => (
              <div className="col-md-6 col-lg-3" key={d.id}>
                <Card className="h-100">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div
                      className="d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'var(--shq-maroon)',
                        color: '#fff',
                        fontWeight: 700,
                      }}
                    >
                      {getInitials(d.name)}
                    </div>
                    <div>
                      <div className="fw-semibold">{d.name}</div>
                      <div className="text-shq-secondary small">{d.qualifications}</div>
                    </div>
                  </div>
                  <div className="text-shq-secondary small mb-3">{d.experienceYears} yrs experience</div>
                  <button
                    className="btn btn-outline-primary btn-sm w-100"
                    onClick={() => setBookingOpen(true)}
                  >
                    Book Token
                  </button>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Health packages */}
      <section className="container py-5">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h2 className="fw-bold h3 m-0">Health Packages</h2>
          <Link to="/packages" className="link-shq d-flex align-items-center gap-1">
            View all packages <ArrowRight size={16} />
          </Link>
        </div>
        <div className="row g-3">
          {packages.slice(0, 3).map((p) => (
            <div className="col-md-4" key={p.id}>
              <Card className="h-100">
                <div className="fw-semibold mb-1">{p.name}</div>
                <div className="text-shq-secondary small mb-2">{p.description}</div>
                <div className="fw-bold" style={{ color: 'var(--shq-green)' }}>
                  ৳{p.price.toLocaleString()}
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      <GuestBookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <HowItWorksModal open={howItWorksOpen} onClose={() => setHowItWorksOpen(false)} />
    </div>
  )
}

function StatTile({ icon: IconCmp, value, label }) {
  return (
    <div className="col-4">
      <div
        className="text-center p-3"
        style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, backdropFilter: 'blur(4px)' }}
      >
        <IconCmp size={20} className="mb-1" />
        <div className="fw-bold fs-5">{value}</div>
        <div className="small" style={{ opacity: 0.85 }}>
          {label}
        </div>
      </div>
    </div>
  )
}
