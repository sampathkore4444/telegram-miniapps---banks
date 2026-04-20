"""
Notification Service
Business logic for notification operations
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime


class NotificationService:
    """Service for notification operations"""

    # Notification types
    TYPES = [
        "transaction",
        "loan",
        "payment",
        "reminder",
        "promo",
        "referral",
        "security",
        "system",
    ]

    # Notification channels
    CHANNELS = ["in_app", "push", "sms", "telegram"]

    @staticmethod
    async def create_notification(
        db: Session,
        user_id: int,
        title: str,
        message: str,
        notification_type: str,
        data: Optional[Dict] = None,
        channels: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Create a new notification

        Args:
            db: Database session
            user_id: User ID
            title: Notification title
            message: Notification message
            notification_type: Type of notification
            data: Additional data
            channels: Notification channels

        Returns:
            Created notification
        """
        from app.db.models.notification import Notification

        if notification_type not in NotificationService.TYPES:
            return {
                "success": False,
                "message": f"Invalid type. Available: {', '.join(NotificationService.TYPES)}",
            }

        channels = channels or ["in_app"]

        notification = Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            data=data,
            channels=channels,
            created_at=datetime.utcnow(),
        )

        db.add(notification)
        db.commit()
        db.refresh(notification)

        # Send to channels
        for channel in channels:
            await NotificationService._send_to_channel(db, notification, channel)

        return {"success": True, "notification_id": notification.id}

    @staticmethod
    async def get_notifications(
        db: Session,
        user_id: int,
        unread_only: bool = False,
        limit: int = 20,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """
        Get user notifications

        Args:
            db: Database session
            user_id: User ID
            unread_only: Filter unread only
            limit: Result limit
            offset: Result offset

        Returns:
            Notifications list
        """
        from app.db.models.notification import Notification

        query = db.query(Notification).filter(Notification.user_id == user_id)

        if unread_only:
            query = query.filter(Notification.is_read == False)

        notifications = (
            query.order_by(Notification.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )

        unread_count = (
            db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.is_read == False)
            .count()
        )

        return {
            "notifications": [
                {
                    "id": n.id,
                    "title": n.title,
                    "message": n.message,
                    "type": n.notification_type,
                    "data": n.data,
                    "is_read": n.is_read,
                    "created_at": n.created_at.isoformat(),
                }
                for n in notifications
            ],
            "unread_count": unread_count,
        }

    @staticmethod
    async def mark_as_read(
        db: Session, user_id: int, notification_id: int
    ) -> Dict[str, Any]:
        """
        Mark notification as read

        Args:
            db: Database session
            user_id: User ID
            notification_id: Notification ID

        Returns:
            Update result
        """
        from app.db.models.notification import Notification

        notification = (
            db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user_id)
            .first()
        )

        if not notification:
            return {"success": False, "message": "Notification not found"}

        notification.is_read = True
        notification.read_at = datetime.utcnow()

        db.commit()

        return {"success": True, "message": "Marked as read"}

    @staticmethod
    async def mark_all_as_read(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Mark all notifications as read

        Args:
            db: Database session
            user_id: User ID

        Returns:
            Update result
        """
        from app.db.models.notification import Notification

        db.query(Notification).filter(
            Notification.user_id == user_id, Notification.is_read == False
        ).update({"is_read": True, "read_at": datetime.utcnow()})

        db.commit()

        return {"success": True, "message": "All notifications marked as read"}

    @staticmethod
    async def delete_notification(
        db: Session, user_id: int, notification_id: int
    ) -> Dict[str, Any]:
        """
        Delete a notification

        Args:
            db: Database session
            user_id: User ID
            notification_id: Notification ID

        Returns:
            Delete result
        """
        from app.db.models.notification import Notification

        notification = (
            db.query(Notification)
            .filter(Notification.id == notification_id, Notification.user_id == user_id)
            .first()
        )

        if not notification:
            return {"success": False, "message": "Notification not found"}

        db.delete(notification)
        db.commit()

        return {"success": True, "message": "Notification deleted"}

    @staticmethod
    async def _send_to_channel(db: Session, notification, channel: str):
        """Send notification to specific channel"""
        # In production, implement actual sending logic
        # For push notifications, use FCM
        # For SMS, use Twilio
        # For Telegram, use Bot API

        if channel == "telegram":
            # Send via Telegram
            pass
        elif channel == "push":
            # Send push notification
            pass
        elif channel == "sms":
            # Send SMS
            pass

    @staticmethod
    async def send_payment_notification(
        db: Session, user_id: int, amount: float, direction: str, reference: str
    ) -> Dict[str, Any]:
        """Send payment notification"""
        direction_text = "received" if direction == "in" else "sent"

        return await NotificationService.create_notification(
            db,
            user_id,
            f"Payment {direction_text.title()}",
            f"You {direction_text} ${amount:.2f}. Ref: {reference}",
            "transaction",
            {"amount": amount, "direction": direction, "reference": reference},
        )

    @staticmethod
    async def send_loan_notification(
        db: Session, user_id: int, loan_status: str, loan_id: str, message: str
    ) -> Dict[str, Any]:
        """Send loan notification"""
        return await NotificationService.create_notification(
            db,
            user_id,
            f"Loan {loan_status.title()}",
            message,
            "loan",
            {"loan_id": loan_id, "status": loan_status},
        )

    @staticmethod
    async def send_bill_reminder(
        db: Session, user_id: int, bill_provider: str, amount: float, due_date: datetime
    ) -> Dict[str, Any]:
        """Send bill reminder notification"""
        return await NotificationService.create_notification(
            db,
            user_id,
            "Bill Payment Reminder",
            f"Your {bill_provider} bill of ${amount:.2f} is due on {due_date.strftime('%b %d, %Y')}",
            "reminder",
            {
                "provider": bill_provider,
                "amount": amount,
                "due_date": due_date.isoformat(),
            },
        )
