"""Streak (Daily Check-in) endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, timedelta

from ...db.session import get_db
from ...core.security import get_current_user, TokenData
from ...services.streak_service import StreakService

router = APIRouter()


class CheckInResponse(BaseModel):
    """Check-in response."""
    success: bool
    current_streak: int
    longest_streak: int
    coins_earned: int
    milestone_reached: Optional[str] = None
    message: str


class StreakResponse(BaseModel):
    """Get streak response."""
    current_streak: int
    longest_streak: int
    total_check_ins: int
    last_check_in: Optional[str] = None
    can_check_in: bool
    next_milestone: int


@router.post("/checkin", response_model=CheckInResponse)
async def check_in(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Perform daily check-in using StreakService."""
    result = await StreakService.check_in(db, current_user.user_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Check-in failed")
        )
    
    return CheckInResponse(
        success=True,
        current_streak=result["current_streak"],
        longest_streak=result["longest_streak"],
        coins_earned=result["coins_earned"],
        milestone_reached=result.get("milestone_reached"),
        message=result["message"],
    )


@router.get("/", response_model=StreakResponse)
async def get_streak(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current streak status using StreakService."""
    result = await StreakService.get_streak_status(db, current_user.user_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("message", "Failed to get streak status")
        )
    
    return StreakResponse(
        current_streak=result["current_streak"],
        longest_streak=result["longest_streak"],
        total_check_ins=result["total_check_ins"],
        last_check_in=result.get("last_check_in"),
        can_check_in=result["can_check_in"],
        next_milestone=result["next_milestone"],
    )


@router.get("/history")
async def get_checkin_history(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 30,
):
    """Get check-in history using StreakService."""
    history = await StreakService.get_checkin_history(db, current_user.user_id, limit)
    return {"items": history, "total": len(history)}


@router.post("/reset")
async def reset_streak(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Reset streak (for testing purposes)."""
    result = await StreakService.reset_streak(db, current_user.user_id)
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to reset streak")
        )
    
    return {"success": True, "message": "Streak has been reset"}
