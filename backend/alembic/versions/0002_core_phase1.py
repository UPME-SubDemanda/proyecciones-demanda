"""Tablas core de la etapa 1: productos, series observadas, revisiones publicadas, exógenas y supuestos.

Revision ID: 0002
Revises: 0001
"""
import sqlalchemy as sa
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def prov():
    """Columnas de procedencia (BD-06)."""
    return [
        sa.Column("source", sa.String(120), nullable=False, comment="Fuente del dato"),
        sa.Column("loaded_at", sa.DateTime, server_default=sa.func.now(), comment="Fecha de carga"),
    ]


def upgrade() -> None:
    op.create_table(
        "products",
        sa.Column("code", sa.String(10), primary_key=True, comment="ee | gn"),
        sa.Column("name", sa.String(100), nullable=False, comment="Nombre visible"),
        sa.Column("unit", sa.String(20), nullable=False, comment="Unidad principal (GWh, GBTUD)"),
        schema="core", comment="Productos de la Subdirección de Demanda",
    )
    op.bulk_insert(sa.table("products", sa.column("code"), sa.column("name"), sa.column("unit"), schema="core"), [
        {"code": "ee", "name": "Energía eléctrica", "unit": "GWh"},
        {"code": "gn", "name": "Gas natural", "unit": "GBTUD"},
    ])
    op.create_table(
        "series_observed",
        sa.Column("product", sa.String(10), sa.ForeignKey("core.products.code"), primary_key=True),
        sa.Column("frequency", sa.String(1), primary_key=True, comment="A anual, M mensual, D diaria"),
        sa.Column("period", sa.Date, primary_key=True, comment="Inicio del periodo"),
        sa.Column("region", sa.String(40), primary_key=True, server_default="NAL", comment="NAL = SIN o nacional"),
        sa.Column("value", sa.Numeric(18, 4), nullable=False),
        sa.Column("cutoff_date", sa.Date, nullable=False, comment="Fecha de corte de la fuente"),
        *prov(),
        schema="core", comment="Dato real observado por producto",
    )
    op.create_table(
        "revisions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("product", sa.String(10), sa.ForeignKey("core.products.code"), nullable=False),
        sa.Column("code", sa.String(20), nullable=False, comment="Mes de publicación, ej. 2026-07"),
        sa.Column("published_on", sa.Date, comment="Fecha de publicación oficial"),
        sa.Column("cutoff_date", sa.Date, comment="Corte de datos usado"),
        sa.Column("model", sa.String(120), comment="Modelo o método (texto libre en etapa 1)"),
        sa.Column("document_url", sa.String(500), comment="Documento oficial publicado"),
        sa.Column("status", sa.String(20), nullable=False, server_default="published",
                  comment="draft | in_review | approved | published (UX-03)"),
        sa.Column("notes", sa.Text),
        *prov(),
        sa.UniqueConstraint("product", "code"),
        schema="core", comment="Revisiones de la proyección (versiones publicadas)",
    )
    op.create_table(
        "revision_values",
        sa.Column("revision_id", sa.Integer, sa.ForeignKey("core.revisions.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("scenario", sa.String(10), primary_key=True, comment="low | mid | high"),
        sa.Column("frequency", sa.String(1), primary_key=True),
        sa.Column("period", sa.Date, primary_key=True),
        sa.Column("region", sa.String(40), primary_key=True, server_default="NAL"),
        sa.Column("value", sa.Numeric(18, 4), nullable=False),
        schema="core", comment="Valores proyectados de cada revisión por escenario",
    )
    op.create_table(
        "exogenous_variables",
        sa.Column("code", sa.String(40), primary_key=True, comment="gdp, population, oni, temperature…"),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("unit", sa.String(40), nullable=False),
        sa.Column("frequency", sa.String(1), nullable=False),
        sa.Column("default_source", sa.String(120), nullable=False),
        schema="core", comment="Catálogo de variables exógenas",
    )
    op.create_table(
        "exogenous_observed",
        sa.Column("variable", sa.String(40), sa.ForeignKey("core.exogenous_variables.code"), primary_key=True),
        sa.Column("period", sa.Date, primary_key=True),
        sa.Column("value", sa.Numeric(18, 6), nullable=False),
        sa.Column("cutoff_date", sa.Date, nullable=False),
        *prov(),
        schema="core", comment="Valores observados de variables exógenas",
    )
    op.create_table(
        "revision_assumptions",
        sa.Column("revision_id", sa.Integer, sa.ForeignKey("core.revisions.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("variable", sa.String(40), sa.ForeignKey("core.exogenous_variables.code"), primary_key=True),
        sa.Column("scenario", sa.String(10), primary_key=True),
        sa.Column("period", sa.Date, primary_key=True),
        sa.Column("value", sa.Numeric(18, 6), nullable=False),
        schema="core", comment="Supuestos de cada revisión por variable exógena y escenario",
    )


def downgrade() -> None:
    for t in ["revision_assumptions", "exogenous_observed", "exogenous_variables", "revision_values", "revisions",
              "series_observed", "products"]:
        op.drop_table(t, schema="core")
