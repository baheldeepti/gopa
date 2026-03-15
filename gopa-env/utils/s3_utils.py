"""S3 upload/download helpers."""
import os
import boto3
import base64
from dotenv import load_dotenv

load_dotenv()


def get_s3_client():
    return boto3.client(
        "s3",
        region_name=os.getenv("S3_REGION", "us-east-1"),
    )


def upload_image_to_s3(image_base64: str, key: str) -> str:
    client = get_s3_client()
    bucket = os.getenv("S3_BUCKET_NAME")
    image_bytes = base64.b64decode(image_base64)
    client.put_object(Bucket=bucket, Key=key, Body=image_bytes, ContentType="image/png")
    return f"s3://{bucket}/{key}"


def get_presigned_url(key: str, expires_in: int = 3600) -> str:
    client = get_s3_client()
    bucket = os.getenv("S3_BUCKET_NAME")
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires_in,
    )


def upload_file_to_s3(file_bytes: bytes, key: str, content_type: str = "image/png") -> str:
    client = get_s3_client()
    bucket = os.getenv("S3_BUCKET_NAME")
    client.put_object(Bucket=bucket, Key=key, Body=file_bytes, ContentType=content_type)
    return f"s3://{bucket}/{key}"
