"""
Payment Service
Business logic for payment operations
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal


class PaymentService:
    """Service for payment operations"""

    # Payment providers
    PROVIDERS = ["khqr", "bank_transfer", "wing", "pipay", "aba"]

    @staticmethod
    async def initiate_payment(
        db: Session,
        user_id: int,
        amount: Decimal,
        payment_type: str,
        provider: str,
        metadata: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Initiate a payment

        Args:
            db: Database session
            user_id: User ID
            amount: Payment amount
            payment_type: Type of payment (transfer, bill, loan_repayment)
            provider: Payment provider
            metadata: Additional payment metadata

        Returns:
            Payment initiation result
        """
        from app.db.models.payment import Payment

        if provider not in PaymentService.PROVIDERS:
            return {
                "success": False,
                "message": f"Invalid provider. Available: {', '.join(PaymentService.PROVIDERS)}",
            }

        # Create payment record
        payment = Payment(
            user_id=user_id,
            amount=amount,
            payment_type=payment_type,
            provider=provider,
            status="pending",
            reference=f"PAY{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            created_at=datetime.utcnow(),
            metadata=metadata,
        )

        db.add(payment)
        db.commit()
        db.refresh(payment)

        # Generate provider-specific payment data
        payment_data = PaymentService._generate_provider_data(provider, payment)

        return {
            "success": True,
            "payment_id": payment.id,
            "reference": payment.reference,
            "provider": provider,
            "payment_data": payment_data,
            "expires_at": (datetime.utcnow() + timedelta(minutes=30)).isoformat(),
        }

    @staticmethod
    async def verify_payment(db: Session, payment_id: int) -> Dict[str, Any]:
        """
        Verify payment status

        Args:
            db: Database session
            payment_id: Payment ID

        Returns:
            Verification result
        """
        from app.db.models.payment import Payment

        payment = db.query(Payment).filter(Payment.id == payment_id).first()

        if not payment:
            return {"success": False, "message": "Payment not found"}

        # In production, verify with provider
        # For now, simulate verification
        if payment.status == "pending":
            # Check expiry
            if payment.created_at + timedelta(minutes=30) < datetime.utcnow():
                payment.status = "expired"
                db.commit()
                return {
                    "success": False,
                    "status": "expired",
                    "message": "Payment has expired",
                }

        return {
            "success": True,
            "payment_id": payment.id,
            "status": payment.status,
            "amount": float(payment.amount),
            "reference": payment.reference,
        }

    @staticmethod
    async def confirm_payment(
        db: Session, payment_id: int, provider_reference: str
    ) -> Dict[str, Any]:
        """
        Confirm payment from provider callback

        Args:
            db: Database session
            payment_id: Payment ID
            provider_reference: Provider's transaction reference

        Returns:
            Confirmation result
        """
        from app.db.models.payment import Payment

        payment = db.query(Payment).filter(Payment.id == payment_id).first()

        if not payment:
            return {"success": False, "message": "Payment not found"}

        if payment.status != "pending":
            return {"success": False, "message": f"Payment already {payment.status}"}

        # Update payment
        payment.status = "completed"
        payment.completed_at = datetime.utcnow()
        payment.provider_reference = provider_reference

        # Process based on payment type
        if payment.payment_type == "loan_repayment":
            await PaymentService._process_loan_repayment(db, payment)
        elif payment.payment_type == "bill":
            await PaymentService._process_bill_payment(db, payment)

        db.commit()

        return {
            "success": True,
            "message": "Payment confirmed",
            "payment_id": payment.id,
        }

    @staticmethod
    async def get_payment_history(
        db: Session, user_id: int, limit: int = 20, offset: int = 0
    ) -> Dict[str, Any]:
        """
        Get payment history

        Args:
            db: Database session
            user_id: User ID
            limit: Result limit
            offset: Result offset

        Returns:
            Payment history
        """
        from app.db.models.payment import Payment

        payments = (
            db.query(Payment)
            .filter(Payment.user_id == user_id)
            .order_by(Payment.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

        return {
            "payments": [
                {
                    "id": p.id,
                    "amount": float(p.amount),
                    "type": p.payment_type,
                    "provider": p.provider,
                    "status": p.status,
                    "reference": p.reference,
                    "created_at": p.created_at.isoformat(),
                    "completed_at": (
                        p.completed_at.isoformat() if p.completed_at else None
                    ),
                }
                for p in payments
            ]
        }

    @staticmethod
    async def get_pending_bills(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get pending bills for user

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Pending bills
        """
        from app.db.models.payment import Bill

        bills = (
            db.query(Bill)
            .filter(Bill.user_id == user_id, Bill.status == "pending")
            .order_by(Bill.due_date.asc())
            .all()
        )

        total_due = sum(float(b.amount) for b in bills)

        return {
            "total_due": total_due,
            "bills_count": len(bills),
            "bills": [
                {
                    "id": b.id,
                    "provider": b.provider,
                    "category": b.category,
                    "amount": float(b.amount),
                    "due_date": b.due_date.isoformat(),
                    "account_number": b.account_number,
                }
                for b in bills
            ],
        }

    @staticmethod
    async def pay_bill(
        db: Session, user_id: int, bill_id: int, provider: str
    ) -> Dict[str, Any]:
        """
        Pay a bill

        Args:
            db: Database session
            user_id: User ID
            bill_id: Bill ID
            provider: Payment provider

        Returns:
            Payment result
        """
        from app.db.models.payment import Bill

        bill = (
            db.query(Bill).filter(Bill.id == bill_id, Bill.user_id == user_id).first()
        )

        if not bill:
            return {"success": False, "message": "Bill not found"}

        if bill.status != "pending":
            return {"success": False, "message": "Bill already paid"}

        # Create payment
        return await PaymentService.initiate_payment(
            db,
            user_id,
            Decimal(str(bill.amount)),
            "bill",
            provider,
            {"bill_id": bill_id},
        )

    @staticmethod
    def _generate_provider_data(provider: str, payment) -> Dict[str, Any]:
        """Generate provider-specific payment data"""
        providers = {
            "khqr": {
                "type": "qr",
                "qr_data": f"KHQR|{payment.reference}|BANK001|{float(payment.amount)}",
            },
            "bank_transfer": {
                "bank": "Bank of Cambodia",
                "account": "123456789",
                "name": "Bank Mini App",
            },
            "wing": {"phone": "012345678"},
            "pipay": {"merchant_id": "MERCH001"},
            "aba": {"account": "123456789"},
        }
        return providers.get(provider, {})

    @staticmethod
    async def _process_loan_repayment(db: Session, payment):
        """Process loan repayment after payment"""
        from app.db.models.loan import Loan

        # Find the loan and update balance
        loan = (
            db.query(Loan)
            .filter(Loan.user_id == payment.user_id, Loan.status == "active")
            .first()
        )

        if loan:
            loan.principal_paid = (loan.principal_paid or 0) + float(payment.amount)

            # Check if loan is fully paid
            if loan.principal_paid >= loan.principal_amount:
                loan.status = "paid"

    @staticmethod
    async def _process_bill_payment(db: Session, payment):
        """Process bill payment after payment"""
        from app.db.models.payment import Bill

        metadata = payment.metadata or {}
        bill_id = metadata.get("bill_id")

        if bill_id:
            bill = db.query(Bill).filter(Bill.id == bill_id).first()
            if bill:
                bill.status = "paid"
                bill.paid_at = datetime.utcnow()
