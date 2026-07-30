# Smart Hospital Queue Management System

A front-end prototype for **Martyr Sharif Osman Bin Hadi Hospital's** queue and token
management system, converted from a high-fidelity Figma design into a working React app.

## Tech Stack

- **React 19** + **Vite** (JavaScript, no TypeScript)
- **React Router** for routing
- **Bootstrap 5** for layout/components, with CSS Modules for the maroon/green theme and
  role-specific sidebar treatments
- **React Context API** for session (simulated login) and shared mock data (queue/tokens,
  notifications)
- **React Hook Form** for form validation
- **SweetAlert2** for toasts and confirmation dialogs
- **Chart.js** (via `react-chartjs-2`) for the Admin Analytics dashboard
- **lucide-react** for icons

## Getting Started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

To build for production:

```bash
npm run build
npm run preview
```

The build output in `dist/` is a static site — deployable to Vercel, Netlify, GitHub Pages,
or any static host. No server runtime is required.

## Demo Logins

| Role    | Email                                | Password      |
|---------|---------------------------------------|---------------|
| Patient | abdullah.mamun@example.com            | password123   |
| Doctor  | farhana.kabir@moh-hospital.example    | doctor123     |
| Admin   | admin@moh-hospital.example             | admin123      |

New patient accounts can also be created via **Register**. Doctor and Admin accounts are
provisioned by an Admin (via **Admin → Doctors → Add Doctor**) — there's no doctor/admin
self-registration, matching the original hospital's account model.

## What's Real vs. Mocked

This is a **front-end demo**, not a production hospital system:

- **No real backend.** All data (doctors, patients, tokens, specialties, notifications)
  lives in in-memory JavaScript modules under `src/data/`, seeded with mock records, and is
  kept alive across page reloads via `localStorage` for the session/token/notification state.
  Refreshing the browser will restore your login and bookings; clearing site data resets
  everything back to the seeded state.
- **No real authentication.** Login checks a plaintext password against the mock data —
  fine for a demo, not secure, and not representative of how a real system should handle
  credentials.
- **Doctor/patient names are invented** for this conversion. The specialties, consult-time
  rules, and queue business rules (emergency cap, walk-in slots, no-show timeout, booking
  window) match the original Figma design exactly; individual staff identities do not.
- **No real payments, SMS/email delivery, or file uploads.** "OTP verification," report
  downloads, and notification delivery are all simulated with toasts.
- **Chart.js analytics** are computed from the in-memory mock token data, so they'll reflect
  whatever bookings you make during your session.

## Project Structure

```
src/
  components/
    layout/       Sidebar, Topbar, Guest header/footer, dashboard shell
    ui/            Card, Modal, Icon, StatusBadge, Logo, generic building blocks
    guest/          Guest-only booking modal, "How It Works" modal
    auth/           Role tabs, forgot-password modal
    patient/        Confirm-booking modal
    doctor/         Call-patient / complete-consultation / block-time modals
    admin/          Add-doctor / add-patient / add-specialty modals
    shared/         Change-password / deactivate-account modals (used by all 3 roles)
  context/          AuthContext, QueueContext, NotificationsContext
  data/             Mock doctors, patients, admins, specialties, tokens, packages, notifications
  pages/
    guest/          Landing, Doctor Directory, Departments, Packages, About, Contact, Booking Confirmation
    auth/           Login, Register
    loading/        Role-themed loading/splash screens
    patient/        Dashboard, Book a Token, Live Queue, My Tokens, Medical Records, Profile
    doctor/         Live Queue, My Schedule, Appointments, Patient Chart, Profile
    admin/          Dashboard, Doctors, Patients, Specialties, Token Config, Reports, Analytics, Profile
    shared/         Notifications (reused across all three roles)
  config/           Sidebar/guest nav definitions
  utils/            Toast helpers, date/initials formatting
```

## Business Rules (matching the Figma prototype)

- Emergency tokens auto-prioritize to the top of the queue, capped at 8 per doctor per day.
- No-show auto-cancel timeout: 15 minutes, with a 5-minute grace period.
- Booking window: next-day up to 24 hours ahead; 5 walk-in slots reserved per doctor per day.
- Max daily tokens: 40 per doctor by default (all adjustable by an Admin under **Token Config**).
- 8 specialties, each with a fixed consult duration: Cardiology (20m), Paediatrics (15m),
  Orthopaedics (25m), Neuro Medicine (30m), Dermatology (12m), ENT (18m), Obs & Gynae (22m),
  Medicine (10m).
