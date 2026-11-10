from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.api.v1 import ee, health
from app.auth.router import admin_router
from app.auth.router import router as auth_router
from app.core.config import settings

app = FastAPI(title="Proyecciones de Demanda", version="0.1.0")
app.add_middleware(SessionMiddleware, secret_key=settings.session_secret, https_only=False, same_site="lax")
app.add_middleware(
    CORSMiddleware, allow_origins=settings.cors_origins.split(","), allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

API = "/api/v1"  # TEC-08
app.include_router(health.router, prefix=API)
app.include_router(ee.router, prefix=API)
app.include_router(auth_router, prefix=API)
app.include_router(admin_router, prefix=API)
