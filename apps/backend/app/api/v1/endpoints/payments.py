"""Payments endpoints (KHQR, etc.)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from ...db.session import get_db
from ...core.security import get_current_user, TokenData
from ...services.payment_service import PaymentService
from pydantic import BaseModel

router = APIRouter()


class GenerateQRRequest(BaseModel):
    """Generate KHQR request."""

    amount: Optional[float] = None
    currency: str = "USD"
    merchant_id: Optional[str] = None


class QRCodeResponse(BaseModel):
    """QR code response."""

    qr_code: str
    qr_id: str
    amount: Optional[float] = None
    currency: str
    expires_at: str


@router.post("/khqr/generate", response_model=QRCodeResponse)
async def generate_khqr(
    data: GenerateQRRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate KHQR code for payment using PaymentService."""
    result = await PaymentService.generate_khqr(
        db,
        current_user.user_id,
        amount=data.amount,
        currency=data.currency,
        merchant_id=data.merchant_id,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to generate QR code"),
        )

    return QRCodeResponse(
        qr_code=result["qr_code"],
        qr_id=result["qr_id"],
        amount=result.get("amount"),
        currency=result["currency"],
        expires_at=result["expires_at"],
    )


@router.get("/khqr/{qr_id}/status")
async def get_payment_status(
    qr_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Check payment status using PaymentService."""
    result = await PaymentService.get_khqr_status(db, current_user.user_id, qr_id)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message", "Payment not found"),
        )

    return result


@router.get("/transactions")
async def get_transactions(
    limit: int = 20,
    offset: int = 0,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's transactions using PaymentService."""
    result = await PaymentService.get_user_transactions(
        db, current_user.user_id, limit=limit, offset=offset
    )

    return result


@router.post("/withdraw")
async def withdraw_funds(
    amount: float,
    bank_account_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Withdraw funds to bank account using PaymentService."""
    result = await PaymentService.withdraw_to_bank(
        db, current_user.user_id, amount, bank_account_id
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Withdrawal failed"),
        )

    return result


@router.post("/topup")
async def topup_wallet(
    amount: float,
    payment_method: str = "khqr",
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Top up wallet using PaymentService."""
    result = await PaymentService.topup_wallet(
        db, current_user.user_id, amount, payment_method
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Top-up failed"),
        )

    return result


@router.get("/methods")
async def get_payment_methods(db: Session = Depends(get_db)):
    """Get available payment methods."""
    return await PaymentService.get_payment_methods(db)
