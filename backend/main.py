"""
हाम्रो विद्यार्थी API
Run with: uvicorn main:app --reload
"""

from datetime import date, datetime
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, User, Class, ClassTeacher, ClassSchedule
from auth import (
    hash_password, verify_password, create_token, decode_token,
    send_otp, check_otp,
    get_current_user, require_auth, require_elevated, require_role,
    oauth2_scheme,
)
from models import (
    RegisterRequest, LoginRequest, VerifyOtpRequest, ElevateOtpRequest,
    ApproveRequest, AssignClassRequest,
    CheckinRequest, ObservationRequest, InterventionRequest,
)
from data import (
    get_students, get_student, get_checkins, add_checkin, get_all_checkins,
    get_students_by_class, get_observations, add_observation,
    get_interventions, add_intervention, get_buddy_for_student,
)
from patterns import (
    detect_risk_level, compute_baseline_mood,
    compute_checkin_frequency, compute_mood_trend,
)
from ai import call_ai

app = FastAPI(title="हाम्रो विद्यार्थी API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/auth/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(400, "Email already registered")

    user = User(
        id=f"u-{uuid4().hex[:8]}",
        email=req.email,
        full_name=req.full_name,
        phone_number=req.phone_number,
        hashed_password=hash_password(req.password),
        role=req.role,
        status="pending",
        created_at=datetime.utcnow().isoformat(),
    )
    db.add(user)
    db.commit()
    return {"message": "Registration submitted. Awaiting admin approval.", "user_id": user.id}


@app.post("/api/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Step 1: validate password, generate OTP. Does NOT issue a token yet."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password")
    if user.status == "pending":
        raise HTTPException(403, "Account pending approval")
    if user.status == "rejected":
        raise HTTPException(403, "Account has been rejected")

    result = send_otp(user.id, user.phone_number or "", purpose="login")
    return {
        "otp_required": True,
        "user_id": user.id,
        "sent_via": result["sent_via"],
        "demo_otp": result["demo_otp"],
    }


@app.post("/api/auth/verify-otp")
def verify_login_otp(req: VerifyOtpRequest, db: Session = Depends(get_db)):
    """Step 2: verify OTP and issue a JWT token."""
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    if not check_otp(user.id, req.otp, phone_number=user.phone_number or "", purpose="login"):
        raise HTTPException(401, "Invalid or expired OTP")

    token = create_token(user.id, user.role, elevated=False)

    assigned = []
    if user.role == "teacher":
        rows = db.query(ClassTeacher).filter(ClassTeacher.user_id == user.id).all()
        assigned = [r.class_id for r in rows]

    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "assigned_classes": assigned,
        },
    }


@app.post("/api/auth/request-elevate")
def request_elevate(user: User = Depends(require_auth)):
    """Generate an OTP to unlock sensitive tabs (observation, dashboard)."""
    result = send_otp(user.id, user.phone_number or "", purpose="elevate")
    return {"sent_via": result["sent_via"], "demo_otp": result["demo_otp"]}


@app.post("/api/auth/verify-elevate")
def verify_elevate(req: ElevateOtpRequest, user: User = Depends(require_auth)):
    """Verify elevation OTP and issue a new token with elevated=true."""
    if not check_otp(user.id, req.otp, phone_number=user.phone_number or "", purpose="elevate"):
        raise HTTPException(401, "Invalid or expired OTP")

    token = create_token(user.id, user.role, elevated=True)
    return {"token": token, "elevated": True}


@app.get("/api/auth/me")
def me(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    payload = getattr(user, "_token_payload", {})
    assigned = []
    if user.role == "teacher":
        rows = db.query(ClassTeacher).filter(ClassTeacher.user_id == user.id).all()
        assigned = [r.class_id for r in rows]

    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "status": user.status,
        "elevated": payload.get("elevated", False),
        "assigned_classes": assigned,
    }


@app.get("/api/admin/pending")
def admin_pending_users(
    user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    rows = db.query(User).filter(User.status == "pending").all()
    return [
        {"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role, "created_at": u.created_at}
        for u in rows
    ]


@app.get("/api/admin/users")
def admin_all_users(
    user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    rows = db.query(User).filter(User.role != "admin").all()
    result = []
    for u in rows:
        assigned = []
        if u.role == "teacher":
            ct = db.query(ClassTeacher).filter(ClassTeacher.user_id == u.id).all()
            assigned = [r.class_id for r in ct]
        result.append({
            "id": u.id, "email": u.email, "full_name": u.full_name,
            "role": u.role, "status": u.status, "assigned_classes": assigned,
        })
    return result


@app.post("/api/admin/approve/{user_id}")
def admin_approve(
    user_id: str,
    req: ApproveRequest,
    admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, "User not found")
    target.status = "approved"
    target.school_id = req.school_id
    db.commit()
    return {"message": f"Approved {target.full_name}"}


@app.post("/api/admin/reject/{user_id}")
def admin_reject(
    user_id: str,
    admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, "User not found")
    target.status = "rejected"
    db.commit()
    return {"message": f"Rejected {target.full_name}"}


@app.post("/api/admin/assign-class")
def admin_assign_class(
    req: AssignClassRequest,
    admin: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(User.id == req.user_id).first()
    if not target or target.role != "teacher":
        raise HTTPException(400, "User must be an approved teacher")
    cls = db.query(Class).filter(Class.id == req.class_id).first()
    if not cls:
        raise HTTPException(404, "Class not found")

    existing = db.query(ClassTeacher).filter(
        ClassTeacher.user_id == req.user_id,
        ClassTeacher.class_id == req.class_id,
    ).first()
    if existing:
        return {"message": "Already assigned"}

    db.add(ClassTeacher(user_id=req.user_id, class_id=req.class_id))
    db.commit()
    return {"message": f"Assigned {target.full_name} to {cls.grade}{cls.section}"}


@app.get("/api/admin/classes")
def admin_list_classes(
    user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    rows = db.query(Class).order_by(Class.grade, Class.section).all()
    return [{"id": c.id, "grade": c.grade, "section": c.section} for c in rows]


@app.get("/api/students")
def list_students(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    if user.role == "teacher":
        assigned = db.query(ClassTeacher).filter(ClassTeacher.user_id == user.id).all()
        class_names = []
        for a in assigned:
            cls = db.query(Class).filter(Class.id == a.class_id).first()
            if cls:
                class_names.append(f"{cls.grade}{cls.section}")
        all_students = []
        for cn in class_names:
            all_students.extend(get_students_by_class(cn))
    else:
        all_students = get_students()

    result = []
    for s in all_students:
        checkins = get_checkins(s["id"], days=14)
        risk = detect_risk_level(s["id"])
        last_checkin = checkins[-1] if checkins else None
        result.append({
            **s,
            "last_mood": last_checkin["mood"] if last_checkin else None,
            "last_energy": last_checkin["energy"] if last_checkin else None,
            "last_checkin_date": last_checkin["date"] if last_checkin else None,
            "risk_level": risk["risk_level"],
            "concerns": risk["concerns"],
        })
    return result


@app.get("/api/students/{student_id}")
def get_student_detail(student_id: str, user: User = Depends(require_auth)):
    student = get_student(student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    return student


@app.get("/api/students/{student_id}/checkins")
def list_checkins(student_id: str, days: int = 14, user: User = Depends(require_auth)):
    return get_checkins(student_id, days=days)


def _is_within_class_time(class_name: str, db: Session) -> bool:
    cls = db.query(Class).filter(Class.id == f"cls-{class_name}").first()
    if not cls:
        return True

    now = datetime.now()
    current_time = now.strftime("%H:%M")

    schedules = db.query(ClassSchedule).filter(
        ClassSchedule.class_id == cls.id,
        ClassSchedule.day_of_week == now.weekday(),
    ).all()

    if not schedules:
        return True

    for s in schedules:
        if s.start_time <= current_time <= s.end_time:
            return True
    return False


@app.post("/api/checkins")
async def create_checkin(
    req: CheckinRequest,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    student = get_student(req.student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    if user.role == "teacher" and not _is_within_class_time(student["class"], db):
        raise HTTPException(
            403,
            f"Check-ins for class {student['class']} are only allowed during scheduled class time.",
        )

    checkin = {
        "id": f"c-{uuid4().hex[:8]}",
        "student_id": req.student_id,
        "teacher_id": user.id,
        "date": date.today().isoformat(),
        "mood": req.mood,
        "energy": req.energy,
        "note": req.note,
    }
    add_checkin(checkin)

    note_analysis = None
    if req.note.strip():
        note_analysis = await call_ai("note_analysis", {"note": req.note})

    return {"checkin": checkin, "note_analysis": note_analysis}


@app.get("/api/observations/{student_id}")
def list_observations(student_id: str, user: User = Depends(require_elevated)):
    return get_observations(student_id)


@app.post("/api/observations")
def create_observation(req: ObservationRequest, user: User = Depends(require_elevated)):
    obs = {
        "id": f"o-{uuid4().hex[:8]}",
        "student_id": req.student_id,
        "teacher_id": user.id,
        "teacher": req.teacher,
        "tags": req.tags,
        "note": req.note,
        "date": date.today().isoformat(),
    }
    add_observation(obs)
    return obs


@app.get("/api/interventions/{student_id}")
def list_interventions(student_id: str, user: User = Depends(require_elevated)):
    return get_interventions(student_id)


@app.post("/api/interventions")
def create_intervention(
    req: InterventionRequest,
    user: User = Depends(require_role("counselor", "admin")),
):
    intervention = {
        "id": f"i-{uuid4().hex[:8]}",
        "student_id": req.student_id,
        "counselor_id": user.id,
        "counselor": req.counselor,
        "type": req.type,
        "note": req.note,
        "date": date.today().isoformat(),
        "status": req.status,
    }
    add_intervention(intervention)
    return intervention


@app.get("/api/watchlist")
def watchlist(user: User = Depends(require_elevated)):
    students = get_students()
    flagged = []
    for s in students:
        risk = detect_risk_level(s["id"])
        if risk["risk_level"] in ("moderate", "high", "crisis"):
            checkins = get_checkins(s["id"], days=14)
            last = checkins[-1] if checkins else None
            flagged.append({
                **s,
                "last_mood": last["mood"] if last else None,
                "last_checkin_date": last["date"] if last else None,
                "risk": risk,
            })
    order = {"crisis": 0, "high": 1, "moderate": 2}
    flagged.sort(key=lambda f: order.get(f["risk"]["risk_level"], 3))
    return flagged


@app.post("/api/analyze/risk/{student_id}")
async def analyze_risk(student_id: str, user: User = Depends(require_elevated)):
    student = get_student(student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    all_checkins = get_checkins(student_id, days=60)
    recent_checkins = all_checkins[-14:] if len(all_checkins) > 14 else all_checkins
    observations = get_observations(student_id)
    interventions = get_interventions(student_id)
    baseline = compute_baseline_mood(student_id)
    frequency = compute_checkin_frequency(student_id)
    trend = compute_mood_trend(recent_checkins)

    last_3 = recent_checkins[-3:] if recent_checkins else []
    current_avg = round(sum(c["mood"] for c in last_3) / len(last_3), 2) if last_3 else 0

    signal_bundle = {
        "student": {
            "name": student["name"],
            "age": student["age"],
            "class": student["class"],
            "gender": student.get("gender"),
            "interests": student.get("interests", []),
            "strengths": student.get("strengths", []),
            "favorite_subjects": student.get("favorite_subjects", []),
            "struggles_with": student.get("struggles_with", []),
        },
        "mood_timeseries": [
            {"date": c["date"], "mood": c["mood"], "energy": c["energy"]}
            for c in all_checkins
        ],
        "computed_stats": {
            "baseline_mood_avg_30d": baseline,
            "current_mood_avg_last3": current_avg,
            "baseline_deviation": round(baseline - current_avg, 2) if baseline else 0,
            "mood_trend": trend,
            "consecutive_low_days": detect_risk_level(student_id)["consecutive_low_days"],
            "total_checkins_60d": len(all_checkins),
        },
        "notes": [
            {"date": c["date"], "text": c["note"]}
            for c in all_checkins if c.get("note")
        ],
        "teacher_observations": observations,
        "checkin_frequency": frequency,
        "active_intervention": interventions[0] if interventions else None,
    }

    rule_based = detect_risk_level(student_id)
    ai_assessment = await call_ai("risk_assessment", signal_bundle)
    return {"student_id": student_id, "rule_based": rule_based, "ai_assessment": ai_assessment}


@app.post("/api/generate/conversation-starters/{student_id}")
async def conversation_starters(student_id: str, user: User = Depends(require_elevated)):
    student = get_student(student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    checkins = get_checkins(student_id, days=7)
    observations = get_observations(student_id)
    context = {
        "student": {"name": student["name"], "age": student["age"], "class": student["class"]},
        "recent_moods": [c["mood"] for c in checkins],
        "recent_notes": [c["note"] for c in checkins if c.get("note")],
        "observations": observations,
    }
    return await call_ai("conversation_starters", context)


@app.get("/api/buddies/{student_id}")
def get_buddy(student_id: str, user: User = Depends(require_auth)):
    buddy_info = get_buddy_for_student(student_id)
    if not buddy_info:
        raise HTTPException(404, "No buddy assigned")
    return buddy_info


@app.post("/api/generate/creative-task/{student_id}")
async def creative_task(student_id: str, user: User = Depends(require_auth)):
    student = get_student(student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    def profile(s):
        return {
            "name": s["name"], "age": s["age"], "class": s["class"],
            "gender": s.get("gender"),
            "interests": s.get("interests", []),
            "strengths": s.get("strengths", []),
            "favorite_subjects": s.get("favorite_subjects", []),
            "struggles_with": s.get("struggles_with", []),
        }

    context = {"student": profile(student)}
    buddy_info = get_buddy_for_student(student_id)
    if buddy_info:
        context["buddy"] = profile(buddy_info["buddy"])

    return await call_ai("creative_task", context)


@app.post("/api/generate/parent-message/{student_id}")
async def parent_message(student_id: str, user: User = Depends(require_elevated)):
    student = get_student(student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    checkins = get_checkins(student_id, days=7)
    observations = get_observations(student_id)
    context = {
        "student": {"name": student["name"], "age": student["age"], "class": student["class"]},
        "recent_moods": [c["mood"] for c in checkins],
        "observations": observations,
    }
    return await call_ai("parent_message", context)


@app.get("/api/analytics/school")
def school_analytics(user: User = Depends(require_role("counselor", "admin"))):
    students = get_students()
    all_checkins = get_all_checkins()

    risks = {"low": 0, "moderate": 0, "high": 0, "crisis": 0}
    for s in students:
        r = detect_risk_level(s["id"])
        risks[r["risk_level"]] = risks.get(r["risk_level"], 0) + 1

    mood_sum = sum(c["mood"] for c in all_checkins) if all_checkins else 0
    avg_mood = round(mood_sum / len(all_checkins), 2) if all_checkins else 0

    return {
        "total_students": len(students),
        "risk_distribution": risks,
        "avg_mood": avg_mood,
        "total_checkins": len(all_checkins),
    }


@app.get("/api/analytics/by-class")
def analytics_by_class(user: User = Depends(require_role("counselor", "admin"))):
    students = get_students()
    all_checkins = get_all_checkins()

    classes = {}
    for s in students:
        cn = s["class"]
        if cn not in classes:
            classes[cn] = {"students": [], "student_ids": set()}
        classes[cn]["students"].append(s)
        classes[cn]["student_ids"].add(s["id"])

    result = []
    for cn, info in sorted(classes.items()):
        class_checkins = [c for c in all_checkins if c["student_id"] in info["student_ids"]]
        avg_mood = round(sum(c["mood"] for c in class_checkins) / len(class_checkins), 2) if class_checkins else 0

        risk_counts = {"low": 0, "moderate": 0, "high": 0, "crisis": 0}
        for s in info["students"]:
            r = detect_risk_level(s["id"])
            risk_counts[r["risk_level"]] = risk_counts.get(r["risk_level"], 0) + 1

        result.append({
            "class": cn,
            "student_count": len(info["students"]),
            "avg_mood": avg_mood,
            "checkin_count": len(class_checkins),
            "risk_distribution": risk_counts,
        })
    return result


@app.get("/api/class/{class_name}/trends")
def class_trends(class_name: str, user: User = Depends(require_auth)):
    students = [s for s in get_students() if s["class"] == class_name]
    all_checkins = get_all_checkins()

    class_student_ids = {s["id"] for s in students}
    class_checkins = [c for c in all_checkins if c["student_id"] in class_student_ids]

    if not class_checkins:
        return {"class": class_name, "student_count": len(students), "avg_mood": None}

    avg_mood = round(sum(c["mood"] for c in class_checkins) / len(class_checkins), 2)
    return {
        "class": class_name,
        "student_count": len(students),
        "avg_mood": avg_mood,
        "total_checkins": len(class_checkins),
    }
