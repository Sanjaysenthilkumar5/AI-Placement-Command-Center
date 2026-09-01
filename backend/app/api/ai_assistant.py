from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schemas import ChatQueryRequest, ChatQueryResponse
from app.services.ai_agent_service import ai_agent_service

router = APIRouter(prefix="/ai", tags=["AI Placement Copilot"])

@router.post("/chat", response_model=ChatQueryResponse)
async def chat_with_placement_copilot(req: ChatQueryRequest, db: Session = Depends(get_db)):
    return await ai_agent_service.handle_user_query(db, req.message, req.conversation_history)
