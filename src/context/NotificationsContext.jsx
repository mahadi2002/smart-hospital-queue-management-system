import { createContext, useContext, useEffect, useState } from 'react'
import { initialNotifications } from '../data/notifications'

const NotificationsContext = createContext(null)
const STORAGE_KEY = 'shq_notifications'

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : initialNotifications
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  }, [notifications])

  function getForProfile(role, profileId) {
    return notifications
      .filter((n) => n.role === role && n.profileId === profileId)
      .sort((a, b) => new Date(b.time) - new Date(a.time))
  }

  function unreadCount(role, profileId) {
    return getForProfile(role, profileId).filter((n) => !n.read).length
  }

  function markAllRead(role, profileId) {
    setNotifications((prev) =>
      prev.map((n) => (n.role === role && n.profileId === profileId ? { ...n, read: true } : n)),
    )
  }

  function clearAll(role, profileId) {
    setNotifications((prev) => prev.filter((n) => !(n.role === role && n.profileId === profileId)))
  }

  function addNotification({ role, profileId, title, body }) {
    setNotifications((prev) => [
      { id: `notif-${Date.now()}`, role, profileId, title, body, time: new Date().toISOString(), read: false },
      ...prev,
    ])
  }

  const value = { notifications, getForProfile, unreadCount, markAllRead, clearAll, addNotification }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider')
  return ctx
}
