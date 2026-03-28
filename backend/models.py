from pydantic import BaseModel
from typing import Literal


class RegisterRequest(BaseModel):
    email: str
    full_name: str
    phone_number: str
    password: str
    role: Literal["teacher", "counselor"]


class LoginRequest(BaseModel):
    email: str
    password: str


class VerifyOtpRequest(BaseModel):
    user_id: str
    otp: str


class ElevateOtpRequest(BaseModel):
    otp: str


class ApproveRequest(BaseModel):
    school_id: str = "school-1"


class AssignClassRequest(BaseModel):
    user_id: str
    class_id: str


class CheckinRequest(BaseModel):
    student_id: str
    mood: int
    energy: Literal["low", "medium", "high"]
    note: str = ""


class ObservationRequest(BaseModel):
    student_id: str
    teacher: str
    tags: list[str]
    note: str = ""


class InterventionRequest(BaseModel):
    student_id: str
    counselor: str
    type: str
    note: str
    status: str = "in_progress"
