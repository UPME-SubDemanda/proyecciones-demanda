from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuración por variables de entorno (TEC-09)."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./local.db"
    session_secret: str = "dev-only-secret"
    google_client_id: str = ""
    google_client_secret: str = ""
    google_allowed_domain: str = "upme.gov.co"
    auth_local_enabled: bool = True
    cors_origins: str = "http://localhost:5173"


settings = Settings()
