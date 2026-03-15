"""
Photo upload route — handles child photo for "Me in the Story" feature.
"""
import os
import uuid
import base64
from fastapi import APIRouter, UploadFile, File, HTTPException
from utils.s3_utils import upload_file_to_s3, get_presigned_url

router = APIRouter()


@router.post("/photo")
async def upload_child_photo(file: UploadFile = File(...)):
    """
    Upload a child's photo for personalized story characters.
    Stores in S3 and returns a key for the Visionary agent.
    """
    # Validate file type
    if file.content_type not in ["image/png", "image/jpeg", "image/jpg", "image/webp"]:
        raise HTTPException(status_code=400, detail="Only PNG, JPEG, and WebP images are supported")

    # Read file
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    photo_id = str(uuid.uuid4())[:8]
    ext = file.filename.split(".")[-1] if file.filename else "png"
    s3_key = f"uploads/photos/{photo_id}.{ext}"

    # Save locally as backup
    local_dir = "generated_stories/uploads"
    os.makedirs(local_dir, exist_ok=True)
    local_path = f"{local_dir}/{photo_id}.{ext}"
    with open(local_path, "wb") as f:
        f.write(contents)

    # Upload to S3
    try:
        s3_uri = upload_file_to_s3(contents, s3_key, content_type=file.content_type)
        url = get_presigned_url(s3_key)
    except Exception as e:
        print(f"S3 upload failed: {e}")
        url = f"/static/uploads/{photo_id}.{ext}"
        s3_uri = None

    # Create base64 for preview
    b64 = base64.b64encode(contents).decode("utf-8")

    return {
        "photo_id": photo_id,
        "s3_key": s3_key,
        "url": url,
        "preview": f"data:{file.content_type};base64,{b64[:100]}...",
    }
