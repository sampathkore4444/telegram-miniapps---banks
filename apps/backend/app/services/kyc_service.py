"""
KYC Service
Business logic for Know Your Customer operations
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
import hashlib


class KYCService:
    """Service for KYC operations"""

    # KYC statuses
    STATUSES = ["pending", "in_review", "approved", "rejected"]

    # KYC levels
    LEVELS = {
        1: {"name": "Basic", "requirements": ["phone"]},
        2: {"name": "Standard", "requirements": ["phone", "basic_info"]},
        3: {
            "name": "Full",
            "requirements": ["phone", "basic_info", "id_verification", "selfie"],
        },
    }

    @staticmethod
    async def get_kyc_status(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Get KYC status for user

        Args:
            db: Database session
            user_id: User ID

        Returns:
            KYC status
        """
        from app.db.models.user import User
        from app.db.models.kyc import KYCRecord

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return {"success": False, "message": "User not found"}

        # Get KYC records
        records = (
            db.query(KYCRecord)
            .filter(KYCRecord.user_id == user_id)
            .order_by(KYCRecord.created_at.desc())
            .all()
        )

        current_level = 1
        if user.kyc_status == "verified":
            current_level = 3
        elif user.kyc_status == "pending":
            current_level = 2

        return {
            "user_id": user_id,
            "status": user.kyc_status or "none",
            "current_level": current_level,
            "level_name": KYCService.LEVELS[current_level]["name"],
            "required_for_next_level": KYCService.LEVELS.get(current_level + 1, {}).get(
                "requirements", []
            ),
            "documents": [
                {
                    "type": r.document_type,
                    "status": r.status,
                    "submitted_at": r.created_at.isoformat() if r.created_at else None,
                    "verified_at": r.verified_at.isoformat() if r.verified_at else None,
                }
                for r in records
            ],
        }

    @staticmethod
    async def submit_document(
        db: Session,
        user_id: int,
        document_type: str,
        document_data: str,
        metadata: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """
        Submit a KYC document

        Args:
            db: Database session
            user_id: User ID
            document_type: Type of document
            document_data: Document data (base64 or URL)
            metadata: Additional metadata

        Returns:
            Submission result
        """
        from app.db.models.kyc import KYCRecord

        # Check if document already submitted
        existing = (
            db.query(KYCRecord)
            .filter(
                KYCRecord.user_id == user_id,
                KYCRecord.document_type == document_type,
                KYCRecord.status.in_(["pending", "in_review"]),
            )
            .first()
        )

        if existing:
            return {
                "success": False,
                "message": f"Document '{document_type}' already submitted",
            }

        # Create record
        record = KYCRecord(
            user_id=user_id,
            document_type=document_type,
            document_hash=hashlib.sha256(document_data.encode()).hexdigest(),
            status="pending",
            metadata=metadata,
            created_at=datetime.utcnow(),
        )

        db.add(record)
        db.commit()
        db.refresh(record)

        # Trigger async verification (in production, this would be a background task)
        # For now, we'll auto-approve for demo

        return {
            "success": True,
            "record_id": record.id,
            "status": record.status,
            "message": "Document submitted successfully",
        }

    @staticmethod
    async def verify_document(
        db: Session,
        record_id: int,
        approved: bool,
        verification_notes: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Verify a KYC document

        Args:
            db: Database session
            record_id: Record ID
            approved: Whether approved
            verification_notes: Verification notes

        Returns:
            Verification result
        """
        from app.db.models.kyc import KYCRecord
        from app.db.models.user import User

        record = db.query(KYCRecord).filter(KYCRecord.id == record_id).first()

        if not record:
            return {"success": False, "message": "Record not found"}

        record.status = "approved" if approved else "rejected"
        record.verified_at = datetime.utcnow()
        record.verification_notes = verification_notes

        # Check if all required documents are approved
        all_approved = KYCService._check_all_documents(db, record.user_id)

        if all_approved:
            # Update user KYC status
            user = db.query(User).filter(User.id == record.user_id).first()
            if user:
                user.kyc_status = "verified"
                user.is_verified = True
                user.verified_at = datetime.utcnow()

        db.commit()

        return {"success": True, "status": record.status, "kyc_complete": all_approved}

    @staticmethod
    async def submit_personal_info(
        db: Session, user_id: int, info: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Submit personal information for KYC

        Args:
            db: Database session
            user_id: User ID
            info: Personal information

        Returns:
            Submission result
        """
        from app.db.models.user import User

        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            return {"success": False, "message": "User not found"}

        # Update user with personal info
        if "name" in info:
            user.name = info["name"]
        if "dob" in info:
            user.dob = info["dob"]
        if "gender" in info:
            user.gender = info["gender"]
        if "address" in info:
            user.address = info["address"]
        if "occupation" in info:
            user.occupation = info["occupation"]

        user.updated_at = datetime.utcnow()

        # Update KYC status
        if user.kyc_status != "verified":
            user.kyc_status = "pending"

        db.commit()

        return {"success": True, "message": "Personal information updated"}

    @staticmethod
    async def submit_selfie(
        db: Session, user_id: int, selfie_data: str
    ) -> Dict[str, Any]:
        """
        Submit selfie for verification

        Args:
            db: Database session
            user_id: User ID
            selfie_data: Selfie data

        Returns:
            Submission result
        """
        return await KYCService.submit_document(
            db, user_id, "selfie", selfie_data, {"purpose": "identity_verification"}
        )

    @staticmethod
    async def get_required_documents(kyc_level: int) -> List[Dict[str, Any]]:
        """
        Get required documents for KYC level

        Args:
            kyc_level: Target KYC level

        Returns:
            List of required documents
        """
        documents = {
            2: [
                {"type": "national_id", "name": "National ID", "required": True},
                {"type": "selfie", "name": "Selfie with ID", "required": True},
            ],
            3: [
                {"type": "national_id", "name": "National ID", "required": True},
                {"type": "passport", "name": "Passport", "required": False},
                {"type": "selfie", "name": "Selfie with ID", "required": True},
                {
                    "type": "proof_of_address",
                    "name": "Proof of Address",
                    "required": True,
                },
                {"type": "income_proof", "name": "Proof of Income", "required": False},
            ],
        }

        return documents.get(kyc_level, [])

    @staticmethod
    def _check_all_documents(db: Session, user_id: int) -> bool:
        """Check if all required documents are approved"""
        from app.db.models.kyc import KYCRecord

        # For basic KYC, just need ID
        required_types = ["national_id", "selfie"]

        for doc_type in required_types:
            record = (
                db.query(KYCRecord)
                .filter(
                    KYCRecord.user_id == user_id,
                    KYCRecord.document_type == doc_type,
                    KYCRecord.status == "approved",
                )
                .first()
            )

            if not record:
                return False

        return True

    @staticmethod
    async def trigger_auto_verification(db: Session, record_id: int):
        """
        Trigger automatic document verification

        In production, this would:
        1. Use OCR to extract data from document
        2. Use face recognition to match selfie with ID photo
        3. Check against watchlists
        4. Verify document authenticity

        Args:
            db: Database session
            record_id: Record ID
        """
        from app.db.models.kyc import KYCRecord

        record = db.query(KYCRecord).filter(KYCRecord.id == record_id).first()

        if not record:
            return

        # Simulate auto-verification
        # In production, integrate with verification providers

        record.status = "approved"
        record.verified_at = datetime.utcnow()
        record.verification_notes = "Auto-verified"

        db.commit()

    @staticmethod
    async def get_kyc_limits(kyc_level: int) -> Dict[str, Any]:
        """
        Get transaction limits based on KYC level

        Args:
            kyc_level: KYC level

        Returns:
            Limits configuration
        """
        limits = {
            1: {
                "max_balance": 100,
                "max_transaction": 50,
                "max_daily": 200,
                "max_monthly": 500,
                "can_withdraw": False,
                "can_receive_international": False,
            },
            2: {
                "max_balance": 1000,
                "max_transaction": 500,
                "max_daily": 2000,
                "max_monthly": 10000,
                "can_withdraw": True,
                "can_receive_international": False,
            },
            3: {
                "max_balance": 10000,
                "max_transaction": 5000,
                "max_daily": 20000,
                "max_monthly": 100000,
                "can_withdraw": True,
                "can_receive_international": True,
            },
        }

        return limits.get(kyc_level, limits[1])
