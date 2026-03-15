"""The Visionary — Uses Nova Canvas with script context + child photo integration."""
import base64, os, uuid, asyncio
from utils.bedrock_client import invoke_nova_canvas
from utils.s3_utils import upload_image_to_s3, get_presigned_url

STYLE_PREFIX = """Pixar-style 3D animated illustration for children. Vibrant saturated colors, soft volumetric golden-hour lighting, lush green Vrindavan meadows with River Yamuna flowing gently in background. Little Krishna is a cute blue-skinned toddler with a peacock feather crown (mukut), yellow silk dhoti, golden jewelry, holding a bamboo flute. Expressive large eyes, rosy cheeks, warm smile. High-quality 3D render textures. """

NEGATIVE_PROMPT = "dark, scary, violent, weapons, blood, realistic photo, ugly, deformed, blurry, low quality, text, watermark, adult, old"

async def generate_scene_image(visual_description: str, scene_number: int, story_id: str, child_photo_key: str = None) -> dict:
    # Build prompt from script's visual description
    prompt = f"{STYLE_PREFIX}\n\nScene: {visual_description}"

    if child_photo_key:
        prompt += "\n\nIMPORTANT: Include a second cute 3D-animated toddler friend character beside Krishna. This friend has warm brown skin, big expressive eyes, and wears a colorful kurta. They are playing together happily."

    seed = abs(scene_number * 1000 + hash(story_id) % 10000)

    # Run in thread pool since boto3 is sync
    loop = asyncio.get_event_loop()
    image_b64 = await loop.run_in_executor(None, lambda: invoke_nova_canvas(prompt, negative_text=NEGATIVE_PROMPT, seed=seed))

    local_dir = f"generated_stories/{story_id}"
    os.makedirs(local_dir, exist_ok=True)
    local_path = f"{local_dir}/scene_{scene_number}.png"
    with open(local_path, "wb") as f:
        f.write(base64.b64decode(image_b64))

    s3_key = f"stories/{story_id}/scene_{scene_number}.png"
    try:
        upload_image_to_s3(image_b64, s3_key)
        presigned_url = get_presigned_url(s3_key)
    except Exception as e:
        print(f"S3 upload failed (non-critical): {e}")
        presigned_url = None

    return {
        "scene_number": scene_number,
        "local_path": local_path,
        "url": presigned_url or f"/static/{story_id}/scene_{scene_number}.png",
        "base64": image_b64,
    }
