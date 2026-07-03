from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    express_api_url: str = "http://localhost:3000"
    frontend_url: str = "http://localhost:5173"
    upload_dir: str = "uploads"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
