"""Shared Amazon Bedrock client configuration."""
import os
import json
import boto3
from dotenv import load_dotenv

load_dotenv()


def get_bedrock_client():
    """Create a Bedrock Runtime client using default AWS credential chain."""
    return boto3.client(
        "bedrock-runtime",
        region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
    )


def get_bedrock_agent_client():
    """Create a Bedrock Agent Runtime client."""
    return boto3.client(
        "bedrock-runtime",
        region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
    )


def invoke_nova_lite(messages: list, system_prompt: str = "") -> str:
    """Invoke Nova 2 Lite for text generation via the Converse API."""
    client = get_bedrock_client()
    model_id = os.getenv("NOVA_LITE_MODEL_ID", "us.amazon.nova-lite-v1:0")

    kwargs = {
        "modelId": model_id,
        "messages": messages,
        "inferenceConfig": {"maxTokens": 2048, "temperature": 0.7},
    }
    if system_prompt:
        kwargs["system"] = [{"text": system_prompt}]

    response = client.converse(**kwargs)
    return response["output"]["message"]["content"][0]["text"]


def invoke_nova_canvas(prompt: str, negative_text: str = "", seed: int = 0) -> str:
    """Invoke Nova Canvas for image generation. Returns base64 image."""
    client = get_bedrock_client()
    model_id = os.getenv("NOVA_CANVAS_MODEL_ID", "amazon.nova-canvas-v1:0")

    body = {
        "taskType": "TEXT_IMAGE",
        "textToImageParams": {"text": prompt},
        "imageGenerationConfig": {
            "seed": seed,
            "quality": "standard",
            "width": 1024,
            "height": 1024,
            "numberOfImages": 1,
        },
    }
    if negative_text:
        body["textToImageParams"]["negativeText"] = negative_text

    response = client.invoke_model(
        modelId=model_id,
        body=json.dumps(body),
        contentType="application/json",
    )
    result = json.loads(response["body"].read())
    return result["images"][0]


def invoke_nova_reel(prompt: str, image_base64: str = None) -> str:
    """Start async Nova Reel video generation. Returns invocation ARN."""
    client = get_bedrock_client()
    model_id = os.getenv("NOVA_REEL_MODEL_ID", "amazon.nova-reel-v1:0")
    s3_bucket = os.getenv("S3_BUCKET_NAME", "gopa-stories")

    body = {
        "taskType": "TEXT_VIDEO",
        "textToVideoParams": {"text": prompt},
        "videoGenerationConfig": {
            "durationSeconds": 6,
            "fps": 24,
            "dimension": "1280x720",
        },
    }

    if image_base64:
        body["textToVideoParams"]["images"] = [
            {"format": "png", "source": {"bytes": image_base64}}
        ]

    response = client.start_async_invoke(
        modelId=model_id,
        modelInput=body,
        outputDataConfig={"s3OutputDataConfig": {"s3Uri": f"s3://{s3_bucket}/videos/"}},
    )
    return response["invocationArn"]


def check_async_status(invocation_arn: str) -> dict:
    """Check the status of an async invocation (Nova Reel)."""
    client = get_bedrock_client()
    response = client.get_async_invoke(invocationArn=invocation_arn)
    return {
        "status": response["status"],
        "output": response.get("outputDataConfig", {}),
    }
