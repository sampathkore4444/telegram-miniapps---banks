"""
Reward Service
Business logic for rewards and wallet operations
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal


class RewardService:
    """Service for reward and wallet operations"""

    # Reward types
    REWARD_TYPES = [
        "signup",
        "referral",
        "quiz",
        "mission",
        "promo",
        "cashback",
        "interest",
        "bonus",
    ]

    @staticmethod
    async def get_wallet(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get user's wallet

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Wallet data
        """
        from app.db.models.reward import Wallet, Transaction

        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()

        if not wallet:
            # Create wallet for new user
            wallet = Wallet(
                user_id=user_id, balance=Decimal("0"), created_at=datetime.utcnow()
            )
            db.add(wallet)
            db.commit()
            db.refresh(wallet)

        # Get recent transactions
        recent_txns = (
            db.query(Transaction)
            .filter(Transaction.wallet_id == wallet.id)
            .order_by(Transaction.created_at.desc())
            .limit(10)
            .all()
        )

        return {
            "wallet_id": wallet.id,
            "balance": float(wallet.balance),
            "currency": "USD",
            "created_at": wallet.created_at.isoformat(),
            "recent_transactions": [
                {
                    "id": t.id,
                    "type": t.transaction_type,
                    "amount": float(t.amount),
                    "description": t.description,
                    "created_at": t.created_at.isoformat(),
                }
                for t in recent_txns
            ],
        }

    @staticmethod
    async def credit_wallet(
        db: Session,
        user_id: int,
        amount: Decimal,
        reward_type: str,
        description: str,
        reference: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Credit money to wallet

        Args:
            db: Database session
            user_id: User ID
            amount: Amount to credit
            reward_type: Type of reward
            description: Transaction description
            reference: External reference

        Returns:
            Credit result
        """
        from app.db.models.reward import Wallet, Transaction

        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()

        if not wallet:
            wallet = Wallet(
                user_id=user_id, balance=Decimal("0"), created_at=datetime.utcnow()
            )
            db.add(wallet)

        # Create transaction
        transaction = Transaction(
            wallet_id=wallet.id,
            transaction_type="credit",
            amount=amount,
            balance_after=wallet.balance + amount,
            reward_type=reward_type,
            description=description,
            reference=reference,
            created_at=datetime.utcnow(),
        )

        db.add(transaction)

        # Update balance
        wallet.balance += amount
        wallet.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(wallet)

        return {
            "success": True,
            "new_balance": float(wallet.balance),
            "transaction_id": transaction.id,
        }

    @staticmethod
    async def debit_wallet(
        db: Session,
        user_id: int,
        amount: Decimal,
        description: str,
        reference: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Debit money from wallet

        Args:
            db: Database session
            user_id: User ID
            amount: Amount to debit
            description: Transaction description
            reference: External reference

        Returns:
            Debit result
        """
        from app.db.models.reward import Wallet, Transaction

        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()

        if not wallet:
            return {"success": False, "message": "Wallet not found"}

        if wallet.balance < amount:
            return {"success": False, "message": "Insufficient balance"}

        # Create transaction
        transaction = Transaction(
            wallet_id=wallet.id,
            transaction_type="debit",
            amount=amount,
            balance_after=wallet.balance - amount,
            description=description,
            reference=reference,
            created_at=datetime.utcnow(),
        )

        db.add(transaction)

        # Update balance
        wallet.balance -= amount
        wallet.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(wallet)

        return {
            "success": True,
            "new_balance": float(wallet.balance),
            "transaction_id": transaction.id,
        }

    @staticmethod
    async def award_signup_bonus(db: Session, user_id: int) -> Dict[str, Any]:
        """Award signup bonus"""
        bonus_amount = Decimal("10.00")

        return await RewardService.credit_wallet(
            db, user_id, bonus_amount, "signup", "Welcome bonus for new user"
        )

    @staticmethod
    async def award_referral_bonus(
        db: Session, user_id: int, milestone: str
    ) -> Dict[str, Any]:
        """Award referral bonus"""
        bonus_amounts = {
            "registration": Decimal("10.00"),
            "kyc": Decimal("10.00"),
            "first_loan": Decimal("25.00"),
        }

        amount = bonus_amounts.get(milestone, Decimal("5.00"))

        return await RewardService.credit_wallet(
            db, user_id, amount, "referral", f"Referral bonus - {milestone}"
        )

    @staticmethod
    async def award_quiz_reward(
        db: Session, user_id: int, score: int, total: int
    ) -> Dict[str, Any]:
        """Award quiz completion reward"""
        percentage = (score / total) * 100

        if percentage >= 80:
            amount = Decimal("5.00")
        elif percentage >= 50:
            amount = Decimal("2.00")
        else:
            amount = Decimal("0.50")

        return await RewardService.credit_wallet(
            db, user_id, amount, "quiz", f"Financial quiz completion - {score}/{total}"
        )

    @staticmethod
    async def award_cashback(
        db: Session, user_id: int, transaction_amount: Decimal, percentage: float = 1.0
    ) -> Dict[str, Any]:
        """Award cashback on transaction"""
        cashback = transaction_amount * Decimal(str(percentage / 100))

        if cashback > 0:
            return await RewardService.credit_wallet(
                db, user_id, cashback, "cashback", f"Cashback on transaction"
            )

        return {"success": True, "cashback": 0}

    @staticmethod
    async def get_transaction_history(
        db: Session, user_id: int, limit: int = 50, offset: int = 0
    ) -> Dict[str, Any]:
        """Get wallet transaction history"""
        from app.db.models.reward import Wallet, Transaction

        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()

        if not wallet:
            return {"transactions": [], "total": 0}

        transactions = (
            db.query(Transaction)
            .filter(Transaction.wallet_id == wallet.id)
            .order_by(Transaction.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

        total = db.query(Transaction).filter(Transaction.wallet_id == wallet.id).count()

        return {
            "transactions": [
                {
                    "id": t.id,
                    "type": t.transaction_type,
                    "amount": float(t.amount),
                    "balance_after": float(t.balance_after),
                    "reward_type": t.reward_type,
                    "description": t.description,
                    "reference": t.reference,
                    "created_at": t.created_at.isoformat(),
                }
                for t in transactions
            ],
            "total": total,
        }

    @staticmethod
    async def get_rewards_summary(db: Session, user_id: int) -> Dict[str, Any]:
        """Get rewards summary"""
        from app.db.models.reward import Wallet, Transaction

        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()

        if not wallet:
            return {
                "total_earned": 0,
                "total_spent": 0,
                "current_balance": 0,
                "rewards_by_type": {},
            }

        # Calculate totals
        credits = (
            db.query(Transaction)
            .filter(
                Transaction.wallet_id == wallet.id,
                Transaction.transaction_type == "credit",
            )
            .all()
        )

        debits = (
            db.query(Transaction)
            .filter(
                Transaction.wallet_id == wallet.id,
                Transaction.transaction_type == "debit",
            )
            .all()
        )

        total_earned = sum(float(t.amount) for t in credits)
        total_spent = sum(float(t.amount) for t in debits)

        # Group by reward type
        by_type = {}
        for t in credits:
            reward_type = t.reward_type or "other"
            if reward_type not in by_type:
                by_type[reward_type] = 0
            by_type[reward_type] += float(t.amount)

        return {
            "total_earned": round(total_earned, 2),
            "total_spent": round(total_spent, 2),
            "current_balance": float(wallet.balance),
            "rewards_by_type": by_type,
        }
