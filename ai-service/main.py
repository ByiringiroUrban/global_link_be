from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import ai

app = FastAPI(
    title="Global Link AI Service",
    description="Visual search, style recommendations, and AI chatbot for Global Link ecommerce",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "global-link-ai-service"}
