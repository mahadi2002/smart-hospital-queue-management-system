// 8 specialties matching the Figma prototype: name, consult duration, and icon.
// Icons are lucide-react component names, resolved via the iconMap below.
export const specialties = [
  { id: 'cardiology', name: 'Cardiology', consultMinutes: 20, icon: 'Heart' },
  { id: 'paediatrics', name: 'Paediatrics', consultMinutes: 15, icon: 'Activity' },
  { id: 'orthopaedics', name: 'Orthopaedics', consultMinutes: 25, icon: 'Shield' },
  { id: 'neuro-medicine', name: 'Neuro Medicine', consultMinutes: 30, icon: 'Zap' },
  { id: 'dermatology', name: 'Dermatology', consultMinutes: 12, icon: 'Droplet' },
  { id: 'ent', name: 'ENT', consultMinutes: 18, icon: 'Ear' },
  { id: 'obs-gynae', name: 'Obs & Gynae', consultMinutes: 22, icon: 'Flower2' },
  { id: 'medicine', name: 'Medicine', consultMinutes: 10, icon: 'Stethoscope' },
]

export function getSpecialtyById(id) {
  return specialties.find((s) => s.id === id)
}
