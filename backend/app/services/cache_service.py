import json
import os
from typing import Any

import redis


REDIS_URL = os.getenv("REDIS_URL")
DEFAULT_TTL_SECONDS = 60


def _client() -> redis.Redis | None:
	if not REDIS_URL:
		return None
	return redis.Redis.from_url(
		REDIS_URL,
		decode_responses=True,
		socket_connect_timeout=0.25,
		socket_timeout=0.25,
		health_check_interval=30,
	)


def get_json(key: str) -> Any | None:
	client = _client()
	if client is None:
		return None
	try:
		value = client.get(key)
		return json.loads(value) if value is not None else None
	except (redis.RedisError, json.JSONDecodeError):
		return None


def set_json(key: str, value: Any, ttl: int = DEFAULT_TTL_SECONDS) -> None:
	client = _client()
	if client is None:
		return
	try:
		client.setex(key, ttl, json.dumps(value, separators=(",", ":")))
	except (redis.RedisError, TypeError, ValueError):
		pass


def delete(key: str) -> None:
	client = _client()
	if client is None:
		return
	try:
		client.delete(key)
	except redis.RedisError:
		pass


def delete_pattern(pattern: str) -> None:
	client = _client()
	if client is None:
		return
	try:
		keys = list(client.scan_iter(match=pattern, count=100))
		if keys:
			client.delete(*keys)
	except redis.RedisError:
		pass
