import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import SupportModal from './SupportModal'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationsContext'
import { getPatientById } from '../../data/patients'
import { getDoctorById } from '../../data/doctors'
import { getAdminById } from '../../data/admins'
import { getInitials } from '../../utils/format'

function resolveProfile(role, profileId) {
  if (role === 'patient') {
    const p = getPatientById(profileId)
    return p && { name: p.name, avatarInitials: p.avatarInitials || getInitials(p.name) }
  }
  if (role === 'doctor') {
    const d = getDoctorById(profileId)
    return d && { name: d.name, avatarInitials: getInitials(d.name) }
  }
  if (role === 'admin') {
    const a = getAdminById(profileId)
    return a && { name: a.name, avatarInitials: a.avatarInitials || getInitials(a.name) }
  }
  return null
}

export default function DashboardLayout({ role }) {
  const { session, isAuthenticated } = useAuth()
  const { unreadCount } = useNotifications()
  const [supportOpen, setSupportOpen] = useState(false)

  if (!isAuthenticated || session.role !== role) {
    return <Navigate to={`/login/${role === 'admin' ? 'admin' : role}`} replace />
  }

  const profile = resolveProfile(role, session.profileId)

  return (
    <div className="shq-app-shell">
      <Sidebar role={role} onOpenSupport={() => setSupportOpen(true)} />
      <div className="shq-main-column">
        <Topbar
          profileName={profile?.name || 'User'}
          profileRole={role}
          avatarInitials={profile?.avatarInitials || '??'}
          notificationsPath={`/${role}/notifications`}
          profilePath={`/${role}/profile`}
          unreadCount={unreadCount(role, session.profileId)}
        />
        <main className="shq-content">
          <Outlet />
        </main>
      </div>
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  )
}
