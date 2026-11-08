"""Esquemas base (BD-03) y tablas de autenticación.

Revision ID: 0001
"""
import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

SCHEMAS = ["raw", "staging", "core", "publicacion", "auth"]


def upgrade() -> None:
    for s in SCHEMAS:
        op.execute(f"CREATE SCHEMA IF NOT EXISTS {s}")
    op.create_table("roles", sa.Column("name", sa.String(50), primary_key=True),
                    sa.Column("description", sa.String(200), nullable=False, server_default=""), schema="auth",
                    comment="Roles de la aplicación")
    op.create_table("users", sa.Column("id", sa.Integer, primary_key=True),
                    sa.Column("email", sa.String(254), nullable=False, unique=True),
                    sa.Column("name", sa.String(200), nullable=False, server_default=""),
                    sa.Column("provider", sa.String(20), nullable=False, server_default="local"),
                    sa.Column("password_hash", sa.String(300)),
                    sa.Column("active", sa.Boolean, nullable=False, server_default=sa.true()),
                    sa.Column("created_at", sa.DateTime, server_default=sa.func.now()), schema="auth",
                    comment="Usuarios: cuenta Google UPME o usuario local")
    op.create_table("user_roles",
                    sa.Column("user_id", sa.Integer, sa.ForeignKey("auth.users.id", ondelete="CASCADE"), primary_key=True),
                    sa.Column("role_name", sa.String(50), sa.ForeignKey("auth.roles.name", ondelete="CASCADE"), primary_key=True),
                    schema="auth")
    op.bulk_insert(sa.table("roles", sa.column("name"), sa.column("description"), schema="auth"), [
        {"name": "admin", "description": "Usuarios, roles y configuración"},
        {"name": "approver", "description": "Aprobar y publicar"},
        {"name": "modeler", "description": "Ejecutar procesos y gestionar alertas"},
        {"name": "viewer", "description": "Ver vistas internas"},
    ])


def downgrade() -> None:
    op.drop_table("user_roles", schema="auth")
    op.drop_table("users", schema="auth")
    op.drop_table("roles", schema="auth")
