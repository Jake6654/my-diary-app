"""
diffusion/sd3.py

Role:
- Load Stable Diffusion 3 onto GPU once (cold start).
- Generate an image for a prompt and return PNG bytes.

Why return bytes:
- The worker later uploads bytes to storage (Supabase).
- Gateway never touches raw images; it only reads the final URL from Redis.

Why load once:
- Model loading is expensive (time + GPU memory).
- We load at worker start, then reuse for multiple jobs until idle shutdown.
"""

from typing import Optional
import io
import torch
from diffusers import StableDiffusion3Pipeline
from ..core.config import HUGGINGFACE_HUB_TOKEN

pipe: Optional[StableDiffusion3Pipeline] = None

def load_model_once():
    global pipe
    if pipe is not None:
        return

    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is not available. This worker requires a GPU.")

    pipe_local = StableDiffusion3Pipeline.from_pretrained(
        "stabilityai/stable-diffusion-3-medium-diffusers",
        token=HUGGINGFACE_HUB_TOKEN,
        torch_dtype=torch.float16,
    )

    # Move weights to GPU
    pipe_local.to("cuda")
    pipe = pipe_local
    print("[inference] SD3 model loaded on GPU")

"""
What are PNG bytes? the raw binary representation of an image, stored in memory instead of disk

Much faster and flexible than an image file

"""
def generate_png_bytes(prompt: str) -> bytes:
    if pipe is None:
        raise RuntimeError("Model not loaded. Call load_model_once() first.")

    with torch.no_grad():
        result = pipe(
            prompt=prompt,
            negative_prompt=(
                "photorealistic, realistic, 3d render, "
                "ugly, low quality, blurry, distorted, disfigured, "
                "text, logo, watermark, caption, nsfw"
            ),
            num_inference_steps=16,
            guidance_scale=6.0,
            height=768,
            width=768,
        )

    img = result.images[0]
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
