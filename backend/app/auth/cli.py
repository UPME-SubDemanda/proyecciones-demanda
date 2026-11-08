"""Uso: python -m app.auth.cli create-user correo@dominio --role admin [--password ...]"""
import argparse
import getpass

from app.auth.models import Role, User
from app.auth.security import hash_password
from app.auth.seed import seed_roles
from app.db.session import SessionLocal


def main() -> None:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("create-user")
    c.add_argument("email")
    c.add_argument("--role", action="append", default=[])
    c.add_argument("--password")
    a = ap.parse_args()
    with SessionLocal() as db:
        seed_roles(db)
        pw = a.password or getpass.getpass("Contraseña: ")
        user = User(email=a.email.lower(), name=a.email, provider="local", password_hash=hash_password(pw))
        user.roles = [db.get(Role, r) for r in a.role]
        db.add(user)
        db.commit()
        print(f"Usuario {user.email} creado con roles {user.role_names}.")


if __name__ == "__main__":
    main()
