export const admins = [
  {
    id: 'adm-1',
    name: 'Md. Habibur Rahman',
    email: 'admin@moh-hospital.example',
    password: 'admin123',
    role: 'Super Admin',
    avatarInitials: 'HR',
  },
]

export function getAdminByEmail(email) {
  return admins.find((a) => a.email.toLowerCase() === email.toLowerCase())
}

export function getAdminById(id) {
  return admins.find((a) => a.id === id)
}
