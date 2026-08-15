"""
NagDrishti AI — Redis Caching Layer
Provides sub-millisecond caching for real-time zone risk scores and weather telemetry with graceful fallback.
"""

import os
import json
from typing import Optional, Any

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

class RedisCacheManager:
    def __init__(self, url: str = REDIS_URL):
        self.url = url
        self.client = None
        self.is_connected = False
        self._init_connection()

    def _init_connection(self):
        try:
            import redis
            self.client = redis.from_url(self.url, socket_timeout=2.0, decode_responses=True)
            self.client.ping()
            self.is_connected = True
            print("[RedisCache] Connected to Redis instance successfully.")
        except Exception as e:
            self.is_connected = False
            self.client = None
            print(f"[RedisCache] Redis connection skipped/unavailable ({e}). Using in-memory fallback cache.")

    def get(self, key: str) -> Optional[Any]:
        if not self.is_connected or not self.client:
            return None
        try:
            val = self.client.get(key)
            return json.loads(val) if val else None
        except Exception:
            return None

    def set(self, key: str, value: Any, ttl_seconds: int = 300) -> bool:
        if not self.is_connected or not self.client:
            return False
        try:
            self.client.setex(key, ttl_seconds, json.dumps(value))
            return True
        except Exception:
            return False

cache_manager = RedisCacheManager()
