"""Lead Generation Service."""

from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import Dict, List, Optional
from datetime import datetime
import uuid
import json


class LeadService:
    """Service for managing leads and partner offers."""

    # Partner bank configurations
    PARTNER_BANKS = {
        "bank_1": {
            "id": "bank_1",
            "bank_name": "ABC Bank",
            "product_name": "Personal Loan",
            "min_rate": 1.5,
            "max_rate": 2.5,
            "max_amount": 5000,
            "processing_fee": 0,
            "min_income": 300,
            "loan_purposes": ["personal", "debt_consolidation"],
            "employment_types": ["salaried", "business_owner"],
        },
        "bank_2": {
            "id": "bank_2",
            "bank_name": "XYZ Microfinance",
            "product_name": "Micro Loan",
            "min_rate": 2.0,
            "max_rate": 3.0,
            "max_amount": 2000,
            "processing_fee": 25,
            "min_income": 200,
            "loan_purposes": ["personal", "business", "education"],
            "employment_types": ["salaried", "self_employed", "business_owner"],
        },
        "bank_3": {
            "id": "bank_3",
            "bank_name": "QuickCash",
            "product_name": "Salary Advance",
            "min_rate": 1.0,
            "max_rate": 1.5,
            "max_amount": 1000,
            "processing_fee": 0,
            "min_income": 250,
            "loan_purposes": ["personal", "home_improvement"],
            "employment_types": ["salaried"],
        },
    }

    @staticmethod
    async def submit_lead(
        db: Session,
        user_id: int,
        phone: str,
        name: str,
        answers: Dict,
        source: str = "telegram_miniapp",
    ) -> Dict:
        """Submit a lead with qualification answers."""
        from ...db.models.user import User, Lead, Wallet, WalletTransaction

        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()

        # Generate unique lead ID
        lead_id = str(uuid.uuid4())

        # Determine qualified offers based on answers
        qualified_offers = LeadService._match_offers(answers)

        # Create lead record
        lead = Lead(
            id=lead_id,
            user_id=user_id,
            phone=phone,
            name=name,
            loan_purpose=answers.get("loan_purpose"),
            monthly_income=answers.get("monthly_income"),
            employment_type=answers.get("employment_type"),
            loan_amount=answers.get("loan_amount"),
            credit_history=answers.get("credit_history"),
            qualified_offers=json.dumps(qualified_offers),
            source=source,
            status="submitted",
        )

        db.add(lead)

        # Create wallet entry for reward if user exists
        if user:
            # Award $5 reward for lead submission
            wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
            if not wallet:
                wallet = Wallet(user_id=user_id)
                db.add(wallet)
                db.flush()

            wallet.available_balance += 5
            wallet.lifetime_earnings += 5

            # Record transaction
            transaction = WalletTransaction(
                wallet_id=wallet.id,
                transaction_type="earn",
                amount=5,
                source="lead_reward",
                description="Lead submission reward",
            )
            db.add(transaction)

        db.commit()

        return {
            "success": True,
            "lead_id": lead_id,
            "matches": qualified_offers,
            "reward_amount": 5,
        }

    @staticmethod
    def _match_offers(answers: Dict) -> List[Dict]:
        """Match qualified offers based on user answers."""
        matches = []

        income_map = {
            "under_300": 250,
            "300_500": 400,
            "500_1000": 750,
            "1000_2000": 1500,
            "over_2000": 2500,
        }

        monthly_income = income_map.get(answers.get("monthly_income", ""), 500)

        for bank_id, bank in LeadService.PARTNER_BANKS.items():
            score = 0

            # Check minimum income requirement
            if monthly_income >= bank["min_income"]:
                score += 1

            # Check loan purpose
            if answers.get("loan_purpose") in bank["loan_purposes"]:
                score += 1

            # Check employment type
            if answers.get("employment_type") in bank["employment_types"]:
                score += 1

            # Only include if at least 2 criteria match
            if score >= 2:
                matches.append(
                    {
                        "id": bank["id"],
                        "bank_name": bank["bank_name"],
                        "product_name": bank["product_name"],
                        "min_rate": bank["min_rate"],
                        "max_rate": bank["max_rate"],
                        "max_amount": bank["max_amount"],
                        "processing_fee": bank["processing_fee"],
                        "match_score": score,
                    }
                )

        # Sort by match score (highest first)
        matches.sort(key=lambda x: x["match_score"], reverse=True)

        return matches[:5]  # Return top 5 matches

    @staticmethod
    async def save_lead_for_later(
        db: Session, user_id: int, answers: Dict, matched_offer_ids: List[str]
    ) -> Dict:
        """Save a lead without contact info for later."""
        from ...db.models.user import User, Lead

        lead_id = str(uuid.uuid4())
        qualified_offers = LeadService._match_offers(answers)

        lead = Lead(
            id=lead_id,
            user_id=user_id,
            phone="",
            name="",
            loan_purpose=answers.get("loan_purpose"),
            monthly_income=answers.get("monthly_income"),
            employment_type=answers.get("employment_type"),
            loan_amount=answers.get("loan_amount"),
            credit_history=answers.get("credit_history"),
            qualified_offers=json.dumps(qualified_offers),
            source="telegram_miniapp_saved",
            status="saved",
        )

        db.add(lead)
        db.commit()

        return {
            "success": True,
            "lead_id": lead_id,
            "message": "Lead saved for later",
        }

    @staticmethod
    async def get_user_leads(
        db: Session, user_id: int, status: Optional[str] = None
    ) -> List[Dict]:
        """Get all leads for a user."""
        from ...db.models.user import Lead

        query = db.query(Lead).filter(Lead.user_id == user_id)

        if status:
            query = query.filter(Lead.status == status)

        leads = query.order_by(Lead.created_at.desc()).all()

        return [
            {
                "id": lead.id,
                "loan_purpose": lead.loan_purpose,
                "status": lead.status,
                "qualified_offers": (
                    json.loads(lead.qualified_offers) if lead.qualified_offers else []
                ),
                "created_at": lead.created_at.isoformat(),
            }
            for lead in leads
        ]

    @staticmethod
    async def get_lead_by_id(db: Session, lead_id: str, user_id: int) -> Optional[Dict]:
        """Get a specific lead."""
        from ...db.models.user import Lead

        lead = (
            db.query(Lead).filter(Lead.id == lead_id, Lead.user_id == user_id).first()
        )

        if not lead:
            return None

        return {
            "id": lead.id,
            "user_id": lead.user_id,
            "phone": lead.phone,
            "name": lead.name,
            "loan_purpose": lead.loan_purpose,
            "monthly_income": lead.monthly_income,
            "employment_type": lead.employment_type,
            "loan_amount": lead.loan_amount,
            "credit_history": lead.credit_history,
            "qualified_offers": (
                json.loads(lead.qualified_offers) if lead.qualified_offers else []
            ),
            "source": lead.source,
            "status": lead.status,
            "created_at": lead.created_at.isoformat(),
            "updated_at": lead.updated_at.isoformat() if lead.updated_at else None,
        }

    @staticmethod
    async def convert_saved_lead(
        db: Session, lead_id: str, user_id: int, phone: str, name: str
    ) -> Dict:
        """Convert a saved lead to submitted with contact info."""
        from ...db.models.user import Lead, User, Wallet, WalletTransaction

        lead = (
            db.query(Lead)
            .filter(Lead.id == lead_id, Lead.user_id == user_id, Lead.status == "saved")
            .first()
        )

        if not lead:
            return {"success": False, "message": "Lead not found or already submitted"}

        # Update with contact info
        lead.phone = phone
        lead.name = name
        lead.status = "submitted"
        lead.updated_at = datetime.utcnow()

        # Award reward
        wallet = db.query(Wallet).filter(Wallet.user_id == user_id).first()
        if wallet:
            wallet.available_balance += 5
            wallet.lifetime_earnings += 5

            transaction = WalletTransaction(
                wallet_id=wallet.id,
                transaction_type="earn",
                amount=5,
                source="lead_reward",
                description="Lead submission reward",
            )
            db.add(transaction)

        db.commit()

        return {
            "success": True,
            "lead_id": lead_id,
            "reward_amount": 5,
        }

    @staticmethod
    async def get_partner_offers() -> List[Dict]:
        """Get all available partner offers."""
        return list(LeadService.PARTNER_BANKS.values())

    @staticmethod
    async def get_offer_by_id(offer_id: str) -> Optional[Dict]:
        """Get a specific partner offer."""
        return LeadService.PARTNER_BANKS.get(offer_id)
