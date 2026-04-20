"""User Pydantic schemas."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserStatus(str, Enum):
    """User status enum."""

    DRAFT = "draft"
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class EmploymentType(str, Enum):
    """Employment type enum."""

    SALARIED = "salaried"
    SELF_EMPLOYED = "self_employed"
    BUSINESS_OWNER = "business_owner"
    FREELANCER = "freelancer"
    STUDENT = "student"
    RETIRED = "retired"
    UNEMPLOYED = "unemployed"


# Request schemas
class UserCreate(BaseModel):
    """User creation schema."""

    first_name: str = Field(..., min_length=1, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, pattern=r"^\+?[0-9]{9,15}$")
    email: Optional[EmailStr] = None
    date_of_birth: Optional[datetime] = None
    country: Optional[str] = Field(None, max_length=10)
    province: Optional[str] = Field(None, max_length=255)
    district: Optional[str] = Field(None, max_length=255)
    commune: Optional[str] = Field(None, max_length=255)
    street: Optional[str] = Field(None, max_length=255)
    employment_type: Optional[EmploymentType] = None
    employer_name: Optional[str] = Field(None, max_length=255)
    monthly_income: Optional[float] = Field(None, ge=0)
    job_title: Optional[str] = Field(None, max_length=255)


class UserUpdate(BaseModel):
    """User update schema."""

    first_name: Optional[str] = Field(None, min_length=1, max_length=255)
    last_name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, pattern=r"^\+?[0-9]{9,15}$")
    email: Optional[EmailStr] = None
    date_of_birth: Optional[datetime] = None
    country: Optional[str] = Field(None, max_length=10)
    province: Optional[str] = Field(None, max_length=255)
    district: Optional[str] = Field(None, max_length=255)
    commune: Optional[str] = Field(None, max_length=255)
    street: Optional[str] = Field(None, max_length=255)
    employment_type: Optional[EmploymentType] = None
    employer_name: Optional[str] = Field(None, max_length=255)
    monthly_income: Optional[float] = Field(None, ge=0)
    job_title: Optional[str] = Field(None, max_length=255)


class UserResponse(BaseModel):
    """User response schema."""

    id: str
    telegram_id: Optional[int] = None
    telegram_username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    country: Optional[str] = None
    province: Optional[str] = None
    district: Optional[str] = None
    commune: Optional[str] = None
    street: Optional[str] = None
    employment_type: Optional[str] = None
    employer_name: Optional[str] = None
    monthly_income: Optional[float] = None
    job_title: Optional[str] = None
    status: str
    kyc_completed: bool
    referral_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileResponse(BaseModel):
    """Extended user profile with account info."""

    id: str
    first_name: str
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    country: Optional[str] = None
    employment_type: Optional[str] = None
    monthly_income: Optional[float] = None
    status: str
    kyc_completed: bool
    kyc_progress: int = 0
    referral_code: Optional[str] = None
    wallet_balance: Optional[float] = 0
    linked_accounts: List[dict] = []

    class Config:
        from_attributes = True


# Document schemas
class DocumentUploadResponse(BaseModel):
    """Document upload response."""

    upload_url: str
    document_id: str


class DocumentResponse(BaseModel):
    """Document response."""

    id: str
    document_type: str
    file_url: str
    status: str
    uploaded_at: datetime
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Bank Account schemas
class BankAccountResponse(BaseModel):
    """Bank account response."""

    id: str
    account_number: str
    account_type: str
    balance: float
    currency: str
    status: str
    nickname: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# Wallet schemas
class WalletResponse(BaseModel):
    """Wallet response."""

    id: str
    currency: str
    available_balance: float
    pending_balance: float
    lifetime_earnings: float

    class Config:
        from_attributes = True


class WalletTransactionResponse(BaseModel):
    """Wallet transaction response."""

    id: str
    transaction_type: str
    amount: float
    source: Optional[str] = None
    description: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# Telegram Link schemas
class TelegramLinkRequest(BaseModel):
    """Telegram link request."""

    link_method: str = Field(..., pattern="^(qr_code|phone|account_number)$")
    verification_token: str
    bank_account_id: Optional[str] = None


class TelegramLinkResponse(BaseModel):
    """Telegram link response."""

    link_id: str
    bank_account_id: Optional[str] = None
    bank_account_last4: Optional[str] = None
    linked_at: datetime
    status: str


class LinkedAccountResponse(BaseModel):
    """Linked account response."""

    link_id: str
    bank_account_id: str
    bank_account_type: str
    last4: str
    nickname: Optional[str] = None
    linked_at: datetime
    status: str


# Notification preferences
class NotificationPreferences(BaseModel):
    """Notification preferences."""

    balance_alerts: bool = True
    transaction_alerts: bool = True
    loan_reminders: bool = True
    promotions: bool = False
