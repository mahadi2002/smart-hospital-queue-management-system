// Sidebar nav items per role. Icon values are lucide-react component names.
export const NAV_ITEMS = {
  patient: [
    { label: 'Dashboard', path: '/patient/dashboard', icon: 'LayoutDashboard' },
    { label: 'Book a Token', path: '/patient/book', icon: 'Ticket' },
    { label: 'Live Queue', path: '/patient/queue', icon: 'ListOrdered' },
    { label: 'My Tokens', path: '/patient/tokens', icon: 'ClipboardList' },
    { label: 'Health Packages', path: '/patient/packages', icon: 'Package' },
    { label: 'Medical Records', path: '/patient/records', icon: 'FileText' },
    { label: 'Notifications', path: '/patient/notifications', icon: 'Bell' },
    { label: 'Profile & Settings', path: '/patient/profile', icon: 'Settings' },
  ],
  doctor: [
    { label: 'Live Queue', path: '/doctor/queue', icon: 'ListOrdered' },
    { label: 'My Schedule', path: '/doctor/schedule', icon: 'CalendarClock' },
    { label: 'Appointments', path: '/doctor/appointments', icon: 'CalendarCheck' },
    { label: 'Notifications', path: '/doctor/notifications', icon: 'Bell' },
    { label: 'Profile & Settings', path: '/doctor/profile', icon: 'Settings' },
  ],
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
    { label: 'Doctors', path: '/admin/doctors', icon: 'Stethoscope' },
    { label: 'Patients', path: '/admin/patients', icon: 'Users' },
    { label: 'Specialties', path: '/admin/specialties', icon: 'Layers' },
    { label: 'Admins', path: '/admin/admins', icon: 'ShieldCheck' },
    { label: 'Token Config', path: '/admin/token-config', icon: 'SlidersHorizontal' },
    { label: 'Reports', path: '/admin/reports', icon: 'FileBarChart' },
    { label: 'Analytics', path: '/admin/analytics', icon: 'PieChart' },
    { label: 'Notifications', path: '/admin/notifications', icon: 'Bell' },
    { label: 'Profile & Settings', path: '/admin/profile', icon: 'Settings' },
  ],
}

export const GUEST_NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Doctors', path: '/doctors' },
  { label: 'Health Packages', path: '/packages' },
  { label: 'Departments', path: '/departments' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]
