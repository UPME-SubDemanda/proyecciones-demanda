from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.auth.models import User
from app.db.session import get_db


def current_user(request: Request, db: Session = Depends(get_db)) -> User:
    uid = request.session.get("user_id")
    user = db.get(User, uid) if uid else None
    if not user or not user.active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Inicie sesión para continuar.")
    return user


def require_role(*roles: str):
    """Permite el acceso si el usuario tiene alguno de los roles (admin siempre puede)."""

    def checker(user: User = Depends(current_user)) -> User:
        names = set(user.role_names)
        if "admin" in names or names.intersection(roles):
            return user
        raise HTTPException(status.HTTP_403_FORBIDDEN, f"Necesita uno de estos roles: {', '.join(roles)}.")

    return checker
