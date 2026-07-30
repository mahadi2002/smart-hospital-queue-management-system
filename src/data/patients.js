// Mock patient records, including medical history and test reports used
// by both the Patient "Medical Records" screen and the Doctor "Patient Chart" screen.
export const patients = [
  {
    id: 'pat-1',
    name: 'Abdullah Al Mamun',
    phone: '+880 1611-100201',
    email: 'abdullah.mamun@example.com',
    password: 'password123',
    dob: '1990-04-12',
    gender: 'Male',
    bloodGroup: 'B+',
    address: 'Mirpur-10, Dhaka',
    avatarInitials: 'AM',
    medicalHistory: [
      {
        id: 'hist-1',
        date: '2026-05-14',
        doctor: 'Dr. Farhana Kabir',
        specialty: 'Cardiology',
        diagnosis: 'Hypertension, stage 1',
        notes: 'Prescribed lifestyle changes and low-dose medication. Follow-up in 3 months.',
      },
      {
        id: 'hist-2',
        date: '2026-02-02',
        doctor: 'Dr. Kamrul Hasan',
        specialty: 'Medicine',
        diagnosis: 'Seasonal flu',
        notes: 'Rest and antivirals prescribed. Fully recovered.',
      },
    ],
    reports: [
      { id: 'rep-1', name: 'ECG Report', date: '2026-05-14', type: 'PDF' },
      { id: 'rep-2', name: 'Lipid Profile', date: '2026-05-14', type: 'PDF' },
    ],
  },
  {
    id: 'pat-2',
    name: 'Nasrin Sultana',
    phone: '+880 1611-100202',
    email: 'nasrin.sultana@example.com',
    password: 'password123',
    dob: '1985-11-02',
    gender: 'Female',
    bloodGroup: 'O+',
    address: 'Dhanmondi, Dhaka',
    avatarInitials: 'NS',
    medicalHistory: [
      {
        id: 'hist-3',
        date: '2026-06-20',
        doctor: 'Dr. Farzana Rahman',
        specialty: 'Obs & Gynae',
        diagnosis: 'Routine antenatal checkup, 24 weeks',
        notes: 'Pregnancy progressing normally. Iron supplements continued.',
      },
    ],
    reports: [{ id: 'rep-3', name: 'Ultrasound Report', date: '2026-06-20', type: 'PDF' }],
  },
  {
    id: 'pat-3',
    name: 'Rakibul Islam',
    phone: '+880 1611-100203',
    email: 'rakibul.islam@example.com',
    password: 'password123',
    dob: '2001-07-23',
    gender: 'Male',
    bloodGroup: 'A+',
    address: 'Uttara, Dhaka',
    avatarInitials: 'RI',
    medicalHistory: [
      {
        id: 'hist-4',
        date: '2026-07-01',
        doctor: 'Dr. Shafiqul Islam',
        specialty: 'Orthopaedics',
        diagnosis: 'Sprained ankle (grade 2)',
        notes: 'Advised rest, ice, compression, elevation. Physiotherapy referral given.',
      },
    ],
    reports: [{ id: 'rep-4', name: 'X-Ray — Left Ankle', date: '2026-07-01', type: 'Image' }],
  },
  {
    id: 'pat-4',
    name: 'Tania Ferdous',
    phone: '+880 1611-100204',
    email: 'tania.ferdous@example.com',
    password: 'password123',
    dob: '1995-01-30',
    gender: 'Female',
    bloodGroup: 'AB+',
    address: 'Banani, Dhaka',
    avatarInitials: 'TF',
    medicalHistory: [],
    reports: [],
  },
]

export function getPatientById(id) {
  return patients.find((p) => p.id === id)
}

export function getPatientByEmail(email) {
  return patients.find((p) => p.email.toLowerCase() === email.toLowerCase())
}
