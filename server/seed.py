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

DOCTOR_DEMO_PASSWORD = "doctor123"
PATIENT_DEMO_PASSWORD = "password123"
ADMIN_DEMO_PASSWORD = "admin123"

# Each entry: name, specialty, qualifications, experience_years, email, phone,
# working_days, working_hours, bio, consultation_fee, languages, room_number.
# 6 doctors per specialty (48 total).
DOCTORS = [
    # --- Cardiology (Floor 2, rooms 201-206) ---
    ("Dr. Farhana Kabir", "Cardiology", "MBBS, FCPS (Cardiology)", 14, "farhana.kabir@moh-hospital.example",
     "+880 1711-000101", ["Sun", "Mon", "Tue", "Wed", "Thu"], "09:00 - 17:00",
     "Interventional cardiologist with a focus on preventive heart care.", 900, ["Bengali", "English"], "201"),
    ("Dr. Rezaul Karim", "Cardiology", "MBBS, MD (Cardiology)", 9, "rezaul.karim@moh-hospital.example",
     "+880 1711-000102", ["Sun", "Tue", "Wed", "Thu", "Sat"], "10:00 - 18:00",
     "Specializes in arrhythmia management and cardiac rehabilitation.", 700, ["Bengali", "English"], "202"),
    ("Dr. Mizanur Rahman", "Cardiology", "MBBS, MD (Cardiology)", 16, "mizanur.rahman@moh-hospital.example",
     "+880 1711-000117", ["Sat", "Sun", "Mon", "Wed", "Thu"], "08:00 - 15:00",
     "Focuses on heart failure management and echocardiography.", 950, ["Bengali", "English", "Hindi"], "203"),
    ("Dr. Shahriar Kabir", "Cardiology", "MBBS, FCPS (Cardiology)", 5, "shahriar.kabir@moh-hospital.example",
     "+880 1711-000118", ["Sun", "Mon", "Tue", "Thu", "Fri"], "14:00 - 21:00",
     "Focuses on young-adult cardiac risk screening.", 600, ["Bengali", "English"], "204"),
    ("Dr. Nasrin Akhter", "Cardiology", "MBBS, MD (Cardiology)", 8, "nasrin.akhter@moh-hospital.example",
     "+880 1711-000119", ["Sat", "Mon", "Tue", "Wed", "Fri"], "09:00 - 16:00",
     "Specializes in women's cardiac health and hypertension.", 680, ["Bengali", "English"], "205"),
    ("Dr. Zahid Hasan", "Cardiology", "MBBS, MS (Cardiac Surgery)", 20, "zahid.hasan@moh-hospital.example",
     "+880 1711-000120", ["Sun", "Tue", "Wed", "Thu", "Sat"], "10:00 - 17:00",
     "Cardiac surgeon specializing in bypass and valve procedures.", 1200, ["Bengali", "English", "Hindi"], "206"),

    # --- Paediatrics (Floor 3, rooms 301-306) ---
    ("Dr. Nusrat Jahan", "Paediatrics", "MBBS, DCH", 11, "nusrat.jahan@moh-hospital.example",
     "+880 1711-000103", ["Sat", "Sun", "Mon", "Tue", "Wed"], "09:00 - 16:00",
     "Child health specialist covering newborn to adolescent care.", 700, ["Bengali", "English"], "301"),
    ("Dr. Mahfuza Akter", "Paediatrics", "MBBS, MD (Paediatrics)", 9, "mahfuza.akter@moh-hospital.example",
     "+880 1711-000111", ["Sat", "Mon", "Tue", "Wed", "Thu"], "10:00 - 17:00",
     "Focuses on childhood vaccination schedules and nutrition.", 650, ["Bengali", "English"], "302"),
    ("Dr. Rowshan Ara", "Paediatrics", "MBBS, DCH", 14, "rowshan.ara@moh-hospital.example",
     "+880 1711-000121", ["Sun", "Mon", "Wed", "Thu", "Fri"], "09:00 - 15:00",
     "Manages asthma, allergies, and growth concerns in children.", 800, ["Bengali", "English"], "303"),
    ("Dr. Faisal Islam", "Paediatrics", "MBBS, MD (Paediatrics)", 6, "faisal.islam@moh-hospital.example",
     "+880 1711-000122", ["Sat", "Sun", "Tue", "Thu", "Fri"], "13:00 - 20:00",
     "Focuses on newborn care and paediatric emergencies.", 550, ["Bengali", "English"], "304"),
    ("Dr. Tahmina Sultana", "Paediatrics", "MBBS, FCPS (Paediatrics)", 10, "tahmina.sultana@moh-hospital.example",
     "+880 1711-000123", ["Sun", "Mon", "Tue", "Wed", "Sat"], "08:00 - 14:00",
     "Specializes in developmental paediatrics.", 720, ["Bengali", "English"], "305"),
    ("Dr. Habibur Rahman", "Paediatrics", "MBBS, DCH", 18, "habibur.rahman@moh-hospital.example",
     "+880 1711-000124", ["Mon", "Tue", "Wed", "Thu", "Sat"], "10:00 - 18:00",
     "Senior paediatrician focused on chronic childhood illness.", 950, ["Bengali", "English", "Hindi"], "306"),

    # --- Orthopaedics (Floor 4, rooms 401-406) ---
    ("Dr. Shafiqul Islam", "Orthopaedics", "MBBS, MS (Orthopaedics)", 17, "shafiqul.islam@moh-hospital.example",
     "+880 1711-000104", ["Sun", "Mon", "Wed", "Thu", "Sat"], "09:00 - 17:00",
     "Joint replacement and trauma surgery specialist.", 1000, ["Bengali", "English"], "401"),
    ("Dr. Rafiqul Alam", "Orthopaedics", "MBBS, D-Ortho", 11, "rafiqul.alam@moh-hospital.example",
     "+880 1711-000112", ["Sat", "Sun", "Tue", "Thu", "Fri"], "13:00 - 20:00",
     "Specializes in sports injuries and spine care.", 750, ["Bengali", "English"], "402"),
    ("Dr. Emran Hossain", "Orthopaedics", "MBBS, MS (Orthopaedics)", 9, "emran.hossain@moh-hospital.example",
     "+880 1711-000125", ["Sun", "Mon", "Tue", "Wed", "Fri"], "09:00 - 16:00",
     "Focuses on fracture care and arthroscopy.", 700, ["Bengali", "English"], "403"),
    ("Dr. Kohinoor Begum", "Orthopaedics", "MBBS, D-Ortho", 7, "kohinoor.begum@moh-hospital.example",
     "+880 1711-000126", ["Sat", "Mon", "Wed", "Thu", "Sat"], "10:00 - 17:00",
     "Specializes in paediatric orthopaedic conditions.", 650, ["Bengali", "English"], "404"),
    ("Dr. Aminul Islam", "Orthopaedics", "MBBS, MS (Orthopaedics)", 15, "aminul.islam@moh-hospital.example",
     "+880 1711-000127", ["Sun", "Tue", "Wed", "Thu", "Sat"], "08:00 - 15:00",
     "Specializes in hip and knee replacement.", 900, ["Bengali", "English"], "405"),
    ("Dr. Sazzad Karim", "Orthopaedics", "MBBS, D-Ortho", 4, "sazzad.karim@moh-hospital.example",
     "+880 1711-000128", ["Mon", "Tue", "Thu", "Fri", "Sat"], "14:00 - 21:00",
     "Focuses on general trauma and casting.", 500, ["Bengali", "English"], "406"),

    # --- Neuro Medicine (Floor 5, rooms 501-506) ---
    ("Dr. Tanvir Ahmed", "Neuro Medicine", "MBBS, MD (Neurology)", 13, "tanvir.ahmed@moh-hospital.example",
     "+880 1711-000105", ["Sun", "Mon", "Tue", "Thu", "Sat"], "10:00 - 17:00",
     "Focuses on stroke care, epilepsy, and movement disorders.", 950, ["Bengali", "English"], "501"),
    ("Dr. Salma Chowdhury", "Neuro Medicine", "MBBS, FCPS (Neurology)", 10, "salma.chowdhury@moh-hospital.example",
     "+880 1711-000113", ["Sat", "Sun", "Wed", "Thu", "Fri"], "09:00 - 16:00",
     "Manages headache disorders and neuromuscular conditions.", 800, ["Bengali", "English"], "502"),
    ("Dr. Delwar Hossain", "Neuro Medicine", "MBBS, MD (Neurology)", 12, "delwar.hossain@moh-hospital.example",
     "+880 1711-000129", ["Sun", "Mon", "Tue", "Wed", "Fri"], "08:00 - 15:00",
     "Focuses on multiple sclerosis and neuropathy.", 850, ["Bengali", "English"], "503"),
    ("Dr. Jesmin Akter", "Neuro Medicine", "MBBS, FCPS (Neuro Medicine)", 6, "jesmin.akter@moh-hospital.example",
     "+880 1711-000130", ["Sat", "Mon", "Tue", "Thu", "Fri"], "13:00 - 20:00",
     "Focuses on paediatric neurology cases.", 600, ["Bengali", "English"], "504"),
    ("Dr. Ashraf Uddin", "Neuro Medicine", "MBBS, MD (Neurology)", 19, "ashraf.uddin@moh-hospital.example",
     "+880 1711-000131", ["Sun", "Tue", "Wed", "Thu", "Sat"], "09:00 - 16:00",
     "Senior neurologist specializing in stroke rehabilitation.", 1100, ["Bengali", "English", "Hindi"], "505"),
    ("Dr. Ruma Khatun", "Neuro Medicine", "MBBS, D-Neuro", 8, "ruma.khatun@moh-hospital.example",
     "+880 1711-000132", ["Sat", "Sun", "Mon", "Wed", "Thu"], "10:00 - 17:00",
     "Focuses on epilepsy monitoring and management.", 700, ["Bengali", "English"], "506"),

    # --- Dermatology (Floor 2, rooms 221-226) ---
    ("Dr. Sabrina Haque", "Dermatology", "MBBS, DDV", 8, "sabrina.haque@moh-hospital.example",
     "+880 1711-000106", ["Sat", "Sun", "Mon", "Wed", "Thu"], "11:00 - 18:00",
     "Treats skin, hair, and nail conditions across all ages.", 650, ["Bengali", "English"], "221"),
    ("Dr. Nazmul Haque", "Dermatology", "MBBS, MD (Dermatology)", 7, "nazmul.haque@moh-hospital.example",
     "+880 1711-000114", ["Sun", "Mon", "Tue", "Thu", "Fri"], "09:00 - 15:00",
     "Focuses on acne, eczema, and cosmetic dermatology.", 600, ["Bengali", "English"], "222"),
    ("Dr. Momtaz Begum", "Dermatology", "MBBS, DDV", 9, "momtaz.begum@moh-hospital.example",
     "+880 1711-000133", ["Sat", "Tue", "Wed", "Thu", "Fri"], "10:00 - 17:00",
     "Specializes in paediatric skin conditions and allergies.", 680, ["Bengali", "English"], "223"),
    ("Dr. Rubel Miah", "Dermatology", "MBBS, MD (Dermatology)", 5, "rubel.miah@moh-hospital.example",
     "+880 1711-000134", ["Sun", "Mon", "Wed", "Thu", "Sat"], "13:00 - 20:00",
     "Focuses on acne scarring and laser treatments.", 550, ["Bengali", "English"], "224"),
    ("Dr. Shahnaz Parveen", "Dermatology", "MBBS, DDV", 13, "shahnaz.parveen@moh-hospital.example",
     "+880 1711-000135", ["Sat", "Sun", "Mon", "Tue", "Thu"], "09:00 - 16:00",
     "Specializes in autoimmune skin disorders.", 800, ["Bengali", "English"], "225"),
    ("Dr. Golam Sarwar", "Dermatology", "MBBS, MD (Dermatology)", 17, "golam.sarwar@moh-hospital.example",
     "+880 1711-000136", ["Mon", "Tue", "Wed", "Fri", "Sat"], "10:00 - 18:00",
     "Senior dermatologist focused on chronic skin disease.", 900, ["Bengali", "English"], "226"),

    # --- ENT (Floor 3, rooms 321-326) ---
    ("Dr. Imran Hossain", "ENT", "MBBS, MS (ENT)", 10, "imran.hossain@moh-hospital.example",
     "+880 1711-000107", ["Sun", "Mon", "Tue", "Wed", "Sat"], "09:00 - 16:00",
     "Ear, nose, and throat surgeon with a focus on sinus disorders.", 750, ["Bengali", "English"], "321"),
    ("Dr. Shirin Akhter", "ENT", "MBBS, D-ENT", 13, "shirin.akhter@moh-hospital.example",
     "+880 1711-000115", ["Mon", "Tue", "Wed", "Thu", "Fri"], "10:00 - 18:00",
     "Specializes in hearing disorders and paediatric ENT care.", 800, ["Bengali", "English"], "322"),
    ("Dr. Laila Yesmin", "ENT", "MBBS, D-ENT", 10, "laila.yesmin@moh-hospital.example",
     "+880 1711-000137", ["Sat", "Sun", "Tue", "Wed", "Thu"], "09:00 - 15:00",
     "Focuses on voice and throat disorders.", 700, ["Bengali", "English"], "323"),
    ("Dr. Anisur Rahman", "ENT", "MBBS, MS (ENT)", 6, "anisur.rahman@moh-hospital.example",
     "+880 1711-000138", ["Sun", "Mon", "Wed", "Fri", "Sat"], "14:00 - 21:00",
     "Focuses on sinus surgery and allergy management.", 600, ["Bengali", "English"], "324"),
    ("Dr. Parveen Sultana", "ENT", "MBBS, D-ENT", 14, "parveen.sultana@moh-hospital.example",
     "+880 1711-000139", ["Sat", "Mon", "Tue", "Thu", "Fri"], "09:00 - 16:00",
     "Specializes in paediatric hearing screening.", 820, ["Bengali", "English"], "325"),
    ("Dr. Tariqul Islam", "ENT", "MBBS, MS (ENT)", 8, "tariqul.islam@moh-hospital.example",
     "+880 1711-000140", ["Sun", "Tue", "Wed", "Thu", "Sat"], "10:00 - 17:00",
     "Focuses on sleep apnea and snoring treatment.", 680, ["Bengali", "English"], "326"),

    # --- Obs & Gynae (Floor 6, rooms 601-606) ---
    ("Dr. Farzana Rahman", "Obs & Gynae", "MBBS, FCPS (Gynae & Obs)", 15, "farzana.rahman@moh-hospital.example",
     "+880 1711-000108", ["Sat", "Sun", "Tue", "Wed", "Thu"], "09:00 - 17:00",
     "Specializes in high-risk pregnancy care and gynaecological surgery.", 950, ["Bengali", "English"], "601"),
    ("Dr. Ismat Jahan", "Obs & Gynae", "MBBS, MS (Gynae & Obs)", 12, "ismat.jahan@moh-hospital.example",
     "+880 1711-000116", ["Sun", "Mon", "Wed", "Thu", "Fri"], "14:00 - 21:00",
     "Focuses on fertility care and minimally invasive gynaecological surgery.", 850, ["Bengali", "English"], "602"),
    ("Dr. Nazma Begum", "Obs & Gynae", "MBBS, FCPS (Gynae & Obs)", 16, "nazma.begum@moh-hospital.example",
     "+880 1711-000141", ["Sat", "Sun", "Mon", "Tue", "Thu"], "09:00 - 16:00",
     "Senior consultant for complicated deliveries.", 1000, ["Bengali", "English"], "603"),
    ("Dr. Ruksana Akhter", "Obs & Gynae", "MBBS, MS (Gynae & Obs)", 9, "ruksana.akhter@moh-hospital.example",
     "+880 1711-000142", ["Sun", "Mon", "Tue", "Wed", "Fri"], "10:00 - 17:00",
     "Focuses on routine antenatal and postnatal care.", 700, ["Bengali", "English"], "604"),
    ("Dr. Farida Yasmin", "Obs & Gynae", "MBBS, FCPS (Gynae & Obs)", 12, "farida.yasmin@moh-hospital.example",
     "+880 1711-000143", ["Sat", "Tue", "Wed", "Thu", "Fri"], "13:00 - 20:00",
     "Specializes in menopause and reproductive health.", 780, ["Bengali", "English"], "605"),
    ("Dr. Shamima Nasrin", "Obs & Gynae", "MBBS, DGO", 7, "shamima.nasrin@moh-hospital.example",
     "+880 1711-000144", ["Sun", "Mon", "Thu", "Fri", "Sat"], "09:00 - 15:00",
     "Focuses on adolescent gynaecology and family planning.", 650, ["Bengali", "English"], "606"),

    # --- Medicine (Floor 1, rooms 101-106) ---
    ("Dr. Kamrul Hasan", "Medicine", "MBBS, MD (Internal Medicine)", 12, "kamrul.hasan@moh-hospital.example",
     "+880 1711-000109", ["Sun", "Mon", "Tue", "Wed", "Thu"], "08:00 - 15:00",
     "General physician managing chronic disease and preventive checkups.", 500, ["Bengali", "English"], "101"),
    ("Dr. Ayesha Siddika", "Medicine", "MBBS, FCPS (Medicine)", 6, "ayesha.siddika@moh-hospital.example",
     "+880 1711-000110", ["Sat", "Mon", "Tue", "Thu", "Sat"], "13:00 - 20:00",
     "Focuses on diabetes management and adult primary care.", 450, ["Bengali", "English"], "102"),
    ("Dr. Mahbub Alam", "Medicine", "MBBS, MD (Medicine)", 11, "mahbub.alam@moh-hospital.example",
     "+880 1711-000145", ["Sun", "Mon", "Wed", "Thu", "Sat"], "09:00 - 16:00",
     "Manages hypertension and thyroid disorders.", 550, ["Bengali", "English"], "103"),
    ("Dr. Nasima Khatun", "Medicine", "MBBS, FCPS (Medicine)", 5, "nasima.khatun@moh-hospital.example",
     "+880 1711-000146", ["Sat", "Sun", "Tue", "Wed", "Fri"], "10:00 - 17:00",
     "Focuses on women's general health and anaemia.", 480, ["Bengali", "English"], "104"),
    ("Dr. Shamsul Alam", "Medicine", "MBBS, MD (Internal Medicine)", 20, "shamsul.alam@moh-hospital.example",
     "+880 1711-000147", ["Sun", "Mon", "Tue", "Thu", "Fri"], "08:00 - 14:00",
     "Senior physician specializing in complex multi-condition cases.", 750, ["Bengali", "English", "Hindi"], "105"),
    ("Dr. Ruma Aktar", "Medicine", "MBBS, MD (Medicine)", 8, "ruma.aktar@moh-hospital.example",
     "+880 1711-000148", ["Sat", "Mon", "Wed", "Thu", "Fri"], "14:00 - 21:00",
     "Focuses on infectious disease and fever clinics.", 520, ["Bengali", "English"], "106"),
    ("Dr. Golam Rabbani", "Medicine", "MBBS, MD (Medicine)", 14, "golam.rabbani@moh-hospital.example",
     "+880 1711-000149", ["Sun", "Mon", "Tue", "Wed", "Fri"], "09:00 - 16:00",
     "General physician with a focus on adult chronic care.", 600, ["Bengali", "English"], "107"),
    ("Dr. Rehana Begum", "Medicine", "MBBS, FCPS (Medicine)", 7, "rehana.begum@moh-hospital.example",
     "+880 1711-000150", ["Sat", "Sun", "Tue", "Thu", "Fri"], "13:00 - 20:00",
     "Focuses on women's general health and metabolic disorders.", 500, ["Bengali", "English"], "108"),

    # --- A few departments run a larger roster than others, same as a real hospital ---
    ("Dr. Anowara Islam", "Paediatrics", "MBBS, DCH", 5, "anowara.islam@moh-hospital.example",
     "+880 1711-000151", ["Sun", "Mon", "Wed", "Thu", "Fri"], "10:00 - 17:00",
     "Focuses on infant feeding and early development checkups.", 500, ["Bengali", "English"], "307"),
    ("Dr. Kamal Chowdhury", "Paediatrics", "MBBS, MD (Paediatrics)", 13, "kamal.chowdhury@moh-hospital.example",
     "+880 1711-000152", ["Sat", "Sun", "Mon", "Wed", "Sat"], "09:00 - 15:00",
     "Manages complex paediatric respiratory conditions.", 780, ["Bengali", "English"], "308"),
    ("Dr. Sultana Yasmin", "Paediatrics", "MBBS, FCPS (Paediatrics)", 8, "sultana.yasmin@moh-hospital.example",
     "+880 1711-000153", ["Sun", "Tue", "Wed", "Thu", "Sat"], "14:00 - 20:00",
     "Focuses on adolescent health and school-age checkups.", 650, ["Bengali", "English"], "309"),
    ("Dr. Belal Rahman", "Orthopaedics", "MBBS, D-Ortho", 10, "belal.rahman@moh-hospital.example",
     "+880 1711-000154", ["Sat", "Mon", "Tue", "Thu", "Fri"], "09:00 - 16:00",
     "Focuses on knee and shoulder arthroscopy.", 750, ["Bengali", "English"], "407"),
    ("Dr. Farida Chowdhury", "Dermatology", "MBBS, DDV", 6, "farida.chowdhury@moh-hospital.example",
     "+880 1711-000155", ["Sun", "Mon", "Wed", "Fri", "Sat"], "10:00 - 17:00",
     "Focuses on hair loss and scalp conditions.", 600, ["Bengali", "English"], "227"),
    ("Dr. Iqbal Kabir", "Dermatology", "MBBS, MD (Dermatology)", 11, "iqbal.kabir@moh-hospital.example",
     "+880 1711-000156", ["Sat", "Sun", "Tue", "Wed", "Thu"], "09:00 - 15:00",
     "Specializes in psoriasis and eczema management.", 750, ["Bengali", "English"], "228"),
    ("Dr. Sabina Yasmin", "Dermatology", "MBBS, DDV", 4, "sabina.yasmin@moh-hospital.example",
     "+880 1711-000157", ["Sun", "Mon", "Tue", "Thu", "Fri"], "13:00 - 19:00",
     "Focuses on acne and adolescent skin care.", 480, ["Bengali", "English"], "229"),
    ("Dr. Rezwanul Haque", "Dermatology", "MBBS, MD (Dermatology)", 15, "rezwanul.haque@moh-hospital.example",
     "+880 1711-000158", ["Sat", "Mon", "Wed", "Thu", "Sat"], "10:00 - 18:00",
     "Senior dermatologist specializing in skin cancer screening.", 850, ["Bengali", "English", "Hindi"], "230"),
    ("Dr. Firoz Alam", "ENT", "MBBS, MS (ENT)", 9, "firoz.alam@moh-hospital.example",
     "+880 1711-000159", ["Sun", "Mon", "Tue", "Wed", "Thu"], "09:00 - 16:00",
     "Focuses on tonsil and adenoid surgery.", 700, ["Bengali", "English"], "327"),
    ("Dr. Nasreen Akhter", "ENT", "MBBS, D-ENT", 12, "nasreen.akhter@moh-hospital.example",
     "+880 1711-000160", ["Sat", "Sun", "Wed", "Thu", "Fri"], "14:00 - 21:00",
     "Specializes in balance disorders and vertigo.", 780, ["Bengali", "English"], "328"),
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
        history = []
        reports = []
        if i % 3 == 0:
            doctor, specialty, diagnosis, notes = _HISTORY_DOCTORS[i % len(_HISTORY_DOCTORS)]
            history.append({
                "date": f"2026-{1 + (i % 7):02d}-{1 + (i % 27):02d}",
                "doctor": doctor, "specialty": specialty, "diagnosis": diagnosis, "notes": notes,
            })
        if i % 4 == 0:
            reports.append({
                "name": "Blood Test Report", "date": f"2026-{1 + (i % 7):02d}-{1 + (i % 27):02d}", "type": "PDF",
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
            "medical_history": history,
            "reports": reports,
        })
    return patients


PATIENTS += _generate_extra_patients()

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

PACKAGES = [
    {"name": "Executive Health Checkup", "price": 4500,
     "tests": ["CBC", "Lipid Profile", "Liver Function Test", "ECG", "Chest X-Ray"],
     "description": "A comprehensive annual checkup for working professionals."},
    {"name": "Cardiac Screening Package", "price": 6000,
     "tests": ["ECG", "Echocardiogram", "Lipid Profile", "Cardiologist Consultation"],
     "description": "Early detection package for heart-related risk factors."},
    {"name": "Women's Wellness Package", "price": 5200,
     "tests": ["CBC", "Thyroid Profile", "Pap Smear", "Ultrasound (Pelvis)", "Gynae Consultation"],
     "description": "Preventive screening package tailored for women's health."},
    {"name": "Senior Citizen Package", "price": 5800,
     "tests": ["CBC", "Blood Sugar (Fasting & PP)", "Kidney Function Test", "ECG", "Bone Density Scan"],
     "description": "Focused on the health concerns most common after age 60."},
    {"name": "Diabetes Screening Package", "price": 2800,
     "tests": ["Fasting Blood Sugar", "HbA1c", "Lipid Profile", "Kidney Function Test"],
     "description": "Early screening and monitoring for diabetes risk."},
    {"name": "Basic Full Body Checkup", "price": 2200,
     "tests": ["CBC", "Blood Sugar (Random)", "Urine Routine", "Chest X-Ray"],
     "description": "An affordable general wellness screening package."},
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


def _generate_live_queue(doctor_records, patient_records, rng_seed=2026):
    """doctor_records: list of (doctor_id, specialty_name) tuples.
    patient_records: list of (patient_id, patient_name) tuples.
    Returns today's "right now" queue tokens — some doctors busy, some idle,
    depth and mix varying by specialty demand and per-doctor luck, so it
    doesn't look like every doctor runs an identical day."""
    rng = random.Random(rng_seed)
    patient_pool = list(patient_records)
    rng.shuffle(patient_pool)
    patient_cursor = 0
    counter = 1
    tokens = []

    for doctor_id, specialty_name in doctor_records:
        demand = _SPECIALTY_DEMAND.get(specialty_name, 0.4)
        doctor_modifier = rng.uniform(0.7, 1.3)  # some doctors just run busier than their peers
        if rng.random() >= min(demand * doctor_modifier, 0.95):
            continue  # quiet day for this doctor - nobody in queue right now

        depth = rng.choices(_QUEUE_DEPTH_CHOICES, weights=_QUEUE_DEPTH_WEIGHTS)[0]
        statuses = []
        if rng.random() < 0.55:
            statuses.append("in-consultation")
            depth -= 1
        if depth > 0:
            statuses.append("called")
            depth -= 1
        statuses.extend(["waiting"] * max(depth, 0))

        for idx, status in enumerate(statuses):
            token_type = "regular"
            if rng.random() < 0.08:
                token_type = "emergency"
            elif rng.random() < 0.10:
                token_type = "walk-in"

            if token_type == "walk-in" or rng.random() < 0.15:
                patient_id, patient_name = None, rng.choice(_WALK_IN_NAMES)
            else:
                patient_id, patient_name = patient_pool[patient_cursor % len(patient_pool)]
                patient_cursor += 1

            hour = 9 + idx // 2
            minute = (idx * 17) % 60
            tokens.append({
                "token_number": f"Q-{counter:03d}",
                "doctor_id": doctor_id,
                "patient_id": patient_id,
                "patient_name": patient_name,
                "type": token_type,
                "status": status,
                "booked_at": f"2026-07-30T{hour:02d}:{minute:02d}:00",
                "slot_time": f"{hour:02d}:{(minute + 15) % 60:02d}",
            })
            counter += 1

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
    for a in _generate_extra_admins():
        admin_docs.append({**a, "password_hash": hash_password(ADMIN_DEMO_PASSWORD)})
    await admins_col.insert_many(admin_docs)

    print("Inserting health packages...")
    await packages_col.insert_many(PACKAGES)

    print("Inserting sample queue tokens...")
    farhana_id = doctor_ids["Dr. Farhana Kabir"]
    nusrat_id = doctor_ids["Dr. Nusrat Jahan"]
    sample_tokens = [
        {"token_number": "A-014", "doctor_id": farhana_id, "patient_id": patient_ids["Abdullah Al Mamun"],
         "patient_name": "Abdullah Al Mamun", "type": "regular", "status": "in-consultation",
         "booked_at": "2026-07-30T08:10:00", "slot_time": "09:20"},
        {"token_number": "A-015", "doctor_id": farhana_id, "patient_id": patient_ids["Rakibul Islam"],
         "patient_name": "Rakibul Islam", "type": "emergency", "status": "waiting",
         "booked_at": "2026-07-30T09:05:00", "slot_time": "09:40"},
        {"token_number": "A-016", "doctor_id": farhana_id, "patient_id": None,
         "patient_name": "Golam Mostofa", "type": "walk-in", "status": "waiting",
         "booked_at": "2026-07-30T09:15:00", "slot_time": "09:45"},
        {"token_number": "A-017", "doctor_id": farhana_id, "patient_id": patient_ids["Tania Ferdous"],
         "patient_name": "Tania Ferdous", "type": "regular", "status": "waiting",
         "booked_at": "2026-07-29T18:30:00", "slot_time": "10:00"},
        {"token_number": "B-008", "doctor_id": nusrat_id, "patient_id": patient_ids["Nasrin Sultana"],
         "patient_name": "Nasrin Sultana", "type": "regular", "status": "completed",
         "booked_at": "2026-07-30T08:00:00", "slot_time": "08:30"},
    ]

    # A spread of past bookings across the extra patients, covering every
    # status (including skipped/no-show) so booking history has real depth.
    extra_patient_names = [name for name, _ in _EXTRA_PATIENTS]
    booking_statuses = ["completed", "completed", "cancelled", "skipped", "no-show", "waiting"]
    doctor_id_list = list(doctor_ids.values())
    for i, patient_name in enumerate(extra_patient_names[:24]):
        status = booking_statuses[i % len(booking_statuses)]
        doctor_id = doctor_id_list[i % len(doctor_id_list)]
        sample_tokens.append({
            "token_number": f"H-{200 + i}",
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
    patient_records = [(pid, name) for name, pid in patient_ids.items()]
    live_queue_tokens = _generate_live_queue(doctor_specialty_pairs, patient_records)
    sample_tokens.extend(live_queue_tokens)
    busy_doctors = len({t["doctor_id"] for t in live_queue_tokens})
    print(f"  {len(live_queue_tokens)} live tokens across {busy_doctors} of {len(doctor_ids)} doctors "
          f"({len(doctor_ids) - busy_doctors} quiet today).")

    await tokens_col.insert_many(sample_tokens)

    print("Inserting starter notifications...")
    await notifications_col.insert_many([
        {"role": "patient", "profile_id": patient_ids["Abdullah Al Mamun"], "title": "Token confirmed",
         "body": "Your token A-014 with Dr. Farhana Kabir is confirmed for today.",
         "time": "2026-07-30T08:10:00", "read": False},
        {"role": "doctor", "profile_id": farhana_id, "title": "Emergency token added",
         "body": "An emergency token (A-015) was added to your queue.",
         "time": "2026-07-30T09:05:00", "read": False},
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
