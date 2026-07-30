"""
One-off script to load the hospital's starting data into MongoDB:
8 specialties, 10 doctors, 4 patients, 1 admin, 6 health packages, and a
handful of sample queue tokens so the app isn't empty on first run.

Safe to re-run — it wipes and reloads the collections each time, so don't
run this against a database you care about keeping as-is.

Usage:
    .venv\\Scripts\\python.exe seed.py
"""

import asyncio

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

DOCTORS = [
    ("Dr. Farhana Kabir", "Cardiology", "MBBS, FCPS (Cardiology)", 14, "farhana.kabir@moh-hospital.example",
     "+880 1711-000101", ["Sun", "Mon", "Tue", "Wed", "Thu"], "09:00 - 17:00",
     "Interventional cardiologist with a focus on preventive heart care."),
    ("Dr. Rezaul Karim", "Cardiology", "MBBS, MD (Cardiology)", 9, "rezaul.karim@moh-hospital.example",
     "+880 1711-000102", ["Sun", "Tue", "Wed", "Thu", "Sat"], "10:00 - 18:00",
     "Specializes in arrhythmia management and cardiac rehabilitation."),
    ("Dr. Nusrat Jahan", "Paediatrics", "MBBS, DCH", 11, "nusrat.jahan@moh-hospital.example",
     "+880 1711-000103", ["Sat", "Sun", "Mon", "Tue", "Wed"], "09:00 - 16:00",
     "Child health specialist covering newborn to adolescent care."),
    ("Dr. Shafiqul Islam", "Orthopaedics", "MBBS, MS (Orthopaedics)", 17, "shafiqul.islam@moh-hospital.example",
     "+880 1711-000104", ["Sun", "Mon", "Wed", "Thu", "Sat"], "09:00 - 17:00",
     "Joint replacement and trauma surgery specialist."),
    ("Dr. Tanvir Ahmed", "Neuro Medicine", "MBBS, MD (Neurology)", 13, "tanvir.ahmed@moh-hospital.example",
     "+880 1711-000105", ["Sun", "Mon", "Tue", "Thu", "Sat"], "10:00 - 17:00",
     "Focuses on stroke care, epilepsy, and movement disorders."),
    ("Dr. Sabrina Haque", "Dermatology", "MBBS, DDV", 8, "sabrina.haque@moh-hospital.example",
     "+880 1711-000106", ["Sat", "Sun", "Mon", "Wed", "Thu"], "11:00 - 18:00",
     "Treats skin, hair, and nail conditions across all ages."),
    ("Dr. Imran Hossain", "ENT", "MBBS, MS (ENT)", 10, "imran.hossain@moh-hospital.example",
     "+880 1711-000107", ["Sun", "Mon", "Tue", "Wed", "Sat"], "09:00 - 16:00",
     "Ear, nose, and throat surgeon with a focus on sinus disorders."),
    ("Dr. Farzana Rahman", "Obs & Gynae", "MBBS, FCPS (Gynae & Obs)", 15, "farzana.rahman@moh-hospital.example",
     "+880 1711-000108", ["Sat", "Sun", "Tue", "Wed", "Thu"], "09:00 - 17:00",
     "Specializes in high-risk pregnancy care and gynaecological surgery."),
    ("Dr. Kamrul Hasan", "Medicine", "MBBS, MD (Internal Medicine)", 12, "kamrul.hasan@moh-hospital.example",
     "+880 1711-000109", ["Sun", "Mon", "Tue", "Wed", "Thu"], "08:00 - 15:00",
     "General physician managing chronic disease and preventive checkups."),
    ("Dr. Ayesha Siddika", "Medicine", "MBBS, FCPS (Medicine)", 6, "ayesha.siddika@moh-hospital.example",
     "+880 1711-000110", ["Sat", "Mon", "Tue", "Thu", "Sat"], "13:00 - 20:00",
     "Focuses on diabetes management and adult primary care."),
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


async def main():
    print("Wiping existing collections...")
    for col in (specialties_col, doctors_col, patients_col, admins_col, packages_col, tokens_col, notifications_col):
        await col.delete_many({})

    print("Inserting specialties...")
    specialty_result = await specialties_col.insert_many(SPECIALTIES)
    specialty_ids = {s["name"]: str(_id) for s, _id in zip(SPECIALTIES, specialty_result.inserted_ids)}

    print("Inserting doctors...")
    doctor_docs = []
    for name, specialty_name, quals, years, email, phone, days, hours, bio in DOCTORS:
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

    print("Inserting admin account...")
    await admins_col.insert_one({
        "name": "Md. Habibur Rahman",
        "email": "admin@moh-hospital.example",
        "password_hash": hash_password(ADMIN_DEMO_PASSWORD),
        "role": "Super Admin",
        "avatar_initials": "HR",
    })

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
          f"{len(SPECIALTIES)} specialties, {len(PACKAGES)} packages, 1 admin, "
          f"{len(sample_tokens)} sample tokens loaded.")
    print(f"\nDemo logins:")
    print(f"  Patient -> abdullah.mamun@example.com / {PATIENT_DEMO_PASSWORD}")
    print(f"  Doctor  -> farhana.kabir@moh-hospital.example / {DOCTOR_DEMO_PASSWORD}")
    print(f"  Admin   -> admin@moh-hospital.example / {ADMIN_DEMO_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(main())
