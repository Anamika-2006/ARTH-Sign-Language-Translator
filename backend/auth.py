"""
ARTH - Authentication & Security Module
Handles bcrypt password hashing and PyJWT token generation/verification.
"""

import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Header, HTTPException, status

JWT_SECRET_KEY = "arth_assistive_sign_language_ai_secret_key_2026"
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 14

def get_password_hash(password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against stored bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(user_id: int, email: str, full_name: str, role: str) -> str:
    """Generate a signed JWT token valid for 14 days."""
    expire = datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
    payload = {
        "sub": str(user_id),
        "user_id": user_id,
        "email": email,
        "full_name": full_name,
        "role": role,
        "exp": expire
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None

def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Extract user payload from Authorization Bearer token, or return None for guests."""
    if not authorization:
        return None
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
        return decode_access_token(token)
    return None

def get_required_user(authorization: Optional[str] = Header(None)) -> dict:
    """Require valid Bearer token, raising 401 Unauthorized if missing/invalid."""
    user = get_optional_user(authorization)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing or has expired. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
