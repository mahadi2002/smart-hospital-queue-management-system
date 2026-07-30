import { NavLink } from 'react-router-dom'

const ROLES = [
  { role: 'patient', label: 'Patient' },
  { role: 'doctor', label: 'Doctor' },
  { role: 'admin', label: 'Admin' },
]

export default function RoleTabs() {
  return (
    <div
      className="d-flex mb-4 p-1"
      style={{ background: 'var(--shq-bg)', borderRadius: 10, border: '1px solid var(--shq-border)' }}
    >
      {ROLES.map((r) => (
        <NavLink
          key={r.role}
          to={`/login/${r.role}`}
          className={({ isActive }) =>
            `flex-fill text-center py-2 rounded fw-semibold small ${isActive ? 'text-white' : 'text-shq-secondary'}`
          }
          style={({ isActive }) => ({
            background: isActive ? 'var(--shq-maroon)' : 'transparent',
            textDecoration: 'none',
            transition: 'background-color 150ms ease-out',
          })}
        >
          {r.label}
        </NavLink>
      ))}
    </div>
  )
}
