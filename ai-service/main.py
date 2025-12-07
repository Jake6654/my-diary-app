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


# ---------------------------------------------------
# 1. 환경 변수 / 클라이언트 초기화
# ---------------------------------------------------
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

# Stable Diffusion 3 Medium 파이프라인
pipe: Optional[StableDiffusion3Pipeline] = None
device = "cuda"


# ---------------------------------------------------
# 2. Pydantic 모델
# ---------------------------------------------------
class UploadTestResponse(BaseModel):
    public_url: str


class PromptRequest(BaseModel):
    diary_text: str


class GenerateRequest(BaseModel):
    diary_text: str
    # 나중에 옵션(예: mood, style 등) 추가 가능


class GenerateResponse(BaseModel):
    prompt: str
    image_url: str


# ---------------------------------------------------
# 3. 유틸 함수들
# ---------------------------------------------------
async def build_illustration_prompt(diary_text: str) -> str:
    """
    OpenAI chat 모델을 사용해 일기 → Stable Diffusion 3에 최적화된
    안정적인 soft-illustrated diary 스타일 프롬프트 생성
    """
    template = f"""
You are an illustration prompt generator for a cartoon-style diary application.

Your job:
Analyze the diary entry and produce a short, clean, Stable Diffusion 3–friendly prompt
that generates an illustration in a distinct **modern cartoon or graphic novel style**.

=== Required Style (Cartoon/Comic feel) ===
- **modern cartoon illustration, graphic novel art style**
- **clean bold outlines**, ink line art feel
- **cel-shaded coloring**, distinct shadows (NOT smooth painted textures)
- warm colors but with clear contrast suitable for comics
- expressive human characters with **natural proportions** (stylized but NOT chibi or oversized heads)
- clear composition, looks like a panel from a comic book

=== Character Rules ===
- The main character must be **a human** with normal proportions.
- Facial expressions should be expressive and cartoonish but not overly exaggerated.
- Avoid: photorealism, chibi style, anime style, fuzzy textures, 3D render.

=== Scene Composition Rules ===
- Depict only one clear scene capturing the main event or mood.
- Include context from the diary (place, activity, objects).
- Keep the background slightly simplified, typical of comic art.

=== Forbidden Outputs ===
- photorealistic, hyperrealistic, photograph
- chibi, oversized heads, baby-like proportions
- painterly, watercolor, blurred edges, soft pastel style
- text, speech bubbles, panels borders, letters, logos

=== Output Formatting ===
Return ONLY the final prompt text with:
- A single concise sentence describing the scene and style.
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
    """
    1) Stable Diffusion 3 Medium으로 이미지 생성
    2) Supabase Storage에 PNG 업로드
    3) Public URL 반환
    """
    if pipe is None:
        raise RuntimeError("Stable Diffusion 3 pipeline is not loaded yet")

    # 1) 이미지 생성 (GPU 전용)
    with torch.no_grad():
        result = pipe(
            prompt=prompt,
            negative_prompt=(
                "photorealistic, realistic, 3d render, "
                "ugly, low quality, blurry, distorted, disfigured, creepy, "
                "text, logo, watermark, caption, nsfw"
            ),
            num_inference_steps=16,   # 필요하면 12~20 사이에서 조정
            guidance_scale=6.0,       # 카툰/프롬프트 반영 강하게
            height=768,
            width=768,
        )
    image = result.images[0]  # PIL.Image

    # 2) 임시 파일로 저장
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        image.save(tmp, format="PNG")
        tmp_path = tmp.name

    # 3) Supabase에 업로드할 경로
    file_name = f"{uuid4().hex}.png"
    file_path = f"generated/{file_name}"

    supabase.storage.from_(SUPABASE_BUCKET).upload(
        file_path,
        tmp_path,
        {"content-type": "image/png"},
    )

    # 4) Public URL
    public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(file_path)
    return public_url


# ---------------------------------------------------
# 4. 엔드포인트들
# ---------------------------------------------------
@app.post("/upload-test", response_model=UploadTestResponse)
def upload_test():
    """
    테스트용: 분홍색 이미지 하나 만들어서 Supabase에 올리고 URL 반환
    """
    img = Image.new("RGB", (512, 512), color=(255, 100, 120))

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        img.save(tmp, format="PNG")
        tmp_path = tmp.name

    file_path = "test/test-image.png"

    supabase.storage.from_(SUPABASE_BUCKET).upload(
        file_path,
        tmp_path,
        {
            "content-type": "image/png",
            "x-upsert": "true",
        },
    )

    public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(file_path)
    return UploadTestResponse(public_url=public_url)


@app.post("/generate-prompt")
async def generate_prompt(req: PromptRequest):
    prompt = await build_illustration_prompt(req.diary_text)
    return {"prompt": prompt}


@app.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest):
    # 1) 프롬프트 생성 (LLM)
    prompt = await build_illustration_prompt(req.diary_text)

    # 2) 이미지 생성 + Supabase 업로드
    image_url = generate_and_upload_image(prompt)

    # 3) 프롬프트 + 이미지 URL 반환
    return GenerateResponse(prompt=prompt, image_url=image_url)


# ---------------------------------------------------
# 5. 모델 로딩 (startup hook, GPU only)
# ---------------------------------------------------
@app.on_event("startup")
def load_model():
    """
    Stable Diffusion 3 Medium 파이프라인 로딩 (GPU only)
    - CUDA가 없으면 바로 에러 발생시키도록 함
    - L4 기준: float16 + 풀 GPU 로딩
    """
    global pipe, device

    if not torch.cuda.is_available():
        raise RuntimeError("CUDA is not available. This service requires a GPU (e.g., L4).")

    device = "cuda"
    print("[SD3-MEDIUM] using device:", device)

    # L4 기준 float16 + GPU 로딩
    pipe_local = StableDiffusion3Pipeline.from_pretrained(
        "stabilityai/stable-diffusion-3-medium-diffusers",
        token=HUGGINGFACE_HUB_TOKEN,
        torch_dtype=torch.float16,
    )

    # 완전 GPU 로딩
    pipe_local.to(device)

    print("[SD3-MEDIUM] model loaded on GPU (no CPU offload).")
    globals()["pipe"] = pipe_local
