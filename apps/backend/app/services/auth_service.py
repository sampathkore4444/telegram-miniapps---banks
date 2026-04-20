"""
Auth Service
Business logic for authentication
"""

from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import hashlib

from app.db.models.user import User
from app.core.security import verify_password, get_password_hash


class AuthService:
    """Service for authentication operations"""

    # OTP configuration
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 5
    MAX_OTP_ATTEMPTS = 3
    OTP_COOLDOWN_MINUTES = 15

    @staticmethod
    async def request_otp(db: Session, phone: str) -> Dict[str, Any]:
        """
        Request OTP for phone number

        Args:
            db: Database session
            phone: Phone number

        Returns:
            OTP request result
        """
        # Check if user exists, create if not
        user = db.query(User).filter(User.phone == phone).first()

        if not user:
            # Create new user with pending verification
            user = User(phone=phone, is_verified=False, created_at=datetime.utcnow())
            db.add(user)
            db.commit()
            db.refresh(user)

        # Check cooldown
        if user.last_otp_at:
            time_since_last = datetime.utcnow() - user.last_otp_at
            if time_since_last.total_seconds() < AuthService.OTP_COOLDOWN_MINUTES * 60:
                return {
                    "success": False,
                    "cooldown": True,
                    "message": f"Please wait {AuthService.OTP_COOLDOWN_MINUTES} minutes before requesting another OTP",
                }

        # Check attempts
        if user.otp_attempts and user.otp_attempts >= AuthService.MAX_OTP_ATTEMPTS:
            return {
                "success": False,
                "locked": True,
                "message": "Too many failed attempts. Please try again later.",
            }

        # Generate OTP
        otp = AuthService.generate_otp()

        # Store OTP (in production, use proper encrypted storage)
        user.otp_code = hashlib.sha256(otp.encode()).hexdigest()
        user.otp_expires_at = datetime.utcnow() + timedelta(
            minutes=AuthService.OTP_EXPIRY_MINUTES
        )
        user.otp_attempts = 0
        user.last_otp_at = datetime.utcnow()

        db.commit()

        # In production, send OTP via SMS
        # For demo, return the OTP
        return {
            "success": True,
            "otp": otp,  # Remove in production!
            "expires_in": AuthService.OTP_EXPIRY_MINUTES * 60,
            "message": "OTP sent successfully",
        }

    @staticmethod
    async def verify_otp(db: Session, phone: str, otp: str) -> Dict[str, Any]:
        """
        Verify OTP and login/register user

        Args:
            db: Database session
            phone: Phone number
            otp: OTP code

        Returns:
            Login result
        """
        user = db.query(User).filter(User.phone == phone).first()

        if not user:
            return {"success": False, "message": "User not found"}

        # Check if OTP expired
        if user.otp_expires_at and user.otp_expires_at < datetime.utcnow():
            return {"success": False, "message": "OTP expired"}

        # Verify OTP
        otp_hash = hashlib.sha256(otp.encode()).hexdigest()

        if user.otp_code != otp_hash:
            # Increment failed attempts
            user.otp_attempts = (user.otp_attempts or 0) + 1
            db.commit()

            return {
                "success": False,
                "message": "Invalid OTP",
                "attempts_remaining": AuthService.MAX_OTP_ATTEMPTS - user.otp_attempts,
            }

        # OTP verified - mark user as verified
        user.is_verified = True
        user.verified_at = datetime.utcnow()
        user.otp_code = None
        user.otp_expires_at = None
        user.last_login_at = datetime.utcnow()

        db.commit()

        return {"success": True, "user_id": user.id, "message": "Verified successfully"}

    @staticmethod
    async def login_with_password(
        db: Session, phone: str, password: str
    ) -> Dict[str, Any]:
        """
        Login with password

        Args:
            db: Database session
            phone: Phone number
            password: Password

        Returns:
            Login result
        """
        user = db.query(User).filter(User.phone == phone).first()

        if not user:
            return {"success": False, "message": "User not found"}

        if not user.password_hash:
            return {"success": False, "message": "Please set up a password"}

        if not verify_password(password, user.password_hash):
            return {"success": False, "message": "Invalid password"}

        user.last_login_at = datetime.utcnow()
        db.commit()

        return {"success": True, "user_id": user.id, "message": "Login successful"}

    @staticmethod
    async def register_with_password(
        db: Session, phone: str, password: str, name: str
    ) -> Dict[str, Any]:
        """
        Register with password

        Args:
            db: Database session
            phone: Phone number
            password: Password
            name: User name

        Returns:
            Registration result
        """
        # Check if user exists
        existing = db.query(User).filter(User.phone == phone).first()

        if existing:
            if existing.is_verified:
                return {"success": False, "message": "User already exists"}
            # Complete registration for pending user
            user = existing
        else:
            # Create new user
            user = User(phone=phone, created_at=datetime.utcnow())
            db.add(user)

        # Set password
        user.name = name
        user.password_hash = get_password_hash(password)
        user.is_verified = True
        user.verified_at = datetime.utcnow()

        db.commit()

        return {
            "success": True,
            "user_id": user.id,
            "message": "Registration successful",
        }

    @staticmethod
    async def login_with_telegram(db: Session, init_data: str) -> Dict[str, Any]:
        """
        Login with Telegram data

        Args:
            db: Database session
            init_data: Telegram init data

        Returns:
            Login result
        """
        # Parse Telegram init data
        # In production, verify the data with Telegram Bot API
        params = dict(param.split("=") for param in init_data.split("&"))

        telegram_id = params.get("user_id")
        if not telegram_id:
            return {"success": False, "message": "Invalid Telegram data"}

        # Find or create user
        user = db.query(User).filter(User.telegram_id == telegram_id).first()

        if not user:
            # Create new user from Telegram
            user = User(
                phone=params.get("phone", ""),
                name=params.get("first_name", "") + " " + params.get("last_name", ""),
                telegram_id=telegram_id,
                is_verified=True,
                verified_at=datetime.utcnow(),
                created_at=datetime.utcnow(),
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        user.last_login_at = datetime.utcnow()
        db.commit()

        return {"success": True, "user_id": user.id, "message": "Login successful"}

    @staticmethod
    def generate_otp() -> str:
        """Generate random OTP"""
        return "".join(
            [str(secrets.randbelow(10)) for _ in range(AuthService.OTP_LENGTH)]
        )

    @staticmethod
    async def refresh_token(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Refresh authentication token

        Args:
            db: Database session
            user_id: User ID

        Returns:
            New token data
        """
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return {"success": False, "message": "User not found"}

        # Generate new session token
        session_token = secrets.token_urlsafe(32)

        user.session_token = session_token
        user.session_expires_at = datetime.utcnow() + timedelta(days=30)

        db.commit()

        return {
            "success": True,
            "session_token": session_token,
            "expires_at": user.session_expires_at.isoformat(),
        }

    @staticmethod
    async def logout(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Logout user

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Logout result
        """
        user = db.query(User).filter(User.id == user_id).first()

        if user:
            user.session_token = None
            user.session_expires_at = None
            db.commit()

        return {"success": True, "message": "Logged out successfully"}
