import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from '../ui/Logo'
import { GUEST_NAV_ITEMS } from '../../config/navigation'
import styles from './GuestHeader.module.css'

export default function GuestHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand} onClick={() => setOpen(false)}>
        <Logo size={30} color="#a32638" />
        <span>Smart Hospital Queue Management System</span>
      </Link>

      <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`}>
        {GUEST_NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            onClick={() => setOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className={styles.actions}>
        <Link to="/login/patient" className="btn btn-outline-primary btn-sm">
          Login
        </Link>
        <Link to="/register" className="btn btn-primary btn-sm">
          Register
        </Link>
        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  )
}
