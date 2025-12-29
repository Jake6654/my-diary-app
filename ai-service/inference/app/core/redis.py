"""
core/redis.py

Role:
- Create a shared Redis connection object.

Why it matters:
- Both gateway and worker share a data contract in Redis.
- decode_responses=True makes values strings (easier than bytes).

"""

import redis
from .config import REDIS_URL

r = redis.Redis.from_url(REDIS_URL, decode_responses=True)
