import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../services/api'
import { normalizeNotification } from '../services/normalize'
import { useAuth } from './AuthContext'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [notifications, setNotifications] = useState([])

  const refetch = useCallback(async () => {
    const { data } = await api.get('/notifications')
    setNotifications(data.map(normalizeNotification))
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    refetch()
    const interval = setInterval(refetch, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated, refetch])

  // role/profileId are kept in the signature so call sites don't need to
  // change — the API already scopes results to whoever is logged in.
  function getForProfile() {
    return [...notifications].sort((a, b) => new Date(b.time) - new Date(a.time))
  }

  function unreadCount() {
    return notifications.filter((n) => !n.read).length
  }

  async function markAllRead() {
    await api.patch('/notifications/mark-all-read')
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function clearAll() {
    await api.delete('/notifications')
    setNotifications([])
  }

  const value = { notifications, getForProfile, unreadCount, markAllRead, clearAll }

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider')
  return ctx
}
