import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { QueueProvider } from './context/QueueContext'
import { NotificationsProvider } from './context/NotificationsContext'
import { DirectoryProvider } from './context/DirectoryContext'

import GuestLayout from './components/layout/GuestLayout'
import Home from './pages/guest/Home'
import GuestDoctors from './pages/guest/Doctors'
import GuestPackages from './pages/guest/Packages'
import Departments from './pages/guest/Departments'
import About from './pages/guest/About'
import Contact from './pages/guest/Contact'
import BookingConfirmation from './pages/guest/BookingConfirmation'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Loading from './pages/loading/Loading'

import DashboardLayout from './components/layout/DashboardLayout'
import Notifications from './pages/shared/Notifications'

import PatientDashboard from './pages/patient/Dashboard'
import BookToken from './pages/patient/BookToken'
import PatientLiveQueue from './pages/patient/LiveQueue'
import MyTokens from './pages/patient/MyTokens'
import MedicalRecords from './pages/patient/MedicalRecords'
import PatientProfile from './pages/patient/Profile'

import DoctorLiveQueue from './pages/doctor/LiveQueue'
import Schedule from './pages/doctor/Schedule'
import Appointments from './pages/doctor/Appointments'
import PatientChart from './pages/doctor/PatientChart'
import DoctorProfile from './pages/doctor/Profile'

import AdminDashboard from './pages/admin/Dashboard'
import AdminDoctors from './pages/admin/Doctors'
import AdminPatients from './pages/admin/Patients'
import AdminSpecialties from './pages/admin/Specialties'
import TokenConfig from './pages/admin/TokenConfig'
import Reports from './pages/admin/Reports'
import Analytics from './pages/admin/Analytics'
import AdminProfile from './pages/admin/Profile'

import NotFound from './pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <DirectoryProvider>
        <QueueProvider>
          <NotificationsProvider>
            <Routes>
              <Route element={<GuestLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/doctors" element={<GuestDoctors />} />
                <Route path="/packages" element={<GuestPackages />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
              </Route>

              <Route path="/login/patient" element={<Login role="patient" />} />
              <Route path="/login/doctor" element={<Login role="doctor" />} />
              <Route path="/login/admin" element={<Login role="admin" />} />
              <Route path="/register" element={<Register />} />

              <Route path="/loading/patient" element={<Loading role="patient" />} />
              <Route path="/loading/doctor" element={<Loading role="doctor" />} />
              <Route path="/loading/admin" element={<Loading role="admin" />} />

              <Route path="/patient" element={<DashboardLayout role="patient" />}>
                <Route path="dashboard" element={<PatientDashboard />} />
                <Route path="book" element={<BookToken />} />
                <Route path="queue" element={<PatientLiveQueue />} />
                <Route path="tokens" element={<MyTokens />} />
                <Route path="packages" element={<GuestPackages />} />
                <Route path="records" element={<MedicalRecords />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<PatientProfile />} />
              </Route>

              <Route path="/doctor" element={<DashboardLayout role="doctor" />}>
                <Route path="queue" element={<DoctorLiveQueue />} />
                <Route path="schedule" element={<Schedule />} />
                <Route path="appointments" element={<Appointments />} />
                <Route path="patient/:patientId" element={<PatientChart />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<DoctorProfile />} />
              </Route>

              <Route path="/admin" element={<DashboardLayout role="admin" />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="doctors" element={<AdminDoctors />} />
                <Route path="patients" element={<AdminPatients />} />
                <Route path="specialties" element={<AdminSpecialties />} />
                <Route path="token-config" element={<TokenConfig />} />
                <Route path="reports" element={<Reports />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile" element={<AdminProfile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationsProvider>
        </QueueProvider>
      </DirectoryProvider>
    </AuthProvider>
  )
}

export default App
