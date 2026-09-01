from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.db.seed_data import seed_database
from app.api import (
    auth, students, companies, jobs, matching,
    skills_training, interview_feedback, analytics,
    documents_rag, ai_assistant, ai_eval, notifications, audit
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema & seed demo data if empty
    Base.metadata.create_all(bind=engine)
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise AI Placement Command Center & Candidate Matching Platform",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers on both /api/v1 and /api
for prefix in [settings.API_V1_STR, "/api"]:
    app.include_router(auth.router, prefix=prefix)
    app.include_router(students.router, prefix=prefix)
    app.include_router(companies.router, prefix=prefix)
    app.include_router(jobs.router, prefix=prefix)
    app.include_router(matching.router, prefix=prefix)
    app.include_router(skills_training.router, prefix=prefix)
    app.include_router(interview_feedback.router, prefix=prefix)
    app.include_router(analytics.router, prefix=prefix)
    app.include_router(documents_rag.router, prefix=prefix)
    app.include_router(ai_assistant.router, prefix=prefix)
    app.include_router(ai_eval.router, prefix=prefix)
    app.include_router(notifications.router, prefix=prefix)
    app.include_router(audit.router, prefix=prefix)

@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "api_v1": api_v1
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-placement-command-center-api"}
