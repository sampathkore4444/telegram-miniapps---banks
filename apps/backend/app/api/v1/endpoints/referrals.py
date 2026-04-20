"""Referral endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...db.session import get_db
from ...core.security import get_current_user, TokenData
from ...schemas.loan import (
    ReferralCodeResponse,
    ReferralStatsResponse,
    ReferralResponse,
)
from ...services.referral_service import ReferralService

router = APIRouter()


@router.get("/code", response_model=ReferralCodeResponse)
async def get_referral_code(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get user's referral code using ReferralService."""
    result = await ReferralService.get_or_create_referral_code(db, current_user.user_id)

    if not result["success"]:
        raise HTTPException(
            status_code=404, detail=result.get("message", "User not found")
        )

    return ReferralCodeResponse(
        code=result["code"],
        total_referrals=result["total_referrals"],
        total_earnings=result["total_earnings"],
    )


@router.get("/stats", response_model=ReferralStatsResponse)
async def get_referral_stats(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get referral statistics using ReferralService."""
    result = await ReferralService.get_referral_stats(db, current_user.user_id)

    if not result["success"]:
        raise HTTPException(
            status_code=404, detail=result.get("message", "User not found")
        )

    return ReferralStatsResponse(
        total_referrals=result["total_referrals"],
        completed_referrals=result["completed_referrals"],
        pending_referrals=result["pending_referrals"],
        total_earnings=result["total_earnings"],
        pending_earnings=result["pending_earnings"],
    )


@router.get("/", response_model=List[ReferralResponse])
async def get_referrals(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get user's referrals using ReferralService."""
    referrals = await ReferralService.get_user_referrals(db, current_user.user_id)
    return referrals


@router.post("/apply")
async def apply_referral_code(
    code: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Apply a referral code using ReferralService."""
    result = await ReferralService.apply_referral_code(db, current_user.user_id, code)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to apply referral code"),
        )

    return {"message": result.get("message", "Referral code applied successfully")}


@router.get("/leaderboard")
async def get_leaderboard(db: Session = Depends(get_db)):
    """Get referral leaderboard using ReferralService."""
    leaderboard = await ReferralService.get_leaderboard(db, limit=10)
    return leaderboard
