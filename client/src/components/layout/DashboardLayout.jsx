import { useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import SupportModal from './SupportModal'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationsContext'

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
          profileRole={role}
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
