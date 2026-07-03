from fastapi import APIRouter, UploadFile, File, Query, Header
from pydantic import BaseModel, Field

from app.services.visual_search import visual_search
from app.services.recommendations import get_recommendations
from app.services.chatbot import chat

router = APIRouter(prefix="/api/ai", tags=["AI"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    success: bool = True
    data: dict


@router.post("/visual-search")
async def search_by_image(file: UploadFile = File(...)):
    content = await file.read()
    result = await visual_search(content, file.filename or "upload.jpg")
    return {"success": True, "data": result}


@router.get("/recommendations")
async def style_recommendations(
    user_id: str | None = Query(None, alias="userId"),
    style: list[str] | None = Query(None),
    limit: int = Query(10, ge=1, le=50),
    authorization: str | None = Header(None),
):
    extracted_user_id = user_id
    if authorization and authorization.startswith("Bearer ") and not extracted_user_id:
        extracted_user_id = "authenticated-user"

    result = await get_recommendations(
        user_id=extracted_user_id,
        style_preferences=style,
        limit=limit,
    )
    return {"success": True, "data": result}


@router.post("/chat", response_model=ChatResponse)
async def ai_chat(
    body: ChatRequest,
    user_id: str | None = Query(None, alias="userId"),
):
    result = await chat(
        message=body.message,
        user_id=user_id,
        conversation_id=body.conversation_id,
    )
    return ChatResponse(data=result)
