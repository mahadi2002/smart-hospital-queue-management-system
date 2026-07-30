import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationsContext'
import { formatDateTime } from '../../utils/format'
import { showToast } from '../../utils/toast'

export default function Notifications() {
  const { role, session } = useAuth()
  const { getForProfile, markAllRead, clearAll } = useNotifications()
  const notifications = getForProfile(role, session.profileId)

  function handleMarkAllRead() {
    markAllRead(role, session.profileId)
    showToast('Notifications marked as read.')
  }

  function handleClearAll() {
    clearAll(role, session.profileId)
    showToast('Notifications cleared.')
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
        <h1 className="h4 fw-bold m-0">Notifications</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm" onClick={handleMarkAllRead}>
            <CheckCheck size={14} className="me-1" />
            Mark all read
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={handleClearAll}>
            <Trash2 size={14} className="me-1" />
            Clear all
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-5 text-shq-secondary">
          <Bell size={32} className="mb-2" />
          <div>You're all caught up.</div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {notifications.map((n) => (
            <Card key={n.id} style={{ background: n.read ? undefined : 'rgba(163,38,56,0.05)' }}>
              <div className="d-flex justify-content-between flex-wrap gap-2">
                <div className="fw-semibold small">{n.title}</div>
                <div className="text-shq-secondary small">{formatDateTime(n.time)}</div>
              </div>
              <div className="text-shq-secondary small">{n.body}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
