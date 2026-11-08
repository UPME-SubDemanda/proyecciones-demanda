from alembic import context
from sqlalchemy import create_engine

import app.auth.models  # noqa: F401  registra tablas
from app.core.config import settings
from app.db.base import Base

target_metadata = Base.metadata


def run_migrations_online() -> None:
    engine = create_engine(settings.database_url)
    with engine.connect() as conn:
        context.configure(connection=conn, target_metadata=target_metadata, include_schemas=True)
        with context.begin_transaction():
            context.run_migrations()


run_migrations_online()
