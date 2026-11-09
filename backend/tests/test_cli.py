import pytest

from app.auth.cli import create_user
from app.db.base import Base
from app.db.session import SessionLocal, engine


@pytest.fixture()
def db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as session:
        yield session


def test_create_user_with_roles(db):
    user, created = create_user(db, "Admin@Local", ["admin"], "clave-123")
    assert created
    assert user.email == "admin@local"
    assert user.role_names == ["admin"]


def test_if_missing_keeps_existing_user(db):
    create_user(db, "admin@local", ["admin"], "clave-123")
    user, created = create_user(db, "admin@local", ["viewer"], "otra", if_missing=True)
    assert not created
    assert user.role_names == ["admin"]


def test_existing_user_without_if_missing_fails(db):
    create_user(db, "admin@local", ["admin"], "clave-123")
    with pytest.raises(SystemExit):
        create_user(db, "admin@local", ["admin"], "clave-123")
