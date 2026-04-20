"""Lead Generation endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ...db.session import get_db
from ...core.security import get_current_user, TokenData
from ...services.lead_service import LeadService

router = APIRouter()


class LeadSubmitRequest(BaseModel):
    """Lead submission request."""

    phone: str
    name: str
    answers: dict
    source: str = "telegram_miniapp"


class LeadSaveRequest(BaseModel):
    """Save lead for later request."""

    answers: dict
    matched_offer_ids: List[str]


class LeadConvertRequest(BaseModel):
    """Convert saved lead to submitted."""

    phone: str
    name: str


class LeadResponse(BaseModel):
    """Lead response."""

    id: str
    loan_purpose: Optional[str]
    monthly_income: Optional[str]
    employment_type: Optional[str]
    status: str
    qualified_offers: List[dict]
    created_at: str


class OfferResponse(BaseModel):
    """Partner offer response."""

    id: str
    bank_name: str
    product_name: str
    min_rate: float
    max_rate: float
    max_amount: float
    processing_fee: float


@router.post("/")
async def submit_lead(
    data: LeadSubmitRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit a lead with qualification answers."""
    result = await LeadService.submit_lead(
        db=db,
        user_id=current_user.user_id,
        phone=data.phone,
        name=data.name,
        answers=data.answers,
        source=data.source,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to submit lead"),
        )

    return result


@router.post("/save")
async def save_lead_for_later(
    data: LeadSaveRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save a lead without contact info for later."""
    result = await LeadService.save_lead_for_later(
        db=db,
        user_id=current_user.user_id,
        answers=data.answers,
        matched_offer_ids=data.matched_offer_ids,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to save lead"),
        )

    return result


@router.get("/")
async def get_user_leads(
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
    status: Optional[str] = None,
):
    """Get all leads for the current user."""
    leads = await LeadService.get_user_leads(db, current_user.user_id, status)
    return {"items": leads, "total": len(leads)}


@router.get("/{lead_id}")
async def get_lead(
    lead_id: str,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a specific lead."""
    lead = await LeadService.get_lead_by_id(db, lead_id, current_user.user_id)

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found"
        )

    return lead


@router.post("/{lead_id}/convert")
async def convert_saved_lead(
    lead_id: str,
    data: LeadConvertRequest,
    current_user: TokenData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Convert a saved lead to submitted with contact info."""
    result = await LeadService.convert_saved_lead(
        db=db,
        lead_id=lead_id,
        user_id=current_user.user_id,
        phone=data.phone,
        name=data.name,
    )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to convert lead"),
        )

    return result


@router.get("/offers/all")
async def get_all_offers(db: Session = Depends(get_db)):
    """Get all available partner offers (public endpoint)."""
    offers = await LeadService.get_partner_offers()
    return {"items": offers, "total": len(offers)}


@router.get("/offers/{offer_id}")
async def get_offer(offer_id: str, db: Session = Depends(get_db)):
    """Get a specific partner offer (public endpoint)."""
    offer = await LeadService.get_offer_by_id(offer_id)

    if not offer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found"
        )

    return offer
