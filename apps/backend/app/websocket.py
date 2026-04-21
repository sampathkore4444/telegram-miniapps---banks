"""
WebSocket Manager for Real-time Notifications
Handles: Loan status, payments, chat, leaderboards
"""

from typing import Dict, List, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from starlette.websockets import WebSocketState
import json
import asyncio
from datetime import datetime


class ConnectionManager:
    """Manages WebSocket connections"""

    def __init__(self):
        # user_id -> set of websockets
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # room_name -> set of websockets (for broadcast)
        self.rooms: Dict[str, Set[WebSocket]] = {}

    async def connect(
        self, websocket: WebSocket, user_id: str = None, room: str = None
    ):
        """Connect a new websocket"""
        await websocket.accept()

        if user_id:
            if user_id not in self.active_connections:
                self.active_connections[user_id] = set()
            self.active_connections[user_id].add(websocket)

        if room:
            if room not in self.rooms:
                self.rooms[room] = set()
            self.rooms[room].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str = None, room: str = None):
        """Disconnect a websocket"""
        if user_id and user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

        if room and room in self.rooms:
            self.rooms[room].discard(websocket)
            if not self.rooms[room]:
                del self.rooms[room]

    async def send_personal_message(self, message: dict, user_id: str):
        """Send message to specific user"""
        if user_id in self.active_connections:
            for websocket in list(self.active_connections[user_id]):
                try:
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_text(json.dumps(message))
                except Exception:
                    pass

    async def broadcast_to_room(self, message: dict, room: str):
        """Broadcast message to all in a room"""
        if room in self.rooms:
            for websocket in list(self.rooms[room]):
                try:
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_text(json.dumps(message))
                except Exception:
                    pass

    async def broadcast_all(self, message: dict):
        """Broadcast to all connected users"""
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, user_id)


# Create global manager
manager = ConnectionManager()

# Create router
router = APIRouter()


@router.websocket("/ws/notifications/{user_id}")
async def websocket_notifications(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time notifications"""
    await manager.connect(websocket, user_id=user_id)

    try:
        # Send connection confirmation
        await websocket.send_text(
            json.dumps(
                {
                    "type": "connected",
                    "message": "Connected to notifications",
                    "user_id": user_id,
                }
            )
        )

        # Keep connection alive
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=60)
                # Handle incoming messages (keepalive ping/pong)
                message = json.loads(data)
                if message.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except asyncio.TimeoutError:
                # Send ping
                await websocket.send_text(json.dumps({"type": "ping"}))

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id=user_id)


@router.websocket("/ws/chat/{user_id}")
async def websocket_chat(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for support chat"""
    room = "support_chat"
    await manager.connect(websocket, user_id=user_id, room=room)

    try:
        # Send welcome
        await websocket.send_text(
            json.dumps({"type": "system", "message": "Connected to support chat"})
        )

        while True:
            data = await asyncio.wait_for(websocket.receive_text(), timeout=60)
            message = json.loads(data)

            # Broadcast to all in chat room
            await manager.broadcast_to_room(
                {
                    "type": "chat_message",
                    "user_id": user_id,
                    "message": message.get("message", ""),
                    "timestamp": datetime.utcnow().isoformat(),
                },
                room,
            )

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id=user_id, room=room)


# Notification sending functions
async def notify_loan_status(
    user_id: str, loan_id: str, status: str, message: str = None
):
    """Notify user about loan status change"""
    await manager.send_personal_message(
        {
            "type": "loan_update",
            "loan_id": loan_id,
            "status": status,
            "message": message or f"Your loan is now {status}",
            "timestamp": datetime.utcnow().isoformat(),
        },
        user_id,
    )


async def notify_payment(user_id: str, payment_id: str, status: str, amount: float):
    """Notify user about payment status"""
    await manager.send_personal_message(
        {
            "type": "payment_update",
            "payment_id": payment_id,
            "status": status,
            "amount": amount,
            "message": f"Payment of ${amount} {status}",
            "timestamp": datetime.utcnow().isoformat(),
        },
        user_id,
    )


async def notify_achievement(
    user_id: str, achievement_id: str, achievement_name: str, coins: int
):
    """Notify user about achievement unlocked"""
    await manager.send_personal_message(
        {
            "type": "achievement",
            "achievement_id": achievement_id,
            "name": achievement_name,
            "coins": coins,
            "message": f"🎉 Unlocked: {achievement_name} (+{coins} coins)",
            "timestamp": datetime.utcnow().isoformat(),
        },
        user_id,
    )


async def update_leaderboard(room: str, leaderboard_data: list):
    """Broadcast leaderboard update"""
    await manager.broadcast_to_room(
        {
            "type": "leaderboard_update",
            "leaderboard": leaderboard_data,
            "timestamp": datetime.utcnow().isoformat(),
        },
        f"leaderboard_{room}",
    )


async def notify_support(message: str, user_id: str = None):
    """Send support notification"""
    if user_id:
        await manager.send_personal_message(
            {
                "type": "support",
                "message": message,
                "timestamp": datetime.utcnow().isoformat(),
            },
            user_id,
        )
    else:
        await manager.broadcast_all(
            {
                "type": "support",
                "message": message,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )
