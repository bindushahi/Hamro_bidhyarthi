"""
Data access layer backed by SQLite via SQLAlchemy.
All functions return plain dicts so patterns.py and main.py stay unchanged.
"""

import json
from sqlalchemy.orm import Session
from database import SessionLocal, Student, CheckIn, Observation, Intervention, Buddy


def _db() -> Session:
    return SessionLocal()


def get_students() -> list[dict]:
    db = _db()
    try:
        rows = db.query(Student).all()
        return [r.to_dict() for r in rows]
    finally:
        db.close()


def get_student(student_id: str) -> dict | None:
    db = _db()
    try:
        row = db.query(Student).filter(Student.id == student_id).first()
        return row.to_dict() if row else None
    finally:
        db.close()


def get_students_by_class(class_name: str) -> list[dict]:
    db = _db()
    try:
        rows = db.query(Student).filter(Student.class_name == class_name).all()
        return [r.to_dict() for r in rows]
    finally:
        db.close()


def get_all_checkins() -> list[dict]:
    db = _db()
    try:
        rows = db.query(CheckIn).all()
        return [r.to_dict() for r in rows]
    finally:
        db.close()


def get_checkins(student_id: str, days: int | None = None) -> list[dict]:
    db = _db()
    try:
        q = db.query(CheckIn).filter(CheckIn.student_id == student_id).order_by(CheckIn.date)
        rows = q.all()
        result = [r.to_dict() for r in rows]
        if days:
            result = result[-days:]
        return result
    finally:
        db.close()


def add_checkin(checkin: dict):
    db = _db()
    try:
        db.add(CheckIn(**checkin))
        db.commit()
    finally:
        db.close()


def get_observations(student_id: str | None = None) -> list[dict]:
    db = _db()
    try:
        q = db.query(Observation)
        if student_id:
            q = q.filter(Observation.student_id == student_id)
        q = q.order_by(Observation.date.desc())
        return [r.to_dict() for r in q.all()]
    finally:
        db.close()


def add_observation(obs: dict):
    db = _db()
    try:
        if isinstance(obs.get("tags"), list):
            obs["tags"] = json.dumps(obs["tags"])
        db.add(Observation(**obs))
        db.commit()
    finally:
        db.close()


def get_interventions(student_id: str | None = None) -> list[dict]:
    db = _db()
    try:
        q = db.query(Intervention)
        if student_id:
            q = q.filter(Intervention.student_id == student_id)
        q = q.order_by(Intervention.date.desc())
        return [r.to_dict() for r in q.all()]
    finally:
        db.close()


def add_intervention(intervention: dict):
    db = _db()
    try:
        db.add(Intervention(**intervention))
        db.commit()
    finally:
        db.close()


def get_buddy_for_student(student_id: str) -> dict | None:
    db = _db()
    try:
        b = db.query(Buddy).filter(Buddy.student_id == student_id).first()
        if not b:
            return None
        buddy_row = db.query(Student).filter(Student.id == b.buddy_id).first()
        if not buddy_row:
            return None
        return {"buddy": buddy_row.to_dict(), "assigned_date": b.assigned_date}
    finally:
        db.close()
