"""Telegram-Bank App Linkage endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...db.session import get_db
from ...core.security import (
    get_current_user,
    TokenData,
    generate_verification_code,
    generate_uuid,
)
from ...schemas.user import (
    TelegramLinkRequest,
    TelegramLinkResponse,
    LinkedAccountResponse,
    NotificationPreferences,
)
from ...services.user_service import UserService
from ...services.notification_service import NotificationService
from pydantic import BaseModel

router = APIRouter()


class LinkInitiateRequest(BaseModel):
    """Initiate link request."""

    link_method: str  # qr_code, phone, account_number
    bank_account_id: str = None


class LinkInitiateResponse(BaseModel):
    """Initiate link response."""

    request_id: str
    verification_code: str = None
    message: str


class UnlinkRequest(BaseModel):
    """Unlink request."""

    link_id: str
    confirmation_code: str


@router.post("/link/initiate", response_model=LinkInitiateResponse)
async def initiate_link(
    data: LinkInitiateRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Initiate linking process using UserService."""
    result = await UserService.initiate_bank_link(
        db,
        current_user.user_id,
        link_method=data.link_method,
        bank_account_id=data.bank_account_id,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to initiate link"),
        )

    return LinkInitiateResponse(
        request_id=result["request_id"],
        verification_code=result.get("verification_code"),
        message=result["message"],
    )


@router.post("/link/verify", response_model=TelegramLinkResponse)
async def verify_link(
    request_id: str,
    verification_code: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verify and complete linking using UserService."""
    result = await UserService.verify_bank_link(
        db, current_user.user_id, request_id, verification_code
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to verify link"),
        )

    return TelegramLinkResponse(
        link_id=result["link_id"],
        bank_account_id=result.get("bank_account_id"),
        bank_account_last4=result.get("bank_account_last4"),
        linked_at=result["linked_at"],
        status=result["status"],
    )


@router.get("/link/status", response_model=List[LinkedAccountResponse])
async def get_link_status(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get linked accounts using UserService."""
    links = await UserService.get_linked_accounts(db, current_user.user_id)
    return links


@router.delete("/link/delete")
async def delete_link(
    data: UnlinkRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Unlink an account using UserService."""
    result = await UserService.unlink_bank_account(
        db, current_user.user_id, data.link_id, data.confirmation_code
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to unlink account"),
        )

    return {"message": result.get("message", "Account unlinked successfully")}


@router.put("/notifications/preferences")
async def update_notification_preferences(
    prefs: NotificationPreferences,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update notification preferences using NotificationService."""
    result = await NotificationService.update_telegram_preferences(
        db, current_user.user_id, prefs.model_dump()
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to update preferences"),
        )

    return {"message": result.get("message", "Preferences updated successfully")}


@router.get("/notifications")
async def get_notifications(
    limit: int = 20,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get notifications sent to Telegram using NotificationService."""
    result = await NotificationService.get_telegram_notifications(
        db, current_user.user_id, limit=limit
    )

    return result


@router.post("/notifications/send")
async def send_notification(
    message: str,
    notification_type: str = "general",
    priority: str = "normal",
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a notification via Telegram using NotificationService."""
    result = await NotificationService.send_telegram_notification(
        db,
        current_user.user_id,
        message=message,
        notification_type=notification_type,
        priority=priority,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to send notification"),
        )

    return result
