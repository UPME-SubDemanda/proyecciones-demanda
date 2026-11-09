"""Uso: python -m app.auth.cli create-user correo@dominio --role admin [--password ...] [--if-missing]

`--if-missing` no hace nada si el usuario ya existe (sirve para el arranque automático en desarrollo).
"""
import argparse
import getpass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.models import Role, User
from app.auth.security import hash_password
from app.auth.seed import seed_roles
from app.db.session import SessionLocal


def create_user(db: Session, email: str, roles: list[str], password: str, if_missing: bool = False) -> tuple[User, bool]:
    """Crea un usuario local con sus roles. Devuelve (usuario, creado). Con `if_missing`, uno existente se deja igual."""
    seed_roles(db)
    email = email.lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        if if_missing:
            return existing, False
        raise SystemExit(f"El usuario {email} ya existe.")
    user = User(email=email, name=email, provider="local", password_hash=hash_password(password))
    user.roles = [db.get(Role, r) for r in roles]
    db.add(user)
    db.commit()
    return user, True


def main() -> None:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("create-user")
    c.add_argument("email")
    c.add_argument("--role", action="append", default=[])
    c.add_argument("--password")
    c.add_argument("--if-missing", action="store_true", help="no falla si el usuario ya existe")
    a = ap.parse_args()
    with SessionLocal() as db:
        if a.if_missing and db.scalar(select(User).where(User.email == a.email.lower())):
            print(f"Usuario {a.email.lower()} ya existe.")
            return
        pw = a.password or getpass.getpass("Contraseña: ")
        user, _ = create_user(db, a.email, a.role, pw, a.if_missing)
        print(f"Usuario {user.email} creado con roles {user.role_names}.")


if __name__ == "__main__":
    main()
