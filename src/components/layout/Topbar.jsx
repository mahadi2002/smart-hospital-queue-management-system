import { Link } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import styles from './Topbar.module.css'

export default function Topbar({ profileName, profileRole, avatarInitials, notificationsPath, unreadCount = 0, profilePath }) {
  return (
    <header className={styles.topbar}>
      <div className={styles.search}>
        <Search size={16} />
        <input type="text" placeholder="Search..." aria-label="Search" />
      </div>
      <div className={styles.right}>
        <Link to={notificationsPath} className={styles.bellBtn} aria-label="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
        </Link>
        <Link to={profilePath} className={styles.profile}>
          <span className={styles.avatar}>{avatarInitials}</span>
          <span className={styles.profileText}>
            <span className={styles.profileName}>{profileName}</span>
            <span className={styles.profileRole}>{profileRole}</span>
          </span>
        </Link>
      </div>
    </header>
  )
}
