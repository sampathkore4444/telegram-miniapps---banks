"""Loan endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal

from ...db.session import get_db
from ...core.security import get_current_user, TokenData
from ...schemas.loan import (
    LoanCreate,
    LoanUpdate,
    LoanResponse,
    LoanDetailResponse,
    EligibilityRequest,
    EligibilityResult,
    LoanEligibilityRequest,
    LoanEligibilityResult,
    LoanCalculationRequest,
    LoanCalculationResponse,
)
from ...services.loan_service import LoanService

router = APIRouter()


@router.post("/eligibility/check", response_model=EligibilityResult)
async def check_eligibility(
    data: EligibilityRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Check user eligibility for products using LoanService."""
    # Use LoanService business logic
    eligibility = await LoanService.check_eligibility(
        db=db,
        user_id=current_user.user_id,
        monthly_income=Decimal(str(data.monthly_income)),
        employment_type=(
            data.employment_type.value
            if hasattr(data, "employment_type")
            else "salaried"
        ),
        loan_amount=Decimal(str(data.monthly_income * 3)),
        loan_purpose=data.purpose.value if hasattr(data, "purpose") else "personal",
    )

    if not eligibility["eligible"]:
        return EligibilityResult(
            eligible=False,
            products=[],
            preapproval_percentage=eligibility.get("pre_approval_percentage"),
            next_steps=eligibility["reasons"],
        )

    products = []
    if data.purpose == "savings_account":
        products.append(
            {
                "type": "savings_account",
                "name": "Savings Account",
                "features": ["No minimum balance", "Free ATM card", "Mobile banking"],
            }
        )
        next_steps = ["Complete KYC to open account"]

    if data.purpose in ["personal_loan", "business_loan", "credit_card"]:
        if data.employment_type in ["salaried", "business_owner", "self_employed"]:
            products.append(
                {
                    "type": data.purpose,
                    "name": data.purpose.replace("_", " ").title(),
                    "max_amount": 5000 if data.purpose == "personal_loan" else 10000,
                    "interest_rate_range": [1.5, 3.5],
                }
            )
            next_steps = ["Submit loan application", "Upload required documents"]

    preapproval = eligibility.get("pre_approval_percentage", 50)
    if data.existing_customer:
        preapproval += 20
    if data.employment_type == "salaried":
        preapproval += 15
    if data.monthly_income > 500:
        preapproval += 15

    return EligibilityResult(
        eligible=True,
        products=products,
        preapproval_percentage=min(preapproval, 100),
        next_steps=next_steps,
        documents_needed=["ID card", "Proof of income"] if products else None,
    )


@router.post("/eligibility/loan", response_model=LoanEligibilityResult)
async def check_loan_eligibility(
    data: LoanEligibilityRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Check loan eligibility using LoanService."""
    # Use LoanService for eligibility check
    result = await LoanService.check_loan_eligibility(
        db=db,
        user_id=current_user.user_id,
        loan_type=(
            data.loan_type.value
            if hasattr(data.loan_type, "value")
            else str(data.loan_type)
        ),
        requested_amount=Decimal(str(data.requested_amount)),
        requested_tenure=data.requested_tenure,
    )

    return LoanEligibilityResult(
        eligible=result["eligible"],
        pre_approved_amount=result.get("pre_approved_amount"),
        pre_approved_tenure=result.get("pre_approved_tenure"),
        interest_rate=result.get("interest_rate"),
        emi=result.get("emi"),
        required_documents=result.get(
            "required_documents", ["ID card", "Income proof", "Bank statement"]
        ),
        approval_probability=result.get("approval_probability", 0.5),
        next_steps=result.get("next_steps", []),
    )


@router.post("/calculate", response_model=LoanCalculationResponse)
async def calculate_loan(
    data: LoanCalculationRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Calculate loan EMI using LoanService."""
    # Use LoanService for calculation
    calculation = await LoanService.calculate_loan_details(
        db=db,
        principal=Decimal(str(data.principal)),
        term_months=data.tenure_months,
        annual_rate=data.interest_rate,
    )

    total_loan_cost = (
        calculation["total_payment"] + data.processing_fee + data.insurance_fee
    )

    return LoanCalculationResponse(
        emi=calculation["monthly_emi"],
        total_interest=round(calculation["total_interest"], 2),
        total_payment=round(calculation["total_payment"], 2),
        processing_fee=data.processing_fee,
        insurance_fee=data.insurance_fee,
        total_loan_cost=round(total_loan_cost, 2),
        amortization_schedule=calculation.get("amortization_schedule", []),
    )


@router.post("/", response_model=LoanResponse)
async def create_loan(
    loan_data: LoanCreate,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new loan application using LoanService."""
    result = await LoanService.create_loan(
        db=db,
        user_id=current_user.user_id,
        loan_type=(
            loan_data.loan_type.value
            if hasattr(loan_data.loan_type, "value")
            else str(loan_data.loan_type)
        ),
        requested_amount=Decimal(str(loan_data.requested_amount)),
        tenure_months=loan_data.tenure_months,
        purpose=loan_data.purpose,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to create loan"),
        )

    return result["loan"]


@router.get("/", response_model=List[LoanResponse])
async def get_loans(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get user's loans using LoanService."""
    loans = await LoanService.get_user_loans(db, current_user.user_id)
    return loans


@router.get("/{loan_id}", response_model=LoanDetailResponse)
async def get_loan(
    loan_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get loan details using LoanService."""
    loan = await LoanService.get_loan_details(db, current_user.user_id, loan_id)

    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found"
        )

    return loan


@router.post("/{loan_id}/submit")
async def submit_loan(
    loan_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit loan application using LoanService."""
    result = await LoanService.submit_loan(db, current_user.user_id, loan_id)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to submit loan"),
        )

    return result


@router.post("/{loan_id}/cancel")
async def cancel_loan(
    loan_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel loan application using LoanService."""
    result = await LoanService.cancel_loan(db, current_user.user_id, loan_id)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to cancel loan"),
        )

    return result
