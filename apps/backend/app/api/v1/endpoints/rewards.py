"""Rewards endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...db.session import get_db
from ...core.security import get_current_user, TokenData
from ...schemas.loan import (
    CampaignResponse,
    CampaignSpinResponse,
    MissionResponse,
    MissionCompletionResponse,
)
from ...services.reward_service import RewardService

router = APIRouter()


@router.get("/campaigns", response_model=List[CampaignResponse])
async def get_campaigns(db: Session = Depends(get_db)):
    """Get active campaigns using RewardService."""
    campaigns = await RewardService.get_active_campaigns(db)
    return campaigns


@router.post("/campaigns/{campaign_id}/spin", response_model=CampaignSpinResponse)
async def spin_wheel(
    campaign_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Spin the campaign wheel using RewardService."""
    result = await RewardService.spin_campaign_wheel(
        db, current_user.user_id, campaign_id
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to spin wheel"),
        )

    return CampaignSpinResponse(
        prize=result.get("prize"), transaction_id=result.get("transaction_id")
    )


@router.get("/missions", response_model=List[MissionResponse])
async def get_missions(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get available missions using RewardService."""
    missions = await RewardService.get_user_missions(db, current_user.user_id)
    return missions


@router.post(
    "/missions/{mission_id}/complete", response_model=MissionCompletionResponse
)
async def complete_mission(
    mission_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Complete a mission and claim reward using RewardService."""
    result = await RewardService.complete_mission(db, current_user.user_id, mission_id)

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to complete mission"),
        )

    return MissionCompletionResponse(
        mission_id=mission_id,
        status="completed",
        reward_claimed=True,
        completed_at=result.get("completed_at"),
    )


@router.get("/wallet")
async def get_wallet(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get user's wallet using RewardService."""
    wallet = await RewardService.get_user_wallet(db, current_user.user_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return wallet


@router.get("/transactions")
async def get_transactions(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20,
):
    """Get user's wallet transactions using RewardService."""
    transactions = await RewardService.get_wallet_transactions(
        db, current_user.user_id, limit
    )
    return transactions


@router.post("/spin")
async def spin_wheel_result(
    prize_value: int,
    prize_label: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record spin wheel result and award coins using RewardService."""
    result = await RewardService.award_spin_reward(
        db, current_user.user_id, prize_value, prize_label
    )

    if not result["success"]:
        return {
            "success": False,
            "message": result.get("message", "Failed to record spin"),
        }

    return result
