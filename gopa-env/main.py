"""
GOPA — Bal Krishna Story Generator
FastAPI Backend Application
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

load_dotenv()

from routes.story import router as story_router
from routes.voice import router as voice_router
from routes.upload import router as upload_router

app = FastAPI(
    title="GOPA API",
    description="Bal Krishna Story Generator — Amazon Nova Hackathon 2026",
    version="1.0.0",
)

# CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for generated content
os.makedirs("generated_stories", exist_ok=True)
app.mount("/static", StaticFiles(directory="generated_stories"), name="static")

# Routes
app.include_router(story_router, prefix="/api/story", tags=["Story"])
app.include_router(voice_router, prefix="/api/voice", tags=["Voice"])
app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])


@app.get("/")
async def root():
    return {"message": "GOPA API — Bal Krishna Story Generator", "status": "running"}


@app.get("/api/health")
async def health():
    return {"status": "healthy"}
