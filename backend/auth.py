import os
import random
import logging
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
load_dotenv()

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from database import get_db, User

log = logging.getLogger(__name__)

SECRET_KEY = os.getenv("JWT_SECRET", "hamro-vidyarthi-dev-secret-change-in-prod")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24
OTP_EXPIRY_MINUTES = 5

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

# Twilio Verify config
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_VERIFY_SID = os.getenv("TWILIO_VERIFY_SID", "")

_twilio_client = None

def _get_twilio():
    """Lazy-load Twilio client. Returns None if creds aren't configured."""
    global _twilio_client
    if not (TWILIO_SID and TWILIO_TOKEN and TWILIO_VERIFY_SID):
        return None
    if _twilio_client is None:
        from twilio.rest import Client
        _twilio_client = Client(TWILIO_SID, TWILIO_TOKEN)
    return _twilio_client


# fallback in-memory OTP store for when Twilio isn't set up
_otp_store: dict = {}


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def send_otp(user_id: str, phone_number: str, purpose: str = "login") -> dict:
    """
    Send a 6-digit OTP via Twilio Verify if configured, otherwise fall back
    to an in-memory demo code.
    Returns { "sent_via": "sms" | "demo", "demo_otp": code_or_None }
    """
    client = _get_twilio()

    if client and phone_number:
        try:
            client.verify.v2.services(TWILIO_VERIFY_SID).verifications.create(
                to=phone_number,
                channel="sms",
            )
            log.info("Twilio Verify OTP sent to %s (purpose=%s)", phone_number[-4:], purpose)
            return {"sent_via": "sms", "demo_otp": None}
        except Exception as e:
            log.warning("Twilio Verify send failed, falling back to demo: %s", e)

    # fallback: generate our own code
    code = f"{random.randint(100000, 999999)}"
    _otp_store[f"{user_id}:{purpose}"] = {
        "code": code,
        "expires": datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES),
    }
    return {"sent_via": "demo", "demo_otp": code}


def check_otp(user_id: str, code: str, phone_number: str = "", purpose: str = "login") -> bool:
    """
    Verify the OTP. Uses Twilio Verify if available, otherwise checks
    the in-memory store.
    """
    client = _get_twilio()

    if client and phone_number:
        try:
            check = client.verify.v2.services(TWILIO_VERIFY_SID).verification_checks.create(
                to=phone_number,
                code=code,
            )
            if check.status == "approved":
                log.info("Twilio Verify OTP approved for %s", phone_number[-4:])
                return True
            log.info("Twilio Verify OTP rejected (status=%s)", check.status)
            return False
        except Exception as e:
            log.warning("Twilio Verify check failed: %s", e)
            return False

    # fallback: check in-memory store
    key = f"{user_id}:{purpose}"
    entry = _otp_store.get(key)
    if not entry:
        return False
    if datetime.now(timezone.utc) > entry["expires"]:
        _otp_store.pop(key, None)
        return False
    if entry["code"] != code:
        return False
    _otp_store.pop(key, None)
    return True


def create_token(user_id: str, role: str, elevated: bool = False) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode(
        {"sub": user_id, "role": role, "elevated": elevated, "exp": expire},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None


def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User | None:
    if not token:
        return None
    payload = decode_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user._token_payload = payload
    return user


def require_auth(user: User | None = Depends(get_current_user)) -> User:
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")
    if user.status != "approved":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account not yet approved")
    return user


def require_elevated(user: User = Depends(require_auth)) -> User:
    payload = getattr(user, "_token_payload", {})
    if not payload.get("elevated"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "OTP verification required")
    return user


def require_role(*roles: str):
    def checker(user: User = Depends(require_auth)) -> User:
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, f"Requires role: {', '.join(roles)}")
        return user
    return checker
