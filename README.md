# हाम्रो विद्यार्थी — Student Wellbeing Early Warning System

A multi-signal early warning system for Nepali schools that helps counselors identify students who may be struggling — before it becomes a crisis.

हाम्रो विद्यार्थी uses rule-based pattern detection for fast, always-available monitoring and an LLM reasoning engine for multi-signal risk assessment when deeper analysis is needed.

## Architecture

```
Frontend (React + Tailwind)  →  FastAPI Backend  →  SQLite (SQLAlchemy)
                                     ↓
                              Pattern Engine (pure logic)
                              NVIDIA NIM API (multi-signal AI reasoning)
                              JWT Auth + RBAC Middleware
```

**Auth & RBAC**: JWT-based authentication with admin-gated registration. Teachers see only their assigned class. Counselors get school-wide access.

**Pure logic** handles: consecutive low mood counters, baseline deviation, check-in frequency drops, mood trends, teacher observation correlation.

**AI reasoning** handles: multi-signal risk fusion, Nepali free-text distress detection, conversation starter generation, personalized creative tasks, parent messages.

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
python3.11 seed.py          # creates SQLite DB + demo accounts
python3.11 -m uvicorn main:app --reload --port 8000
```

Create `backend/.env`:
```
NVIDIA_API_KEY=your-nvidia-nim-api-key-here
JWT_SECRET=change-this-in-production

# Twilio Verify (for real SMS OTP)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_VERIFY_SID=your-verify-service-sid
ADMIN_PHONE=+1XXXXXXXXXX
```

The system works without an NVIDIA key — AI endpoints gracefully degrade to rule-based analysis. Without Twilio credentials, OTP falls back to on-screen demo codes.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 to sign in.

## Demo Accounts

| Role       | Email                     | Password     | Scope       |
|------------|---------------------------|--------------|-------------|
| Admin      |admin@hamro.edu.np         | admin123     | Full access |
| Teacher    | teacher@hamro.edu.np      | teacher123   | Class 9B    |
| Counselor  | counselor@hamro.edu.np    | counselor123 | All classes |

All demo accounts receive OTP via SMS when Twilio is configured. Without Twilio, OTP codes appear on screen.

## Roles & Permissions

- **Admin** — Approve/reject new registrations, assign teachers to classes, manage school config
- **Teacher** — Log observations, view dashboard scoped to their assigned class. Check-ins validated against class schedule
- **Counselor** — School-wide dashboard with per-class comparison, risk distribution, aggregated metrics
- **Student** — (No direct login) Check-ins are filed by teachers/counselors on behalf of students

## Database Schema

| Table            | Purpose                                          |
|------------------|--------------------------------------------------|
| `users`          | Auth (email, hashed password, role, status)      |
| `schools`        | School entity                                    |
| `classes`        | Grade + section                                  |
| `class_teachers` | Maps teachers to their class (N:N)               |
| `students`       | Full student profiles (interests, strengths, etc)|
| `checkins`       | Daily mood/energy logs                           |
| `observations`   | Teacher behavioral tags + notes                  |
| `interventions`  | Counselor actions                                |
| `buddies`        | Peer buddy pairs                                 |
| `class_schedule` | Per-class timetable for time-gated check-ins     |

## API Documentation

With the backend running, visit http://localhost:8000/docs

## Tech Stack

- **Frontend**: React 19, React Router, Tailwind CSS, Recharts, Lucide icons
- **Backend**: FastAPI, SQLAlchemy, Pydantic, httpx
- **Auth**: JWT (python-jose) + bcrypt (passlib) + Twilio Verify (SMS OTP)
- **Database**: SQLite (file-based, zero config)
- **AI**: Kimi K2 Instruct via NVIDIA NIM API — used as a structured reasoning engine, not a chatbot
