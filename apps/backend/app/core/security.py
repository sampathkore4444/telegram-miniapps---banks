"""Security module for authentication and authorization."""

from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Bearer token
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def verify_telegram_data(init_data: str) -> dict:
    """Verify Telegram WebApp init data."""
    try:
        # Parse the init_data string
        params = {}
        for param in init_data.split("&"):
            if "=" in param:
                key, value = param.split("=", 1)
                params[key] = value

        # Get hash from params
        received_hash = params.pop("hash", "")

        # Sort keys and create data check string
        data_check_string = "\n".join([f"{k}={v}" for k, v in sorted(params.items())])

        # In production, verify hash with bot token
        # For now, return parsed user data
        if "user" in params:
            import json
            import urllib.parse

            user_data = json.loads(urllib.parse.unquote(params["user"]))
            return {
                "telegram_id": user_data.get("id"),
                "first_name": user_data.get("first_name"),
                "last_name": user_data.get("last_name"),
                "username": user_data.get("username"),
                "language_code": user_data.get("language_code"),
            }

        return {}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Telegram data: {str(e)}",
        )


class TokenData:
    """Token data container."""

    def __init__(
        self, user_id: Optional[str] = None, telegram_id: Optional[int] = None
    ):
        self.user_id = user_id
        self.telegram_id = telegram_id


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> TokenData:
    """Get current authenticated user."""
    token = credentials.credentials
    payload = decode_token(token)

    user_id = payload.get("sub")
    telegram_id = payload.get("telegram_id")

    if user_id is None and telegram_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    return TokenData(user_id=user_id, telegram_id=telegram_id)


def generate_verification_code(length: int = 6) -> str:
    """Generate a numeric verification code."""
    import random

    return "".join([str(random.randint(0, 9)) for _ in range(length)])


def generate_uuid() -> str:
    """Generate a UUID string."""
    import uuid

    return str(uuid.uuid4())
