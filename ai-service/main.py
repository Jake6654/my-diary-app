import os
from io import BytesIO
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import FastAPI
from pydantic import BaseModel
from PIL import Image
import tempfile 
import torch
from diffusers import FluxPipeline


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "diary-illustrations")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

pipe: FluxPipeline | None = None
device = "cpu"


class UploadTestResponse(BaseModel):
    public_url: str


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

@app.on_event("startup")
def load_model():
    global pipe, device

    # Mac M1이면 mps, 아니면 cuda 또는 cpu
    if torch.backends.mps.is_available():
        device = "mps"
    elif torch.cuda.is_available():
        device = "cuda"
    else:
        device = "cpu"

    print("[FLUX] using device:", device)

    pipe = FluxPipeline.from_pretrained(
        "black-forest-labs/FLUX.1-schnell",
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        use_safetensors=True,
    ).to(device)

    print("[FLUX] model loaded.")

