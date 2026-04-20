"""
Loan Service
Business logic for loan operations
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from decimal import Decimal
import math


class LoanService:
    """Service for loan-related operations"""

    # Loan configuration
    MIN_LOAN_AMOUNT = 100
    MAX_LOAN_AMOUNT = 50000
    MIN_TERM_MONTHS = 1
    MAX_TERM_MONTHS = 60

    # Interest rates by loan type
    INTEREST_RATES = {
        "personal": {"min": 12, "max": 18},
        "business": {"min": 10, "max": 15},
        "home": {"min": 8, "max": 12},
        "education": {"min": 6, "max": 10},
    }

    @staticmethod
    async def check_eligibility(
        db: Session,
        user_id: int,
        monthly_income: Decimal,
        employment_type: str,
        loan_amount: Decimal,
        loan_purpose: str,
    ) -> Dict[str, Any]:
        """
        Check loan eligibility

        Args:
            db: Database session
            user_id: User ID
            monthly_income: Monthly income
            employment_type: Employment type
            loan_amount: Requested loan amount
            loan_purpose: Loan purpose

        Returns:
            Eligibility result dictionary
        """
        # Basic eligibility rules
        eligible = True
        reasons = []

        # Check minimum income
        if monthly_income < 150:
            eligible = False
            reasons.append("Monthly income below minimum requirement")

        # Check loan amount limits
        if loan_amount < LoanService.MIN_LOAN_AMOUNT:
            eligible = False
            reasons.append(f"Minimum loan amount is ${LoanService.MIN_LOAN_AMOUNT}")

        if loan_amount > LoanService.MAX_LOAN_AMOUNT:
            eligible = False
            reasons.append(f"Maximum loan amount is ${LoanService.MAX_LOAN_AMOUNT}")

        # Calculate affordability (debt-to-income ratio should be < 40%)
        estimated_emi = LoanService.calculate_emi(
            loan_amount, 24, 12  # 24 months default  # 12% default rate
        )

        dti_ratio = (estimated_emi / monthly_income) * 100
        if dti_ratio > 40:
            eligible = False
            reasons.append("Loan would exceed debt-to-income ratio limit")

        # Calculate pre-approval percentage
        pre_approval = 0
        if eligible:
            pre_approval = 85
            if monthly_income >= 500:
                pre_approval += 10
            if employment_type == "salaried":
                pre_approval += 5

        # Get recommended loan type
        recommended_type = loan_purpose
        if recommended_type not in LoanService.INTEREST_RATES:
            recommended_type = "personal"

        return {
            "eligible": eligible,
            "reasons": reasons,
            "pre_approval_percentage": pre_approval,
            "max_amount": min(loan_amount * 3, LoanService.MAX_LOAN_AMOUNT),
            "interest_rate_range": LoanService.INTEREST_RATES[recommended_type],
            "recommended_type": recommended_type,
            "documents_required": LoanService.get_required_docs(loan_purpose),
        }

    @staticmethod
    async def calculate_loan_details(
        principal: Decimal, term_months: int, annual_rate: float
    ) -> Dict[str, Any]:
        """
        Calculate loan EMI and amortization

        Args:
            principal: Loan amount
            term_months: Loan term in months
            annual_rate: Annual interest rate

        Returns:
            Loan calculation details
        """
        monthly_rate = annual_rate / 12 / 100

        # Calculate EMI
        if monthly_rate > 0:
            emi = (
                principal
                * monthly_rate
                * ((1 + monthly_rate) ** term_months)
                / (((1 + monthly_rate) ** term_months) - 1)
            )
        else:
            emi = principal / term_months

        total_payment = emi * term_months
        total_interest = total_payment - principal

        # Generate amortization schedule
        schedule = []
        balance = principal

        for month in range(1, term_months + 1):
            interest_payment = balance * monthly_rate
            principal_payment = emi - interest_payment
            balance -= principal_payment

            schedule.append(
                {
                    "month": month,
                    "principal": float(round(principal_payment, 2)),
                    "interest": float(round(interest_payment, 2)),
                    "balance": float(round(max(0, balance), 2)),
                }
            )

        return {
            "principal": float(principal),
            "term_months": term_months,
            "annual_rate": annual_rate,
            "monthly_emi": float(round(emi, 2)),
            "total_interest": float(round(total_interest, 2)),
            "total_payment": float(round(total_payment, 2)),
            "amortization_schedule": schedule,
        }

    @staticmethod
    def calculate_emi(
        principal: Decimal, term_months: int, annual_rate: float
    ) -> float:
        """Calculate EMI"""
        if annual_rate == 0:
            return float(principal / term_months)

        monthly_rate = annual_rate / 12 / 100
        emi = (
            float(principal)
            * monthly_rate
            * ((1 + monthly_rate) ** term_months)
            / (((1 + monthly_rate) ** term_months) - 1)
        )
        return round(emi, 2)

    @staticmethod
    def get_required_docs(loan_purpose: str) -> List[str]:
        """Get required documents for loan purpose"""
        docs_map = {
            "personal": ["ID Card", "Proof of Income"],
            "business": ["ID Card", "Business License", "Bank Statement"],
            "education": ["ID Card", "Enrollment Letter", "Proof of Income"],
            "home": ["ID Card", "Proof of Income", "Property Documents"],
        }
        return docs_map.get(loan_purpose, ["ID Card", "Proof of Income"])

    @staticmethod
    async def process_loan_application(
        db: Session, user_id: int, application_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process loan application

        Args:
            db: Database session
            user_id: User ID
            application_data: Application data

        Returns:
            Application result
        """
        # Check eligibility first
        eligibility = await LoanService.check_eligibility(
            db,
            user_id,
            application_data.get("monthly_income"),
            application_data.get("employment_type"),
            application_data.get("loan_amount"),
            application_data.get("loan_purpose"),
        )

        if not eligibility["eligible"]:
            return {"approved": False, "reasons": eligibility["reasons"]}

        # Auto-approve for small amounts
        if application_data.get("loan_amount", 0) <= 1000:
            return {
                "approved": True,
                "auto_approved": True,
                "loan_id": f"LN{user_id}{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                "interest_rate": eligibility["interest_rate_range"]["min"],
            }

        # Manual review for larger amounts
        return {
            "approved": False,
            "pending_review": True,
            "message": "Your application is under review",
        }

    @staticmethod
    async def get_loan_summary(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get loan summary for user

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Loan summary
        """
        from app.db.models.loan import Loan, LoanApplication

        # Get active loans
        active_loans = (
            db.query(Loan)
            .filter(Loan.user_id == user_id, Loan.status == "active")
            .all()
        )

        # Get pending applications
        pending_apps = (
            db.query(LoanApplication)
            .filter(
                LoanApplication.user_id == user_id, LoanApplication.status == "pending"
            )
            .all()
        )

        total_outstanding = sum(
            float(loan.principal_amount - loan.principal_paid or 0)
            for loan in active_loans
        )

        return {
            "active_loans_count": len(active_loans),
            "total_outstanding": round(total_outstanding, 2),
            "pending_applications": len(pending_apps),
            "loans": [
                {
                    "id": loan.id,
                    "type": loan.loan_type,
                    "amount": float(loan.principal_amount),
                    "remaining": float(
                        loan.principal_amount - (loan.principal_paid or 0)
                    ),
                    "monthly_payment": float(loan.monthly_emi),
                    "next_due": (
                        loan.next_payment_date.isoformat()
                        if loan.next_payment_date
                        else None
                    ),
                    "status": loan.status,
                }
                for loan in active_loans
            ],
        }
