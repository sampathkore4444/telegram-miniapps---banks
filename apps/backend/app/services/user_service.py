"""
User Service
Business logic for user management
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.models.user import User
from app.db.models.loan import Loan, LoanApplication
from app.schemas.user import UserCreate, UserUpdate, UserResponse


class UserService:
    """Service for user-related operations"""

    @staticmethod
    async def create_user(db: Session, user_data: UserCreate) -> User:
        """
        Create a new user

        Args:
            db: Database session
            user_data: User creation data

        Returns:
            Created user instance
        """
        # Check if user already exists
        existing_user = (
            db.query(User)
            .filter((User.phone == user_data.phone) | (User.email == user_data.email))
            .first()
        )

        if existing_user:
            raise ValueError("User with this phone or email already exists")

        # Create new user
        user = User(
            phone=user_data.phone,
            email=user_data.email,
            name=user_data.name,
            telegram_id=user_data.telegram_id,
            created_at=datetime.utcnow(),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    async def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
        """
        Get user by ID

        Args:
            db: Database session
            user_id: User ID

        Returns:
            User instance or None
        """
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    async def get_user_by_phone(db: Session, phone: str) -> Optional[User]:
        """
        Get user by phone number

        Args:
            db: Database session
            phone: Phone number

        Returns:
            User instance or None
        """
        return db.query(User).filter(User.phone == phone).first()

    @staticmethod
    async def get_user_by_telegram(db: Session, telegram_id: str) -> Optional[User]:
        """
        Get user by Telegram ID

        Args:
            db: Database session
            telegram_id: Telegram user ID

        Returns:
            User instance or None
        """
        return db.query(User).filter(User.telegram_id == telegram_id).first()

    @staticmethod
    async def update_user(
        db: Session, user_id: int, user_data: UserUpdate
    ) -> Optional[User]:
        """
        Update user information

        Args:
            db: Database session
            user_id: User ID
            user_data: Update data

        Returns:
            Updated user instance or None
        """
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return None

        # Update fields
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        user.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(user)

        return user

    @staticmethod
    async def get_user_profile(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get complete user profile with accounts and stats

        Args:
            db: Database session
            user_id: User ID

        Returns:
            User profile dictionary
        """
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return None

        # Get user's loans
        loans = db.query(Loan).filter(Loan.user_id == user_id).all()

        # Get user's loan applications
        applications = (
            db.query(LoanApplication).filter(LoanApplication.user_id == user_id).all()
        )

        return {
            "id": user.id,
            "phone": user.phone,
            "email": user.email,
            "name": user.name,
            "telegram_id": user.telegram_id,
            "is_verified": user.is_verified,
            "kyc_status": user.kyc_status,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "stats": {
                "total_loans": len(loans),
                "active_loans": len([l for l in loans if l.status == "active"]),
                "pending_applications": len(
                    [a for a in applications if a.status == "pending"]
                ),
                "total_borrowed": sum(
                    l.principal_amount for l in loans if l.status == "active"
                ),
            },
        }

    @staticmethod
    async def delete_user(db: Session, user_id: int) -> bool:
        """
        Delete user account

        Args:
            db: Database session
            user_id: User ID

        Returns:
            True if deleted, False otherwise
        """
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return False

        # Check for active loans
        active_loans = (
            db.query(Loan)
            .filter(Loan.user_id == user_id, Loan.status == "active")
            .count()
        )

        if active_loans > 0:
            raise ValueError("Cannot delete account with active loans")

        db.delete(user)
        db.commit()

        return True

    @staticmethod
    async def search_users(db: Session, query: str, limit: int = 20) -> List[User]:
        """
        Search users by name or phone

        Args:
            db: Database session
            query: Search query
            limit: Maximum results

        Returns:
            List of matching users
        """
        return (
            db.query(User)
            .filter((User.name.ilike(f"%{query}%")) | (User.phone.ilike(f"%{query}%")))
            .limit(limit)
            .all()
        )
