"""
One-off script to load the hospital's starting data into MongoDB:
8 specialties, 60 doctors (varying 6-10 per specialty, matching a real
hospital's uneven staffing), 40 patients, 40 admins, 6 health packages,
plus a realistic "right now" queue spread across most doctors — busier
specialties and busier individual doctors get deeper queues, others sit
idle, same as a real hospital on a given day.

Safe to re-run — it wipes and reloads the collections each time, so don't
run this against a database you care about keeping as-is.

Usage:
    .venv\\Scripts\\python.exe seed.py
"""

import asyncio
import random
from datetime import date, datetime, timedelta, timezone

from app.core.security import hash_password
from app.database import (
    admins_col,
    doctors_col,
    notifications_col,
    packages_col,
    patients_col,
    specialties_col,
    tokens_col,
)

SPECIALTIES = [
    {"name": "Cardiology", "consult_minutes": 20, "icon": "Heart"},
    {"name": "Paediatrics", "consult_minutes": 15, "icon": "Activity"},
    {"name": "Orthopaedics", "consult_minutes": 25, "icon": "Shield"},
    {"name": "Neuro Medicine", "consult_minutes": 30, "icon": "Zap"},
    {"name": "Dermatology", "consult_minutes": 12, "icon": "Droplet"},
    {"name": "ENT", "consult_minutes": 18, "icon": "Ear"},
    {"name": "Obs & Gynae", "consult_minutes": 22, "icon": "Flower2"},
    {"name": "Medicine", "consult_minutes": 10, "icon": "Stethoscope"},
]

# "Today's queue" has to actually be today, otherwise every wait time on the
# doctor's screen reads in the thousands of minutes the day after seeding.
TODAY = date.today().isoformat()
YESTERDAY = (date.today() - timedelta(days=1)).isoformat()

DOCTOR_DEMO_PASSWORD = "doctor123"
PATIENT_DEMO_PASSWORD = "password123"
ADMIN_DEMO_PASSWORD = "admin123"

# Each entry: name, specialty, qualifications, experience_years, email, phone,
# working_days, working_hours, bio, consultation_fee, languages, room_number.
# 6-10 doctors per specialty (60 total).
DOCTORS = [
    # --- Cardiology (Floor 2, rooms 201-206) ---
    ("Dr. Farhana Kabir", "Cardiology", "MBBS, FCPS (Cardiology)", 14, "farhana.kabir@moh-hospital.example",
     "+880 1711-000101", ["Sun", "Mon", "Tue", "Wed", "Thu"], "09:00 - 17:00",
     "Runs the interventional cath lab, though most of her day is preventive heart care rather than emergencies.", 900, ["Bengali", "English"], "201"),
    ("Dr. Rezaul Karim", "Cardiology", "MBBS, MD (Cardiology)", 9, "rezaul.karim@moh-hospital.example",
     "+880 1711-000102", ["Sun", "Tue", "Wed", "Thu", "Sat"], "10:00 - 18:00",
     "Sees a lot of arrhythmia cases and runs the cardiac rehab program after bypass surgery.", 700, ["Bengali", "English"], "202"),
    ("Dr. Mizanur Rahman", "Cardiology", "MBBS, MD (Cardiology)", 16, "mizanur.rahman@moh-hospital.example",
     "+880 1711-000117", ["Sat", "Sun", "Mon", "Wed", "Thu"], "08:00 - 15:00",
     "Does most of the echocardiograms here and follows up long-term heart failure patients.", 950, ["Bengali", "English", "Hindi"], "203"),
    ("Dr. Shahriar Kabir", "Cardiology", "MBBS, FCPS (Cardiology)", 5, "shahriar.kabir@moh-hospital.example",
     "+880 1711-000118", ["Sun", "Mon", "Tue", "Thu", "Fri"], "14:00 - 21:00",
     "Newest in the department, mostly sees younger patients coming in for cardiac risk screening.", 600, ["Bengali", "English"], "204"),
    ("Dr. Nasrin Akhter", "Cardiology", "MBBS, MD (Cardiology)", 8, "nasrin.akhter@moh-hospital.example",
     "+880 1711-000119", ["Sat", "Mon", "Tue", "Wed", "Fri"], "09:00 - 16:00",
     "Treats a lot of hypertension, with a particular interest in heart disease in women.", 680, ["Bengali", "English"], "205"),
    ("Dr. Zahid Hasan", "Cardiology", "MBBS, MS (Cardiac Surgery)", 20, "zahid.hasan@moh-hospital.example",
     "+880 1711-000120", ["Sun", "Tue", "Wed", "Thu", "Sat"], "10:00 - 17:00",
     "The department's surgeon. Handles bypass and valve procedures, twenty years in the OR.", 1200, ["Bengali", "English", "Hindi"], "206"),

    # --- Paediatrics (Floor 3, rooms 301-306) ---
    ("Dr. Nusrat Jahan", "Paediatrics", "MBBS, DCH", 11, "nusrat.jahan@moh-hospital.example",
     "+880 1711-000103", ["Sat", "Sun", "Mon", "Tue", "Wed"], "09:00 - 16:00",
     "Sees kids from birth through their teenage years, general paediatric care.", 700, ["Bengali", "English"], "301"),
    ("Dr. Mahfuza Akter", "Paediatrics", "MBBS, MD (Paediatrics)", 9, "mahfuza.akter@moh-hospital.example",
     "+880 1711-000111", ["Sat", "Mon", "Tue", "Wed", "Thu"], "10:00 - 17:00",
     "Runs most of the vaccination clinic and spends a lot of time talking to parents about nutrition.", 650, ["Bengali", "English"], "302"),
    ("Dr. Rowshan Ara", "Paediatrics", "MBBS, DCH", 14, "rowshan.ara@moh-hospital.example",
     "+880 1711-000121", ["Sun", "Mon", "Wed", "Thu", "Fri"], "09:00 - 15:00",
     "A lot of her patients come in for asthma or allergies, plus routine growth monitoring.", 800, ["Bengali", "English"], "303"),
    ("Dr. Faisal Islam", "Paediatrics", "MBBS, MD (Paediatrics)", 6, "faisal.islam@moh-hospital.example",
     "+880 1711-000122", ["Sat", "Sun", "Tue", "Thu", "Fri"], "13:00 - 20:00",
     "Covers the newborn unit and handles paediatric emergencies when they come in.", 550, ["Bengali", "English"], "304"),
    ("Dr. Tahmina Sultana", "Paediatrics", "MBBS, FCPS (Paediatrics)", 10, "tahmina.sultana@moh-hospital.example",
     "+880 1711-000123", ["Sun", "Mon", "Tue", "Wed", "Sat"], "08:00 - 14:00",
     "Works mostly with developmental delays — speech, motor skills, that kind of thing.", 720, ["Bengali", "English"], "305"),
    ("Dr. Habibur Rahman", "Paediatrics", "MBBS, DCH", 18, "habibur.rahman@moh-hospital.example",
     "+880 1711-000124", ["Mon", "Tue", "Wed", "Thu", "Sat"], "10:00 - 18:00",
     "The most senior paediatrician on staff. Mostly manages kids with long-term conditions.", 950, ["Bengali", "English", "Hindi"], "306"),

    # --- Orthopaedics (Floor 4, rooms 401-406) ---
    ("Dr. Shafiqul Islam", "Orthopaedics", "MBBS, MS (Orthopaedics)", 17, "shafiqul.islam@moh-hospital.example",
     "+880 1711-000104", ["Sun", "Mon", "Wed", "Thu", "Sat"], "09:00 - 17:00",
     "Does most of the joint replacements here, along with trauma surgery.", 1000, ["Bengali", "English"], "401"),
    ("Dr. Rafiqul Alam", "Orthopaedics", "MBBS, D-Ortho", 11, "rafiqul.alam@moh-hospital.example",
     "+880 1711-000112", ["Sat", "Sun", "Tue", "Thu", "Fri"], "13:00 - 20:00",
     "Sees a lot of sports injuries and also takes spine consultations.", 750, ["Bengali", "English"], "402"),
    ("Dr. Emran Hossain", "Orthopaedics", "MBBS, MS (Orthopaedics)", 9, "emran.hossain@moh-hospital.example",
     "+880 1711-000125", ["Sun", "Mon", "Tue", "Wed", "Fri"], "09:00 - 16:00",
     "Mostly fracture care and arthroscopic procedures.", 700, ["Bengali", "English"], "403"),
    ("Dr. Kohinoor Begum", "Orthopaedics", "MBBS, D-Ortho", 7, "kohinoor.begum@moh-hospital.example",
     "+880 1711-000126", ["Sat", "Mon", "Wed", "Thu", "Sat"], "10:00 - 17:00",
     "One of the few here who regularly takes paediatric orthopaedic cases.", 650, ["Bengali", "English"], "404"),
    ("Dr. Aminul Islam", "Orthopaedics", "MBBS, MS (Orthopaedics)", 15, "aminul.islam@moh-hospital.example",
     "+880 1711-000127", ["Sun", "Tue", "Wed", "Thu", "Sat"], "08:00 - 15:00",
     "Hip and knee replacements make up most of his caseload.", 900, ["Bengali", "English"], "405"),
    ("Dr. Sazzad Karim", "Orthopaedics", "MBBS, D-Ortho", 4, "sazzad.karim@moh-hospital.example",
     "+880 1711-000128", ["Mon", "Tue", "Thu", "Fri", "Sat"], "14:00 - 21:00",
     "Newest on the team, mostly handles casting and general trauma walk-ins.", 500, ["Bengali", "English"], "406"),

    # --- Neuro Medicine (Floor 5, rooms 501-506) ---
    ("Dr. Tanvir Ahmed", "Neuro Medicine", "MBBS, MD (Neurology)", 13, "tanvir.ahmed@moh-hospital.example",
     "+880 1711-000105", ["Sun", "Mon", "Tue", "Thu", "Sat"], "10:00 - 17:00",
     "Covers stroke care, epilepsy, and movement disorders — a fairly broad general neurology practice.", 950, ["Bengali", "English"], "501"),
    ("Dr. Salma Chowdhury", "Neuro Medicine", "MBBS, FCPS (Neurology)", 10, "salma.chowdhury@moh-hospital.example",
     "+880 1711-000113", ["Sat", "Sun", "Wed", "Thu", "Fri"], "09:00 - 16:00",
     "A lot of her patients come in with chronic headaches or neuromuscular complaints.", 800, ["Bengali", "English"], "502"),
    ("Dr. Delwar Hossain", "Neuro Medicine", "MBBS, MD (Neurology)", 12, "delwar.hossain@moh-hospital.example",
     "+880 1711-000129", ["Sun", "Mon", "Tue", "Wed", "Fri"], "08:00 - 15:00",
     "Mostly follows multiple sclerosis and neuropathy patients long-term.", 850, ["Bengali", "English"], "503"),
    ("Dr. Jesmin Akter", "Neuro Medicine", "MBBS, FCPS (Neuro Medicine)", 6, "jesmin.akter@moh-hospital.example",
     "+880 1711-000130", ["Sat", "Mon", "Tue", "Thu", "Fri"], "13:00 - 20:00",
     "The department's paediatric neurology referral. Sees mostly children.", 600, ["Bengali", "English"], "504"),
    ("Dr. Ashraf Uddin", "Neuro Medicine", "MBBS, MD (Neurology)", 19, "ashraf.uddin@moh-hospital.example",
     "+880 1711-000131", ["Sun", "Tue", "Wed", "Thu", "Sat"], "09:00 - 16:00",
     "Most senior neurologist here. Runs the stroke rehabilitation clinic.", 1100, ["Bengali", "English", "Hindi"], "505"),
    ("Dr. Ruma Khatun", "Neuro Medicine", "MBBS, D-Neuro", 8, "ruma.khatun@moh-hospital.example",
     "+880 1711-000132", ["Sat", "Sun", "Mon", "Wed", "Thu"], "10:00 - 17:00",
     "Handles ongoing epilepsy monitoring for most of the department's patients.", 700, ["Bengali", "English"], "506"),

    # --- Dermatology (Floor 2, rooms 221-226) ---
    ("Dr. Sabrina Haque", "Dermatology", "MBBS, DDV", 8, "sabrina.haque@moh-hospital.example",
     "+880 1711-000106", ["Sat", "Sun", "Mon", "Wed", "Thu"], "11:00 - 18:00",
     "General dermatology — skin, hair, nails, patients of every age.", 650, ["Bengali", "English"], "221"),
    ("Dr. Nazmul Haque", "Dermatology", "MBBS, MD (Dermatology)", 7, "nazmul.haque@moh-hospital.example",
     "+880 1711-000114", ["Sun", "Mon", "Tue", "Thu", "Fri"], "09:00 - 15:00",
     "A mix of acne and eczema cases, plus some cosmetic dermatology work.", 600, ["Bengali", "English"], "222"),
    ("Dr. Momtaz Begum", "Dermatology", "MBBS, DDV", 9, "momtaz.begum@moh-hospital.example",
     "+880 1711-000133", ["Sat", "Tue", "Wed", "Thu", "Fri"], "10:00 - 17:00",
     "Mostly sees children — skin allergies and general paediatric dermatology.", 680, ["Bengali", "English"], "223"),
    ("Dr. Rubel Miah", "Dermatology", "MBBS, MD (Dermatology)", 5, "rubel.miah@moh-hospital.example",
     "+880 1711-000134", ["Sun", "Mon", "Wed", "Thu", "Sat"], "13:00 - 20:00",
     "Handles most of the laser treatment referrals and acne scarring cases.", 550, ["Bengali", "English"], "224"),
    ("Dr. Shahnaz Parveen", "Dermatology", "MBBS, DDV", 13, "shahnaz.parveen@moh-hospital.example",
     "+880 1711-000135", ["Sat", "Sun", "Mon", "Tue", "Thu"], "09:00 - 16:00",
     "Sees the harder autoimmune skin cases that other doctors refer over.", 800, ["Bengali", "English"], "225"),
    ("Dr. Golam Sarwar", "Dermatology", "MBBS, MD (Dermatology)", 17, "golam.sarwar@moh-hospital.example",
     "+880 1711-000136", ["Mon", "Tue", "Wed", "Fri", "Sat"], "10:00 - 18:00",
     "Longest-serving dermatologist here. Mostly follows chronic skin disease patients.", 900, ["Bengali", "English"], "226"),

    # --- ENT (Floor 3, rooms 321-326) ---
    ("Dr. Imran Hossain", "ENT", "MBBS, MS (ENT)", 10, "imran.hossain@moh-hospital.example",
     "+880 1711-000107", ["Sun", "Mon", "Tue", "Wed", "Sat"], "09:00 - 16:00",
     "ENT surgeon — mostly sinus surgery these days.", 750, ["Bengali", "English"], "321"),
    ("Dr. Shirin Akhter", "ENT", "MBBS, D-ENT", 13, "shirin.akhter@moh-hospital.example",
     "+880 1711-000115", ["Mon", "Tue", "Wed", "Thu", "Fri"], "10:00 - 18:00",
     "About half her patients are kids: hearing disorders and general paediatric ENT.", 800, ["Bengali", "English"], "322"),
    ("Dr. Laila Yesmin", "ENT", "MBBS, D-ENT", 10, "laila.yesmin@moh-hospital.example",
     "+880 1711-000137", ["Sat", "Sun", "Tue", "Wed", "Thu"], "09:00 - 15:00",
     "Voice and throat disorders. Sees a lot of teachers and singers.", 700, ["Bengali", "English"], "323"),
    ("Dr. Anisur Rahman", "ENT", "MBBS, MS (ENT)", 6, "anisur.rahman@moh-hospital.example",
     "+880 1711-000138", ["Sun", "Mon", "Wed", "Fri", "Sat"], "14:00 - 21:00",
     "Fairly new to the department. Mostly sinus surgery and allergy management.", 600, ["Bengali", "English"], "324"),
    ("Dr. Parveen Sultana", "ENT", "MBBS, D-ENT", 14, "parveen.sultana@moh-hospital.example",
     "+880 1711-000139", ["Sat", "Mon", "Tue", "Thu", "Fri"], "09:00 - 16:00",
     "Runs the paediatric hearing screening clinic.", 820, ["Bengali", "English"], "325"),
    ("Dr. Tariqul Islam", "ENT", "MBBS, MS (ENT)", 8, "tariqul.islam@moh-hospital.example",
     "+880 1711-000140", ["Sun", "Tue", "Wed", "Thu", "Sat"], "10:00 - 17:00",
     "Sees mostly sleep apnea and snoring referrals.", 680, ["Bengali", "English"], "326"),

    # --- Obs & Gynae (Floor 6, rooms 601-606) ---
    ("Dr. Farzana Rahman", "Obs & Gynae", "MBBS, FCPS (Gynae & Obs)", 15, "farzana.rahman@moh-hospital.example",
     "+880 1711-000108", ["Sat", "Sun", "Tue", "Wed", "Thu"], "09:00 - 17:00",
     "Handles the high-risk pregnancies and most of the gynaecological surgery.", 950, ["Bengali", "English"], "601"),
    ("Dr. Ismat Jahan", "Obs & Gynae", "MBBS, MS (Gynae & Obs)", 12, "ismat.jahan@moh-hospital.example",
     "+880 1711-000116", ["Sun", "Mon", "Wed", "Thu", "Fri"], "14:00 - 21:00",
     "Fertility care is her main focus, along with minimally invasive surgery.", 850, ["Bengali", "English"], "602"),
    ("Dr. Nazma Begum", "Obs & Gynae", "MBBS, FCPS (Gynae & Obs)", 16, "nazma.begum@moh-hospital.example",
     "+880 1711-000141", ["Sat", "Sun", "Mon", "Tue", "Thu"], "09:00 - 16:00",
     "Senior consultant. Gets called in for the complicated deliveries.", 1000, ["Bengali", "English"], "603"),
    ("Dr. Ruksana Akhter", "Obs & Gynae", "MBBS, MS (Gynae & Obs)", 9, "ruksana.akhter@moh-hospital.example",
     "+880 1711-000142", ["Sun", "Mon", "Tue", "Wed", "Fri"], "10:00 - 17:00",
     "Mostly routine antenatal and postnatal checkups.", 700, ["Bengali", "English"], "604"),
    ("Dr. Farida Yasmin", "Obs & Gynae", "MBBS, FCPS (Gynae & Obs)", 12, "farida.yasmin@moh-hospital.example",
     "+880 1711-000143", ["Sat", "Tue", "Wed", "Thu", "Fri"], "13:00 - 20:00",
     "Sees a lot of menopause and general reproductive health cases.", 780, ["Bengali", "English"], "605"),
    ("Dr. Shamima Nasrin", "Obs & Gynae", "MBBS, DGO", 7, "shamima.nasrin@moh-hospital.example",
     "+880 1711-000144", ["Sun", "Mon", "Thu", "Fri", "Sat"], "09:00 - 15:00",
     "Adolescent gynaecology and family planning make up most of her clinic.", 650, ["Bengali", "English"], "606"),

    # --- Medicine (Floor 1, rooms 101-106) ---
    ("Dr. Kamrul Hasan", "Medicine", "MBBS, MD (Internal Medicine)", 12, "kamrul.hasan@moh-hospital.example",
     "+880 1711-000109", ["Sun", "Mon", "Tue", "Wed", "Thu"], "08:00 - 15:00",
     "General physician. A lot of chronic disease follow-ups and routine checkups.", 500, ["Bengali", "English"], "101"),
    ("Dr. Ayesha Siddika", "Medicine", "MBBS, FCPS (Medicine)", 6, "ayesha.siddika@moh-hospital.example",
     "+880 1711-000110", ["Sat", "Mon", "Tue", "Thu", "Sat"], "13:00 - 20:00",
     "Diabetes management is her main focus, along with general adult care.", 450, ["Bengali", "English"], "102"),
    ("Dr. Mahbub Alam", "Medicine", "MBBS, MD (Medicine)", 11, "mahbub.alam@moh-hospital.example",
     "+880 1711-000145", ["Sun", "Mon", "Wed", "Thu", "Sat"], "09:00 - 16:00",
     "Sees mostly hypertension and thyroid patients.", 550, ["Bengali", "English"], "103"),
    ("Dr. Nasima Khatun", "Medicine", "MBBS, FCPS (Medicine)", 5, "nasima.khatun@moh-hospital.example",
     "+880 1711-000146", ["Sat", "Sun", "Tue", "Wed", "Fri"], "10:00 - 17:00",
     "A lot of her patients come in for anaemia or general women's health concerns.", 480, ["Bengali", "English"], "104"),
    ("Dr. Shamsul Alam", "Medicine", "MBBS, MD (Internal Medicine)", 20, "shamsul.alam@moh-hospital.example",
     "+880 1711-000147", ["Sun", "Mon", "Tue", "Thu", "Fri"], "08:00 - 14:00",
     "Most senior physician in the department. Usually gets the complicated multi-condition cases.", 750, ["Bengali", "English", "Hindi"], "105"),
    ("Dr. Ruma Aktar", "Medicine", "MBBS, MD (Medicine)", 8, "ruma.aktar@moh-hospital.example",
     "+880 1711-000148", ["Sat", "Mon", "Wed", "Thu", "Fri"], "14:00 - 21:00",
     "Runs the fever clinic, mostly infectious disease cases.", 520, ["Bengali", "English"], "106"),
    ("Dr. Golam Rabbani", "Medicine", "MBBS, MD (Medicine)", 14, "golam.rabbani@moh-hospital.example",
     "+880 1711-000149", ["Sun", "Mon", "Tue", "Wed", "Fri"], "09:00 - 16:00",
     "General physician, mostly long-term adult chronic care.", 600, ["Bengali", "English"], "107"),
    ("Dr. Rehana Begum", "Medicine", "MBBS, FCPS (Medicine)", 7, "rehana.begum@moh-hospital.example",
     "+880 1711-000150", ["Sat", "Sun", "Tue", "Thu", "Fri"], "13:00 - 20:00",
     "Metabolic disorders and general women's health, fairly steady caseload.", 500, ["Bengali", "English"], "108"),

    # --- A few departments run a larger roster than others, same as a real hospital ---
    ("Dr. Anowara Islam", "Paediatrics", "MBBS, DCH", 5, "anowara.islam@moh-hospital.example",
     "+880 1711-000151", ["Sun", "Mon", "Wed", "Thu", "Fri"], "10:00 - 17:00",
     "New to the team. Sees a lot of infant feeding issues and early development checkups.", 500, ["Bengali", "English"], "307"),
    ("Dr. Kamal Chowdhury", "Paediatrics", "MBBS, MD (Paediatrics)", 13, "kamal.chowdhury@moh-hospital.example",
     "+880 1711-000152", ["Sat", "Sun", "Mon", "Wed", "Sat"], "09:00 - 15:00",
     "Handles the tougher respiratory cases — recurring pneumonia, chronic cough, that sort of thing.", 780, ["Bengali", "English"], "308"),
    ("Dr. Sultana Yasmin", "Paediatrics", "MBBS, FCPS (Paediatrics)", 8, "sultana.yasmin@moh-hospital.example",
     "+880 1711-000153", ["Sun", "Tue", "Wed", "Thu", "Sat"], "14:00 - 20:00",
     "Mostly sees school-age kids and teenagers for routine checkups.", 650, ["Bengali", "English"], "309"),
    ("Dr. Belal Rahman", "Orthopaedics", "MBBS, D-Ortho", 10, "belal.rahman@moh-hospital.example",
     "+880 1711-000154", ["Sat", "Mon", "Tue", "Thu", "Fri"], "09:00 - 16:00",
     "Runs the arthroscopy list here, mostly knees and shoulders.", 750, ["Bengali", "English"], "407"),
    ("Dr. Farida Chowdhury", "Dermatology", "MBBS, DDV", 6, "farida.chowdhury@moh-hospital.example",
     "+880 1711-000155", ["Sun", "Mon", "Wed", "Fri", "Sat"], "10:00 - 17:00",
     "Hair loss and scalp conditions make up most of her clinic.", 600, ["Bengali", "English"], "227"),
    ("Dr. Iqbal Kabir", "Dermatology", "MBBS, MD (Dermatology)", 11, "iqbal.kabir@moh-hospital.example",
     "+880 1711-000156", ["Sat", "Sun", "Tue", "Wed", "Thu"], "09:00 - 15:00",
     "Runs the psoriasis clinic and manages a lot of eczema cases too.", 750, ["Bengali", "English"], "228"),
    ("Dr. Sabina Yasmin", "Dermatology", "MBBS, DDV", 4, "sabina.yasmin@moh-hospital.example",
     "+880 1711-000157", ["Sun", "Mon", "Tue", "Thu", "Fri"], "13:00 - 19:00",
     "Newest addition to dermatology. Mostly sees teenagers for acne and general skin care.", 480, ["Bengali", "English"], "229"),
    ("Dr. Rezwanul Haque", "Dermatology", "MBBS, MD (Dermatology)", 15, "rezwanul.haque@moh-hospital.example",
     "+880 1711-000158", ["Sat", "Mon", "Wed", "Thu", "Sat"], "10:00 - 18:00",
     "Senior dermatologist. Does most of the skin cancer screenings here.", 850, ["Bengali", "English", "Hindi"], "230"),
    ("Dr. Firoz Alam", "ENT", "MBBS, MS (ENT)", 9, "firoz.alam@moh-hospital.example",
     "+880 1711-000159", ["Sun", "Mon", "Tue", "Wed", "Thu"], "09:00 - 16:00",
     "Does most of the tonsil and adenoid surgeries here.", 700, ["Bengali", "English"], "327"),
    ("Dr. Nasreen Akhter", "ENT", "MBBS, D-ENT", 12, "nasreen.akhter@moh-hospital.example",
     "+880 1711-000160", ["Sat", "Sun", "Wed", "Thu", "Fri"], "14:00 - 21:00",
     "Balance disorders and vertigo cases mostly land with her.", 780, ["Bengali", "English"], "328"),
]

PATIENTS = [
    {
        "name": "Abdullah Al Mamun", "phone": "+880 1611-100201", "email": "abdullah.mamun@example.com",
        "dob": "1990-04-12", "gender": "Male", "blood_group": "B+", "address": "Mirpur-10, Dhaka",
        "avatar_initials": "AM",
        "medical_history": [
            {"date": "2026-05-14", "doctor": "Dr. Farhana Kabir", "specialty": "Cardiology",
             "diagnosis": "Hypertension, stage 1",
             "notes": "Prescribed lifestyle changes and low-dose medication. Follow-up in 3 months."},
            {"date": "2026-02-02", "doctor": "Dr. Kamrul Hasan", "specialty": "Medicine",
             "diagnosis": "Seasonal flu", "notes": "Rest and antivirals prescribed. Fully recovered."},
        ],
        "reports": [
            {"name": "ECG Report", "date": "2026-05-14", "type": "PDF"},
            {"name": "Lipid Profile", "date": "2026-05-14", "type": "PDF"},
        ],
    },
    {
        "name": "Nasrin Sultana", "phone": "+880 1611-100202", "email": "nasrin.sultana@example.com",
        "dob": "1985-11-02", "gender": "Female", "blood_group": "O+", "address": "Dhanmondi, Dhaka",
        "avatar_initials": "NS",
        "medical_history": [
            {"date": "2026-06-20", "doctor": "Dr. Farzana Rahman", "specialty": "Obs & Gynae",
             "diagnosis": "Routine antenatal checkup, 24 weeks",
             "notes": "Pregnancy progressing normally. Iron supplements continued."},
        ],
        "reports": [{"name": "Ultrasound Report", "date": "2026-06-20", "type": "PDF"}],
    },
    {
        "name": "Rakibul Islam", "phone": "+880 1611-100203", "email": "rakibul.islam@example.com",
        "dob": "2001-07-23", "gender": "Male", "blood_group": "A+", "address": "Uttara, Dhaka",
        "avatar_initials": "RI",
        "medical_history": [
            {"date": "2026-07-01", "doctor": "Dr. Shafiqul Islam", "specialty": "Orthopaedics",
             "diagnosis": "Sprained ankle (grade 2)",
             "notes": "Advised rest, ice, compression, elevation. Physiotherapy referral given."},
        ],
        "reports": [{"name": "X-Ray - Left Ankle", "date": "2026-07-01", "type": "Image"}],
    },
    {
        "name": "Tania Ferdous", "phone": "+880 1611-100204", "email": "tania.ferdous@example.com",
        "dob": "1995-01-30", "gender": "Female", "blood_group": "AB+", "address": "Banani, Dhaka",
        "avatar_initials": "TF",
        "medical_history": [],
        "reports": [],
    },
]

# 36 more patients on top of the 4 above, so there's a realistic volume of
# accounts to browse and log in as (40 total). Every entry shares the same
# demo password; medical_history/reports are only filled in for a subset,
# same as a real patient base where most people have thin records.
_EXTRA_PATIENTS = [
    ("Abdur Rahim", "Male"), ("Rahima Khatun", "Female"), ("Jamal Talukder", "Male"),
    ("Shirin Sultana", "Female"), ("Kamal Hossain", "Male"), ("Rupa Begum", "Female"),
    ("Alamgir Molla", "Male"), ("Dilara Yeasmin", "Female"), ("Kulsum Bibi", "Female"),
    ("Selim Reza", "Male"), ("Hosne Ara", "Female"), ("Jasim Sarkar", "Male"),
    ("Roksana Parvin", "Female"), ("Belal Mridha", "Male"), ("Firoza Khatun", "Female"),
    ("Nazrul Talukder", "Male"), ("Anowara Khatun", "Female"), ("Shahin Chowdhury", "Male"),
    ("Kamrun Nahar", "Female"), ("Habiba Sultana", "Female"), ("Mostafa Kamal", "Male"),
    ("Iqbal Hossain", "Male"), ("Rashida Begum", "Female"), ("Saiful Molla", "Male"),
    ("Monira Khatun", "Female"), ("Zakir Talukder", "Male"), ("Anwar Sheikh", "Male"),
    ("Sultana Razia", "Female"), ("Rezwan Chowdhury", "Male"), ("Nurjahan Begum", "Female"),
    ("Shahed Ali", "Male"), ("Marium Begum", "Female"), ("Kabir Sheikh", "Male"),
    ("Rehana Parvin", "Female"), ("Aziz Mia", "Male"), ("Halima Khatun", "Female"),
]

_DHAKA_AREAS = [
    "Mirpur", "Dhanmondi", "Uttara", "Banani", "Gulshan", "Mohammadpur", "Bashundhara",
    "Wari", "Jatrabari", "Badda", "Rampura", "Khilgaon", "Tejgaon", "Farmgate", "Malibagh",
]
_BLOOD_GROUPS = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"]

_REPORT_TYPES = [
    "Blood Test Report", "Chest X-Ray", "ECG Report", "Ultrasound Report",
    "Lipid Profile", "Thyroid Profile", "Urine Routine", "HbA1c Report",
    "Kidney Function Test", "Liver Function Test", "Bone Density Scan", "CT Scan Report",
]

# A doctor+specialty pool for generating plausible visit-history entries.
_HISTORY_DOCTORS = [
    ("Dr. Rezaul Karim", "Cardiology", "Palpitations on exertion", "ECG normal. Advised follow-up if symptoms recur."),
    ("Dr. Rowshan Ara", "Paediatrics", "Routine child wellness visit", "Growth on track. Next vaccination due in 2 months."),
    ("Dr. Emran Hossain", "Orthopaedics", "Lower back pain", "Advised physiotherapy and posture correction exercises."),
    ("Dr. Delwar Hossain", "Neuro Medicine", "Recurring migraine", "Prescribed preventive medication, follow-up in 6 weeks."),
    ("Dr. Momtaz Begum", "Dermatology", "Contact dermatitis", "Topical steroid prescribed, avoid known irritant."),
    ("Dr. Laila Yesmin", "ENT", "Chronic sinus congestion", "Prescribed nasal spray, review in 2 weeks."),
    ("Dr. Ruksana Akhter", "Obs & Gynae", "Routine gynaecological checkup", "All normal, advised annual screening."),
    ("Dr. Mahbub Alam", "Medicine", "Seasonal viral fever", "Rest and fluids advised. Fully recovered on review."),
]


def _generate_extra_patients():
    patients = []
    for i, (name, gender) in enumerate(_EXTRA_PATIENTS):
        initials = "".join(part[0] for part in name.split()[:2]).upper()
        birth_year = 1965 + (i * 3) % 55
        birth_month = 1 + (i * 7) % 12
        birth_day = 1 + (i * 11) % 28
        # Everyone who has been coming here a while has a few visits behind
        # them, not one. Long-standing patients build up thicker files.
        history = []
        visit_count = 2 + (i % 4)
        for v in range(visit_count):
            doctor, specialty, diagnosis, notes = _HISTORY_DOCTORS[(i + v * 3) % len(_HISTORY_DOCTORS)]
            history.append({
                "date": f"2026-{1 + ((i + v * 2) % 7):02d}-{1 + ((i + v * 5) % 27):02d}",
                "doctor": doctor, "specialty": specialty, "diagnosis": diagnosis, "notes": notes,
            })
        history.sort(key=lambda h: h["date"], reverse=True)

        reports = []
        for r in range(1 + (i % 3)):
            reports.append({
                "name": _REPORT_TYPES[(i + r * 4) % len(_REPORT_TYPES)],
                "date": f"2026-{1 + ((i + r) % 7):02d}-{1 + ((i + r * 3) % 27):02d}",
                "type": "PDF",
            })
        patients.append({
            "name": name,
            "phone": f"+880 1611-{100205 + i}",
            "email": name.lower().replace(".", "").replace(" ", ".") + "@example.com",
            "dob": f"{birth_year}-{birth_month:02d}-{birth_day:02d}",
            "gender": gender,
            "blood_group": _BLOOD_GROUPS[i % len(_BLOOD_GROUPS)],
            "address": f"{_DHAKA_AREAS[i % len(_DHAKA_AREAS)]}, Dhaka",
            "avatar_initials": initials,
            "mrn": f"MRN {55000 + i * 7}",
            "medical_history": history,
            "reports": reports,
        })
    return patients


PATIENTS += _generate_extra_patients()

# The four hand-written patients above predate the MRN field, so give them one too.
for _i, _p in enumerate(PATIENTS[:4]):
    _p["mrn"] = f"MRN {54100 + _i * 13}"

# A few extra accounts with tidy addresses, handy when demoing the three roles
# side by side without hunting through the 40-row patient list.
DEMO_PATIENTS = [
    {
        "name": "Imran Chowdhury", "phone": "+880 1611-100301", "email": "imran.chowdhury@example.com",
        "dob": "1988-09-17", "gender": "Male", "blood_group": "A+", "address": "Banani, Dhaka",
        "avatar_initials": "IC", "mrn": "MRN 56010",
        "medical_history": [
            {"date": "2026-06-11", "doctor": "Dr. Mahbub Alam", "specialty": "Medicine",
             "diagnosis": "Type 2 diabetes, newly diagnosed",
             "notes": "Started on metformin. Diet counselling done. Repeat HbA1c in 3 months."},
            {"date": "2026-03-04", "doctor": "Dr. Nasrin Akhter", "specialty": "Cardiology",
             "diagnosis": "Borderline hypertension",
             "notes": "No medication yet. Advised salt reduction and daily walking."},
            {"date": "2025-11-22", "doctor": "Dr. Laila Yesmin", "specialty": "ENT",
             "diagnosis": "Allergic rhinitis", "notes": "Seasonal. Antihistamine as needed."},
        ],
        "reports": [
            {"name": "HbA1c Report", "date": "2026-06-11", "type": "PDF"},
            {"name": "Lipid Profile", "date": "2026-06-11", "type": "PDF"},
            {"name": "ECG Report", "date": "2026-03-04", "type": "PDF"},
        ],
    },
    {
        "name": "Sadia Rahman", "phone": "+880 1611-100302", "email": "sadia.rahman@example.com",
        "dob": "1996-02-08", "gender": "Female", "blood_group": "B+", "address": "Uttara, Dhaka",
        "avatar_initials": "SR", "mrn": "MRN 56011",
        "medical_history": [
            {"date": "2026-07-02", "doctor": "Dr. Momtaz Begum", "specialty": "Dermatology",
             "diagnosis": "Eczema flare on both hands",
             "notes": "Topical steroid for 2 weeks. Avoid detergent contact, use gloves."},
            {"date": "2026-01-19", "doctor": "Dr. Ruksana Akhter", "specialty": "Obs & Gynae",
             "diagnosis": "Routine screening", "notes": "All results normal. Review next year."},
        ],
        "reports": [
            {"name": "Blood Test Report", "date": "2026-07-02", "type": "PDF"},
            {"name": "Thyroid Profile", "date": "2026-01-19", "type": "PDF"},
        ],
    },
    {
        "name": "Anwar Hossain Khan", "phone": "+880 1611-100303", "email": "anwar.khan@example.com",
        "dob": "1959-05-30", "gender": "Male", "blood_group": "O+", "address": "Mohammadpur, Dhaka",
        "avatar_initials": "AK", "mrn": "MRN 56012",
        "medical_history": [
            {"date": "2026-07-15", "doctor": "Dr. Aminul Islam", "specialty": "Orthopaedics",
             "diagnosis": "Osteoarthritis, right knee",
             "notes": "Grade 2 on X-ray. Physiotherapy started, replacement discussed for later."},
            {"date": "2026-05-08", "doctor": "Dr. Mizanur Rahman", "specialty": "Cardiology",
             "diagnosis": "Stable angina", "notes": "Echo shows preserved function. Continue current medication."},
            {"date": "2026-02-14", "doctor": "Dr. Shamsul Alam", "specialty": "Medicine",
             "diagnosis": "Annual review — diabetes and BP",
             "notes": "Both reasonably controlled. Kidney function stable."},
            {"date": "2025-10-03", "doctor": "Dr. Delwar Hossain", "specialty": "Neuro Medicine",
             "diagnosis": "Peripheral neuropathy", "notes": "Diabetes-related. Started on gabapentin."},
        ],
        "reports": [
            {"name": "Knee X-Ray", "date": "2026-07-15", "type": "PDF"},
            {"name": "Echocardiogram", "date": "2026-05-08", "type": "PDF"},
            {"name": "Kidney Function Test", "date": "2026-02-14", "type": "PDF"},
            {"name": "HbA1c Report", "date": "2026-02-14", "type": "PDF"},
        ],
    },
]
PATIENTS += DEMO_PATIENTS

# Three more consultants, one each in the busiest departments.
DOCTORS += [
    ("Dr. Sabbir Ahmed", "Medicine", "MBBS, MD (Internal Medicine)", 10, "sabbir.ahmed@moh-hospital.example",
     "+880 1711-000161", ["Sun", "Mon", "Tue", "Wed", "Thu"], "09:00 - 16:00",
     "Splits his week between the general clinic and the diabetes follow-up list.", 580, ["Bengali", "English"], "109"),
    ("Dr. Ruhul Amin", "Cardiology", "MBBS, MD (Cardiology)", 12, "ruhul.amin@moh-hospital.example",
     "+880 1711-000162", ["Sat", "Sun", "Tue", "Thu", "Fri"], "10:00 - 18:00",
     "Took over the hypertension clinic last year. Sees a lot of first-time referrals.", 780, ["Bengali", "English"], "207"),
    ("Dr. Sharmin Akter", "Obs & Gynae", "MBBS, FCPS (Gynae & Obs)", 8, "sharmin.akter@moh-hospital.example",
     "+880 1711-000163", ["Sun", "Mon", "Wed", "Thu", "Sat"], "09:00 - 15:00",
     "Mostly antenatal clinics, with a half-day of general gynae consults on Thursdays.", 720, ["Bengali", "English"], "607"),
]

# 39 more admin accounts on top of the original one (40 total), spread
# across the departments that actually run a hospital's back office.
_EXTRA_ADMINS = [
    ("Md. Nurul Islam", "IT Support"), ("Shahida Akter", "Patient Records"),
    ("Kazi Mahmud Hasan", "Billing & Finance"), ("Farhana Yesmin", "Human Resources"),
    ("Golam Rasul", "Operations"), ("Rina Akter", "Front Desk"),
    ("Shamsuddin Ahmed", "Compliance"), ("Naznin Sultana", "Facilities"),
    ("Aftab Uddin", "IT Support"), ("Ruma Begum", "Patient Records"),
    ("Wahidul Islam", "Billing & Finance"), ("Tasnim Jahan", "Human Resources"),
    ("Manzur Alam", "Operations"), ("Shathi Akter", "Front Desk"),
    ("Rafiqul Bari", "Compliance"), ("Nurun Nahar", "Facilities"),
    ("Ekramul Haque", "IT Support"), ("Josna Begum", "Patient Records"),
    ("Badrul Alam", "Billing & Finance"), ("Parul Akter", "Human Resources"),
    ("Moshiur Rahman", "Operations"), ("Lutfun Nahar", "Front Desk"),
    ("Shafiqur Rahman Bhuiyan", "Compliance"), ("Kohinur Akter", "Facilities"),
    ("Ziaul Haque", "IT Support"), ("Selina Akter", "Patient Records"),
    ("Nasir Uddin Molla", "Billing & Finance"), ("Rowshan Jahan", "Human Resources"),
    ("Abul Kalam Azad", "Operations"), ("Munira Sultana", "Front Desk"),
    ("Harun Or Rashid", "Compliance"), ("Ayesha Khanam", "Facilities"),
    ("Faruk Ahmed", "IT Support"), ("Nasreen Sultana", "Patient Records"),
    ("Shakhawat Hossain", "Billing & Finance"), ("Shirin Nahar", "Human Resources"),
    ("Golam Kibria", "Operations"), ("Rehena Akter", "Front Desk"),
    ("Aminul Haque Bhuiyan", "Compliance"),
]


def _generate_extra_admins():
    admins = []
    for i, (name, department) in enumerate(_EXTRA_ADMINS):
        initials = "".join(part[0] for part in name.split()[:2]).upper()
        join_year = 2021 + (i % 5)
        join_month = 1 + (i * 5) % 12
        role = "Super Admin" if i % 12 == 0 else "Admin"
        admins.append({
            "name": name,
            "email": name.lower().replace(".", "").replace(" ", ".") + "@moh-hospital.example",
            "role": role,
            "avatar_initials": initials,
            "phone": f"+880 1811-{100000 + i * 3}",
            "department": department,
            "join_date": f"{join_year}-{join_month:02d}-01",
        })
    return admins


DEMO_ADMINS = [
    {"name": "Tanvir Alam", "email": "tanvir.alam@moh-hospital.example", "role": "Super Admin",
     "avatar_initials": "TA", "phone": "+880 1811-200001", "department": "Operations",
     "join_date": "2019-06-01"},
    {"name": "Mehnaz Karim", "email": "mehnaz.karim@moh-hospital.example", "role": "Admin",
     "avatar_initials": "MK", "phone": "+880 1811-200002", "department": "Patient Records",
     "join_date": "2022-02-15"},
    {"name": "Sohel Rana", "email": "sohel.rana@moh-hospital.example", "role": "Admin",
     "avatar_initials": "SR", "phone": "+880 1811-200003", "department": "Front Desk",
     "join_date": "2023-09-04"},
]

PACKAGES = [
    {"name": "Executive Health Checkup", "price": 4500,
     "tests": ["CBC", "Lipid Profile", "Liver Function Test", "ECG", "Chest X-Ray"],
     "description": "Covers the basics most working professionals need once a year — blood work, liver function, a chest X-ray, and an ECG."},
    {"name": "Cardiac Screening Package", "price": 6000,
     "tests": ["ECG", "Echocardiogram", "Lipid Profile", "Cardiologist Consultation"],
     "description": "If heart disease runs in your family or you just want to check where you stand, this covers the main things — ECG, echo, lipid profile, and a sit-down with a cardiologist."},
    {"name": "Women's Wellness Package", "price": 5200,
     "tests": ["CBC", "Thyroid Profile", "Pap Smear", "Ultrasound (Pelvis)", "Gynae Consultation"],
     "description": "Thyroid, pap smear, pelvic ultrasound, and a gynae consultation in one visit instead of five separate appointments."},
    {"name": "Senior Citizen Package", "price": 5800,
     "tests": ["CBC", "Blood Sugar (Fasting & PP)", "Kidney Function Test", "ECG", "Bone Density Scan"],
     "description": "Built around what tends to come up after 60 — kidney function, bone density, blood sugar, the usual."},
    {"name": "Diabetes Screening Package", "price": 2800,
     "tests": ["Fasting Blood Sugar", "HbA1c", "Lipid Profile", "Kidney Function Test"],
     "description": "For anyone who wants to know their blood sugar numbers before it turns into a bigger problem."},
    {"name": "Basic Full Body Checkup", "price": 2200,
     "tests": ["CBC", "Blood Sugar (Random)", "Urine Routine", "Chest X-Ray"],
     "description": "The cheapest option here. A general baseline checkup without paying for anything you don't need."},
]

# How much demand each specialty tends to see day-to-day — general medicine
# and cardiology run busier than, say, dermatology in most hospitals.
_SPECIALTY_DEMAND = {
    "Medicine": 0.80, "Cardiology": 0.65, "Obs & Gynae": 0.60, "Paediatrics": 0.55,
    "Orthopaedics": 0.45, "Neuro Medicine": 0.40, "ENT": 0.32, "Dermatology": 0.28,
}
_QUEUE_DEPTH_CHOICES = [1, 2, 3, 4, 5, 6, 7, 8]
_QUEUE_DEPTH_WEIGHTS = [22, 22, 18, 14, 10, 7, 4, 3]
_WALK_IN_NAMES = ["Walk-in Patient", "Walk-in Visitor", "Golam Mostofa", "Rina Begum", "Nazrul Sarkar"]

# What people actually write on the slip when they book, per department.
_VISIT_REASONS = {
    "Cardiology": ["Chest pain — needs urgent review", "Follow-up — hypertension management",
                   "ECG review & consult", "Palpitations, new consult", "Post-op follow-up",
                   "Routine check-up"],
    "Paediatrics": ["Fever for 3 days", "Vaccination due", "Routine growth check",
                    "Persistent cough", "Rash — needs review", "Feeding difficulty"],
    "Orthopaedics": ["Knee pain — worsening", "Post-fracture follow-up", "Back pain review",
                     "Shoulder injury", "Cast removal", "Physiotherapy referral"],
    "Neuro Medicine": ["Recurring headaches", "Seizure follow-up", "Numbness in left arm",
                       "Post-stroke review", "Dizziness & balance issues", "Medication review"],
    "Dermatology": ["Persistent rash", "Acne consultation", "Hair fall — 6 months",
                    "Mole check", "Eczema flare-up", "Follow-up on prescription"],
    "ENT": ["Ear pain & discharge", "Sore throat — 2 weeks", "Hearing test follow-up",
            "Sinus congestion", "Snoring / sleep issues", "Tonsil review"],
    "Obs & Gynae": ["Antenatal check-up", "Irregular cycles", "Post-natal follow-up",
                    "Ultrasound review", "Family planning consult", "Routine screening"],
    "Medicine": ["Fever & body ache", "Diabetes follow-up", "Blood pressure check",
                 "Stomach pain", "General check-up", "Report review"],
}


def _has_patients_today(rng, specialty_name):
    """Busier departments see patients more often. Each doctor also gets a
    personal nudge, so two cardiologists don't have identical days."""
    demand = _SPECIALTY_DEMAND.get(specialty_name, 0.4)
    personal_pace = rng.uniform(0.7, 1.3)
    return rng.random() < min(demand * personal_pace, 0.95)


def _todays_statuses(rng):
    """One entry per token this doctor has today, in the order they were seen:
    a few already finished, maybe one patient in the room now, then the queue
    still waiting."""
    statuses = ["completed"] * rng.randint(2, 9)

    queue_length = rng.choices(_QUEUE_DEPTH_CHOICES, weights=_QUEUE_DEPTH_WEIGHTS)[0]
    if rng.random() < 0.55:
        statuses.append("in-consultation")
        queue_length -= 1
    if queue_length > 0:
        statuses.append("called")
        queue_length -= 1
    statuses.extend(["waiting"] * max(queue_length, 0))

    return statuses


def _pick_token_type(rng):
    roll = rng.random()
    if roll < 0.08:
        return "emergency"
    if roll < 0.18:
        return "walk-in"
    return "regular"


def _pick_patient(rng, free_patients, status):
    """Returns (patient_id, patient_name). Walk-ins and some visitors have no
    account — they just give a name at the desk, so patient_id is None.

    A patient who is still waiting or in the room can't also be queued for
    another doctor, so they get taken off the list. Someone whose visit has
    already finished is free to appear elsewhere."""
    if not free_patients or rng.random() < 0.15:
        return None, rng.choice(_WALK_IN_NAMES)
    if status == "completed":
        return rng.choice(free_patients)
    return free_patients.pop()


def _visit_day(token):
    """The day the patient is actually seen, which isn't always the day they
    booked — someone can book tonight for tomorrow morning. Check-in time is
    the better signal when we have it."""
    stamp = token.get("checked_in_at") or token["booked_at"]
    return stamp[:10]


def _generate_live_queue(doctor_records, patient_records, rng_seed=2026):
    """Builds today's queue across all doctors, so the app opens on a hospital
    mid-morning rather than an empty one. Some doctors are busy, some are
    idle, and queue depth varies by department.

    doctor_records: (doctor_id, specialty_name) tuples
    patient_records: (patient_id, patient_name) tuples
    """
    rng = random.Random(rng_seed)

    # Patients still available to be put in a queue. Handing them out from one
    # shared list is what stops the same person appearing in two queues.
    free_patients = list(patient_records)
    rng.shuffle(free_patients)

    tokens = []

    for doctor_id, specialty_name in doctor_records:
        if not _has_patients_today(rng, specialty_name):
            continue

        reasons = _VISIT_REASONS.get(specialty_name, ["General consultation"])

        for position, status in enumerate(_todays_statuses(rng)):
            token_type = _pick_token_type(rng)
            if token_type == "walk-in":
                patient_id, patient_name = None, rng.choice(_WALK_IN_NAMES)
            else:
                patient_id, patient_name = _pick_patient(rng, free_patients, status)

            # Roughly two patients an hour from 9am, which keeps the timestamps
            # believable without needing a real scheduler.
            hour = 9 + position // 2
            minute = (position * 17) % 60
            booked_at = f"{TODAY}T{hour:02d}:{minute:02d}:00"

            tokens.append({
                "doctor_id": doctor_id,
                "patient_id": patient_id,
                "patient_name": patient_name,
                "type": token_type,
                "status": status,
                "booked_at": booked_at,
                "slot_time": f"{hour:02d}:{(minute + 15) % 60:02d}",
                "reason": rng.choice(reasons),
                "checked_in_at": booked_at,
            })

    return tokens


async def main():
    print("Wiping existing collections...")
    for col in (specialties_col, doctors_col, patients_col, admins_col, packages_col, tokens_col, notifications_col):
        await col.delete_many({})

    print("Inserting specialties...")
    specialty_result = await specialties_col.insert_many(SPECIALTIES)
    specialty_ids = {s["name"]: str(_id) for s, _id in zip(SPECIALTIES, specialty_result.inserted_ids)}

    print("Inserting doctors...")
    doctor_docs = []
    for name, specialty_name, quals, years, email, phone, days, hours, bio, fee, languages, room in DOCTORS:
        doctor_docs.append({
            "name": name,
            "specialty_id": specialty_ids[specialty_name],
            "qualifications": quals,
            "experience_years": years,
            "email": email,
            "phone": phone,
            "password_hash": hash_password(DOCTOR_DEMO_PASSWORD),
            "working_days": days,
            "working_hours": hours,
            "daily_token_limit": 40,
            "emergency_cap": 8,
            "walk_in_slots": 5,
            "status": "active",
            "bio": bio,
            "consultation_fee": fee,
            "languages": languages,
            "room_number": room,
            "queue_paused": False,
        })
    doctor_result = await doctors_col.insert_many(doctor_docs)
    doctor_ids = {d["name"]: str(_id) for d, _id in zip(doctor_docs, doctor_result.inserted_ids)}

    print("Inserting patients...")
    patient_docs = []
    for p in PATIENTS:
        patient_docs.append({**p, "password_hash": hash_password(PATIENT_DEMO_PASSWORD)})
    patient_result = await patients_col.insert_many(patient_docs)
    patient_ids = {p["name"]: str(_id) for p, _id in zip(patient_docs, patient_result.inserted_ids)}

    print("Inserting admin accounts...")
    admin_docs = [{
        "name": "Md. Habibur Rahman",
        "email": "admin@moh-hospital.example",
        "password_hash": hash_password(ADMIN_DEMO_PASSWORD),
        "role": "Super Admin",
        "avatar_initials": "HR",
        "phone": "+880 1811-000001",
        "department": "Operations",
        "join_date": "2020-01-01",
    }]
    for a in _generate_extra_admins() + DEMO_ADMINS:
        admin_docs.append({**a, "password_hash": hash_password(ADMIN_DEMO_PASSWORD)})
    await admins_col.insert_many(admin_docs)

    print("Inserting health packages...")
    await packages_col.insert_many(PACKAGES)

    print("Inserting sample queue tokens...")
    farhana_id = doctor_ids["Dr. Farhana Kabir"]
    nusrat_id = doctor_ids["Dr. Nusrat Jahan"]
    sample_tokens = [
        {"doctor_id": farhana_id, "patient_id": patient_ids["Abdullah Al Mamun"],
         "patient_name": "Abdullah Al Mamun", "type": "regular", "status": "in-consultation",
         "booked_at": f"{TODAY}T08:10:00", "slot_time": "09:20",
         "reason": "Follow-up — hypertension management", "checked_in_at": f"{TODAY}T09:12:00"},
        {"doctor_id": farhana_id, "patient_id": patient_ids["Rakibul Islam"],
         "patient_name": "Rakibul Islam", "type": "emergency", "status": "waiting",
         "booked_at": f"{TODAY}T09:05:00", "slot_time": "09:40",
         "reason": "Chest pain — needs urgent review", "checked_in_at": f"{TODAY}T09:30:00"},
        {"doctor_id": farhana_id, "patient_id": None,
         "patient_name": "Golam Mostofa", "type": "walk-in", "status": "waiting",
         "booked_at": f"{TODAY}T09:15:00", "slot_time": "09:45",
         "reason": "Palpitations, new consult", "checked_in_at": f"{TODAY}T09:40:00"},
        # Booked the night before for a morning slot — the wait clock still
        # starts when they physically check in, not when they booked.
        {"doctor_id": farhana_id, "patient_id": patient_ids["Tania Ferdous"],
         "patient_name": "Tania Ferdous", "type": "regular", "status": "waiting",
         "booked_at": f"{YESTERDAY}T18:30:00", "slot_time": "10:00",
         "reason": "ECG review & consult", "checked_in_at": f"{TODAY}T09:55:00"},
        {"doctor_id": nusrat_id, "patient_id": patient_ids["Nasrin Sultana"],
         "patient_name": "Nasrin Sultana", "type": "regular", "status": "completed",
         "booked_at": f"{TODAY}T08:00:00", "slot_time": "08:30",
         "reason": "Routine child wellness visit", "checked_in_at": f"{TODAY}T08:20:00"},
    ]

    # Farhana and Nusrat sit outside the generated queue, so give them the
    # morning's finished consultations too — otherwise their "seen today"
    # counter reads zero while they're mid-consultation.
    _morning_done = [
        (farhana_id, "Kamal Uddin", "Post-op follow-up", "08:00"),
        (farhana_id, "Rowshan Ara Begum", "Routine check-up", "08:20"),
        (farhana_id, "Jahangir Alam", "Follow-up — hypertension management", "08:40"),
        (nusrat_id, "Sumaiya Akter", "Vaccination due", "08:45"),
        (nusrat_id, "Rafi Ahmed", "Fever for 3 days", "09:05"),
    ]
    for _n, (_doc_id, _name, _reason, _slot) in enumerate(_morning_done):
        sample_tokens.append({
            "doctor_id": _doc_id, "patient_id": None,
            "patient_name": _name, "type": "regular", "status": "completed",
            "booked_at": f"{TODAY}T07:{30 + _n:02d}:00", "slot_time": _slot,
            "reason": _reason, "checked_in_at": f"{TODAY}T07:{45 + _n:02d}:00",
        })

    # Every entry in a patient's medical history was a real visit once, so give
    # each one a matching completed token. Without this the four hand-written
    # patients show "0 visits" on their dashboard while listing past diagnoses.
    for patient in PATIENTS[:4]:
        for entry in patient.get("medical_history", []):
            doctor_id = doctor_ids.get(entry["doctor"])
            if not doctor_id:
                continue
            sample_tokens.append({
                "doctor_id": doctor_id,
                "patient_id": patient_ids[patient["name"]],
                "patient_name": patient["name"],
                "type": "regular",
                "status": "completed",
                "booked_at": f"{entry['date']}T09:00:00",
                "slot_time": "09:30",
                "reason": entry["diagnosis"],
                "checked_in_at": f"{entry['date']}T09:00:00",
            })

    # A spread of past bookings across the extra patients, covering every
    # status (including skipped/no-show) so booking history has real depth.
    extra_patient_names = [name for name, _ in _EXTRA_PATIENTS]
    booking_statuses = ["completed", "completed", "cancelled", "skipped", "no-show", "waiting"]
    doctor_id_list = list(doctor_ids.values())
    for i, patient_name in enumerate(extra_patient_names[:24]):
        status = booking_statuses[i % len(booking_statuses)]
        doctor_id = doctor_id_list[i % len(doctor_id_list)]
        sample_tokens.append({
            "doctor_id": doctor_id,
            "patient_id": patient_ids[patient_name],
            "patient_name": patient_name,
            "type": "regular",
            "status": status,
            "booked_at": f"2026-{1 + (i % 7):02d}-{1 + (i % 27):02d}T{9 + (i % 8):02d}:00:00",
            "slot_time": f"{9 + (i % 8):02d}:30",
        })

    print("Generating today's live queue across doctors...")
    # Farhana Kabir and Nusrat Jahan already have their own hand-placed
    # tokens above (including an in-consultation one for Farhana) — skip
    # them here so a doctor never ends up "in consultation" with two
    # patients at once.
    already_seeded_doctors = {"Dr. Farhana Kabir", "Dr. Nusrat Jahan"}
    doctor_specialty_pairs = [
        (doctor_ids[name], specialty_name)
        for name, specialty_name, *_rest in DOCTORS
        if name not in already_seeded_doctors
    ]
    # Patients already sitting in a hand-placed queue above must not be handed
    # a second token by the generator.
    active_statuses = {"waiting", "called", "in-consultation"}
    busy_patient_ids = {
        t["patient_id"] for t in sample_tokens
        if t["patient_id"] and t["status"] in active_statuses
    }
    patient_records = [
        (pid, name) for name, pid in patient_ids.items() if pid not in busy_patient_ids
    ]
    live_queue_tokens = _generate_live_queue(doctor_specialty_pairs, patient_records)
    sample_tokens.extend(live_queue_tokens)
    busy_doctors = len({t["doctor_id"] for t in live_queue_tokens})
    print(f"  {len(live_queue_tokens)} live tokens across {busy_doctors} of {len(doctor_ids)} doctors "
          f"({len(doctor_ids) - busy_doctors} quiet today).")

    # One numbering rule for every token above, whether it was hand-written or
    # generated: each doctor numbers their own patients from T-001 each day, in
    # slot order. This is the same rule _next_token_number applies in
    # app/routers/tokens.py when a real booking comes in, so seeded and
    # live-booked tokens look identical. Two doctors both having a T-001 is
    # expected — the number is only unique within one doctor's day.
    day_sequence = {}
    for token in sorted(sample_tokens, key=lambda t: (_visit_day(t), t["slot_time"])):
        key = (token["doctor_id"], _visit_day(token))
        day_sequence[key] = day_sequence.get(key, 0) + 1
        token["token_number"] = f"T-{day_sequence[key]:03d}"

    # The queue screens show "waiting 12 min", counted from check-in. Seeding a
    # fixed 09:00 check-in means running this in the evening shows people who
    # have apparently been waiting 800 minutes, so anchor anyone still in a
    # queue to the current clock instead. Finished visits keep their real times.
    still_waiting = {"waiting", "called", "in-consultation"}
    now = datetime.now(timezone.utc)
    waiting_rng = random.Random(7)
    for token in sample_tokens:
        if token["status"] in still_waiting:
            minutes_ago = waiting_rng.randint(3, 55)
            token["checked_in_at"] = (now - timedelta(minutes=minutes_ago)).isoformat()

    await tokens_col.insert_many(sample_tokens)

    print("Inserting starter notifications...")
    await notifications_col.insert_many([
        {"role": "patient", "profile_id": patient_ids["Abdullah Al Mamun"], "title": "Token confirmed",
         "body": "Your token A-014 with Dr. Farhana Kabir is confirmed for today.",
         "time": f"{TODAY}T08:10:00", "read": False},
        {"role": "doctor", "profile_id": farhana_id, "title": "Emergency token added",
         "body": "An emergency token (A-015) was added to your queue.",
         "time": f"{TODAY}T09:05:00", "read": False},
    ])

    print(f"Done. {len(doctor_ids)} doctors, {len(patient_ids)} patients, "
          f"{len(SPECIALTIES)} specialties, {len(PACKAGES)} packages, {len(admin_docs)} admins, "
          f"{len(sample_tokens)} sample tokens loaded.")
    print(f"\nDemo logins (any account below works — every account in a role shares the same password):")
    print(f"  Patient -> abdullah.mamun@example.com / {PATIENT_DEMO_PASSWORD}")
    print(f"  Doctor  -> farhana.kabir@moh-hospital.example / {DOCTOR_DEMO_PASSWORD}")
    print(f"  Admin   -> admin@moh-hospital.example / {ADMIN_DEMO_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(main())
