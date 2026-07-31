import { Link, useLocation } from 'react-router-dom'
import { Search, Bell, Menu } from 'lucide-react'
import { NAV_ITEMS } from '../../config/navigation'
import styles from './Topbar.module.css'

// The Figma header shows the current page's name on the left. The nav config
// already knows every page's label, so look it up from the URL instead of
// making each page pass its own title down.
function usePageTitle(role) {
  const { pathname } = useLocation()
  const items = NAV_ITEMS[role] || []
  const match = items.find((item) => pathname.startsWith(item.path))
  return match ? match.label : ''
}

export default function Topbar({
  profileName,
  profileSubtitle,
  role,
  avatarInitials,
  notificationsPath,
  unreadCount = 0,
  profilePath,
  onOpenSidebar,
}) {
  const pageTitle = usePageTitle(role)

  return (
    <header className={styles.topbar}>
      <button type="button" className={styles.menuToggle} onClick={onOpenSidebar} aria-label="Open menu">
        <Menu size={22} />
      </button>
      <h2 className={styles.pageTitle}>{pageTitle}</h2>
      <div className={styles.search}>
        <Search size={16} />
        <input type="text" placeholder="Search patients, tokens, doctors..." aria-label="Search" />
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
            <span className={styles.profileRole}>{profileSubtitle}</span>
          </span>
        </Link>
      </div>
    </header>
  )
}
