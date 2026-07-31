# Smart Hospital Queue Management System

A full-stack outpatient queue and token management system for **Martyr Sharif Osman
Bin Hadi Hospital**, a fictional specialist diagnostic centre in Dhaka. Built as a
Web Programming course project: a React front end, a FastAPI back end, and MongoDB
for storage.

The problem it solves is the one everybody recognises from a hospital waiting room —
you have no idea how long you'll be sitting there. Patients book a token before they
leave home, watch their position move in real time, and turn up when their turn is
close. Doctors run their day's queue from one screen. Admins manage staff, patients,
and the rules the queue runs on.

---

## Contents

- [Features by role](#features-by-role)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Demo logins](#demo-logins)
- [How the core flows work](#how-the-core-flows-work)
- [Data model](#data-model)
- [Business rules](#business-rules)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Design decisions](#design-decisions)
- [Known limitations](#known-limitations)
- [Possible next steps](#possible-next-steps)

---

## Features by role

**Guest** (no account needed)
- Browse doctors by specialty, with each doctor's live queue status: which token is
  in the room, how many are waiting, and the estimated wait if you booked right now
- Book a token with just a name and phone number
- Browse and reserve health check-up packages

**Patient**
- Everything a guest can do, plus a dashboard showing their active token and position
- Full booking history, including skipped and no-show visits
- Medical records: past diagnoses, doctor's notes, and test reports
- Change their own password

**Doctor**
- Live queue for the day: who's in the room, who's next, who's waiting and how long
  they've been there
- Call in, skip, or complete a consultation; completing one writes a diagnosis and
  notes straight into that patient's medical record
- Pause the queue (for a break) without losing their place
- Look up the full chart of any patient in their queue

**Admin**
- Dashboard of hospital-wide activity
- Create and remove doctors, patients, and other admins, handing over login details
- Manage specialties and their consultation durations
- Edit the queue rules (token limits, no-show timeouts, booking window) live
- Reports, including health package reservations with accept/cancel actions
- Analytics charts computed from real booking data

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Front end | React 19 + Vite | Component model fits a dashboard app; Vite gives near-instant hot reload |
| Routing | React Router | Nested layouts let all three dashboards share one shell |
| State | React Context API | Four small providers were enough — Redux would have been overkill here |
| Styling | Bootstrap 5 + CSS Modules | Bootstrap for layout and forms, CSS Modules where components needed scoped styles |
| Forms | React Hook Form | Less re-rendering and less boilerplate than controlled inputs everywhere |
| Charts | Chart.js | Simple API, and the analytics needed only bar and doughnut charts |
| Back end | FastAPI | Async by default, and automatic API docs at `/docs` were genuinely useful while building |
| Database | MongoDB (Motor) | Records vary in shape — a patient may have zero or twenty history entries — which suits documents better than rigid tables |
| Auth | JWT (python-jose) + bcrypt | Stateless tokens, hashed passwords |

---

## Architecture

```
┌───────────────────────┐        JSON over HTTP         ┌──────────────────────┐        ┌─────────────┐
│   client/ (React)     │  ───────────────────────────▶ │   server/ (FastAPI)  │ ──────▶│   MongoDB   │
│   Vite + React Router │ ◀───────────────────────────  │   JWT auth, REST API │ ◀──────│   (local)   │
└───────────────────────┘        Bearer token auth      └──────────────────────┘        └─────────────┘
```

The client never touches the database. Every doctor, patient, token, notification
and setting is fetched from the API, and everything the user does writes back
through it. Four React Contexts hold that data on the client side:

| Context | Holds | Notes |
|---|---|---|
| `AuthContext` | Session + logged-in profile | Reads the JWT from `localStorage` on load |
| `DirectoryContext` | Doctors, specialties, packages | Reference data used across all roles |
| `QueueContext` | Tokens and queue rules | Polls every 6s so bookings appear without a refresh |
| `NotificationsContext` | Notifications + unread count | Polls every 10s |

The API speaks `snake_case` (Python convention) and the client speaks `camelCase`
(JavaScript convention). Rather than compromise on either, `services/normalize.js`
converts between them in one place, so no component has to care.

---

## Getting started

You need **Node.js 18+**, **Python 3.11+**, and **MongoDB** running locally.

### 1. MongoDB

Install MongoDB Community Server and make sure the service is running. The default
`mongodb://localhost:27017` is what the app expects.

### 2. Back end

```bash
cd server
python -m venv .venv
.venv\Scripts\activate            # Windows
# source .venv/bin/activate       # macOS / Linux

pip install -r requirements.txt
copy .env.example .env            # macOS / Linux: cp .env.example .env
python seed.py                    # loads the starting data
python -m uvicorn app.main:app --reload --port 8000
```

The API is now on `http://localhost:8000`, with interactive docs at
`http://localhost:8000/docs`.

> `seed.py` **wipes and reloads** the collections every time it runs. Run it once at
> setup; don't run it against data you want to keep.

### 3. Front end

```bash
cd client
npm install
copy .env.example .env            # needs VITE_API_URL=http://localhost:8000
npm run dev
```

Open the printed URL, usually `http://localhost:5173`.

### Production build

```bash
cd client
npm run build      # outputs to client/dist/
npm run preview
```

---

## Demo logins

`seed.py` loads **63 doctors, 43 patients and 43 admins**. Every account in a role
shares the same password, so any of the seeded emails will work.

| Role | Password | Example accounts |
|---|---|---|
| Patient | `password123` | `abdullah.mamun@example.com`, `nasrin.sultana@example.com` |
| Doctor | `doctor123` | `farhana.kabir@moh-hospital.example`, `kamrul.hasan@moh-hospital.example` |
| Admin | `admin123` | `admin@moh-hospital.example` (Super Admin) |

For the best first impression, log in as **Dr. Farhana Kabir** — her queue is seeded
with a patient mid-consultation, an emergency case, a walk-in, and an advance
booking.

New patients can register themselves. Doctor and admin accounts are created by an
admin, matching how a real hospital would issue them.

---

## How the core flows work

### Booking a token

1. Guest or patient picks a specialty, then a doctor, then a time slot.
2. `POST /tokens` checks the doctor exists, then checks the daily limit — emergency
   tokens are counted against a separate, smaller cap.
3. The token is created with status `waiting` and a number like `T-007`.
4. If the booker was logged in, a notification is written for them.

### The queue lifecycle

```
waiting ──► called ──► in-consultation ──► completed
   │           │
   │           └──► no-show   (auto, after the timeout expires)
   └──► skipped / cancelled
```

The doctor drives these transitions from their Live Queue screen. Two of them are
worth calling out:

- **`called` → `no-show` happens on its own.** When a token is marked `called` the
  server records the timestamp. Any later request that reads the queue first sweeps
  for tokens that have sat in `called` past the timeout plus grace period and flips
  them to `no-show`, so an absent patient can't block the queue.
- **`completed` writes to the medical record.** Finishing a consultation saves the
  diagnosis and notes onto the patient's history, which is what makes the Medical
  Records page real rather than decorative.

### Authentication

Login returns a signed JWT which the client stores and sends as
`Authorization: Bearer <token>`. On every protected request the server decodes the
token **and re-checks the account still exists and is active** — so an account
removed mid-session loses access immediately instead of staying valid until the
token expires.

### Removing a doctor

Deleting the record outright would orphan every token that doctor ever handled, and
patients would lose the name of who they saw. So removal **archives** instead: the
password hash is stripped (which is what actually ends access) and the record is
marked archived. They vanish from the directory, booking, and live queue, but past
consultations stay intact. Admins can tick "Include removed" to see them.

---

## Data model

Nine MongoDB collections:

| Collection | Holds | Notable fields |
|---|---|---|
| `patients` | Patient accounts | `medical_history[]`, `reports[]`, `mrn`, `password_hash` |
| `doctors` | Doctor accounts | `specialty_id`, `working_days[]`, `consultation_fee`, `status`, `queue_paused` |
| `admins` | Admin accounts | `role` (Admin / Super Admin), `department` |
| `specialties` | Departments | `consult_minutes` — drives every wait-time estimate |
| `tokens` | Every booking, past and present | `status`, `type`, `booked_at`, `checked_in_at`, `reason` |
| `notifications` | Per-user messages | `role`, `profile_id`, `read` |
| `packages` | Health check-up packages | `tests[]`, `price` |
| `package_reservations` | Package enquiries | `name`, `phone`, `status` |
| `settings` | Queue rules | Single document, editable by admins |

Documents reference each other by string id (`specialty_id`, `doctor_id`,
`patient_id`) rather than embedding, so a doctor's details aren't duplicated across
hundreds of tokens.

**Token numbers** restart at `T-001` for each doctor each day, in slot order. That
mirrors a real counter — you're "number 7 for Dr. Rahman today", not number 4,213
since the system was installed. Two doctors both having a `T-001` is expected; the
number is only unique within one doctor's day.

---

## Business rules

Enforced by the **back end**, not just hidden in the UI, and all the numeric ones are
editable by an admin under **Token Config**:

| Rule | Default |
|---|---|
| Max tokens per doctor per day | 40 |
| Emergency tokens per doctor per day | 8 (auto-prioritised to the top of the queue) |
| Walk-in slots reserved per doctor per day | 5 |
| No-show timeout | 15 minutes, plus a 5-minute grace period |
| Booking window | Up to 24 hours ahead |

Each specialty has its own consultation length, which is what the wait estimates are
built from:

| Specialty | Consult | Doctors |
|---|---|---|
| Cardiology | 20 min | 7 |
| Paediatrics | 15 min | 9 |
| Orthopaedics | 25 min | 7 |
| Neuro Medicine | 30 min | 6 |
| Dermatology | 12 min | 10 |
| ENT | 18 min | 8 |
| Obs & Gynae | 22 min | 7 |
| Medicine | 10 min | 9 |

Estimated wait = `people waiting × consult minutes`, plus one more consultation if
someone is already in the room.

---

## API reference

All endpoints are under `http://localhost:8000`. Full interactive docs at `/docs`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login/{patient,doctor,admin}`, `GET /auth/me`, `POST /auth/change-password` |
| Doctors | `GET /doctors`, `GET /doctors/queue-status`, `GET /doctors/{id}`, `POST /doctors`, `PATCH /doctors/{id}`, `PATCH /doctors/{id}/queue-pause`, `DELETE /doctors/{id}` |
| Patients | `GET /patients`, `GET /patients/{id}`, `POST /patients`, `PATCH /patients/{id}`, `DELETE /patients/{id}` |
| Admins | `GET /admins`, `POST /admins`, `PATCH /admins/{id}`, `DELETE /admins/{id}` |
| Specialties | `GET /specialties`, `POST /specialties`, `DELETE /specialties/{id}` |
| Packages | `GET /packages`, `GET /packages/reservations`, `POST /packages/{id}/reserve`, `PATCH /packages/reservations/{id}` |
| Tokens | `GET /tokens`, `POST /tokens`, `PATCH /tokens/{id}/status`, `POST /tokens/{id}/complete` |
| Notifications | `GET /notifications`, `PATCH /notifications/mark-all-read`, `DELETE /notifications` |
| Config | `GET /config`, `PATCH /config` |

Some endpoints are deliberately open, because guests need them before they have an
account. The browse reads — `GET /doctors`, `GET /doctors/queue-status`,
`GET /specialties`, `GET /packages` — plus two writes: `POST /tokens` (book a token)
and `POST /packages/{id}/reserve`. Everything else requires a valid token.

Role permissions are enforced server-side. A patient requesting `GET /tokens` only
ever receives their own tokens, no matter what query parameters they send.

---

## Project structure

```
client/
  src/
    components/
      layout/      Sidebar, Topbar, guest header/footer, dashboard shell
      ui/          Card, Modal, Icon, StatusBadge, Logo
      guest/       Guest booking modal, package reservation modal
      auth/        Role tabs, forgot-password modal
      patient/     Confirm-booking modal
      doctor/      Call-patient, complete-consultation, block-time modals
      admin/       Add-doctor, add-patient, add-admin, add-specialty modals
      shared/      Patient record view, change-password modal
    context/       Auth, Directory, Queue, Notifications providers
    services/      api.js (axios), normalize.js (snake_case <-> camelCase)
    constants/     Token status and type values
    config/        Sidebar and guest navigation definitions
    utils/         Toast helpers, date and initials formatting
    pages/
      guest/       Home, Doctors, Departments, Packages, About, Contact
      auth/        Login, Register
      loading/     Role-themed splash screens
      patient/     Dashboard, Book Token, Live Queue, My Tokens, Records, Profile
      doctor/      Live Queue, Schedule, Appointments, Patient Chart, Profile
      admin/       Dashboard, Doctors, Patients, Admins, Specialties,
                   Token Config, Reports, Analytics, Profile
      shared/      Notifications (used by all three roles)

server/
  app/
    main.py        FastAPI app, CORS, router registration
    config.py      Settings from .env via pydantic-settings
    database.py    Motor client and collection handles
    core/
      security.py    Password hashing, JWT issue and verify
      deps.py        Auth dependencies (get_current_user, require_role)
      queue_rules.py No-show expiry sweep
      serializers.py Mongo document -> JSON helpers
      notify.py      Notification creation helper
      utils.py       Initials and timestamp helpers
    models/        Pydantic request/response schemas
    routers/       auth, doctors, patients, admins, specialties,
                   tokens, notifications, packages, config
  seed.py          Loads the starting dataset
  requirements.txt
```

---

## Design decisions

**Polling instead of WebSockets.** The queue needs to feel live, and WebSockets
would be the "proper" answer. We used polling on a timer instead — it's a few lines
in a `useEffect`, it degrades gracefully if a request fails, and at this scale the
extra requests cost nothing. A real deployment with hundreds of concurrent users
would want to revisit this.

**Business rules live on the server.** It would have been easier to check the
emergency cap in the booking form. But anything enforced only in the browser can be
bypassed by calling the API directly, so the limits, the no-show timeout, and the
role permissions are all checked server-side. The UI just shows them.

**Archiving instead of deleting.** Covered above under removing a doctor — the short
version is that a hospital record system should never lose history because a member
of staff left.

**One `normalize.js` instead of renaming fields everywhere.** Python and JavaScript
disagree about naming conventions. Converting at the boundary meant neither side had
to write unnatural code.

**Denormalising the patient's name onto each token.** Tokens store `patient_name`
even though `patient_id` could look it up. Guests book without an account and have no
id at all, so the name has to live on the token regardless.

**Deterministic seed data.** `seed.py` uses a fixed random seed, so the same dataset
is produced every time. Demos are reproducible, and queue depths still vary per
doctor and per department rather than looking machine-generated.

---

## Known limitations

This is a course project, not a production hospital system.

- **No automated tests.** Everything was verified manually through the UI and the
  API docs. Tests would be the first real addition.
- **Passwords are set in plain text by admins.** When an admin creates an account
  they choose a temporary password and read it off the screen. A production system
  would email a one-time setup link so nobody ever sees the password.
- **No rate limiting or refresh tokens.** JWTs last 24 hours and can't be revoked
  individually, though removed accounts are rejected on every request.
- **Token numbers can race.** Two people booking with the same doctor in the same
  instant could get the same number. A production system would use an atomic
  per-doctor counter.
- **Notifications, OTP and report downloads are simulated.** The records are real
  and stored in MongoDB, but nothing is actually emailed or texted.
- **The JS bundle is a single ~1.3 MB chunk.** Not code-split; fine for a demo,
  but a real deployment would split it with dynamic `import()`.
- **Doctor and patient names are invented.** The specialties, consultation times and
  queue rules are modelled on how a real outpatient department works; the people are
  not real.

---

## Possible next steps

- Replace polling with WebSockets for true real-time updates
- Add a test suite — pytest for the API, React Testing Library for the components
- SMS notifications when your token is two places away
- Let patients upload documents before an appointment
- Code-split the front-end bundle by route
