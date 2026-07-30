import { Outlet } from 'react-router-dom'
import GuestHeader from './GuestHeader'
import GuestFooter from './GuestFooter'

export default function GuestLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <GuestHeader />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <GuestFooter />
    </div>
  )
}
