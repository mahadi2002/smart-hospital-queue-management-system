import * as icons from 'lucide-react'

// Resolves a lucide-react icon by string name so nav/data configs can stay
// plain JSON instead of importing components directly.
export default function Icon({ name, size = 20, ...props }) {
  const Cmp = icons[name]
  if (!Cmp) return null
  return <Cmp size={size} {...props} />
}
