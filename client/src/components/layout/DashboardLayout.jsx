import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import SupportModal from './SupportModal'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationsContext'

// The header shows something different under each name: a patient's record
// number, where to find the doctor, or the admin's job title.
function profileSubtitle(role, profile) {
  if (!profile) return ''
  if (role === 'patient') return profile.mrn || 'Patient'
  if (role === 'doctor') return profile.roomNumber ? `Room ${profile.roomNumber}` : 'Consultant'
  return profile.role || 'Admin'
}

export default function DashboardLayout({ role }) {
  const { session, isAuthenticated, profile, loading } = useAuth()
  const { unreadCount } = useNotifications()
  const [supportOpen, setSupportOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  if (loading) {
    return null
  }

  if (!isAuthenticated || session.role !== role) {
    return <Navigate to={`/login/${role === 'admin' ? 'admin' : role}`} replace />
  }

  if (!profile) {
    return null
  }

  return (
    <div className="shq-app-shell">
      <Sidebar
        role={role}
        onOpenSupport={() => setSupportOpen(true)}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="shq-main-column">
        <Topbar
          profileName={profile?.name || 'User'}
          profileSubtitle={profileSubtitle(role, profile)}
          role={role}
          avatarInitials={profile?.avatarInitials || '??'}
          notificationsPath={`/${role}/notifications`}
          profilePath={`/${role}/profile`}
          unreadCount={unreadCount()}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className="shq-content">
          <Outlet />
        </main>
      </div>
      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </div>
  )
}
