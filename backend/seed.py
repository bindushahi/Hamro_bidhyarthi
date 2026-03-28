"""
Seed the SQLite database from the existing JSON files.
Also creates a default admin account and class records.
Run once: python3.11 seed.py
"""

import json
from pathlib import Path
from datetime import datetime, timezone
from uuid import uuid4

from database import (
    engine, Base, SessionLocal,
    School, User, Class, ClassTeacher, Student, CheckIn,
    Observation, Intervention, Buddy, ClassSchedule,
)
import os
from auth import hash_password
from dotenv import load_dotenv

load_dotenv()

DATA_DIR = Path(__file__).parent / "data"
ADMIN_PHONE = os.getenv("ADMIN_PHONE", "")
db = SessionLocal()


def load_json(name: str) -> list:
    p = DATA_DIR / name
    if not p.exists():
        return []
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def seed():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    school = School(id="school-1", name="Hamro Vidyalaya", address="Kathmandu, Nepal")
    db.add(school)

    admin = User(
        id=f"u-{uuid4().hex[:8]}",
        email="admin@hamro.edu.np",
        full_name="School Admin",
        phone_number=ADMIN_PHONE,
        hashed_password=hash_password("admin123"),
        role="admin",
        status="approved",
        school_id="school-1",
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(admin)

    # pre-approved demo teacher and counselor (share the admin phone for demo)
    teacher = User(
        id="u-teacher1",
        email="teacher@hamro.edu.np",
        full_name="Ram Kumar (Math)",
        phone_number=ADMIN_PHONE,
        hashed_password=hash_password("teacher123"),
        role="teacher",
        status="approved",
        school_id="school-1",
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(teacher)

    counselor = User(
        id="u-counselor1",
        email="counselor@hamro.edu.np",
        full_name="Sita Devi",
        phone_number=ADMIN_PHONE,
        hashed_password=hash_password("counselor123"),
        role="counselor",
        status="approved",
        school_id="school-1",
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    db.add(counselor)
    db.flush()

    # build classes from student data
    students_raw = load_json("students.json")
    class_names = sorted(set(s["class"] for s in students_raw))
    class_map = {}
    for cn in class_names:
        grade = int("".join(c for c in cn if c.isdigit()))
        section = "".join(c for c in cn if c.isalpha())
        cls = Class(id=f"cls-{cn}", grade=grade, section=section, school_id="school-1")
        db.add(cls)
        class_map[cn] = cls.id

    # assign the demo teacher to class 9B
    db.add(ClassTeacher(user_id="u-teacher1", class_id="cls-9B"))
    db.flush()

    # seed students
    for s in students_raw:
        db.add(Student(
            id=s["id"],
            name=s["name"],
            age=s.get("age"),
            class_id=class_map.get(s["class"]),
            class_name=s["class"],
            gender=s.get("gender"),
            enrolled_date=s.get("enrolled_date"),
            guardian=s.get("guardian", ""),
            guardian_phone=s.get("guardian_phone", ""),
            address=s.get("address", ""),
            interests=json.dumps(s.get("interests", [])),
            strengths=json.dumps(s.get("strengths", [])),
            favorite_subjects=json.dumps(s.get("favorite_subjects", [])),
            struggles_with=json.dumps(s.get("struggles_with", [])),
        ))

    # seed checkins
    for c in load_json("checkins.json"):
        db.add(CheckIn(
            id=c["id"],
            student_id=c["student_id"],
            date=c["date"],
            mood=c["mood"],
            energy=c["energy"],
            note=c.get("note", ""),
        ))

    # seed observations
    for o in load_json("observations.json"):
        db.add(Observation(
            id=o["id"],
            student_id=o["student_id"],
            teacher=o.get("teacher", ""),
            tags=json.dumps(o.get("tags", [])),
            note=o.get("note", ""),
            date=o["date"],
        ))

    # seed interventions
    for i in load_json("interventions.json"):
        db.add(Intervention(
            id=i["id"],
            student_id=i["student_id"],
            counselor=i.get("counselor", ""),
            type=i["type"],
            note=i["note"],
            date=i["date"],
            status=i.get("status", "in_progress"),
        ))

    # seed buddies
    for b in load_json("buddies.json"):
        db.add(Buddy(
            student_id=b["student_id"],
            buddy_id=b["buddy_id"],
            assigned_date=b.get("assigned_date", ""),
        ))

    # seed class schedules (realistic Nepali school timetable)
    schedules = [
        ("cls-8A", 0, "10:00", "10:45"), ("cls-8A", 2, "10:00", "10:45"), ("cls-8A", 4, "10:00", "10:45"),
        ("cls-8B", 0, "11:00", "11:45"), ("cls-8B", 2, "11:00", "11:45"), ("cls-8B", 4, "11:00", "11:45"),
        ("cls-9A", 1, "10:00", "10:45"), ("cls-9A", 3, "10:00", "10:45"),
        ("cls-9B", 0, "14:00", "14:45"), ("cls-9B", 1, "14:00", "14:45"), ("cls-9B", 3, "14:00", "14:45"),
        ("cls-10A", 0, "08:00", "08:45"), ("cls-10A", 2, "08:00", "08:45"), ("cls-10A", 4, "08:00", "08:45"),
        ("cls-10B", 1, "08:00", "08:45"), ("cls-10B", 3, "08:00", "08:45"),
    ]
    for cls_id, dow, start, end in schedules:
        db.add(ClassSchedule(
            id=f"sched-{uuid4().hex[:6]}",
            class_id=cls_id,
            day_of_week=dow,
            start_time=start,
            end_time=end,
        ))

    db.commit()
    db.close()

    print("Seeded successfully.")
    print(f"  Admin:     admin@hamro.edu.np / admin123")
    print(f"  Teacher:   teacher@hamro.edu.np / teacher123  (assigned to 9B)")
    print(f"  Counselor: counselor@hamro.edu.np / counselor123")
    print(f"  {len(students_raw)} students, {len(class_names)} classes")


if __name__ == "__main__":
    seed()
