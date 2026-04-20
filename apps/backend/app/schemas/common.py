"""Common Pydantic schemas."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class MessageResponse(BaseModel):
    """Standard message response."""

    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response."""

    error: str
    detail: Optional[str] = None
    code: Optional[str] = None


class PaginationParams(BaseModel):
    """Pagination parameters."""

    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)


class PaginatedResponse(BaseModel):
    """Paginated response wrapper."""

    items: list
    total: int
    page: int
    page_size: int
    total_pages: int


class TokenResponse(BaseModel):
    """Token response."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TelegramInitData(BaseModel):
    """Telegram init data for authentication."""

    init_data: str


class PhoneVerificationRequest(BaseModel):
    """Phone verification request."""

    phone: str = Field(..., pattern=r"^\+?[0-9]{9,15}$")
    verification_code: str = Field(..., min_length=6, max_length=6)


class PhoneVerificationResponse(BaseModel):
    """Phone verification response."""

    verified: bool
    user_id: Optional[str] = None


class LinkMethod(str):
    """Link method types."""

    QR_CODE = "qr_code"
    PHONE = "phone"
    ACCOUNT_NUMBER = "account_number"
