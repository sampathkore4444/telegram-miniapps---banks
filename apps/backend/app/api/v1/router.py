"""API router configuration."""

from fastapi import APIRouter
from .endpoints import (
    auth,
    users,
    loans,
    referrals,
    rewards,
    payments,
    telegram,
    leads,
    streak,
    cashback,
)

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(loans.router, prefix="/loans", tags=["Loans"])
api_router.include_router(referrals.router, prefix="/referrals", tags=["Referrals"])
api_router.include_router(rewards.router, prefix="/rewards", tags=["Rewards"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(telegram.router, prefix="/telegram", tags=["Telegram"])
api_router.include_router(leads.router, prefix="/leads", tags=["Lead Generation"])
api_router.include_router(streak.router, prefix="/streak", tags=["Streak"])
api_router.include_router(cashback.router, prefix="/cashback", tags=["Cashback"])
