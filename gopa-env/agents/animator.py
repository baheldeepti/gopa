"""
The Animator — Video Orchestrator
Uses Amazon Nova Reel to animate scenes into a 60-second bedtime video.
"""
import os
from utils.bedrock_client import invoke_nova_reel, check_async_status

ANIMATION_PROMPT_TEMPLATE = """Cinematic animation of a Pixar-style Bal Krishna scene. 
Gentle {camera_motion} camera motion with motion intensity 0.4. 
Character facial expressions are fluid — smiling and laughing. 
Soft golden lighting, magical sparkles, lush green Vrindavan backdrop. 
16:9 aspect ratio. Smooth, child-friendly animation style.

Scene: {narration}"""


async def start_scene_animation(
    scene: dict,
    image_base64: str,
    story_id: str,
) -> dict:
    """
    Start async video generation for a single scene.
    Returns the invocation ARN for status polling.
    """
    camera_motion = scene.get("camera_motion", "Dolly-In")
    narration = scene.get("narration", "")

    prompt = ANIMATION_PROMPT_TEMPLATE.format(
        camera_motion=camera_motion,
        narration=narration,
    )

    try:
        invocation_arn = invoke_nova_reel(prompt, image_base64=image_base64)
        return {
            "scene_number": scene["scene_number"],
            "invocation_arn": invocation_arn,
            "status": "IN_PROGRESS",
        }
    except Exception as e:
        return {
            "scene_number": scene["scene_number"],
            "invocation_arn": None,
            "status": "FAILED",
            "error": str(e),
        }


async def check_animation_status(invocation_arn: str) -> dict:
    """Poll the status of a Nova Reel video generation job."""
    try:
        result = check_async_status(invocation_arn)
        return result
    except Exception as e:
        return {"status": "ERROR", "error": str(e)}


async def start_all_animations(scenes: list, images: list, story_id: str) -> list:
    """Start video generation for all scenes."""
    results = []
    for scene, image in zip(scenes, images):
        result = await start_scene_animation(
            scene=scene,
            image_base64=image.get("base64", ""),
            story_id=story_id,
        )
        results.append(result)
    return results
