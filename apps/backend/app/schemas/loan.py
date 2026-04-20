"""Loan Pydantic schemas."""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class LoanStatus(str, Enum):
    """Loan status enum."""

    DRAFT = "draft"
    SUBMITTED = "submitted"
    DOCUMENTS_VERIFICATION = "documents_verification"
    UNDERWRITING = "underwriting"
    APPROVED = "approved"
    REJECTED = "rejected"
    DISBURSED = "disbursed"
    REPAID = "repaid"
    DEFAULTED = "defaulted"


class LoanType(str, Enum):
    """Loan type enum."""

    PERSONAL = "personal"
    BUSINESS = "business"
    SALARY_ADVANCE = "salary_advance"
    MICRO = "micro"


# Eligibility schemas
class EligibilityRequest(BaseModel):
    """Eligibility check request."""

    country: str = Field(..., pattern="^(KH|LA|MM|TH)$")
    employment_type: str = Field(
        ..., pattern="^(salaried|self_employed|business_owner|freelancer|student)$"
    )
    monthly_income: float = Field(..., ge=0)
    purpose: str = Field(
        ..., pattern="^(savings_account|personal_loan|business_loan|credit_card)$"
    )
    existing_customer: bool = False


class EligibilityResult(BaseModel):
    """Eligibility check result."""

    eligible: bool
    products: List[dict] = []
    preapproval_percentage: Optional[int] = None
    next_steps: List[str] = []
    documents_needed: Optional[List[str]] = None


class LoanEligibilityRequest(BaseModel):
    """Loan eligibility check request."""

    loan_type: LoanType
    requested_amount: float = Field(..., ge=1)
    requested_tenure: int = Field(..., ge=1, le=60)
    purpose: str


class LoanEligibilityResult(BaseModel):
    """Loan eligibility result."""

    eligible: bool
    pre_approved_amount: Optional[float] = None
    pre_approved_tenure: Optional[int] = None
    interest_rate: Optional[float] = None
    emi: Optional[float] = None
    required_documents: List[str] = []
    approval_probability: float = 0
    next_steps: List[str] = []


# Loan application schemas
class LoanCreate(BaseModel):
    """Loan creation schema."""

    loan_type: LoanType
    requested_amount: float = Field(..., ge=1)
    tenure_months: int = Field(..., ge=1, le=60)
    purpose: Optional[str] = None


class LoanUpdate(BaseModel):
    """Loan update schema."""

    requested_amount: Optional[float] = Field(None, ge=1)
    tenure_months: Optional[int] = Field(None, ge=1, le=60)
    purpose: Optional[str] = None


class LoanResponse(BaseModel):
    """Loan response schema."""

    id: str
    user_id: str
    loan_type: str
    requested_amount: float
    approved_amount: Optional[float] = None
    interest_rate: Optional[float] = None
    tenure_months: int
    purpose: Optional[str] = None
    emi_amount: Optional[float] = None
    total_interest: Optional[float] = None
    total_payment: Optional[float] = None
    status: str
    rejection_reason: Optional[str] = None
    credit_score: Optional[int] = None
    disbursed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LoanDetailResponse(LoanResponse):
    """Detailed loan response with documents and repayments."""

    documents: List[dict] = []
    repayments: List[dict] = []


# Loan calculation schemas
class LoanCalculationRequest(BaseModel):
    """Loan calculation request."""

    principal: float = Field(..., ge=1)
    interest_rate: float = Field(..., ge=0, le=100)  # annual percentage
    tenure_months: int = Field(..., ge=1, le=60)
    processing_fee: float = Field(default=0, ge=0)
    insurance_fee: float = Field(default=0, ge=0)


class LoanCalculationResponse(BaseModel):
    """Loan calculation response."""

    emi: float
    total_interest: float
    total_payment: float
    processing_fee: float
    insurance_fee: float
    total_loan_cost: float
    amortization_schedule: List[dict] = []


# Repayment schemas
class RepaymentResponse(BaseModel):
    """Repayment response."""

    id: str
    payment_number: int
    due_date: datetime
    amount: float
    principal: Optional[float] = None
    interest: Optional[float] = None
    balance: Optional[float] = None
    status: str
    paid_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Referral schemas
class ReferralCodeResponse(BaseModel):
    """Referral code response."""

    code: str
    total_referrals: int = 0
    total_earnings: float = 0


class ReferralStatsResponse(BaseModel):
    """Referral stats response."""

    total_referrals: int
    completed_referrals: int
    pending_referrals: int
    total_earnings: float
    pending_earnings: float


class ReferralResponse(BaseModel):
    """Referral response."""

    id: str
    referee_id: Optional[str] = None
    status: str
    reward_amount: float
    steps_completed: List[str] = []
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Campaign schemas
class CampaignResponse(BaseModel):
    """Campaign response."""

    id: str
    name: str
    campaign_type: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    prizes: List[dict] = []
    status: str

    class Config:
        from_attributes = True


class CampaignSpinRequest(BaseModel):
    """Campaign spin request."""

    campaign_id: str


class CampaignSpinResponse(BaseModel):
    """Campaign spin response."""

    prize: Optional[dict] = None
    transaction_id: Optional[str] = None


# Mission schemas
class MissionResponse(BaseModel):
    """Mission response."""

    id: str
    name: str
    description: Optional[str] = None
    mission_type: str
    reward_amount: float
    reward_type: str
    is_one_time: bool
    status: str

    class Config:
        from_attributes = True


class MissionCompletionResponse(BaseModel):
    """Mission completion response."""

    mission_id: str
    status: str
    reward_claimed: bool
    completed_at: datetime
