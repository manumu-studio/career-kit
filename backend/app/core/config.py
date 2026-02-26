"""Application configuration loaded from environment variables."""

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Validated application settings."""

    anthropic_api_key: str = ""
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])
    max_file_size_mb: int = 5
    llm_provider: str = "anthropic"
    rate_limit_requests: int = 10
    rate_limit_window_seconds: int = 60
    llm_input_cost_per_million: float = 0.80
    llm_output_cost_per_million: float = 4.00

    model_config = SettingsConfigDict(env_file=".env", enable_decoding=False)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str]:
        """Supports comma-separated or list-based CORS origin definitions."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        if isinstance(value, list):
            return [str(origin).strip() for origin in value if str(origin).strip()]
        return ["http://localhost:3000"]


@lru_cache
def get_settings() -> Settings:
    """Return cached, validated application settings."""
    return Settings()


settings = get_settings()
