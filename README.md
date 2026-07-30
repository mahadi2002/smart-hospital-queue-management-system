# Smart Hospital Queue Management System

A full-stack queue and token management system for **Martyr Sharif Osman Bin Hadi
Hospital**, built by converting a high-fidelity Figma prototype into a working
application: a React front end talking to a real FastAPI backend, backed by MongoDB.

Guests can browse doctors and book a token with nothing more than a name and phone
number. Patients get accounts, live queue tracking, and a medical record history.
Doctors run their queue for the day — call patients in, complete consultations,
handle emergencies and walk-ins. Admins manage the doctor roster, patient accounts,
specialties, and the token/queue rules that govern the whole system.

## How this project came together

This started as a Figma design covering all four roles — Guest, Patient, Doctor,
Admin — across roughly 35 screens and 25 modals, themed in the maroon-and-green of
the July 2024 movement in Bangladesh, and named in tribute to Sharif Osman bin Hadi.

The build happened in two passes:

1. **Design → front end.** Every screen from the Figma file was rebuilt as a real
   React page, wired up with React Router, and backed by mock in-memory data so the
   whole app was clickable and demo-able without any server.
2. **Mock → real.** The mock data layer was replaced end-to-end with a genuine
   backend: a FastAPI service with its own MongoDB collections for patients,
   doctors, and admins, JWT-based login, and real CRUD endpoints. The repo was also
   restructured from a single Vite app into a `client/` + `server/` monorepo to
   match that shape, and the page/component files were renamed to drop the
   generic `XyzPage.jsx` scaffold-style naming in favor of names that just describe
   what's on the screen (`Login.jsx`, `Dashboard.jsx`, `LiveQueue.jsx`, etc.).

## Architecture

```
┌─────────────────────┐        JSON over HTTP        ┌──────────────────────┐        ┌─────────────┐
│   client/ (React)    │  ───────────────────────────▶ │   server/ (FastAPI)  │ ──────▶│   MongoDB   │
│   Vite + React Router│ ◀─────────────────────────── │   JWT auth, REST API │ ◀──────│  (local)    │
└─────────────────────┘        Bearer token auth       └──────────────────────┘        └─────────────┘
```

- The **client** never talks to a database directly — every piece of data (doctors,
  patients, tokens, notifications, specialties, packages, queue rules) is fetched
  from and written to the API.
- The **server** owns all business logic: password hashing, JWT issuance, queue
  sorting rules, emergency-cap enforcement, and writing consultation notes into a
  patient's medical history.
- **MongoDB** is the single source of truth. There's no in-memory or mock data left
  in the running app — the `server/seed.py` script is what puts the *starting* data
  in place, but from then on it's a real database.

## Tech Stack

**Client** (`client/`)
- React 19 + Vite (JavaScript, no TypeScript)
- React Router for routing
- Bootstrap 5 + CSS Modules for the maroon/green theme and role-specific sidebars
- React Context API for session state and API-backed data caching
- Axios for HTTP calls to the API
- React Hook Form for form validation
- SweetAlert2 for toasts and confirmation dialogs
- Chart.js (via `react-chartjs-2`) for the Admin Analytics dashboard
- lucide-react for icons

**Server** (`server/`)
- FastAPI + Uvicorn
- Motor (async MongoDB driver) + PyMongo
- Pydantic for request/response validation
- python-jose for JWT signing/verification
- passlib + bcrypt for password hashing

## Getting Started

You need Node.js, Python 3.11+, and a running MongoDB instance (local install or a
connection string to one).

### 1. Start MongoDB

If you don't already have MongoDB running locally, install MongoDB Community Server
and make sure the `MongoDB` service is running (default: `mongodb://localhost:27017`).

### 2. Backend

```bash
cd server
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
copy .env.example .env          # Windows — cp .env.example .env on macOS/Linux
python seed.py                  # loads doctors, patients, specialties, packages, admin
uvicorn app.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000` (interactive docs at `/docs`).

### 3. Frontend

```bash
cd client
npm install
copy .env.example .env          # Windows — cp .env.example .env on macOS/Linux
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). The `.env` file
just needs `VITE_API_URL=http://localhost:8000` pointing at the backend above.

### Production build

```bash
cd client
npm run build
npm run preview
```

`client/dist/` is a static site, deployable to Vercel/Netlify/any static host — as
long as it can reach a running instance of the `server/` API (set `VITE_API_URL`
accordingly at build time). The backend needs a Python host (Render, Railway, a VPS,
etc.) with a MongoDB connection string in its environment.

## Demo Logins

| Role    | Email                                | Password      |
|---------|---------------------------------------|---------------|
| Patient | abdullah.mamun@example.com            | password123   |
| Doctor  | farhana.kabir@moh-hospital.example    | doctor123     |
| Admin   | admin@moh-hospital.example             | admin123      |

New patient accounts can also be created via **Register**. Doctor and Admin accounts
are provisioned by an Admin (**Admin → Doctors → Add Doctor**) — there's no
doctor/admin self-registration, matching the original hospital's account model.

## API Overview

All endpoints live under `http://localhost:8000`. Full interactive docs (generated
by FastAPI) are available at `/docs` once the server is running.

| Area          | Endpoints |
|---------------|-----------|
| Auth          | `POST /auth/register`, `POST /auth/login/{patient,doctor,admin}`, `GET /auth/me` |
| Doctors       | `GET /doctors`, `GET /doctors/{id}`, `POST /doctors`, `PATCH /doctors/{id}`, `PATCH /doctors/{id}/queue-pause`, `DELETE /doctors/{id}` |
| Patients      | `GET /patients`, `GET /patients/{id}`, `POST /patients`, `PATCH /patients/{id}`, `DELETE /patients/{id}` |
| Admins        | `PATCH /admins/{id}` |
| Specialties   | `GET /specialties`, `POST /specialties`, `DELETE /specialties/{id}` |
| Packages      | `GET /packages` |
| Tokens/Queue  | `GET /tokens`, `POST /tokens`, `PATCH /tokens/{id}/status`, `POST /tokens/{id}/complete` |
| Notifications | `GET /notifications`, `PATCH /notifications/mark-all-read`, `DELETE /notifications` |
| Queue Config  | `GET /config`, `PATCH /config` |

Authentication is a `Bearer <token>` header, issued by the login endpoints and
verified on every protected route. Booking a token (`POST /tokens`) is the one
endpoint that works without a token too, since guests can book without an account.

## What's Real vs. What's Still Simulated

This is a genuine full-stack app now — not a front-end-only mock — but it's still a
student/demo project, not a production hospital system:

- **Real database.** Every doctor, patient, admin, token, notification, specialty,
  and health package lives in MongoDB and survives restarts. `server/seed.py` is
  only used to load the *initial* data; after that, everything you do in the app
  (booking, admin CRUD, profile edits, completing consultations) writes to Mongo.
- **Real authentication.** Passwords are hashed with bcrypt (never stored in plain
  text), and sessions are signed JWTs verified server-side on every request — this
  is meaningfully more real than a plaintext mock check, though it still isn't
  hardened for production (no rate limiting, no refresh-token rotation, a
  hard-coded default `JWT_SECRET` you must change via `.env`).
- **Doctor/patient names are invented** for this conversion — the specialties,
  consult-time rules, and queue business rules (emergency cap, walk-in slots,
  no-show timeout, booking window) match the original Figma design exactly;
  individual staff identities do not.
- **No real payments, SMS/email delivery, or file uploads.** "OTP verification,"
  report downloads, and notification delivery are all simulated with toasts —
  the *records* are real (stored in Mongo), but nothing is actually texted or
  emailed anywhere.
- **Chart.js analytics** are computed live from the real token data in MongoDB, so
  they reflect whatever bookings actually exist in the database.

## Project Structure

```
client/
  src/
    components/
      layout/       Sidebar, Topbar, Guest header/footer, dashboard shell
      ui/           Card, Modal, Icon, StatusBadge, Logo, generic building blocks
      guest/        Guest-only booking modal, "How It Works" modal
      auth/         Role tabs, forgot-password modal
      patient/      Confirm-booking modal
      doctor/       Call-patient / complete-consultation / block-time modals
      admin/        Add-doctor / add-patient / add-specialty modals
      shared/       Change-password / deactivate-account modals (used by all 3 roles)
    context/         AuthContext, DirectoryContext, QueueContext, NotificationsContext
                     — all fetch from and write to the API, no local mock state
    services/        api.js (axios client), normalize.js (snake_case <-> camelCase)
    constants/       Token status/type enums
    pages/
      guest/         Home, Doctors, Departments, Packages, About, Contact, Booking Confirmation
      auth/          Login, Register
      loading/       Role-themed loading/splash screens
      patient/       Dashboard, Book Token, Live Queue, My Tokens, Medical Records, Profile
      doctor/        Live Queue, Schedule, Appointments, Patient Chart, Profile
      admin/         Dashboard, Doctors, Patients, Specialties, Token Config, Reports, Analytics, Profile
      shared/        Notifications (reused across all three roles)
    config/          Sidebar/guest nav definitions
    utils/           Toast helpers, date/initials formatting

server/
  app/
    main.py          FastAPI app, CORS, router registration
    config.py        Settings (Mongo URI, JWT secret, CORS origins) via pydantic-settings
    database.py      Motor client + collection handles
    core/
      security.py    Password hashing, JWT issue/verify
      deps.py         get_current_user / require_role auth dependencies
      serializers.py  Mongo document -> JSON dict helpers
      notify.py       Internal notification-creation helper
      utils.py        Initials/timestamp helpers
    models/          Pydantic request/response schemas per entity
    routers/         auth, doctors, patients, admins, specialties, tokens, notifications, packages, config
  seed.py            Loads starting doctors/patients/specialties/packages/admin into MongoDB
  requirements.txt
```

## Business Rules

These match the original Figma design and are enforced by the backend (not just the
UI), and the numeric ones are all editable by an Admin under **Token Config**:

- Emergency tokens auto-prioritize to the top of the queue, capped at 8 per doctor
  per day.
- No-show auto-cancel timeout: 15 minutes, with a 5-minute grace period.
- Booking window: next-day up to 24 hours ahead; 5 walk-in slots reserved per
  doctor per day.
- Max daily tokens: 40 per doctor by default.
- 8 specialties, each with a fixed consult duration: Cardiology (20m), Paediatrics
  (15m), Orthopaedics (25m), Neuro Medicine (30m), Dermatology (12m), ENT (18m),
  Obs & Gynae (22m), Medicine (10m).

## Known Limitations

- The production JS bundle is a single ~1.3MB chunk (not code-split) — fine for a
  demo, but a real deployment would want to split it with dynamic `import()`.
- `JWT_SECRET` defaults to a placeholder value in `server/config.py` — change it via
  `server/.env` before deploying anywhere real.
- No automated test suite on either side yet.
