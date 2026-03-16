"""
GOPA — Bal Krishna Story Generator
FastAPI + AWS Lambda (Mangum) Backend
"""
from fastapi import FastAPI, HTTPException
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import boto3, os, logging, json, uuid, time, re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gopa")

app = FastAPI(
    title="GOPA API",
    description="Bal Krishna Story Generator — Amazon Nova Hackathon 2026",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "https://dev.d2chs9h4rp6fta.amplifyapp.com"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── AWS CLIENTS ───────────────────────────────────────────────────────────────
# bedrock-runtime handles: converse, invoke_model, start_async_invoke (Nova Reel)
# bedrock (mgmt) is NOT needed — removing to avoid confusion
bedrock = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"))
s3 = boto3.client("s3", region_name=os.getenv("S3_REGION", "us-east-1"))
S3_BUCKET = os.getenv("S3_BUCKET", "gopa-media")


# ── REQUEST MODELS ────────────────────────────────────────────────────────────
class StoryRequest(BaseModel):
    prompt: str
    value: str = ""
    child_name: str = "Friend"
    child_photo_key: Optional[str] = None

class ImageRequest(BaseModel):
    image_prompt: str

class VideoRequest(BaseModel):
    image_prompt: str
    story: str = ""

class VoiceRequest(BaseModel):
    story: str

class TokenRequest(BaseModel):
    room: str
    participant: str


# ── STORY PROMPT ──────────────────────────────────────────────────────────────
STORY_PROMPT = """You are a scholar of the Bhagavata Purana and Harivamsa with deep knowledge of all stories from Krishna's childhood in Vrindavan and Gokul.

A child wants to hear a REAL, AUTHENTIC story from Krishna's actual life.

Context/Theme requested: {prompt}
Virtue to highlight: {value}
Child's name: {child_name}

YOUR TASK:
- Choose the most fitting REAL story from Krishna's childhood as recorded in the Bhagavata Purana
- Examples: Makhan Chor (butter theft), Kaliya Mardana (serpent taming), Govardhana Parvat (mountain lifting), Putana Vadha, Trinavarta, Aghasura, Dhenukasura, Brahma Vimohana, Yashoda seeing the universe in Krishna's mouth, Krishna playing flute enchanting Vrindavan, and many more
- Tell it authentically — do not invent fictional events
- Simple warm language a 4-year-old can understand
- Exactly 4 scenes, 2-3 short sentences each
- Final scene ends with the moral/virtue lesson for {child_name}

OUTPUT FORMAT — follow exactly, no extra text before or after:
TITLE: [Name of the real story from scripture]

SCENE 1:
NARRATION: [2-3 sentences]
IMAGE: [Describe the SPECIFIC ACTION in this exact scene: who is doing what, where, facial expression, key objects. Be very specific. Example: "Little Krishna reaching his tiny blue hand into a clay butter pot hanging from ceiling, butter dripping on his cheeks, eyes wide with mischief, cozy Vrindavan kitchen with oil lamps glowing warm orange"]

SCENE 2:
NARRATION: [2-3 sentences]
IMAGE: [Specific action description for scene 2 — different from scene 1]

SCENE 3:
NARRATION: [2-3 sentences]
IMAGE: [Specific action description for scene 3 — different from scenes 1 and 2]

SCENE 4:
NARRATION: [2-3 sentences]
IMAGE: [Specific action description for scene 4 — different from previous scenes]"""


# ── HELPERS ───────────────────────────────────────────────────────────────────

def parse_story(text: str, value: str) -> dict:
    """Parse Nova's structured story output into scenes."""
    scenes = []
    title = "A Krishna Adventure"

    title_match = re.search(r'TITLE:\s*(.+)', text)
    if title_match:
        title = title_match.group(1).strip()

    scene_blocks = re.split(r'SCENE \d+:', text)
    for block in scene_blocks[1:]:
        n = re.search(r'NARRATION:\s*(.+?)(?=IMAGE:|SCENE \d+:|$)', block, re.DOTALL)
        i = re.search(r'IMAGE:\s*(.+?)(?=SCENE \d+:|$)', block, re.DOTALL)
        narration = n.group(1).strip() if n else ""
        image_prompt = i.group(1).strip() if i else ""
        if narration:
            scenes.append({
                "narration": narration,
                "image_prompt": image_prompt,
                "image_url": None,
            })

    # Fallback if parsing fails
    if not scenes:
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        for para in paragraphs[:4]:
            scenes.append({
                "narration": para,
                "image_prompt": f"Little Lord Krishna in Vrindavan, {value}, Pixar 3D, golden light",
                "image_url": None,
            })

    return {"title": title, "scenes": scenes}


def make_image(scene_action: str, narration: str = "") -> Optional[str]:
    """
    Generate one scene image via Nova Canvas.
    scene_action: the specific IMAGE: description from Nova (the exact action in this scene).
    narration: the scene text — gives extra grounding context.
    Scene-specific content comes FIRST so it dominates the generation.
    """
    try:
        context = f"Context: {narration[:100]}. " if narration else ""
        full_prompt = (
            f"{scene_action}. "
            f"{context}"
            "Pixar 3D animation style, vibrant saturated colors, warm golden lighting. "
            "Krishna: age 4, dark blue skin, curly black hair, yellow peacock feather crown, bright yellow dhoti. "
            "Ancient Vrindavan. Children's storybook illustration."
        )[:900]

        logger.info(f"Image prompt: {full_prompt[:200]}")

        body = json.dumps({
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {"text": full_prompt},
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "height": 512,
                "width": 512,
                "cfgScale": 8.0,
            },
        })

        resp = bedrock.invoke_model(
            modelId=os.getenv("NOVA_CANVAS_MODEL_ID", "amazon.nova-canvas-v1:0"),
            body=body,
        )
        result = json.loads(resp["body"].read())
        return result["images"][0]
    except Exception as e:
        logger.error(f"Image error: {e}")
        return None


# ── ROUTES ────────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "message": "GOPA API — Bal Krishna Story Generator",
        "status": "running",
        "endpoints": ["/api/story/generate", "/api/image/generate",
                      "/api/video/generate", "/api/voice/generate", "/health"],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "gopa-api"}


# ── STORY ─────────────────────────────────────────────────────────────────────

@app.post("/api/story/generate")
async def generate_story(request: StoryRequest):
    try:
        logger.info(f"Story: prompt={request.prompt} value={request.value} child={request.child_name}")

        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt required")

        prompt = STORY_PROMPT.format(
            prompt=request.prompt,
            value=request.value or "courage",
            child_name=request.child_name or "Friend",
        )

        logger.info("Calling Nova Lite for story script...")
        resp = bedrock.converse(
            modelId=os.getenv("NOVA_LITE_MODEL_ID", "us.amazon.nova-lite-v1:0"),
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": 2000, "temperature": 0.7},
        )
        raw = resp["output"]["message"]["content"][0]["text"].strip()
        logger.info(f"Story raw preview:\n{raw[:500]}")

        data = parse_story(raw, request.value)
        logger.info(f"Parsed {len(data['scenes'])} scenes: '{data['title']}'")

        # Generate a unique, scene-relevant image for each scene
        for idx, scene in enumerate(data["scenes"]):
            logger.info(f"Image {idx+1}/{len(data['scenes'])}: {scene['image_prompt'][:80]}")
            b64 = make_image(scene["image_prompt"], scene["narration"])
            scene["image_url"] = f"data:image/png;base64,{b64}" if b64 else None

        logger.info(f"Story complete: '{data['title']}'")
        return {
            "status": "success",
            "title": data["title"],
            "scenes": data["scenes"],
            "theme": request.prompt,
            "value": request.value,
        }

    except Exception as e:
        logger.error(f"Story error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── IMAGE ─────────────────────────────────────────────────────────────────────

@app.post("/api/image/generate")
async def generate_image(request: ImageRequest):
    try:
        if not request.image_prompt.strip():
            raise HTTPException(status_code=400, detail="image_prompt required")
        b64 = make_image(request.image_prompt)
        if not b64:
            raise HTTPException(status_code=500, detail="Image generation failed")
        return {"status": "success", "image": b64, "format": "png"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── VIDEO ─────────────────────────────────────────────────────────────────────

@app.post("/api/video/generate")
async def generate_video(request: VideoRequest):
    try:
        logger.info(f"Video request: {request.image_prompt[:80]}")

        if not request.image_prompt.strip():
            raise HTTPException(status_code=400, detail="image_prompt required")

        video_prompt = (
            f"{request.image_prompt}. "
            "Little Lord Krishna age 4, dark blue skin, curly black hair with peacock feather, "
            "yellow dhoti, ancient Vrindavan, Pixar 3D animation style, "
            "warm golden lighting, magical children's storybook."
        )[:512]

        output_key = f"videos/{uuid.uuid4().hex}"
        s3_uri = f"s3://{S3_BUCKET}/{output_key}"

        model_input = {
            "taskType": "TEXT_VIDEO",
            "textToVideoParams": {"text": video_prompt},
            "videoGenerationConfig": {
                "durationSeconds": 6,
                "fps": 24,
                "dimension": "1280x720",
                "seed": int(time.time()) % 2147483647,
            },
        }

        # ✅ FIX: start_async_invoke belongs to bedrock-runtime, NOT bedrock management client
        resp = bedrock.start_async_invoke(
            modelId=os.getenv("NOVA_REEL_MODEL_ID", "amazon.nova-reel-v1:0"),
            modelInput=model_input,
            outputDataConfig={"s3OutputDataConfig": {"s3Uri": s3_uri}},
        )

        invocation_arn = resp.get("invocationArn", "")
        logger.info(f"Video job started: {invocation_arn}")
        return {
            "status": "success",
            "message": "Video generation started — ready in 2-4 minutes",
            "invocation_arn": invocation_arn,
            "s3_output": s3_uri,
        }

    except Exception as e:
        logger.error(f"Video error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── VOICE ─────────────────────────────────────────────────────────────────────

@app.post("/api/voice/generate")
async def generate_voice(request: VoiceRequest):
    try:
        if not request.story:
            raise HTTPException(status_code=400, detail="Story required")

        prompt = (
            f"Transform this into a warm 250-word read-aloud narration for children aged 4-8:\n\n"
            f"{request.story}\n\n"
            "Guidelines: simple words, short sentences, mark natural pauses with [PAUSE], "
            "build gentle emotion, highlight the moral, end with encouragement for the child."
        )

        resp = bedrock.converse(
            modelId=os.getenv("NOVA_LITE_MODEL_ID", "us.amazon.nova-lite-v1:0"),
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={"maxTokens": 600, "temperature": 0.6},
        )
        return {
            "status": "success",
            "narration": resp["output"]["message"]["content"][0]["text"].strip(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── LIVEKIT TOKEN ─────────────────────────────────────────────────────────────

@app.post("/api/token")
async def get_token(request: TokenRequest):
    try:
        from livekit import api
        token = api.TokenWithGrants(
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
            grant=api.VideoGrant(room_join=True, room=request.room),
            identity=request.participant,
            ttl=259200,
        )
        return {
            "status": "success",
            "token": token.to_jwt(),
            "url": os.getenv("LIVEKIT_URL"),
            "room": request.room,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))