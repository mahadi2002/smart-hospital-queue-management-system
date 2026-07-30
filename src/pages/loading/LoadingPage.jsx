import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../components/ui/Logo'
import styles from './LoadingPage.module.css'

const HOME_ROUTE = {
  patient: '/patient/dashboard',
  doctor: '/doctor/queue',
  admin: '/admin/dashboard',
}

export default function LoadingPage({ role }) {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => navigate(HOME_ROUTE[role], { replace: true }), 2200)
    return () => clearTimeout(timer)
  }, [role, navigate])

  return (
    <div className={`${styles.screen} ${styles[role]}`}>
      <Logo size={56} color="#fff" />
      <div className={styles.spinner} />
      <div className="fw-semibold">Setting up your {role} dashboard...</div>
    </div>
  )
}
