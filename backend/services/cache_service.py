from redis import Redis
from fastapi import HTTPException

class CacheService:
    def __init__(self, redis_url: str):
        self.redis = Redis.from_url(redis_url)

    def cache_latest_workout(self, member_id: str, workout_data: dict):
        key = f"member:{member_id}:latest_workout"
        self.redis.set(key, workout_data, ex=3600)  # Cache for 1 hour

    def get_latest_workout(self, member_id: str):
        key = f"member:{member_id}:latest_workout"
        workout_data = self.redis.get(key)
        if workout_data is None:
            raise HTTPException(status_code=404, detail="No workout data found.")
        return workout_data

    def clear_cache(self, member_id: str):
        key = f"member:{member_id}:latest_workout"
        self.redis.delete(key)