export function getInitials(name = '') {
  return name
    .replace('Dr.', '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Today's date as YYYY-MM-DD in the *local* timezone, for matching against the
// date part of a stored timestamp.
//
// Don't use toISOString() for this — it converts to UTC first. We're at UTC+6,
// so between midnight and 6am it returns yesterday's date, and anything
// counting "today" silently reads zero for the first six hours of every day.
// 'en-CA' is the trick: it formats as YYYY-MM-DD, but in local time.
export function todayLocal() {
  return new Date().toLocaleDateString('en-CA')
}
