import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.auth.models import Role, User  # noqa: E402
from app.auth.security import hash_password  # noqa: E402
from app.auth.seed import seed_roles  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture()
def client():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_roles(db)
        for email, roles in [("admin@local", ["admin"]), ("viewer@local", ["viewer"])]:
            u = User(email=email, provider="local", password_hash=hash_password("clave-123"))
            u.roles = [db.get(Role, r) for r in roles]
            db.add(u)
        db.commit()
    yield TestClient(app)
