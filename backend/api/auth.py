"""
NagDrishti AI — Authentication & Authorization (RBAC) Module
Implements JWT tokens, password hashing, and role-based access control (Citizen vs Admin).
"""

import os
import time
import hmac
import hashlib
import json
import base64
from typing import Optional, Dict, Any
from fastapi import HTTPException, Header, Depends, status
from pydantic import BaseModel

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "nagdrishti-ai-secret-key-2026-nagpur-crisis-command")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 86400 * 7 # 7 days

class TokenPayload(BaseModel):
    user_id: str
    role: str # CITIZEN or ADMIN
    email: str
    exp: int

class UserCredentials(BaseModel):
    email: str
    password: str
    role: Optional[str] = "CITIZEN"
    full_name: Optional[str] = "Nagpur Citizen"

# Pre-seeded authorized users
AUTHORIZED_USERS = {
    "admin@nmc.nagpur.gov.in": {
        "user_id": "usr-admin-01",
        "full_name": "Admin NMC",
        "email": "admin@nmc.nagpur.gov.in",
        "role": "ADMIN",
        "password_hash": hashlib.sha256("Admin@Nagpur2026".encode()).hexdigest()
    },
    "traffic.patil@nagpurpolice.gov.in": {
        "user_id": "usr-traffic-02",
        "full_name": "Inspector R. S. Patil",
        "email": "traffic.patil@nagpurpolice.gov.in",
        "role": "ADMIN",
        "password_hash": hashlib.sha256("Patil@Police2026".encode()).hexdigest()
    },
    "citizen@nagpur.org": {
        "user_id": "usr-citizen-01",
        "full_name": "Nagpur Citizen",
        "email": "citizen@nagpur.org",
        "role": "CITIZEN",
        "password_hash": hashlib.sha256("Citizen@123".encode()).hexdigest()
    }
}

def create_jwt_token(user_id: str, role: str, email: str) -> str:
    """Creates a signed HMAC-SHA256 JWT token."""
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "user_id": user_id,
        "role": role,
        "email": email,
        "exp": int(time.time()) + ACCESS_TOKEN_EXPIRE_SECONDS
    }

    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")

    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")

    return f"{header_b64}.{payload_b64}.{sig_b64}"

def verify_jwt_token(token: str) -> Dict[str, Any]:
    """Verifies and decodes a signed JWT token."""
    parts = token.split(".")
    if len(parts) != 3:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token format.")

    header_b64, payload_b64, sig_b64 = parts

    # Verify signature
    expected_sig = hmac.new(
        SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()

    expected_sig_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")

    if not hmac.compare_digest(sig_b64, expected_sig_b64):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token signature.")

    # Decode payload
    padding = "=" * (4 - len(payload_b64) % 4)
    payload_json = base64.urlsafe_b64decode(payload_b64 + padding).decode()
    payload = json.loads(payload_json)

    if payload.get("exp", 0) < time.time():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired.")

    return payload

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Dependency to extract authenticated user from Bearer header."""
    if not authorization:
        # Default to anonymous citizen for open public endpoints
        return {"user_id": "anonymous", "role": "CITIZEN", "email": "anonymous@nagdrishti.local"}

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header format.")

    token = authorization.split(" ")[1]
    return verify_jwt_token(token)

def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Dependency guard requiring ADMIN role for civic command center actions."""
    if current_user.get("role") != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: This action requires municipal ADMIN privileges."
        )
    return current_user
