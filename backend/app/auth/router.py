from authlib.integrations.starlette_client import OAuth
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.deps import current_user, require_role
from app.auth.models import Role, User
from app.auth.security import verify_password
from app.core.config import settings
from app.db.session import get_db

router = APIRouter(prefix="/auth", tags=["auth"])
admin_router = APIRouter(prefix="/admin/users", tags=["admin"], dependencies=[Depends(require_role("admin"))])

oauth = OAuth()
if settings.google_client_id:
    oauth.register(
        "google",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    provider: str
    active: bool
    roles: list[str]

    @classmethod
    def of(cls, u: User) -> "UserOut":
        return cls(id=u.id, email=u.email, name=u.name, provider=u.provider, active=u.active, roles=u.role_names)


class LocalLogin(BaseModel):
    email: str
    password: str


@router.post("/login", response_model=UserOut)
def login_local(body: LocalLogin, request: Request, db: Session = Depends(get_db)):
    if not settings.auth_local_enabled:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "El ingreso con usuario local está deshabilitado.")
    user = db.scalar(select(User).where(User.email == body.email.lower(), User.provider == "local"))
    if not user or not user.active or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Usuario o contraseña incorrectos.")
    request.session["user_id"] = user.id
    return UserOut.of(user)


@router.get("/google/login")
async def login_google(request: Request):
    if "google" not in oauth._clients:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Ingreso con Google no configurado.")
    return await oauth.google.authorize_redirect(request, request.url_for("google_callback"))


@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    info = token.get("userinfo") or {}
    email = (info.get("email") or "").lower()
    if not email.endswith("@" + settings.google_allowed_domain) or not info.get("email_verified"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, f"Use una cuenta @{settings.google_allowed_domain}.")
    user = db.scalar(select(User).where(User.email == email))
    if not user:  # se crea sin roles: un administrador los asigna (AUT-01)
        user = User(email=email, name=info.get("name", ""), provider="google")
        db.add(user)
        db.commit()
    request.session["user_id"] = user.id
    return RedirectResponse("/app")


@router.post("/logout", status_code=204)
def logout(request: Request):
    request.session.clear()


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return UserOut.of(user)


class RolesIn(BaseModel):
    roles: list[str]


@admin_router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return [UserOut.of(u) for u in db.scalars(select(User).order_by(User.email))]


@admin_router.put("/{user_id}/roles", response_model=UserOut)
def set_roles(user_id: int, body: RolesIn, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuario no encontrado.")
    roles = [db.get(Role, r) for r in body.roles]
    if None in roles:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Rol inexistente.")
    user.roles = roles
    db.commit()
    return UserOut.of(user)
