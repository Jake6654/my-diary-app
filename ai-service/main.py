import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import FastAPI
from pydantic import BaseModel
from PIL import Image
import tempfile 
import torch
from diffusers import AutoPipelineForText2Image
from openai import OpenAI
from uuid import uuid4
from typing import Optional


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "diary-illustrations")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
HUGGINGFACE_HUB_TOKEN = os.getenv("HUGGINGFACE_HUB_TOKEN")


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

client = OpenAI(api_key=OPENAI_API_KEY)


pipe: AutoPipelineForText2Image | None = None
device = "cpu"


class UploadTestResponse(BaseModel):
    public_url: str

class PromptRequest(BaseModel):
    diary_text: str


class GenerateRequest(BaseModel):
    diary_text: str
    # 나중에 옵션 더 넣고 싶으면 여기 확장 (예: mood, style 등)

class GenerateResponse(BaseModel):
    prompt: str
    image_url: str


@app.post("/upload-test", response_model=UploadTestResponse)
def upload_test():
    # 1) 메모리에서 임시 이미지 생성 (512x512 분홍 배경)
    img = Image.new("RGB", (512, 512), color=(255, 100, 120))

     # 2) 임시 파일에 저장
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        img.save(tmp, format="PNG")
        tmp_path = tmp.name  # 이게 실제 파일 경로

    # 2) 업로드할 파일 경로 (버킷 내부)
    file_path = "test/test-image.png"

    # 3) Supabase Storage에 업로드
    supabase.storage.from_(SUPABASE_BUCKET).upload(
        file_path,
        tmp_path,  # 여기에는 "파일 경로(str)"를 넘겨줘야 함
        {"content-type": "image/png"},
    )

    # 4) Public URL 가져오기
    public_url = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(file_path)

    return UploadTestResponse(public_url=public_url)

async def build_illustration_prompt(diary_text: str) -> str:
    template = f"""
You are an illustration prompt generator for a cute diary-style art application.

Your job:
1. Read the user's diary entry.
2. Extract the main mood, activities, and key emotional themes.
3. Create a short, clean, Flux-friendly prompt for a cute illustrated diary drawing.

Guidelines:
- Style: “cute diary illustration, pastel colors, warm lighting, soft edges”
- Include the main emotional mood (happy, sad, reflective, tired, excited, etc.)
- Describe only 1–2 key actions or scenes from the diary
- Keep the prompt under 40–60 words
- Do NOT include text in the image
- Do NOT describe multiple complex scenes

Return ONLY the final prompt, nothing else.

Diary:
\"\"\"
{diary_text}
\"\"\"
"""

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": template}],
    )

    # 새로운 OpenAI SDK는 이렇게 접근
    prompt = completion.choices[0].message.content
    return prompt

def generate_and_upload_image(prompt: str) -> str:
    """
    1) Stable Diffusion Turbo로 이미지 생성
    2) Supabase Storage에 PNG 업로드
    3) Public URL 반환
    """
    if pipe is None:
        raise RuntimeError("Flux pipeline is not loaded yet")

    # 1) 이미지 생성 (하나만 생성)
    with torch.no_grad():
        result = pipe(
            prompt=prompt,
            num_inference_steps=1,   # 빠른 테스트용, 나중에 조절 가능
            guidance_scale=0.0,
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

@app.on_event("startup")
def load_model():
    global pipe, device

    if torch.cuda.is_available():
        device = "cuda"
    else:
        device = "cpu"

    print("[SD-TURBO] using device:", device)

    pipe = AutoPipelineForText2Image.from_pretrained(
        "stabilityai/sd-turbo",
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        variant="fp16" if device == "cuda" else None,
    ).to(device)

    print("[SD-TURBO] model loaded.")

