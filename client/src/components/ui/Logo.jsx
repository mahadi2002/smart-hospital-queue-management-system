// Heart outline + pulse line, drawn by hand to match the lucide-react icon style used everywhere else.
export default function Logo({ size = 32, color = 'currentColor', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Smart Hospital Queue Management System logo"
    >
      <path
        d="M16 27.5s-10.5-6.6-13.6-13.2C.6 9.8 2.8 5 7.4 4.1c2.9-.6 5.8.7 7.4 3.1l1.2 1.8 1.2-1.8c1.6-2.4 4.5-3.7 7.4-3.1 4.6.9 6.8 5.7 5 10.2C26.5 20.9 16 27.5 16 27.5Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 15.5H10l2-4 3 8 2.5-6 1.5 2h8.5"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
