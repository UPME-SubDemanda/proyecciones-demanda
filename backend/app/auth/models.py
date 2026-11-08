from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", ForeignKey("auth.users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_name", ForeignKey("auth.roles.name", ondelete="CASCADE"), primary_key=True),
    schema="auth",
    comment="Roles asignados a cada usuario por un administrador (AUT-01)",
)


class Role(Base):
    __tablename__ = "roles"
    __table_args__ = {"schema": "auth", "comment": "Roles de la aplicación"}
    name: Mapped[str] = mapped_column(String(50), primary_key=True)
    description: Mapped[str] = mapped_column(String(200), default="")


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth", "comment": "Usuarios: cuenta Google UPME o usuario local"}
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200), default="")
    provider: Mapped[str] = mapped_column(String(20), default="local", comment="google | local")
    password_hash: Mapped[str | None] = mapped_column(String(300), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    roles: Mapped[list[Role]] = relationship(secondary=user_roles, lazy="selectin")

    @property
    def role_names(self) -> list[str]:
        return [r.name for r in self.roles]
