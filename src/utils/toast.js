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
