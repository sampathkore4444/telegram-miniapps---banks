"""Cashback Service for loan repayments."""

from sqlalchemy.orm import Session
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
import json


class CashbackService:
    """Service for managing cashback rewards on loan repayments."""

    # Cashback configuration
    CASHBACK_TIERS = {
        "on_time": {
            "name": "On-Time Payment",
            "min_days_early": 0,
            "description": "Pay on time",
        },
        "early": {
            "name": "Early Bird",
            "min_days_early": 7,
            "description": "Pay 7+ days early",
        },
        "very_early": {
            "name": "Super Early",
            "min_days_early": 14,
            "description": "Pay 14+ days early",
        },
        "monthly_streak_3": {
            "name": "Consistency Champion",
            "min_consecutive": 3,
            "description": "3 consecutive on-time payments",
        },
        "monthly_streak_6": {
            "name": "Reliability Master",
            "min_consecutive": 6,
            "description": "6 consecutive on-time payments",
        },
        "monthly_streak_12": {
            "name": "Payment Hero",
            "min_consecutive": 12,
            "description": "12 consecutive on-time payments",
        },
    }

    # Cashback percentages by tier
    CASHBACK_PERCENTAGES = {
        "on_time": 0.5,  # 0.5% cashback
        "early": 1.0,  # 1.0% cashback
        "very_early": 1.5,  # 1.5% cashback
        "monthly_streak_3": 0.5,  # +0.5% for 3-month streak
        "monthly_streak_6": 1.0,  # +1.0% for 6-month streak
        "monthly_streak_12": 2.0,  # +2.0% for 12-month streak
    }

    @staticmethod
    async def calculate_cashback(
        db: Session,
        user_id: int,
        loan_id: str,
        payment_amount: Decimal,
        payment_date: datetime,
        due_date: datetime,
    ) -> Dict[str, Any]:
        """Calculate cashback for a loan payment."""
        from ..db.models.loan import Loan, LoanRepayment

        # Get loan details
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
        if not loan:
            return {"success": False, "message": "Loan not found"}

        # Calculate days early/late
        days_early = (due_date - payment_date).days

        # Determine base cashback tier
        cashback_tiers_earned = []
        cashback_percentage = 0

        # Check payment timing tier
        if days_early >= 14:
            cashback_tiers_earned.append("very_early")
            cashback_percentage += CashbackService.CASHBACK_PERCENTAGES["very_early"]
        elif days_early >= 7:
            cashback_tiers_earned.append("early")
            cashback_percentage += CashbackService.CASHBACK_PERCENTAGES["early"]
        elif days_early >= 0:
            cashback_tiers_earned.append("on_time")
            cashback_percentage += CashbackService.CASHBACK_PERCENTAGES["on_time"]

        # Check consecutive payment streak
        consecutive_count = await CashbackService._get_consecutive_payments(
            db, user_id, loan_id
        )

        if consecutive_count >= 12:
            cashback_tiers_earned.append("monthly_streak_12")
            cashback_percentage += CashbackService.CASHBACK_PERCENTAGES[
                "monthly_streak_12"
            ]
        elif consecutive_count >= 6:
            cashback_tiers_earned.append("monthly_streak_6")
            cashback_percentage += CashbackService.CASHBACK_PERCENTAGES[
                "monthly_streak_6"
            ]
        elif consecutive_count >= 3:
            cashback_tiers_earned.append("monthly_streak_3")
            cashback_percentage += CashbackService.CASHBACK_PERCENTAGES[
                "monthly_streak_3"
            ]

        # Calculate cashback amount
        cashback_amount = payment_amount * Decimal(str(cashback_percentage / 100))

        return {
            "success": True,
            "cashback_amount": float(cashback_amount),
            "cashback_percentage": cashback_percentage,
            "tiers_earned": cashback_tiers_earned,
            "days_early": days_early,
            "consecutive_payments": consecutive_count,
        }

    @staticmethod
    async def _get_consecutive_payments(db: Session, user_id: int, loan_id: str) -> int:
        """Get the number of consecutive on-time payments."""
        from ..db.models.loan import LoanRepayment

        repayments = (
            db.query(LoanRepayment)
            .filter(LoanRepayment.loan_id == loan_id, LoanRepayment.status == "paid")
            .order_by(LoanRepayment.payment_number.desc())
            .all()
        )

        consecutive = 0
        for repayment in repayments:
            if repayment.paid_at and repayment.due_date:
                if repayment.paid_at.date() <= repayment.due_date.date():
                    consecutive += 1
                else:
                    break

        return consecutive

    @staticmethod
    async def award_cashback(
        db: Session,
        user_id: int,
        loan_id: str,
        repayment_id: str,
        cashback_amount: Decimal,
        tiers_earned: List[str],
    ) -> Dict[str, Any]:
        """Award cashback to user after successful payment."""
        from ..db.models.user import Wallet, WalletTransaction

        # Get or create wallet
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()

        if not wallet:
            wallet = Wallet(
                id=str(uuid.uuid4()),
                user_id=user_id,
                available_balance=cashback_amount,
                lifetime_earnings=cashback_amount,
            )
            db.add(wallet)
        else:
            wallet.available_balance += cashback_amount
            wallet.lifetime_earnings += cashback_amount

        wallet.updated_at = datetime.utcnow()

        # Create transaction record
        transaction = WalletTransaction(
            id=str(uuid.uuid4()),
            wallet_id=wallet.id,
            transaction_type="earn",
            amount=cashback_amount,
            source="cashback",
            description=f"Loan repayment cashback: {', '.join(tiers_earned)}",
            status="completed",
            completed_at=datetime.utcnow(),
        )
        db.add(transaction)

        # Create cashback record
        from ..db.models.loan import CashbackReward

        cashback_record = CashbackReward(
            id=str(uuid.uuid4()),
            user_id=user_id,
            loan_id=loan_id,
            repayment_id=repayment_id,
            amount=cashback_amount,
            tiers_earned=json.dumps(tiers_earned),
            status="awarded",
        )
        db.add(cashback_record)

        db.commit()
        db.refresh(wallet)

        return {
            "success": True,
            "cashback_amount": float(cashback_amount),
            "new_balance": float(wallet.available_balance),
            "tiers_earned": tiers_earned,
        }

    @staticmethod
    async def get_cashback_summary(db: Session, user_id: int) -> Dict[str, Any]:
        """Get user's cashback summary."""
        from ..db.models.loan import CashbackReward

        cashbacks = (
            db.query(CashbackReward).filter(CashbackReward.user_id == user_id).all()
        )

        total_cashback = sum(c.amount for c in cashbacks)
        cashback_count = len(cashbacks)

        # Get cashback by tier
        tier_totals = {}
        for c in cashbacks:
            tiers = json.loads(c.tiers_earned) if c.tiers_earned else []
            for tier in tiers:
                tier_totals[tier] = tier_totals.get(tier, 0) + float(c.amount)

        return {
            "success": True,
            "total_cashback": float(total_cashback),
            "cashback_count": cashback_count,
            "tier_totals": tier_totals,
            "recent_cashbacks": [
                {
                    "id": c.id,
                    "amount": float(c.amount),
                    "tiers": json.loads(c.tiers_earned) if c.tiers_earned else [],
                    "created_at": c.created_at.isoformat() if c.created_at else None,
                }
                for c in cashbacks[-10:]
            ],
        }

    @staticmethod
    async def get_cashback_tiers() -> List[Dict[str, Any]]:
        """Get all available cashback tiers."""
        return [
            {
                "id": tier_id,
                "name": tier_info["name"],
                "description": tier_info["description"],
                "cashback_percentage": CashbackService.CASHBACK_PERCENTAGES[tier_id],
            }
            for tier_id, tier_info in CashbackService.CASHBACK_TIERS.items()
        ]
