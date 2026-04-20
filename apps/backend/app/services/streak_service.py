"""Streak Service for Daily Check-in."""

from sqlalchemy.orm import Session
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta, date
import uuid

from ..db.models.user import User, Wallet, WalletTransaction


class StreakService:
    """Service for managing user check-in streaks."""

    # Streak milestones and rewards
    MILESTONES = {
        1: {"coins": 5, "label": "Day 1"},
        3: {"coins": 15, "label": "Day 3 Bonus"},
        7: {"coins": 50, "label": "Week Streak!"},
        14: {"coins": 100, "label": "2 Week Streak!"},
        30: {"coins": 300, "label": "Month Streak!!"},
        60: {"coins": 500, "label": "2 Month Streak!"},
        90: {"coins": 1000, "label": "Mega Streak!!!"},
    }

    # Daily check-in reward
    DAILY_REWARD = 2  # 2 coins per day

    @staticmethod
    async def check_in(db: Session, user_id: int) -> Dict[str, Any]:
        """Perform daily check-in."""
        from ..db.models.loan import CheckIn

        # Check if already checked in today
        today = date.today()
        existing = (
            db.query(CheckIn)
            .filter(CheckIn.user_id == user_id, CheckIn.check_in_date == today)
            .first()
        )

        if existing:
            return {"success": False, "message": "You have already checked in today!"}

        # Get or create streak data
        streak_data = StreakService._get_or_create_streak(db, user_id)

        # Calculate new streak
        yesterday = today - timedelta(days=1)
        if streak_data["last_check_in"] == yesterday:
            new_streak = streak_data["current_streak"] + 1
        else:
            new_streak = 1

        # Update streak
        streak_data["current_streak"] = new_streak
        streak_data["last_check_in"] = today
        streak_data["total_check_ins"] += 1

        if new_streak > streak_data["longest_streak"]:
            streak_data["longest_streak"] = new_streak

        # Create check-in record
        check_in = CheckIn(
            id=str(uuid.uuid4()),
            user_id=user_id,
            check_in_date=today,
            streak_count=new_streak,
        )
        db.add(check_in)

        # Calculate coins to award
        coins_earned = StreakService.DAILY_REWARD
        milestone_reached = None

        # Check for milestone bonus
        if new_streak in StreakService.MILESTONES:
            milestone_reached = StreakService.MILESTONES[new_streak]["label"]
            coins_earned += StreakService.MILESTONES[new_streak]["coins"]

        # Award coins
        await StreakService._award_coins(
            db, user_id, coins_earned, f"Daily check-in streak: {new_streak} days"
        )

        # Update streak data in database
        StreakService._save_streak_data(db, user_id, streak_data)

        db.commit()

        return {
            "success": True,
            "current_streak": new_streak,
            "longest_streak": streak_data["longest_streak"],
            "coins_earned": coins_earned,
            "milestone_reached": milestone_reached,
            "message": f"Check-in successful! Day {new_streak} streak!",
        }

    @staticmethod
    async def get_streak_status(db: Session, user_id: int) -> Dict[str, Any]:
        """Get current streak status."""
        streak_data = StreakService._get_or_create_streak(db, user_id)
        today = date.today()
        yesterday = today - timedelta(days=1)

        # Check if can check in
        last_check_in = streak_data["last_check_in"]
        if last_check_in == today:
            can_check_in = False
        elif last_check_in == yesterday:
            can_check_in = True
        elif last_check_in is None:
            can_check_in = True
        else:
            # Streak broken
            streak_data["current_streak"] = 0
            StreakService._save_streak_data(db, user_id, streak_data)
            db.commit()
            can_check_in = True

        # Find next milestone
        current = streak_data["current_streak"]
        next_milestone = None
        for milestone in sorted(StreakService.MILESTONES.keys()):
            if milestone > current:
                next_milestone = milestone
                break

        return {
            "success": True,
            "current_streak": streak_data["current_streak"],
            "longest_streak": streak_data["longest_streak"],
            "total_check_ins": streak_data["total_check_ins"],
            "last_check_in": (
                streak_data["last_check_in"].isoformat()
                if streak_data["last_check_in"]
                else None
            ),
            "can_check_in": can_check_in,
            "next_milestone": next_milestone or 999,
        }

    @staticmethod
    async def get_checkin_history(
        db: Session, user_id: int, limit: int = 30
    ) -> List[Dict]:
        """Get check-in history."""
        from ..db.models.loan import CheckIn

        check_ins = (
            db.query(CheckIn)
            .filter(CheckIn.user_id == user_id)
            .order_by(CheckIn.check_in_date.desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "date": c.check_in_date.isoformat(),
                "streak_count": c.streak_count,
            }
            for c in check_ins
        ]

    @staticmethod
    async def reset_streak(db: Session, user_id: int) -> Dict[str, Any]:
        """Reset streak for a user (for testing)."""
        from ..db.models.loan import CheckIn

        # Delete all check-ins
        db.query(CheckIn).filter(CheckIn.user_id == user_id).delete()

        # Reset streak data
        streak_data = {
            "current_streak": 0,
            "longest_streak": 0,
            "total_check_ins": 0,
            "last_check_in": None,
        }
        StreakService._save_streak_data(db, user_id, streak_data)

        db.commit()

        return {"success": True, "message": "Streak has been reset"}

    @staticmethod
    def _get_or_create_streak(db: Session, user_id: int) -> Dict:
        """Get or create streak data for user."""
        from ..db.models.loan import Streak

        streak = db.query(Streak).filter(Streak.user_id == user_id).first()

        if not streak:
            streak = Streak(
                id=str(uuid.uuid4()),
                user_id=user_id,
                current_streak=0,
                longest_streak=0,
                total_check_ins=0,
            )
            db.add(streak)
            db.commit()
            db.refresh(streak)

        return {
            "current_streak": streak.current_streak,
            "longest_streak": streak.longest_streak,
            "total_check_ins": streak.total_check_ins,
            "last_check_in": streak.last_check_in,
        }

    @staticmethod
    def _save_streak_data(db: Session, user_id: int, data: Dict):
        """Save streak data to database."""
        from ..db.models.loan import Streak

        streak = db.query(Streak).filter(Streak.user_id == user_id).first()

        if streak:
            streak.current_streak = data["current_streak"]
            streak.longest_streak = data["longest_streak"]
            streak.total_check_ins = data["total_check_ins"]
            streak.last_check_in = data["last_check_in"]
            streak.updated_at = datetime.utcnow()
        else:
            streak = Streak(
                id=str(uuid.uuid4()),
                user_id=user_id,
                current_streak=data["current_streak"],
                longest_streak=data["longest_streak"],
                total_check_ins=data["total_check_ins"],
                last_check_in=data["last_check_in"],
            )
            db.add(streak)

    @staticmethod
    async def _award_coins(db: Session, user_id: int, amount: float, description: str):
        """Award coins to user's wallet."""
        from decimal import Decimal

        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()

        if not wallet:
            wallet = Wallet(
                id=str(uuid.uuid4()),
                user_id=user_id,
                available_balance=Decimal(str(amount)),
                lifetime_earnings=Decimal(str(amount)),
            )
            db.add(wallet)
        else:
            wallet.available_balance += Decimal(str(amount))
            wallet.lifetime_earnings += Decimal(str(amount))

        wallet.updated_at = datetime.utcnow()

        # Create transaction record
        transaction = WalletTransaction(
            id=str(uuid.uuid4()),
            wallet_id=wallet.id,
            transaction_type="earn",
            amount=Decimal(str(amount)),
            source="streak",
            description=description,
            status="completed",
            completed_at=datetime.utcnow(),
        )
        db.add(transaction)
