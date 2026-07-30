export const healthPackages = [
  {
    id: 'pkg-1',
    name: 'Executive Health Checkup',
    price: 4500,
    tests: ['CBC', 'Lipid Profile', 'Liver Function Test', 'ECG', 'Chest X-Ray'],
    description: 'A comprehensive annual checkup for working professionals.',
  },
  {
    id: 'pkg-2',
    name: 'Cardiac Screening Package',
    price: 6000,
    tests: ['ECG', 'Echocardiogram', 'Lipid Profile', 'Cardiologist Consultation'],
    description: 'Early detection package for heart-related risk factors.',
  },
  {
    id: 'pkg-3',
    name: "Women's Wellness Package",
    price: 5200,
    tests: ['CBC', 'Thyroid Profile', 'Pap Smear', 'Ultrasound (Pelvis)', 'Gynae Consultation'],
    description: 'Preventive screening package tailored for women’s health.',
  },
  {
    id: 'pkg-4',
    name: 'Senior Citizen Package',
    price: 5800,
    tests: ['CBC', 'Blood Sugar (Fasting & PP)', 'Kidney Function Test', 'ECG', 'Bone Density Scan'],
    description: 'Focused on the health concerns most common after age 60.',
  },
  {
    id: 'pkg-5',
    name: 'Diabetes Screening Package',
    price: 2800,
    tests: ['Fasting Blood Sugar', 'HbA1c', 'Lipid Profile', 'Kidney Function Test'],
    description: 'Early screening and monitoring for diabetes risk.',
  },
  {
    id: 'pkg-6',
    name: 'Basic Full Body Checkup',
    price: 2200,
    tests: ['CBC', 'Blood Sugar (Random)', 'Urine Routine', 'Chest X-Ray'],
    description: 'An affordable general wellness screening package.',
  },
]

export function getPackageById(id) {
  return healthPackages.find((p) => p.id === id)
}
