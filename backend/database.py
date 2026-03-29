"""
SQLAlchemy setup with SQLite. Tables are created on import via create_all().
"""

import json
from datetime import datetime
from pathlib import Path

from sqlalchemy import (
    create_engine, Column, String, Integer, Float, Boolean, Text,
    ForeignKey, UniqueConstraint, CheckConstraint,
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DB_PATH = Path(__file__).parent / "hamro.db"
engine = create_engine(f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class School(Base):
    __tablename__ = "schools"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    address = Column(String, default="")


class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone_number = Column(String, default="")
    role = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    school_id = Column(String, ForeignKey("schools.id"), nullable=True)
    created_at = Column(String, nullable=False)

    assigned_classes = relationship("ClassTeacher", back_populates="user")


class Class(Base):
    __tablename__ = "classes"
    id = Column(String, primary_key=True)
    grade = Column(Integer, nullable=False)
    section = Column(String, nullable=False)
    school_id = Column(String, ForeignKey("schools.id"))
    __table_args__ = (UniqueConstraint("grade", "section", "school_id"),)


class ClassTeacher(Base):
    __tablename__ = "class_teachers"
    user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    class_id = Column(String, ForeignKey("classes.id"), primary_key=True)

    user = relationship("User", back_populates="assigned_classes")


class Student(Base):
    __tablename__ = "students"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    class_id = Column(String, ForeignKey("classes.id"))
    class_name = Column(String)  # denormalized "9B" for quick access
    gender = Column(String)
    enrolled_date = Column(String)
    guardian = Column(String, default="")
    guardian_phone = Column(String, default="")
    address = Column(String, default="")
    interests = Column(Text, default="[]")  # stored as JSON string
    strengths = Column(Text, default="[]")
    favorite_subjects = Column(Text, default="[]")
    struggles_with = Column(Text, default="[]")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "age": self.age,
            "class": self.class_name,
            "gender": self.gender,
            "enrolled_date": self.enrolled_date,
            "guardian": self.guardian,
            "guardian_phone": self.guardian_phone,
            "address": self.address,
            "interests": json.loads(self.interests),
            "strengths": json.loads(self.strengths),
            "favorite_subjects": json.loads(self.favorite_subjects),
            "struggles_with": json.loads(self.struggles_with),
        }


class CheckIn(Base):
    __tablename__ = "checkins"
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"), index=True)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=True)
    date = Column(String, nullable=False, index=True)
    mood = Column(Integer)
    energy = Column(String)
    note = Column(Text, default="")

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "date": self.date,
            "mood": self.mood,
            "energy": self.energy,
            "note": self.note or "",
        }


class Observation(Base):
    __tablename__ = "observations"
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"), index=True)
    teacher_id = Column(String, ForeignKey("users.id"), nullable=True)
    teacher = Column(String, default="")
    tags = Column(Text, default="[]")
    note = Column(Text, default="")
    date = Column(String, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "teacher": self.teacher,
            "tags": json.loads(self.tags),
            "note": self.note or "",
            "date": self.date,
        }


class Intervention(Base):
    __tablename__ = "interventions"
    id = Column(String, primary_key=True)
    student_id = Column(String, ForeignKey("students.id"), index=True)
    counselor_id = Column(String, ForeignKey("users.id"), nullable=True)
    counselor = Column(String, default="")
    type = Column(String, nullable=False)
    note = Column(Text, nullable=False)
    date = Column(String, nullable=False)
    status = Column(String, default="in_progress")

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "counselor": self.counselor,
            "type": self.type,
            "note": self.note,
            "date": self.date,
            "status": self.status,
        }


class Buddy(Base):
    __tablename__ = "buddies"
    student_id = Column(String, ForeignKey("students.id"), primary_key=True)
    buddy_id = Column(String, ForeignKey("students.id"))
    assigned_date = Column(String)


class ClassSchedule(Base):
    __tablename__ = "class_schedule"
    id = Column(String, primary_key=True)
    class_id = Column(String, ForeignKey("classes.id"))
    day_of_week = Column(Integer)  # 0=Monday ... 6=Sunday
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)


Base.metadata.create_all(bind=engine)
