import { Link } from 'react-router-dom'
import { FacebookIcon, TwitterIcon, YoutubeIcon } from '../ui/SocialIcons'
import Logo from '../ui/Logo'
import styles from './GuestFooter.module.css'

export default function GuestFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.row}>
        <Link to="/" className={styles.brand}>
          <Logo size={22} color="#fff" />
          Smart Hospital Queue Management System
        </Link>
        <div className={styles.social}>
          <a href="#" aria-label="Facebook">
            <FacebookIcon size={18} />
          </a>
          <a href="#" aria-label="Twitter">
            <TwitterIcon size={18} />
          </a>
          <a href="#" aria-label="YouTube">
            <YoutubeIcon size={18} />
          </a>
        </div>
      </div>
      <div className={styles.copyright}>
        © {new Date().getFullYear()} Martyr Sharif Osman Bin Hadi Hospital. All rights reserved.
      </div>
    </footer>
  )
}
