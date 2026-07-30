import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { QueueProvider } from './context/QueueContext'
import { NotificationsProvider } from './context/NotificationsContext'

import GuestLayout from './components/layout/GuestLayout'
import LandingPage from './pages/guest/LandingPage'
import DoctorDirectoryPage from './pages/guest/DoctorDirectoryPage'
import HealthPackagesPage from './pages/guest/HealthPackagesPage'
import DepartmentsPage from './pages/guest/DepartmentsPage'
import AboutPage from './pages/guest/AboutPage'
import ContactPage from './pages/guest/ContactPage'
import BookingConfirmationPage from './pages/guest/BookingConfirmationPage'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import LoadingPage from './pages/loading/LoadingPage'

import DashboardLayout from './components/layout/DashboardLayout'
import NotificationsPage from './pages/shared/NotificationsPage'

import PatientDashboardPage from './pages/patient/PatientDashboardPage'
import BookTokenPage from './pages/patient/BookTokenPage'
import PatientLiveQueuePage from './pages/patient/PatientLiveQueuePage'
import MyTokensPage from './pages/patient/MyTokensPage'
import MedicalRecordsPage from './pages/patient/MedicalRecordsPage'
import PatientProfilePage from './pages/patient/PatientProfilePage'

import DoctorLiveQueuePage from './pages/doctor/DoctorLiveQueuePage'
import MySchedulePage from './pages/doctor/MySchedulePage'
import AppointmentsPage from './pages/doctor/AppointmentsPage'
import PatientChartPage from './pages/doctor/PatientChartPage'
import DoctorProfilePage from './pages/doctor/DoctorProfilePage'

import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage'
import AdminPatientsPage from './pages/admin/AdminPatientsPage'
import AdminSpecialtiesPage from './pages/admin/AdminSpecialtiesPage'
import TokenConfigPage from './pages/admin/TokenConfigPage'
import ReportsPage from './pages/admin/ReportsPage'
import AnalyticsPage from './pages/admin/AnalyticsPage'
import AdminProfilePage from './pages/admin/AdminProfilePage'

import NotFoundPage from './pages/NotFoundPage'

function App() {
  return (
    <AuthProvider>
      <QueueProvider>
        <NotificationsProvider>
          <Routes>
            <Route element={<GuestLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/doctors" element={<DoctorDirectoryPage />} />
              <Route path="/packages" element={<HealthPackagesPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
            </Route>

            <Route path="/login/patient" element={<LoginPage role="patient" />} />
            <Route path="/login/doctor" element={<LoginPage role="doctor" />} />
            <Route path="/login/admin" element={<LoginPage role="admin" />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/loading/patient" element={<LoadingPage role="patient" />} />
            <Route path="/loading/doctor" element={<LoadingPage role="doctor" />} />
            <Route path="/loading/admin" element={<LoadingPage role="admin" />} />

            <Route path="/patient" element={<DashboardLayout role="patient" />}>
              <Route path="dashboard" element={<PatientDashboardPage />} />
              <Route path="book" element={<BookTokenPage />} />
              <Route path="queue" element={<PatientLiveQueuePage />} />
              <Route path="tokens" element={<MyTokensPage />} />
              <Route path="packages" element={<HealthPackagesPage />} />
              <Route path="records" element={<MedicalRecordsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<PatientProfilePage />} />
            </Route>

            <Route path="/doctor" element={<DashboardLayout role="doctor" />}>
              <Route path="queue" element={<DoctorLiveQueuePage />} />
              <Route path="schedule" element={<MySchedulePage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="patient/:patientId" element={<PatientChartPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<DoctorProfilePage />} />
            </Route>

            <Route path="/admin" element={<DashboardLayout role="admin" />}>
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="doctors" element={<AdminDoctorsPage />} />
              <Route path="patients" element={<AdminPatientsPage />} />
              <Route path="specialties" element={<AdminSpecialtiesPage />} />
              <Route path="token-config" element={<TokenConfigPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<AdminProfilePage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationsProvider>
      </QueueProvider>
    </AuthProvider>
  )
}

export default App
