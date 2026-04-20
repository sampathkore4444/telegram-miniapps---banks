"""User model for database."""

from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
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


class UserStatus(str, enum.Enum):
    """User status enum."""

    DRAFT = "draft"
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    DELETED = "deleted"


class EmploymentType(str, enum.Enum):
    """Employment type enum."""

    SALARIED = "salaried"
    SELF_EMPLOYED = "self_employed"
    BUSINESS_OWNER = "business_owner"
    FREELANCER = "freelancer"
    STUDENT = "student"
    RETIRED = "retired"
    UNEMPLOYED = "unemployed"


class User(Base):
    """User model."""

    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    telegram_id = Column(Integer, unique=True, index=True, nullable=True)
    telegram_username = Column(String(255), nullable=True)

    # Personal info
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=True)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)

    # Address
    country = Column(String(10), nullable=True)  # KH, LA, MM, TH
    province = Column(String(255), nullable=True)
    district = Column(String(255), nullable=True)
    commune = Column(String(255), nullable=True)
    street = Column(String(255), nullable=True)

    # Employment
    employment_type = Column(SQLEnum(EmploymentType), nullable=True)
    employer_name = Column(String(255), nullable=True)
    monthly_income = Column(Numeric(12, 2), nullable=True)
    job_title = Column(String(255), nullable=True)

    # KYC
    status = Column(SQLEnum(UserStatus), default=UserStatus.DRAFT)
    kyc_completed = Column(Boolean, default=False)
    kyc_started_at = Column(DateTime, nullable=True)
    kyc_completed_at = Column(DateTime, nullable=True)

    # Referral
    referral_code = Column(String(20), unique=True, index=True, nullable=True)
    referred_by = Column(String(36), ForeignKey("users.id"), nullable=True)

    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    bank_accounts = relationship("BankAccount", back_populates="user")
    telegram_links = relationship("TelegramLink", back_populates="user")
    documents = relationship("Document", back_populates="user")
    wallet = relationship("Wallet", back_populates="user", uselist=False)


class BankAccount(Base):
    """Bank account model."""

    __tablename__ = "bank_accounts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    account_number = Column(String(20), unique=True, index=True, nullable=False)
    account_type = Column(String(50), nullable=False)  # savings, checking, credit
    balance = Column(Numeric(15, 2), default=0)
    currency = Column(String(3), default="USD")
    status = Column(String(20), default="active")
    nickname = Column(String(100), nullable=True)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="bank_accounts")
    transactions = relationship("Transaction", back_populates="bank_account")
    telegram_links = relationship("TelegramLink", back_populates="bank_account")


class Document(Base):
    """Document model for KYC."""

    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    document_type = Column(
        String(50), nullable=False
    )  # id_front, id_back, selfie, income_proof
    file_url = Column(Text, nullable=False)
    status = Column(String(20), default="pending")  # pending, verified, rejected
    verification_result = Column(Text, nullable=True)  # JSON string
    rejection_reason = Column(Text, nullable=True)

    uploaded_at = Column(DateTime, server_default=func.now())
    verified_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="documents")


class Transaction(Base):
    """Transaction model."""

    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    bank_account_id = Column(String(36), ForeignKey("bank_accounts.id"), nullable=False)
    transaction_type = Column(
        String(50), nullable=False
    )  # deposit, withdrawal, transfer
    amount = Column(Numeric(15, 2), nullable=False)
    currency = Column(String(3), default="USD")
    description = Column(Text, nullable=True)
    reference = Column(String(100), unique=True, index=True)
    status = Column(String(20), default="completed")  # pending, completed, failed

    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    bank_account = relationship("BankAccount", back_populates="transactions")


class Wallet(Base):
    """Reward wallet model."""

    __tablename__ = "wallets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    currency = Column(String(3), default="USD")
    available_balance = Column(Numeric(15, 2), default=0)
    pending_balance = Column(Numeric(15, 2), default=0)
    lifetime_earnings = Column(Numeric(15, 2), default=0)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet")


class WalletTransaction(Base):
    """Wallet transaction model."""

    __tablename__ = "wallet_transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    wallet_id = Column(String(36), ForeignKey("wallets.id"), nullable=False)
    transaction_type = Column(
        String(20), nullable=False
    )  # earn, redeem, expire, adjust
    amount = Column(Numeric(15, 2), nullable=False)
    source = Column(String(100), nullable=True)  # referral, mission, cashback
    description = Column(Text, nullable=True)
    status = Column(String(20), default="completed")  # pending, completed, failed

    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    wallet = relationship("Wallet", back_populates="transactions")


class TelegramLink(Base):
    """Telegram-Bank Account Link model."""

    __tablename__ = "telegram_links"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    bank_account_id = Column(String(36), ForeignKey("bank_accounts.id"), nullable=True)
    link_method = Column(String(50), nullable=False)  # qr_code, phone, account_number
    verification_token = Column(String(255), nullable=True)
    status = Column(
        String(20), default="active"
    )  # active, pending_verification, inactive

    created_at = Column(DateTime, server_default=func.now())
    verified_at = Column(DateTime, nullable=True)
    last_used_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="telegram_links")
    bank_account = relationship("BankAccount", back_populates="telegram_links")
    notifications = relationship("TelegramNotification", back_populates="link")


class TelegramNotification(Base):
    """Telegram notification model."""

    __tablename__ = "telegram_notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    link_id = Column(String(36), ForeignKey("telegram_links.id"), nullable=False)
    notification_type = Column(
        String(50), nullable=False
    )  # balance_alert, transaction, loan_reminder
    message = Column(Text, nullable=False)
    priority = Column(String(20), default="medium")  # low, medium, high

    sent_at = Column(DateTime, server_default=func.now())
    read_at = Column(DateTime, nullable=True)

    # Relationships
    link = relationship("TelegramLink", back_populates="notifications")


class Lead(Base):
    """Lead model for lead generation."""

    __tablename__ = "leads"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    phone = Column(String(20), nullable=True)
    name = Column(String(255), nullable=True)
    loan_purpose = Column(String(100), nullable=True)
    monthly_income = Column(String(50), nullable=True)
    employment_type = Column(String(50), nullable=True)
    loan_amount = Column(String(50), nullable=True)
    credit_history = Column(String(50), nullable=True)
    qualified_offers = Column(Text, nullable=True)  # JSON string
    source = Column(String(50), default="telegram_miniapp")
    status = Column(
        String(20), default="submitted"
    )  # saved, submitted, converted, expired
    reward_sent = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
