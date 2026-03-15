import uuid, asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from agents.chronicler import generate_story_script
from agents.visionary import generate_scene_image
from agents.animator import start_all_animations, check_animation_status

router = APIRouter()
stories = {}

class StoryRequest(BaseModel):
    value: str
    child_name: Optional[str] = "Friend"
    child_photo_key: Optional[str] = None
    duration: Optional[str] = "short"

@router.post("/generate")
async def generate_story(req: StoryRequest):
    story_id = str(uuid.uuid4())[:8]
    try:
        script = await generate_story_script(value=req.value, child_name=req.child_name or "Friend")
        stories[story_id] = {"id": story_id, "value": req.value, "script": script, "status": "generating_images", "images": []}

        tasks = [
            generate_scene_image(
                visual_description=scene["visual_description"],
                scene_number=scene["scene_number"],
                story_id=story_id,
                child_photo_key=req.child_photo_key,
            )
            for scene in script["scenes"]
        ]
        images = await asyncio.gather(*tasks, return_exceptions=True)

        good_images = []
        for img in images:
            if isinstance(img, Exception):
                print(f"Image gen failed: {img}")
                good_images.append({"scene_number": len(good_images)+1, "url": None})
            else:
                good_images.append({k: v for k, v in img.items() if k != "base64"})

        stories[story_id]["images"] = good_images
        stories[story_id]["status"] = "complete"

        return {
            "story_id": story_id,
            "title": script.get("title", "A Krishna Adventure"),
            "status": "complete",
            "scenes": [
                {"scene_number": s["scene_number"], "narration": s["narration"],
                 "image_url": good_images[i].get("url", "") if i < len(good_images) else ""}
                for i, s in enumerate(script["scenes"])
            ],
        }
    except Exception as e:
        stories[story_id] = {"id": story_id, "status": "error", "error": str(e)}
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-script")
async def generate_script_only(req: StoryRequest):
    story_id = str(uuid.uuid4())[:8]
    script = await generate_story_script(value=req.value, child_name=req.child_name or "Friend")
    stories[story_id] = {"id": story_id, "script": script, "status": "script_ready"}
    return {"story_id": story_id, "script": script}

@router.post("/generate-video/{story_id}")
async def generate_video(story_id: str):
    if story_id not in stories: raise HTTPException(status_code=404)
    story = stories[story_id]
    if not story.get("images"): raise HTTPException(status_code=400, detail="No images")
    video_jobs = await start_all_animations(story["script"]["scenes"], story["images"], story_id)
    stories[story_id]["videos"] = video_jobs
    stories[story_id]["status"] = "video_in_progress"
    return {"story_id": story_id, "status": "video_in_progress"}

@router.get("/status/{story_id}")
async def get_story_status(story_id: str):
    if story_id not in stories: raise HTTPException(status_code=404)
    return stories[story_id]

@router.get("/list")
async def list_stories():
    return [{"id": s["id"], "status": s["status"]} for s in stories.values()]
