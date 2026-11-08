from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


def make_engine(url: str):
    if url.startswith("sqlite"):
        # SQLite no tiene esquemas: se ignoran (solo pruebas y desarrollo rápido)
        return create_engine(url, connect_args={"check_same_thread": False}).execution_options(
            schema_translate_map={"auth": None, "raw": None, "staging": None, "core": None, "publicacion": None}
        )
    return create_engine(url, pool_pre_ping=True)


engine = make_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
