
"""
config.py 

Purpose:
- Central place to load and manage env variables
- Prevents scattering os.getenv() calls across the codebase
"""



import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
