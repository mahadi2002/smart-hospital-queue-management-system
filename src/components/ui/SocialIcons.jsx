// lucide-react intentionally ships no brand/logo icons, so these three
// social marks are small hand-drawn SVGs matching the app's thin-stroke style.
export function FacebookIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path d="M15 8.5h2V5.5h-2c-2 0-3.5 1.5-3.5 3.5v2H10v3h1.5v6H14v-6h2l.5-3H14v-2c0-.6.4-1 1-1Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TwitterIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <path
        d="M20 6.5c-.6.3-1.3.5-2 .6a3.1 3.1 0 0 0 1.4-1.7c-.7.4-1.4.7-2.2.9a3.1 3.1 0 0 0-5.3 2.8A8.8 8.8 0 0 1 5.5 6.2a3.1 3.1 0 0 0 1 4.1c-.5 0-1-.2-1.5-.4v.1c0 1.5 1 2.8 2.5 3a3.2 3.2 0 0 1-1.4.1 3.1 3.1 0 0 0 2.9 2.2A6.3 6.3 0 0 1 4 16.6a8.8 8.8 0 0 0 4.8 1.4c5.7 0 8.9-4.8 8.9-9v-.4c.6-.4 1.1-1 1.3-1.7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function YoutubeIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6">
      <rect x="3" y="6.5" width="18" height="11" rx="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 10.5v3.4l3-1.7-3-1.7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
