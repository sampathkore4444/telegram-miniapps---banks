"""Cashback endpoints for loan repayments."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from decimal import Decimal
from datetime import datetime
from pydantic import BaseModel

from ...db.session import get_db
from ...core.security import get_current_user, TokenData
from ...services.cashback_service import CashbackService

router = APIRouter()


class CashbackCalculateRequest(BaseModel):
    """Calculate cashback request."""

    loan_id: str
    payment_amount: float
    payment_date: str
    due_date: str


class CashbackAwardRequest(BaseModel):
    """Award cashback request."""

    loan_id: str
    repayment_id: str
    payment_amount: float
    payment_date: str
    due_date: str


class CashbackResponse(BaseModel):
    """Cashback response."""

    success: bool
    cashback_amount: float
    cashback_percentage: float
    tiers_earned: List[str]
    days_early: int
    consecutive_payments: int


class CashbackSummaryResponse(BaseModel):
    """Cashback summary response."""

    success: bool
    total_cashback: float
    cashback_count: int
    tier_totals: dict
    recent_cashbacks: List[dict]


@router.post("/calculate", response_model=CashbackResponse)
async def calculate_cashback(
    data: CashbackCalculateRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Calculate potential cashback for a loan payment."""
    result = await CashbackService.calculate_cashback(
        db=db,
        user_id=current_user.user_id,
        loan_id=data.loan_id,
        payment_amount=Decimal(str(data.payment_amount)),
        payment_date=datetime.fromisoformat(data.payment_date),
        due_date=datetime.fromisoformat(data.due_date),
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to calculate cashback"),
        )

    return CashbackResponse(
        success=True,
        cashback_amount=result["cashback_amount"],
        cashback_percentage=result["cashback_percentage"],
        tiers_earned=result["tiers_earned"],
        days_early=result["days_early"],
        consecutive_payments=result["consecutive_payments"],
    )


@router.post("/award")
async def award_cashback(
    data: CashbackAwardRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Award cashback after successful loan payment."""
    # First calculate cashback
    calc_result = await CashbackService.calculate_cashback(
        db=db,
        user_id=current_user.user_id,
        loan_id=data.loan_id,
        payment_amount=Decimal(str(data.payment_amount)),
        payment_date=datetime.fromisoformat(data.payment_date),
        due_date=datetime.fromisoformat(data.due_date),
    )

    if not calc_result["success"]:
        return {"success": False, "message": "Failed to calculate cashback"}

    # Award cashback if there's any
    if calc_result["cashback_amount"] > 0:
        result = await CashbackService.award_cashback(
            db=db,
            user_id=current_user.user_id,
            loan_id=data.loan_id,
            repayment_id=data.repayment_id,
            cashback_amount=Decimal(str(calc_result["cashback_amount"])),
            tiers_earned=calc_result["tiers_earned"],
        )

        return result

    return {
        "success": True,
        "cashback_amount": 0,
        "message": "No cashback earned for this payment",
    }


@router.get("/summary", response_model=CashbackSummaryResponse)
async def get_cashback_summary(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's cashback summary."""
    result = await CashbackService.get_cashback_summary(db, current_user.user_id)
    return CashbackSummaryResponse(**result)


@router.get("/tiers")
async def get_cashback_tiers(db: Session = Depends(get_db)):
    """Get all available cashback tiers."""
    tiers = await CashbackService.get_cashback_tiers()
    return {"items": tiers, "total": len(tiers)}
