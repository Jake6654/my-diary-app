"""
core/config.py

Role:
- Centralize all configuration and environment variable loading.
- This keeps other modules clean (no repeated os.getenv everywhere).

"""

import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "diary-illustrations")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

HUGGINGFACE_HUB_TOKEN = os.getenv("HUGGINGFACE_HUB_TOKEN")

WORKER_IDLE_SECONDS = int(os.getenv("WORKER_IDLE_SECONDS", "600"))
