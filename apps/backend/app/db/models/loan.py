"""Loan model for database."""

from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    Date,
    Numeric,
    Text,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from ..db.session import Base


class LoanStatus(str, enum.Enum):
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


class LoanType(str, enum.Enum):
    """Loan type enum."""

    PERSONAL = "personal"
    BUSINESS = "business"
    SALARY_ADVANCE = "salary_advance"
    MICRO = "micro"


class Loan(Base):
    """Loan model."""

    __tablename__ = "loans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    loan_type = Column(SQLEnum(LoanType), nullable=False)

    # Loan details
    requested_amount = Column(Numeric(12, 2), nullable=False)
    approved_amount = Column(Numeric(12, 2), nullable=True)
    interest_rate = Column(Numeric(5, 2), nullable=True)  # Annual percentage
    tenure_months = Column(Integer, nullable=False)
    purpose = Column(Text, nullable=True)

    # EMI
    emi_amount = Column(Numeric(12, 2), nullable=True)
    total_interest = Column(Numeric(12, 2), nullable=True)
    total_payment = Column(Numeric(12, 2), nullable=True)

    # Status
    status = Column(SQLEnum(LoanStatus), default=LoanStatus.DRAFT)
    rejection_reason = Column(Text, nullable=True)

    # Underwriting
    credit_score = Column(Integer, nullable=True)
    assigned_underwriter = Column(String(36), ForeignKey("users.id"), nullable=True)

    # Disbursement
    disbursed_at = Column(DateTime, nullable=True)
    disbursement_reference = Column(String(100), nullable=True)

    # Dates
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="loans")
    documents = relationship("LoanDocument", back_populates="loan")
    repayments = relationship("LoanRepayment", back_populates="loan")


class LoanDocument(Base):
    """Loan document model."""

    __tablename__ = "loan_documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    loan_id = Column(String(36), ForeignKey("loans.id"), nullable=False)
    document_type = Column(
        String(50), nullable=False
    )  # income_proof, id_copy, bank_statement
    file_url = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending, verified, rejected

    uploaded_at = Column(DateTime, server_default=func.now())
    verified_at = Column(DateTime, nullable=True)

    # Relationships
    loan = relationship("Loan", back_populates="documents")


class LoanRepayment(Base):
    """Loan repayment model."""

    __tablename__ = "loan_repayments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    loan_id = Column(String(36), ForeignKey("loans.id"), nullable=False)
    payment_number = Column(Integer, nullable=False)
    due_date = Column(DateTime, nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    principal = Column(Numeric(12, 2), nullable=True)
    interest = Column(Numeric(12, 2), nullable=True)
    balance = Column(Numeric(12, 2), nullable=True)
    status = Column(String(20), default="pending")  # pending, paid, overdue
    paid_at = Column(DateTime, nullable=True)
    payment_reference = Column(String(100), nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    loan = relationship("Loan", back_populates="repayments")


class Referral(Base):
    """Referral model."""

    __tablename__ = "referrals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    referrer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    referee_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    referral_code = Column(String(20), nullable=False)
    status = Column(String(20), default="pending")  # pending, completed, rewarded
    reward_amount = Column(Numeric(10, 2), default=0)
    rewarded_at = Column(DateTime, nullable=True)

    # Steps tracking (stored as JSON)
    steps_completed = Column(Text, nullable=True)  # JSON array of completed steps

    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    referrer = relationship(
        "User", foreign_keys=[referrer_id], back_populates="referrals_made"
    )
    referee = relationship(
        "User", foreign_keys=[referee_id], back_populates="referrals_received"
    )


class Campaign(Base):
    """Campaign model for promotions."""

    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    campaign_type = Column(
        String(50), nullable=False
    )  # spin_wheel, lucky_draw, festival
    description = Column(Text, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)

    # Rules (stored as JSON)
    rules = Column(Text, nullable=True)  # JSON object
    prizes = Column(Text, nullable=True)  # JSON array of prizes

    # Requirements
    phone_required = Column(Boolean, default=True)
    consent_required = Column(Boolean, default=True)

    status = Column(String(20), default="active")  # active, paused, completed
    created_at = Column(DateTime, server_default=func.now())


class CampaignParticipation(Base):
    """Campaign participation model."""

    __tablename__ = "campaign_participations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    prize_won = Column(Text, nullable=True)  # JSON object for prize
    status = Column(String(20), default="active")  # active, claimed

    participated_at = Column(DateTime, server_default=func.now())
    claimed_at = Column(DateTime, nullable=True)


class Mission(Base):
    """Mission model for rewards."""

    __tablename__ = "missions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    mission_type = Column(
        String(50), nullable=False
    )  # complete_profile, verify_phone, upload_id, referral, daily_login, share
    requirement = Column(Text, nullable=True)  # JSON object
    reward_amount = Column(Numeric(10, 2), nullable=False)
    reward_type = Column(String(20), default="cash")  # cash, points, badge
    is_one_time = Column(Boolean, default=True)
    duration_days = Column(Integer, nullable=True)
    status = Column(String(20), default="active")  # active, paused, completed
    created_at = Column(DateTime, server_default=func.now())


class MissionCompletion(Base):
    """Mission completion tracking."""

    __tablename__ = "mission_completions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mission_id = Column(String(36), ForeignKey("missions.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="completed")  # completed, rewarded
    reward_claimed = Column(Boolean, default=False)
    completed_at = Column(DateTime, server_default=func.now())
    rewarded_at = Column(DateTime, nullable=True)


class CashbackReward(Base):
    """Cashback rewards for loan repayments."""

    __tablename__ = "cashback_rewards"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    loan_id = Column(String(36), ForeignKey("loans.id"), nullable=False)
    repayment_id = Column(String(36), nullable=True)
    amount = Column(Numeric(15, 2), nullable=False)
    tiers_earned = Column(Text, nullable=True)  # JSON string of tiers
    status = Column(String(20), default="awarded")  # pending, awarded, expired
    created_at = Column(DateTime, server_default=func.now())


# Streak model for daily check-ins
class Streak(Base):
    """User streak data for daily check-ins."""

    __tablename__ = "streaks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_check_ins = Column(Integer, default=0)
    last_check_in = Column(Date, nullable=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class CheckIn(Base):
    """Daily check-in record."""

    __tablename__ = "check_ins"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    check_in_date = Column(Date, nullable=False)
    streak_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())


# Add relationships to User model
from .user import User

User.loans = relationship("Loan", back_populates="user")
User.referrals_made = relationship(
    "Referral", foreign_keys=[Referral.referrer_id], back_populates="referrer"
)
User.referrals_received = relationship(
    "Referral", foreign_keys=[Referral.referee_id], back_populates="referee"
)
