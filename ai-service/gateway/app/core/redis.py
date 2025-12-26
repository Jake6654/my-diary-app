
"""
redis.py

Purpose:
- Create a single Redis connection object and share it across the gateway.

Why this file exists:
- Avoid duplicated Redis connection logic.
- Keep Redis configuration consistent everywhere.

"""

import redis
from .config import REDIS_URL

r = redis.Redis.from_url(REDIS_URL, decode_responses=True)