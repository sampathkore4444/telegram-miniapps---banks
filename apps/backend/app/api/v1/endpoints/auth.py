"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from ...db.session import get_db
from ...core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_telegram_data,
    get_password_hash,
)
from ...schemas.common import TokenResponse, TelegramInitData, MessageResponse
from ...schemas.user import UserCreate, UserResponse
from ...services.auth_service import AuthService
from ...services.referral_service import ReferralService

router = APIRouter()


@router.post("/telegram", response_model=TokenResponse)
async def authenticate_telegram(data: TelegramInitData, db: Session = Depends(get_db)):
    """Authenticate user via Telegram WebApp init data using AuthService."""
    result = await AuthService.login_with_telegram(db, data.init_data)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("message", "Invalid Telegram authentication data"),
        )

    # Create tokens
    access_token = create_access_token(
        data={"sub": str(result["user_id"]), "type": "access"}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(result["user_id"]), "type": "refresh"}
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=1800,  # 30 minutes
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_access_token(refresh_token: str, db: Session = Depends(get_db)):
    """Refresh access token using refresh token."""
    payload = decode_token(refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type"
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        )

    # Use AuthService to refresh
    result = await AuthService.refresh_token(db, int(user_id))

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh failed"
        )

    access_token = create_access_token(data={"sub": user_id})

    return TokenResponse(
        access_token=access_token, refresh_token=refresh_token, expires_in=1800
    )


@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with email/password using UserService."""
    from ...schemas.user import UserCreate as UserCreateSchema

    result = await AuthService.register_with_password(
        db,
        phone=user_data.phone or "",
        password=user_data.password,
        name=f"{user_data.first_name or ''} {user_data.last_name or ''}".strip(),
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Registration failed"),
        )

    # Award signup bonus
    from ...services.reward_service import RewardService

    await RewardService.award_signup_bonus(db, result["user_id"])

    # Create tokens
    access_token = create_access_token(
        data={"sub": str(result["user_id"]), "type": "access"}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(result["user_id"]), "type": "refresh"}
    )

    return UserResponse(
        id=result["user_id"],
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        email=user_data.email,
        status="active",
    )


@router.post("/otp/request")
async def request_otp(phone: str, db: Session = Depends(get_db)):
    """Request OTP for phone number."""
    result = await AuthService.request_otp(db, phone)

    if not result["success"]:
        return MessageResponse(message=result.get("message", "OTP request failed"))

    return MessageResponse(
        message=f"OTP sent successfully. Demo OTP: {result.get('otp')}"
    )


@router.post("/otp/verify")
async def verify_otp(phone: str, otp: str, db: Session = Depends(get_db)):
    """Verify OTP and login."""
    result = await AuthService.verify_otp(db, phone, otp)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("message", "Invalid OTP"),
        )

    # Create tokens
    access_token = create_access_token(
        data={"sub": str(result["user_id"]), "type": "access"}
    )
    refresh_token = create_refresh_token(
        data={"sub": str(result["user_id"]), "type": "refresh"}
    )

    return TokenResponse(
        access_token=access_token, refresh_token=refresh_token, expires_in=1800
    )


@router.post("/logout")
async def logout(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Logout user."""
    await AuthService.logout(db, current_user.user_id)
    return MessageResponse(message="Logged out successfully")
