"""
Voice AI routes — LiveKit token generation for the narrator agent.
"""
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from livekit.api import AccessToken, VideoGrants

router = APIRouter()


class TokenRequest(BaseModel):
    room_name: Optional[str] = "gopa-story-room"
    participant_name: Optional[str] = "child-listener"
    story_context: Optional[str] = ""


@router.post("/token")
async def get_livekit_token(req: TokenRequest):
    """
    Generate a LiveKit access token for the frontend to join a room.
    The narrator agent auto-joins via LiveKit's agent dispatch.
    """
    api_key = os.getenv("LIVEKIT_API_KEY", "devkey")
    api_secret = os.getenv("LIVEKIT_API_SECRET", "secret")

    if not api_key or not api_secret:
        raise HTTPException(status_code=500, detail="LiveKit credentials not configured")

    token = (
        AccessToken(api_key, api_secret)
        .with_identity(req.participant_name)
        .with_grants(
            VideoGrants(
                room_join=True,
                room=req.room_name,
            )
        )
    )

    jwt = token.to_jwt()

    return {
        "token": jwt,
        "room_name": req.room_name,
        "livekit_url": os.getenv("LIVEKIT_URL", "ws://localhost:7880"),
    }


@router.get("/health")
async def voice_health():
    """Check if LiveKit config is available."""
    return {
        "livekit_url": os.getenv("LIVEKIT_URL", "not set"),
        "api_key_set": bool(os.getenv("LIVEKIT_API_KEY")),
    }
