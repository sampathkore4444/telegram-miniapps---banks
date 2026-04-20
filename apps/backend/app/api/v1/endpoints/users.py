"""User endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...db.session import get_db
from ...core.security import get_current_user, TokenData
from ...schemas.user import (
    UserResponse,
    UserUpdate,
    UserProfileResponse,
    BankAccountResponse,
    WalletResponse,
    WalletTransactionResponse,
    LinkedAccountResponse,
    NotificationPreferences,
)
from ...schemas.common import MessageResponse
from ...services.user_service import UserService
from ...services.reward_service import RewardService
from ...db.models.user import User, BankAccount, Wallet, TelegramLink

router = APIRouter()


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get current user profile using UserService."""
    profile = await UserService.get_user_profile(db, current_user.user_id)

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    # Get wallet balance
    wallet_data = await RewardService.get_wallet(db, current_user.user_id)

    # Get linked accounts
    links = (
        db.query(TelegramLink)
        .filter(
            TelegramLink.user_id == current_user.user_id,
            TelegramLink.status == "active",
        )
        .all()
    )

    linked_accounts = []
    for link in links:
        if link.bank_account:
            linked_accounts.append(
                {
                    "account_id": link.bank_account.id,
                    "last4": link.bank_account.account_number[-4:],
                    "type": link.bank_account.account_type,
                    "nickname": link.bank_account.nickname,
                }
            )

    return UserProfileResponse(
        id=profile["id"],
        first_name=profile.get("name", "").split()[0] if profile.get("name") else None,
        last_name=(
            " ".join(profile.get("name", "").split()[1:])
            if profile.get("name")
            else None
        ),
        phone=profile["phone"],
        email=profile.get("email"),
        country=None,
        employment_type=None,
        monthly_income=None,
        status="active",
        kyc_completed=profile.get("kyc_status") == "verified",
        kyc_progress=100 if profile.get("kyc_status") == "verified" else 50,
        referral_code=None,
        wallet_balance=wallet_data["balance"],
        linked_accounts=linked_accounts,
    )


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update current user profile using UserService."""
    from ...schemas.user import UserUpdate as UserUpdateSchema

    # Convert to dict format
    update_dict = user_data.model_dump(exclude_unset=True)
    if "employment_type" in update_dict and update_dict["employment_type"]:
        update_dict["employment_type"] = update_dict["employment_type"].value

    updated_user = await UserService.update_user(
        db, current_user.user_id, UserUpdateSchema(**update_dict)
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return updated_user


@router.get("/accounts", response_model=List[BankAccountResponse])
def get_user_accounts(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get user's bank accounts."""
    accounts = (
        db.query(BankAccount).filter(BankAccount.user_id == current_user.user_id).all()
    )
    return accounts


@router.get("/wallet", response_model=WalletResponse)
async def get_user_wallet(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get user's wallet using RewardService."""
    wallet_data = await RewardService.get_wallet(db, current_user.user_id)

    return WalletResponse(
        id=wallet_data["wallet_id"],
        balance=wallet_data["balance"],
        currency=wallet_data["currency"],
        status="active",
    )


@router.get("/wallet/transactions", response_model=List[WalletTransactionResponse])
async def get_wallet_transactions(
    current_user: TokenData = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Get wallet transactions using RewardService."""
    transactions_data = await RewardService.get_transaction_history(
        db, current_user.user_id
    )

    return [
        WalletTransactionResponse(
            id=t["id"],
            transaction_type=t["type"],
            amount=t["amount"],
            description=t["description"],
            balance_after=t["balance_after"],
            created_at=t["created_at"],
        )
        for t in transactions_data["transactions"]
    ]
