import Swal from 'sweetalert2'

const brand = {
  confirmButtonColor: '#a32638',
  cancelButtonColor: '#6b7280',
}

export function showToast(title, icon = 'success') {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
  })
}

export function showConfirm({ title, text, confirmText = 'Confirm', cancelText = 'Cancel', icon = 'warning' }) {
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    ...brand,
  }).then((result) => result.isConfirmed)
}

export function showError(title, text) {
  return Swal.fire({ title, text, icon: 'error', ...brand })
}

// After an admin creates a doctor/patient/admin account, they still have to
// tell that person how to get in. Show the credentials once, clearly enough
// to write down or copy.
export function showCredentials({ role, name, email, password }) {
  return Swal.fire({
    title: `${role} account created`,
    icon: 'success',
    html: `
      <p style="margin-bottom:12px">Give <strong>${name}</strong> these details so they can log in:</p>
      <div style="text-align:left;background:#f5f6f8;border:1px solid #d6dee6;border-radius:10px;padding:12px 14px;font-size:0.95rem">
        <div style="margin-bottom:6px"><strong>Email</strong><br><code>${email}</code></div>
        <div><strong>Password</strong><br><code>${password}</code></div>
      </div>
      <p style="margin-top:12px;font-size:0.85rem;color:#6b7280">
        Ask them to change it after their first login.
      </p>
    `,
    confirmButtonText: 'Copy & close',
    ...brand,
  }).then((result) => {
    if (result.isConfirmed && navigator.clipboard) {
      navigator.clipboard.writeText(`Email: ${email}\nPassword: ${password}`).catch(() => {})
    }
    return result.isConfirmed
  })
}
