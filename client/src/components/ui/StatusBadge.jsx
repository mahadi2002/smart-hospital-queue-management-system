const COLORS = {
  waiting: { bg: '#fef3c7', text: '#92400e' },
  called: { bg: '#dbeafe', text: '#1e40af' },
  'in-consultation': { bg: '#dcfce7', text: '#166534' },
  completed: { bg: '#e5e7eb', text: '#374151' },
  skipped: { bg: '#fee2e2', text: '#991b1b' },
  cancelled: { bg: '#f3f4f6', text: '#6b7280' },
  'no-show': { bg: '#fee2e2', text: '#991b1b' },
}

export default function StatusBadge({ status }) {
  const c = COLORS[status] || COLORS.waiting
  return (
    <span
      className="badge text-capitalize"
      style={{ background: c.bg, color: c.text, fontWeight: 600, fontSize: '0.72rem' }}
    >
      {status.replace('-', ' ')}
    </span>
  )
}
