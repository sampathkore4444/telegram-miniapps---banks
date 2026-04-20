"""
Referral Service
Business logic for referral operations
"""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import string


class ReferralService:
    """Service for referral operations"""

    REWARD_AMOUNTS = {
        "completed": 25,  # When referred user completes registration
        "first_loan": 50,  # When referred user takes first loan
        "verification": 10,  # When referred user completes KYC
    }

    @staticmethod
    async def get_or_create_referral_code(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get or create referral code for user

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Referral code data
        """
        from app.db.models.user import User, Referral

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return {"success": False, "message": "User not found"}

        # Get existing referral
        referral = db.query(Referral).filter(Referral.referrer_id == user_id).first()

        if not referral:
            # Generate unique code
            code = ReferralService.generate_code()

            while db.query(Referral).filter(Referral.code == code).first():
                code = ReferralService.generate_code()

            referral = Referral(
                referrer_id=user_id, code=code, created_at=datetime.utcnow()
            )
            db.add(referral)
            db.commit()
            db.refresh(referral)

        return {
            "success": True,
            "code": referral.code,
            "total_referrals": referral.total_referrals,
            "total_earned": referral.total_earned,
        }

    @staticmethod
    async def process_referral(
        db: Session, referrer_id: int, referred_phone: str
    ) -> Dict[str, Any]:
        """
        Process a new referral (when someone uses a code)

        Args:
            db: Database session
            referrer_id: Referrer user ID
            referred_phone: Phone number of referred user

        Returns:
            Referral result
        """
        from app.db.models.user import User, Referral

        # Get referrer
        referrer = db.query(User).filter(User.id == referrer_id).first()
        if not referrer:
            return {"success": False, "message": "Referrer not found"}

        # Get referral record
        referral = (
            db.query(Referral).filter(Referral.referrer_id == referrer_id).first()
        )
        if not referral:
            return {"success": False, "message": "Referral code not found"}

        # Check if already referred
        existing = (
            db.query(Referral)
            .filter(
                Referral.referred_phone == referred_phone,
                Referral.referrer_id == referrer_id,
            )
            .first()
        )

        if existing:
            return {"success": False, "message": "Already referred"}

        # Create pending referral
        referred = Referral(
            referrer_id=referrer_id,
            referred_phone=referred_phone,
            status="pending",
            created_at=datetime.utcnow(),
        )
        db.add(referred)

        referrer.referral_count = (referrer.referral_count or 0) + 1
        db.commit()

        return {
            "success": True,
            "message": "Referral recorded",
            "pending_reward": ReferralService.REWARD_AMOUNTS["completed"],
        }

    @staticmethod
    async def complete_referral(
        db: Session, referred_phone: str, milestone: str
    ) -> Dict[str, Any]:
        """
        Complete referral milestone (registration, KYC, loan)

        Args:
            db: Database session
            referred_phone: Phone of referred user
            milestone: Milestone achieved

        Returns:
            Referral completion result
        """
        from app.db.models.user import Referral

        # Find the pending referral
        referral = (
            db.query(Referral)
            .filter(
                Referral.referred_phone == referred_phone, Referral.status == "pending"
            )
            .first()
        )

        if not referral:
            return {"success": False, "message": "No pending referral found"}

        # Calculate reward
        reward = ReferralService.REWARD_AMOUNTS.get(milestone, 0)

        # Update referral
        referral.status = "completed"
        referral.completed_at = datetime.utcnow()
        referral.milestone = milestone
        referral.reward_earned = reward

        # Update referrer stats
        referrer = (
            db.query(Referral)
            .filter(Referral.referrer_id == referral.referrer_id)
            .first()
        )

        if referrer:
            referrer.total_referrals = (referrer.total_referrals or 0) + 1
            referrer.total_earned = (referrer.total_earned or 0) + reward

        db.commit()

        return {
            "success": True,
            "reward": reward,
            "message": f"Referral completed! {reward} reward earned",
        }

    @staticmethod
    async def get_referral_stats(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get referral statistics

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Referral stats
        """
        from app.db.models.user import Referral, User

        referral = db.query(Referral).filter(Referral.referrer_id == user_id).first()

        if not referral:
            return {
                "code": None,
                "total_referrals": 0,
                "total_earned": 0,
                "referrals": [],
            }

        # Get pending referrals
        pending = (
            db.query(Referral)
            .filter(Referral.referrer_id == user_id, Referral.status == "pending")
            .all()
        )

        # Get completed referrals
        completed = (
            db.query(Referral)
            .filter(Referral.referrer_id == user_id, Referral.status == "completed")
            .all()
        )

        return {
            "code": referral.code,
            "total_referrals": referral.total_referrals or 0,
            "total_earned": referral.total_earned or 0,
            "pending_count": len(pending),
            "completed_count": len(completed),
            "pending_referrals": [
                {"phone": r.referred_phone, "date": r.created_at.isoformat()}
                for r in pending
            ],
            "completed_referrals": [
                {
                    "phone": r.referred_phone,
                    "date": r.created_at.isoformat(),
                    "reward": r.reward_earned,
                }
                for r in completed
            ],
        }

    @staticmethod
    async def get_leaderboard(db: Session, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get referral leaderboard

        Args:
            db: Database session
            limit: Number of entries

        Returns:
            Leaderboard data
        """
        from app.db.models.user import Referral, User

        results = (
            db.query(Referral)
            .order_by(Referral.total_referrals.desc())
            .limit(limit)
            .all()
        )

        leaderboard = []
        for i, ref in enumerate(results):
            user = db.query(User).filter(User.id == ref.referrer_id).first()
            leaderboard.append(
                {
                    "rank": i + 1,
                    "name": user.name if user else "Unknown",
                    "referrals": ref.total_referrals or 0,
                    "earnings": ref.total_earned or 0,
                }
            )

        return leaderboard

    @staticmethod
    def generate_code() -> str:
        """Generate random referral code"""
        return "".join(
            secrets.choice(string.ascii_uppercase + string.digits) for _ in range(8)
        )
