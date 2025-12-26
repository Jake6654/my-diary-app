import os
import tempfile
from uuid import uuid4
from typing import Optional

from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import FastAPI
from pydantic import BaseModel
from PIL import Image

import torch
from diffusers import StableDiffusion3Pipeline
from openai import OpenAI

# loading env vars
load_dotenv() 
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "diary-illustrations")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HUGGINGFACE_HUB_TOKEN = os.getenv("HUGGINGFACE_HUB_TOKEN")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL / SUPABASE_SERVICE_KEY are not set")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set")

if not HUGGINGFACE_HUB_TOKEN:
    raise RuntimeError("HUGGINGFACE_HUB_TOKEN is not set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

client = OpenAI(api_key=OPENAI_API_KEY)

# Stable Diffusion 3 Medium pipline
pipe: Optional[StableDiffusion3Pipeline] = None
device = "cuda"


# Pydantic model
# it define and validate the structure of request and response data
class UploadTestResponse(BaseModel):
    public_url: str


class PromptRequest(BaseModel):
    diary_text: str


class GenerateRequest(BaseModel):
    diary_text: str


class GenerateResponse(BaseModel):
    prompt: str
    image_url: str



async def build_illustration_prompt(diary_text: str) -> str:
    template = f"""
You are an illustration prompt generator for a cartoon-style diary app.

Your job:
Generate a short, Stable Diffusion 3-friendly propmt that illustartes the diary entry in a modern cartoon/ graphic novel style.

Required style:
- modern cartoon illustration
- graphic novel art style
- clean, bold ink outlines
- cel-shaded coloring with clear shadows
- expressive human characters with natural proportions
- simplified comic-style background


Character Rules:
- The main character must be **a human** with normal proportions.
- Facial expressions should be expressive and cartoonish but not overly exaggerated.
- Avoid: photorealism, chibi style, anime style, fuzzy textures, 3D render.

Scene Composition Rules:
- Depict only one clear scene capturing the main event or mood.
- Include context from the diary (place, activity, objects).
- Keep the background slightly simplified, typical of comic art.

Forbidden Outputs
- photorealistic, hyperrealistic, photograph
- chibi, oversized heads, baby-like proportions
- painterly, watercolor, blurred edges, soft pastel style
- text, speech bubbles, panels borders, letters, logos

Output format:
- One concise sentence
- No explanation
- No diary restatement

Diary Entry:
\"\"\"{diary_text}\"\"\"
"""

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": template}],
    )

    prompt = completion.choices[0].message.content
    return prompt.strip()

def generate_and_upload_image(prompt: str) -> str:
    if pipe is None:
        raise RuntimeError("Stable Diffusion 3 pipeline is not loaded yet")

    with torch.no_grad():
        result = pipe(
            prompt=prompt,
            negative_prompt=(
                "photorealistic, realistic, 3d render, "
                "ugly, low quality, blurry, distorted, disfigured, creepy, "
                "text, logo, watermark, caption, nsfw"
            ),
            num_inference_steps=16,   # can adjust it bwt 12~20 if you want
            guidance_scale=6.0,       
            height=768,
            width=768,
        )
    image = result.images[0]  # PIL.Image

    # have to save temporary PNG file because the supabase storage SDK
    # is most reliabel with a real file path not a PIL Image in memory
    tmp_path = None

    try:
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            image.save(tmp, format="PNG")
            tmp_path = tmp.name

        file_name = f"{uuid4().hex}.png"
        file_path = f"generated/{file_name}"

        supabase.storage.from_(SUPABASE_BUCKET).upload(
            file_path,
            tmp_path,
            {"content-type": "image/png"},
        )

        # Public URL
        public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(file_path)
        return public_url
    finally:
        # Clean up the temp file to avoid filling up disk over time
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass



@app.post("/generate-prompt")
async def generate_prompt(req: PromptRequest):
    prompt = await build_illustration_prompt(req.diary_text)
    return {"prompt": prompt}


@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    # 1. generate a prompt first
    prompt = await build_illustration_prompt(req.diary_text)

    # 2. generate an image and upload it to supabase 
    image_url = generate_and_upload_image(prompt)

    # 3. return
    return GenerateResponse(prompt=prompt, image_url=image_url)


@app.on_event("startup")
def load_model():
    global pipe, device

    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is not available. This service requires a GPU (e.g., L4).")

    device = "cuda"
    print("[SD3-MEDIUM] using device:", device)

    pipe_local = StableDiffusion3Pipeline.from_pretrained(
        "stabilityai/stable-diffusion-3-medium-diffusers",
        token=HUGGINGFACE_HUB_TOKEN,
        torch_dtype=torch.float16,
    )

    pipe_local.to(device)

    print("[SD3-MEDIUM] model loaded on GPU.")
    globals()["pipe"] = pipe_local
