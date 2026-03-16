from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import boto3, os, logging, json
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gopa")

app = FastAPI(title="GOPA API", version="1.0.0")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(CORSMiddleware, allow_origins=cors_origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

bedrock = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))

class StoryRequest(BaseModel):
    prompt: str
    value: str = ""

STORY_TEMPLATE = """Create an authentic Bal Krishna story (age 4) for children 4-8 years old.

THEME/PROMPT: {prompt}
VIRTUE TO TEACH: {value}

KRISHNA CHARACTER:
- Age: Little Lord Krishna (approximately 4 years old)
- Hair: Curly dark locks with small peacock feather
- Eyes: Big, expressive, sparkling
- Smile: Innocent yet divine, warm
- Clothes: Bright sunny yellow dhoti, soft peachy-orange shawl with mandala patterns
- Setting: Ancient Vrindavan/Gokul

VISUAL STYLE:
- Animation: Pixar-quality 3D, ultra-vibrant saturated colors
- Lighting: Soft shadows, warm golden lighting
- Tone: Whimsical children's storybook, magical
- Colors: Emerald grass, azure sky, sparkling waters, golden sunlight

CAMERA:
- Shot: Medium shot, eye-level with Krishna
- Focus: Emotional connection between characters
- Depth: Cinematic depth of field

Write 2-3 paragraphs. End with IMAGE_PROMPT: [detailed one-sentence visual description]"""

@app.get("/")
async def root():
    logger.info("📍 GET /")
    return {"message": "GOPA API Active", "endpoints": ["/api/story/generate", "/api/voice/generate", "/api/token", "/health"]}

@app.post("/api/story/generate")
async def generate_story(request: StoryRequest):
    try:
        logger.info(f"🎨 POST /api/story/generate - Prompt: {request.prompt}")
        
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt required")
        
        prompt = STORY_TEMPLATE.format(
            prompt=request.prompt,
            value=request.value if request.value else "virtue"
        )
        
        response = bedrock.converse(
            modelId=os.getenv("NOVA_LITE_MODEL_ID", "us.amazon.nova-lite-v1:0"),
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": 1200, "temperature": 0.8}
        )
        
        full_text = response["output"]["message"]["content"][0]["text"].strip()
        
        image_prompt = ""
        if "IMAGE_PROMPT:" in full_text:
            image_prompt = full_text.split("IMAGE_PROMPT:")[-1].strip()
            story = full_text.split("IMAGE_PROMPT:")[0].strip()
        else:
            story = full_text
        
        logger.info("✅ Story generated")
        return {"status": "success", "story": story, "image_prompt": image_prompt, "theme": request.prompt}
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/voice/generate")
async def generate_voice(request: dict):
    try:
        logger.info("🎤 POST /api/voice/generate")
        story = request.get("story", "")
        
        if not story:
            raise HTTPException(status_code=400, detail="Story required")
        
        prompt = f"""Transform into 250-word narration for children (4-8):
        
{story}

Use simple language, mark pauses [PAUSE], create emotion, gently teach moral, end with encouragement."""
        
        response = bedrock.converse(
            modelId=os.getenv("NOVA_LITE_MODEL_ID", "us.amazon.nova-lite-v1:0"),
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": 600, "temperature": 0.6}
        )
        
        logger.info("✅ Narration generated")
        return {"status": "success", "narration": response["output"]["message"]["content"][0]["text"].strip()}
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/token")
async def get_token(request: dict):
    try:
        logger.info("🎥 POST /api/token")
        room = request.get("room", "")
        participant = request.get("participant", "")
        
        if not room or not participant:
            raise HTTPException(status_code=400, detail="room and participant required")
        
        from livekit import api
        token = api.TokenWithGrants(
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
            grant=api.VideoGrant(room_join=True, room=room),
            identity=participant,
            ttl=259200
        )
        
        logger.info("✅ Token generated")
        return {"status": "success", "token": token.to_jwt(), "url": os.getenv("LIVEKIT_URL"), "room": room}
    except Exception as e:
        logger.error(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    logger.info("💚 GET /health")
    return {"status": "healthy", "service": "gopa-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
