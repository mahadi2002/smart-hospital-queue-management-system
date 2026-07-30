import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Headset, X } from 'lucide-react'
import Logo from '../ui/Logo'
import Icon from '../ui/Icon'
import { NAV_ITEMS } from '../../config/navigation'
import { useAuth } from '../../context/AuthContext'
import styles from './Sidebar.module.css'

export default function Sidebar({ role, onOpenSupport, mobileOpen, onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const items = NAV_ITEMS[role] || []

  function handleLogout() {
    logout()
    navigate('/login/patient')
  }

  return (
    <>
      {mobileOpen && <div className={styles.backdrop} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${styles[`sidebar--${role}`]} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.brand}>
          <Logo size={28} color="#fff" />
          <span>Smart Hospital Queue Management System</span>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className={styles.nav} style={{ paddingBottom: 150 }}>
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className={styles.supportCard} onClick={onOpenSupport}>
          <Headset size={18} />
          Contact Support
        </button>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  )
}
