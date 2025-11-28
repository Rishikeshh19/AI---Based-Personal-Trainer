from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = Field(default="mongodb://localhost:27017")
    # Redis settings
    REDIS_URL: str = Field(default="redis://localhost:6379")
    # RabbitMQ settings
    RABBITMQ_URL: str = Field(default="amqp://localhost:5672")
    # JWT settings
    JWT_SECRET: str = Field(default="your-secret-key-change-in-production")
    SECRET_KEY: str = Field(default="your-secret-key-change-in-production")
    JWT_EXPIRATION: int = Field(default=30)
    ALGORITHM: str = Field(default="HS256")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM