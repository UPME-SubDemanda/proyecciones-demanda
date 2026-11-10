"""Modelo de datos v2 (P-0004): catálogos, revisiones, datos observados versionados, calidad,
raw, staging y el esquema operacion. Comenta cada esquema, tabla, vista, función y columna (PBD-01).

Documentación: docs/tecnica/base-de-datos/. Las tablas de core de la 0002 estaban vacías salvo los
dos productos, así que se borran y se vuelven a crear (issue #34).

Revision ID: 0003
Revises: 0002
"""
import importlib.util
from pathlib import Path

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None

FREQ = "'H', 'D', 'M', 'Q', 'A'"

SCHEMA_COMMENTS = {
    "raw": "Datos tal como llegan de cada fuente, sin limpiar. Solo se agrega; lo leen solo los flujos de carga (BD-03, PBD-05).",
    "staging": "Datos validados y normalizados con la misma forma para todas las fuentes: el contrato entre las fuentes y core (PDA-01).",
    "core": "Entidades del producto: catálogos, revisiones publicadas, datos reales versionados y su calidad. Lo leen la API y las vistas internas.",
    "publicacion": "Solo lo publicable, para el portal, el modo pantalla y la API pública (TV-06). Vistas sobre core, etapa 5.",
    "auth": "Usuarios, roles y su asignación para el módulo de autenticación.",
    "operacion": "Cómo funciona el sistema: bitácora y mensajes de las cargas, consultas a las fuentes y estado de cada fuente (PBD-07).",
}

# Comentarios que faltaban en auth (0001). En downgrade se quitan.
AUTH_COMMENTS = {
    ("roles", None): None,  # ya tenía comentario de tabla
    ("roles", "name"): "Código del rol: admin, approver, modeler o viewer",
    ("roles", "description"): "Qué permite el rol, en palabras",
    ("users", "id"): "Identificador interno del usuario",
    ("users", "email"): "Correo del usuario; único. Es su nombre de ingreso",
    ("users", "name"): "Nombre visible",
    ("users", "provider"): "Cómo ingresa: google (cuenta institucional) o local",
    ("users", "password_hash"): "Hash de la contraseña (solo cuentas locales; vacío en Google)",
    ("users", "active"): "Si la cuenta puede ingresar",
    ("users", "created_at"): "Fecha de creación de la cuenta",
    ("user_roles", None): "Qué roles tiene cada usuario",
    ("user_roles", "user_id"): "Usuario (auth.users.id)",
    ("user_roles", "role_name"): "Rol asignado (auth.roles.name)",
}


def comment_on(target, text):
    """COMMENT ON no acepta parámetros: el texto va como literal con las comillas escapadas."""
    literal = "'" + text.replace("'", "''") + "'"
    op.execute(f"COMMENT ON {target} IS {literal}")


def c(name, type_, comment, *args, **kw):
    """Columna con comentario obligatorio (PBD-01)."""
    return sa.Column(name, type_, *args, comment=comment, **kw)


def loaded_at(comment="Fecha y hora de carga (created_at de BD-06)"):
    return c("loaded_at", sa.DateTime(timezone=True), comment, server_default=sa.func.now(), nullable=False)


def check_in(column, values, name):
    return sa.CheckConstraint(f"{column} IN ({values})", name=name)


def upgrade() -> None:
    op.execute("CREATE SCHEMA IF NOT EXISTS operacion")

    # --- core v1: se borra (vacío salvo los dos productos) ---------------------------------------------
    for t in ["revision_assumptions", "exogenous_observed", "exogenous_variables", "revision_values", "revisions",
              "series_observed", "products"]:
        op.drop_table(t, schema="core")

    # --- operacion -----------------------------------------------------------------------------------------
    op.create_table(
        "load_runs",
        c("id", sa.BigInteger, "Identificador de la carga", sa.Identity(), primary_key=True),
        c("flow", sa.String(80), "Flujo que corrió (por ejemplo ingest-observed-demand)", nullable=False),
        c("source", sa.String(40), "Fuente consultada (código de core.sources)", nullable=False),
        c("load_type", sa.String(10), "daily, weekly (conciliación), backfill (histórico) o file (archivo)", nullable=False),
        c("started_at", sa.DateTime(timezone=True), "Inicio de la carga", server_default=sa.func.now(), nullable=False),
        c("finished_at", sa.DateTime(timezone=True), "Fin de la carga; vacío mientras corre"),
        c("status", sa.String(20), "running, ok, ok_with_warnings o failed", server_default="running", nullable=False),
        c("range_start", sa.Date, "Primer periodo consultado"),
        c("range_end", sa.Date, "Último periodo consultado"),
        c("n_queried", sa.Integer, "Periodos consultados", server_default="0", nullable=False),
        c("n_new", sa.Integer, "Periodos nuevos guardados", server_default="0", nullable=False),
        c("n_changed", sa.Integer, "Periodos que cambiaron y crearon una versión nueva", server_default="0", nullable=False),
        c("n_unchanged", sa.Integer, "Periodos sin cambio (no se guardan)", server_default="0", nullable=False),
        c("n_anomalous", sa.Integer, "Datos nuevos marcados como anómalos", server_default="0", nullable=False),
        c("n_errors", sa.Integer, "Errores de la carga", server_default="0", nullable=False),
        c("retries", sa.Integer, "Reintentos ante fallas de la fuente", server_default="0", nullable=False),
        c("message", sa.Text, "Resumen legible de la carga (PDA-05)"),
        c("app_version", sa.String(20), "Versión de la app que ejecutó la carga (FLU-08)"),
        check_in("load_type", "'daily', 'weekly', 'backfill', 'file'", "ck_load_runs_load_type"),
        check_in("status", "'running', 'ok', 'ok_with_warnings', 'failed'", "ck_load_runs_status"),
        schema="operacion", comment="Bitácora: una fila por ejecución de cada flujo de carga, aunque no encuentre nada (PDA-05)",
    )
    op.create_table(
        "load_messages",
        c("id", sa.BigInteger, "Identificador del mensaje", sa.Identity(), primary_key=True),
        c("load_run_id", sa.BigInteger, "Carga a la que pertenece",
          sa.ForeignKey("operacion.load_runs.id", ondelete="CASCADE"), nullable=False),
        c("level", sa.String(10), "error, warning o info", nullable=False),
        c("code", sa.String(60), "Código del mensaje (por ejemplo file_sum_mismatch)", nullable=False),
        c("message", sa.Text, "Mensaje legible, con el objeto afectado", nullable=False),
        c("context", JSONB, "Objeto afectado: hoja, serie, periodo, celda, variable o extracción",
          server_default="{}", nullable=False),
        c("created_at", sa.DateTime(timezone=True), "Fecha del mensaje", server_default=sa.func.now(), nullable=False),
        check_in("level", "'error', 'warning', 'info'", "ck_load_messages_level"),
        schema="operacion", comment="Detalle de cada carga: una fila por error, advertencia o información (PDA-05)",
    )
    op.create_table(
        "extractions",
        c("id", sa.BigInteger, "Identificador de la consulta", sa.Identity(), primary_key=True),
        c("load_run_id", sa.BigInteger, "Carga que hizo la consulta",
          sa.ForeignKey("operacion.load_runs.id", ondelete="CASCADE"), nullable=False),
        c("source", sa.String(40), "Fuente consultada (código de core.sources)", nullable=False),
        c("request", JSONB, "Qué se pidió: métrica, entidad, rango, archivo", nullable=False),
        c("requested_at", sa.DateTime(timezone=True), "Cuándo se consultó", server_default=sa.func.now(), nullable=False),
        c("http_status", sa.SmallInteger, "Respuesta HTTP de la fuente (vacío si no es una API)"),
        c("row_count", sa.Integer, "Filas recibidas"),
        c("content_hash", sa.String(64), "Huella SHA-256 del contenido; si es igual a la de la última consulta igual, no se guarda el contenido"),
        c("error", sa.Text, "Error de la consulta, si falló"),
        schema="operacion", comment="Cada consulta a una fuente: qué se pidió, cuándo, respuesta y huella (PBD-05)",
    )
    op.create_table(
        "source_status",
        c("source", sa.String(40), "Fuente (código de core.sources)", primary_key=True),
        c("last_success_at", sa.DateTime(timezone=True), "Última carga exitosa"),
        c("last_period", sa.Date, "Último periodo disponible en la base"),
        c("days_stale", sa.Integer, "Días sin datos nuevos"),
        c("updated_at", sa.DateTime(timezone=True), "Última actualización de esta fila", server_default=sa.func.now(), nullable=False),
        schema="operacion", comment="Estado de cada fuente, para detectar una fuente sin actualizar",
    )

    # --- core: catálogos ------------------------------------------------------------------------------------
    op.create_table(
        "products",
        c("code", sa.String(10), "Código del producto: ee o gn", primary_key=True),
        c("name", sa.String(100), "Nombre visible", nullable=False),
        schema="core", comment="Productos de la Subdirección de Demanda",
    )
    op.create_table(
        "measures",
        c("code", sa.String(40), "Código de la medida (por ejemplo ee_energy)", primary_key=True),
        c("product", sa.String(10), "Producto", sa.ForeignKey("core.products.code"), nullable=False),
        c("name", sa.String(120), "Nombre visible", nullable=False),
        c("unit", sa.String(20), "Unidad en la que se guardan los valores (GWh, MW, GBTUD)", nullable=False),
        c("aggregation", sa.String(10), "Cómo se agrega en el tiempo: sum, max o mean", nullable=False),
        check_in("aggregation", "'sum', 'max', 'mean'", "ck_measures_aggregation"),
        schema="core", comment="Qué se mide, en qué unidad y cómo se agrega en el tiempo",
    )
    op.create_table(
        "geographies",
        c("code", sa.String(80), "Código de la geografía (por ejemplo ee_area_caribe)", primary_key=True),
        c("product", sa.String(10), "Producto", sa.ForeignKey("core.products.code"), nullable=False),
        c("name", sa.String(150), "Nombre visible", nullable=False),
        c("level", sa.String(10), "national, area, region o node", nullable=False),
        c("parent", sa.String(80), "Geografía que la contiene; vacío en la nacional", sa.ForeignKey("core.geographies.code")),
        check_in("level", "'national', 'area', 'region', 'node'", "ck_geographies_level"),
        schema="core", comment="Territorio con jerarquía: EE nacional → área; GN nacional → región → nodo",
    )
    op.create_table(
        "series",
        c("code", sa.String(60), "Código de la serie (por ejemplo ee_sin_gce_me_gd_upme)", primary_key=True),
        c("product", sa.String(10), "Producto", sa.ForeignKey("core.products.code"), nullable=False),
        c("name", sa.String(150), "Nombre visible", nullable=False),
        c("kind", sa.String(10), "base, composite (serie compuesta), sector o total", nullable=False),
        c("is_comparable", sa.Boolean, "Si es la serie que se compara con el dato real para el error (PER-01)",
          server_default=sa.false(), nullable=False),
        c("description", sa.Text, "Qué incluye la serie"),
        check_in("kind", "'base', 'composite', 'sector', 'total'", "ck_series_kind"),
        schema="core", comment="Lo que se proyecta: series compuestas de EE y sectores de GN",
    )
    op.create_table(
        "components",
        c("code", sa.String(80), "Código del componente (por ejemplo gce_rubiales)", primary_key=True),
        c("product", sa.String(10), "Producto", sa.ForeignKey("core.products.code"), nullable=False),
        c("type", sa.String(10), "gce, ev (vehículos eléctricos), rail (trenes), gd_upme o gd_pnuma", nullable=False),
        c("name", sa.String(150), "Nombre visible", nullable=False),
        c("geography", sa.String(80), "Área o región, si aplica", sa.ForeignKey("core.geographies.code")),
        check_in("type", "'gce', 'ev', 'rail', 'gd_upme', 'gd_pnuma'", "ck_components_type"),
        schema="core", comment="Partes que forman las series compuestas de EE (GCE, movilidad eléctrica, GD)",
    )
    op.create_table(
        "series_composition",
        c("series", sa.String(60), "Serie compuesta", sa.ForeignKey("core.series.code"), primary_key=True),
        c("part", sa.String(80), "Serie o tipo de componente que la forma", primary_key=True),
        c("part_kind", sa.String(20), "series (otra serie) o component_type (un tipo de componente)", nullable=False),
        c("sign", sa.SmallInteger, "1 suma, -1 resta (los componentes se guardan positivos, PDA-07)", nullable=False),
        check_in("part_kind", "'series', 'component_type'", "ck_series_composition_part_kind"),
        sa.CheckConstraint("sign IN (1, -1)", name="ck_series_composition_sign"),
        schema="core", comment="Cómo se forma cada serie compuesta; la carga verifica la suma con esto (PDA-06)",
    )
    op.create_table(
        "value_types",
        c("code", sa.String(20), "Código del tipo de valor (mid, ci95_upper…)", primary_key=True),
        c("name", sa.String(80), "Nombre visible", nullable=False),
        c("kind", sa.String(10), "scenario, interval o historical", nullable=False),
        c("level", sa.SmallInteger, "Nivel del intervalo (68 o 95); vacío si no es intervalo"),
        c("bound", sa.String(5), "upper o lower; vacío si no es intervalo"),
        check_in("kind", "'scenario', 'interval', 'historical'", "ck_value_types_kind"),
        sa.CheckConstraint("level IS NULL OR level IN (68, 95)", name="ck_value_types_level"),
        sa.CheckConstraint("bound IS NULL OR bound IN ('upper', 'lower')", name="ck_value_types_bound"),
        schema="core", comment="Qué representa un número: escenario (bajo, medio, alto) o límite de un intervalo",
    )
    op.create_table(
        "sources",
        c("code", sa.String(40), "Código de la fuente (por ejemplo xm_sinergox)", primary_key=True),
        c("entity", sa.String(80), "Entidad que publica (XM, UPME, DANE…)", nullable=False),
        c("name", sa.String(150), "Nombre visible", nullable=False),
        c("url", sa.String(500), "Dirección de la fuente"),
        c("license", sa.Text, "Licencia o condiciones de uso (X-04)"),
        c("frequency", sa.String(40), "Cada cuánto publica"),
        c("versioning", sa.String(20), "snapshot (cada consulta puede cambiar) o source_version (la fuente numera versiones)",
          nullable=False),
        c("doc_page", sa.String(300), "Ficha de la fuente en la documentación (PFU-01)"),
        check_in("versioning", "'snapshot', 'source_version'", "ck_sources_versioning"),
        schema="core", comment="Fuentes de datos y cómo se versionan",
    )
    op.create_table(
        "variables",
        c("code", sa.String(60), "Código de la variable (por ejemplo xm_demasin)", primary_key=True),
        c("name", sa.String(150), "Nombre visible", nullable=False),
        c("kind", sa.String(12), "demand (medidas reales de demanda), exogenous o assumption", nullable=False),
        c("product", sa.String(10), "Producto, si aplica", sa.ForeignKey("core.products.code")),
        c("measure", sa.String(40), "Medida, si aplica (define cómo se agrega)", sa.ForeignKey("core.measures.code")),
        c("unit", sa.String(40), "Unidad en la que se guardan los valores", nullable=False),
        c("source", sa.String(40), "Fuente", sa.ForeignKey("core.sources.code")),
        c("source_metric", sa.String(80), "Nombre de la métrica en la fuente (por ejemplo DemaSIN)"),
        c("source_entity", sa.String(80), "Entidad o agregación en la fuente (por ejemplo Sistema)"),
        c("source_unit", sa.String(40), "Unidad en la que llega de la fuente"),
        c("factor", sa.Numeric(30, 12), "Factor para pasar de la unidad de la fuente a la unidad guardada",
          server_default="1", nullable=False),
        c("is_official_for_error", sa.Boolean, "Si es el dato real oficial para el cálculo del error (PER-01)",
          server_default=sa.false(), nullable=False),
        check_in("kind", "'demand', 'exogenous', 'assumption'", "ck_variables_kind"),
        schema="core", comment="Toda variable observada o supuesta: demanda real, exógenas y supuestos",
    )

    # --- raw ------------------------------------------------------------------------------------------------
    op.create_table(
        "files",
        c("id", sa.BigInteger, "Identificador del archivo", sa.Identity(), primary_key=True),
        c("source", sa.String(40), "Fuente del archivo (por ejemplo upme_annex)", nullable=False),
        c("file_name", sa.String(300), "Nombre del archivo como llegó", nullable=False),
        c("sha256", sa.String(64), "Huella SHA-256; el mismo archivo no se carga dos veces", nullable=False, unique=True),
        c("size_bytes", sa.BigInteger, "Tamaño en bytes", nullable=False),
        c("content", sa.LargeBinary, "Contenido del archivo (puede pasar a un almacenamiento externo, ver raw.md)", nullable=False),
        c("revision_code", sa.String(20), "Código de la revisión a la que pertenece, si aplica"),
        c("received_at", sa.DateTime(timezone=True), "Cuándo se recibió el archivo"),
        c("load_run_id", sa.BigInteger, "Carga que lo guardó", sa.ForeignKey("operacion.load_runs.id")),
        loaded_at(),
        schema="raw", comment="Archivos recibidos (anexos y informes de las revisiones), tal cual",
    )
    op.create_table(
        "file_cells",
        c("file_id", sa.BigInteger, "Archivo", sa.ForeignKey("raw.files.id", ondelete="CASCADE"), primary_key=True),
        c("sheet", sa.String(100), "Hoja", primary_key=True),
        c("row_index", sa.Integer, "Fila (desde 1)", primary_key=True),
        c("col_index", sa.Integer, "Columna (desde 1)", primary_key=True),
        c("header_path", sa.Text, "Ruta de encabezados de la celda (hoja › serie › tipo de valor)"),
        c("value_text", sa.Text, "Valor como texto"),
        c("value_num", sa.Numeric, "Valor numérico, si lo es"),
        schema="raw", comment="Celdas con dato de cada hoja de un archivo, para releerlo sin el archivo y depurar el lector",
    )
    op.create_table(
        "xm_sinergox_values",
        c("id", sa.BigInteger, "Identificador de la fila", sa.Identity(), primary_key=True),
        c("extraction_id", sa.BigInteger, "Consulta de donde salió",
          sa.ForeignKey("operacion.extractions.id"), nullable=False),
        c("metric", sa.String(40), "Métrica de XM (DemaSIN, DemaReal…)", nullable=False),
        c("entity", sa.String(40), "Entidad de XM (Sistema, Agente…)", nullable=False),
        c("code", sa.String(80), "Código del agente, recurso o sistema", nullable=False),
        c("date", sa.Date, "Día", nullable=False),
        c("hour", sa.SmallInteger, "Hora de 1 a 24 (Hour01 = 00:00–01:00); vacía en las diarias"),
        c("value_text", sa.String(40), "Valor como llega (texto, en la unidad de XM)"),
        c("source", sa.String(40), "Fuente", server_default="xm_sinergox", nullable=False),
        loaded_at(),
        sa.CheckConstraint("hour IS NULL OR hour BETWEEN 1 AND 24", name="ck_xm_sinergox_values_hour"),
        schema="raw", comment="Valores de la API SINERGOX de XM tal como llegan; una tabla para todas sus métricas",
    )

    # --- core: revisiones -----------------------------------------------------------------------------------
    op.create_table(
        "revisions",
        c("id", sa.Integer, "Identificador interno", sa.Identity(), primary_key=True),
        c("product", sa.String(10), "Producto", sa.ForeignKey("core.products.code"), nullable=False),
        c("code", sa.String(20), "Año y mes del informe oficial (2026-07); la corrección lleva sufijo (2026-07.1)", nullable=False),
        c("name", sa.String(120), "Nombre oficial (Rev. Julio 2026)", nullable=False),
        c("published_on", sa.Date, "Fecha de publicación", nullable=False),
        c("data_cutoff", sa.Date, "Corte del dato real que usó", nullable=False),
        c("source_consulted_on", sa.Date, "Día en que se consultaron los datos de la fuente (para observed_as_of)"),
        c("first_projected_period", sa.Date, "Primer mes proyectado"),
        c("horizon_end", sa.Date, "Último periodo proyectado"),
        c("model", sa.String(300), "Modelo o método, en texto (catálogo de modelos en la fase 2)", nullable=False),
        c("document_url", sa.String(500), "Informe oficial publicado", nullable=False),
        c("annex_file_id", sa.BigInteger, "Archivo de datos de la revisión", sa.ForeignKey("raw.files.id")),
        c("status", sa.String(20), "draft, in_review, approved, published o superseded (UX-03)",
          server_default="draft", nullable=False),
        c("supersedes_id", sa.Integer, "Revisión que esta corrige (X-09)", sa.ForeignKey("core.revisions.id")),
        c("notes", sa.Text, "Notas"),
        c("source", sa.String(40), "Fuente de la revisión", sa.ForeignKey("core.sources.code"), nullable=False),
        loaded_at(),
        sa.UniqueConstraint("product", "code", name="uq_revisions_product_code"),
        check_in("status", "'draft', 'in_review', 'approved', 'published', 'superseded'", "ck_revisions_status"),
        schema="core", comment="Revisiones de la proyección. Una publicada no se modifica: se corrige con otra (P-0003)",
    )
    op.create_table(
        "revision_values",
        c("revision_id", sa.Integer, "Revisión", sa.ForeignKey("core.revisions.id", ondelete="CASCADE"), primary_key=True),
        c("series", sa.String(60), "Serie", sa.ForeignKey("core.series.code"), primary_key=True),
        c("measure", sa.String(40), "Medida", sa.ForeignKey("core.measures.code"), primary_key=True),
        c("geography", sa.String(80), "Geografía", sa.ForeignKey("core.geographies.code"), primary_key=True),
        c("frequency", sa.String(1), "M mensual o A anual", primary_key=True),
        c("period", sa.Date, "Inicio del periodo", primary_key=True),
        c("value_type", sa.String(20), "Tipo de valor", sa.ForeignKey("core.value_types.code"), primary_key=True),
        c("value", sa.Numeric(24, 12), "Valor publicado, en la unidad de la medida", nullable=False),
        c("basis", sa.String(10), "projected o mixed (suma meses reales y proyectados, como el anual del primer año)",
          server_default="projected", nullable=False),
        check_in("frequency", "'M', 'A'", "ck_revision_values_frequency"),
        check_in("basis", "'projected', 'mixed'", "ck_revision_values_basis"),
        schema="core",
        comment="Valores publicados de las series de cada revisión. Heredan la procedencia de core.revisions",
    )
    op.create_table(
        "revision_component_values",
        c("revision_id", sa.Integer, "Revisión", sa.ForeignKey("core.revisions.id", ondelete="CASCADE"), primary_key=True),
        c("component", sa.String(80), "Componente", sa.ForeignKey("core.components.code"), primary_key=True),
        c("measure", sa.String(40), "Medida", sa.ForeignKey("core.measures.code"), primary_key=True),
        c("frequency", sa.String(1), "M mensual o A anual", primary_key=True),
        c("period", sa.Date, "Inicio del periodo", primary_key=True),
        c("value", sa.Numeric(24, 12), "Valor siempre positivo; la resta la aplica series_composition (PDA-07)", nullable=False),
        check_in("frequency", "'M', 'A'", "ck_revision_component_values_frequency"),
        sa.CheckConstraint("value >= 0", name="ck_revision_component_values_positive"),
        schema="core", comment="Valores de cada componente en cada revisión. Heredan la procedencia de core.revisions",
    )
    op.create_table(
        "revision_components",
        c("revision_id", sa.Integer, "Revisión", sa.ForeignKey("core.revisions.id", ondelete="CASCADE"), primary_key=True),
        c("component", sa.String(80), "Componente", sa.ForeignKey("core.components.code"), primary_key=True),
        c("published_name", sa.String(200), "Nombre tal como se publicó en esa revisión", nullable=False),
        c("gce_group", sa.SmallInteger, "Grupo del GCE: 1 conectado al SIN, 2 por conectar"),
        c("geography", sa.String(80), "Área", sa.ForeignKey("core.geographies.code")),
        c("entry_date", sa.Date, "Fecha prevista de entrada"),
        c("capacity_mw", sa.Numeric(14, 4), "Capacidad (MW)"),
        c("filing_number", sa.String(60), "Radicado ante la UPME"),
        sa.CheckConstraint("gce_group IS NULL OR gce_group IN (1, 2)", name="ck_revision_components_gce_group"),
        schema="core", comment="Atributos de cada componente en una revisión (grupo, área, entrada, capacidad, radicado)",
    )
    op.create_table(
        "revision_assumptions",
        c("revision_id", sa.Integer, "Revisión", sa.ForeignKey("core.revisions.id", ondelete="CASCADE"), primary_key=True),
        c("variable", sa.String(60), "Variable supuesta", sa.ForeignKey("core.variables.code"), primary_key=True),
        c("geography", sa.String(80), "Geografía", sa.ForeignKey("core.geographies.code"), primary_key=True),
        c("frequency", sa.String(1), "H, D, M, Q o A", primary_key=True),
        c("period", sa.Date, "Inicio del periodo", primary_key=True),
        c("value_type", sa.String(20), "Escenario del supuesto", sa.ForeignKey("core.value_types.code"), primary_key=True),
        c("value", sa.Numeric(24, 12), "Valor supuesto, en la unidad de la variable", nullable=False),
        check_in("frequency", FREQ, "ck_revision_assumptions_frequency"),
        schema="core", comment="Supuestos con forma de serie de cada revisión (PIB, población, temperatura, capacidad de GD)",
    )
    op.create_table(
        "aliases",
        c("id", sa.Integer, "Identificador", sa.Identity(), primary_key=True),
        c("entity", sa.String(12), "Qué se nombra: revision, series, component o geography", nullable=False),
        c("code", sa.String(80), "Código del catálogo al que equivale", nullable=False),
        c("alias", sa.String(200), "Otro nombre (como aparece en un archivo o informe)", nullable=False),
        c("revision_id", sa.Integer, "Revisión en la que aparece ese nombre, si aplica",
          sa.ForeignKey("core.revisions.id", ondelete="CASCADE")),
        c("note", sa.Text, "Nota, por ejemplo quién confirmó la equivalencia"),
        check_in("entity", "'revision', 'series', 'component', 'geography'", "ck_aliases_entity"),
        schema="core", comment="Otros nombres de cualquier código, por revisión o fuente",
    )
    op.execute("ALTER TABLE core.aliases ADD CONSTRAINT uq_aliases UNIQUE NULLS NOT DISTINCT (entity, alias, revision_id)")

    # --- core: datos observados versionados (particionada por frecuencia) -------------------------------
    op.execute(f"""
        CREATE TABLE core.observed_values (
            variable varchar(60) NOT NULL REFERENCES core.variables(code),
            geography varchar(80) NOT NULL REFERENCES core.geographies(code),
            frequency varchar(1) NOT NULL CONSTRAINT ck_observed_values_frequency CHECK (frequency IN ({FREQ})),
            period timestamp NOT NULL,
            version integer NOT NULL CONSTRAINT ck_observed_values_version CHECK (version >= 1),
            value numeric(24, 12) NOT NULL,
            source_version varchar(20),
            quality_status varchar(12) NOT NULL DEFAULT 'provisional'
                CONSTRAINT ck_observed_values_quality CHECK (quality_status IN ('provisional', 'anomalous', 'accepted', 'rejected')),
            loaded_at timestamptz NOT NULL DEFAULT now(),
            load_run_id bigint REFERENCES operacion.load_runs(id),
            extraction_id bigint REFERENCES operacion.extractions(id),
            PRIMARY KEY (variable, geography, frequency, period, version)
        ) PARTITION BY LIST (frequency);
        CREATE TABLE core.observed_values_hourly PARTITION OF core.observed_values FOR VALUES IN ('H');
        CREATE TABLE core.observed_values_other PARTITION OF core.observed_values FOR VALUES IN ('D', 'M', 'Q', 'A');
    """)
    observed_cols = {
        "variable": "Qué se observó (core.variables)",
        "geography": "Dónde (core.geographies)",
        "frequency": "H horaria, D diaria, M mensual, Q trimestral, A anual",
        "period": "Inicio del periodo, en hora de Colombia (UTC−5)",
        "version": "1, 2, 3… por periodo; nunca se repite ni se modifica el valor (PBD-05)",
        "value": "Valor en la unidad de la variable, ya convertido",
        "source_version": "Versión propia de la fuente, si la trae (por ejemplo TXF en SIMEM)",
        "quality_status": "provisional, anomalous, accepted o rejected (PDA-02). Es lo único que cambia en una fila",
        "loaded_at": "Fecha y hora de carga (created_at de BD-06)",
        "load_run_id": "Carga que guardó la versión (operacion.load_runs)",
        "extraction_id": "Consulta de donde salió (operacion.extractions)",
    }
    op.execute("COMMENT ON TABLE core.observed_values IS 'Dato real de cualquier fuente y variable, versionado: una fila por versión de cada periodo (PBD-05). Particionada por frecuencia'")
    for col, text in observed_cols.items():
        comment_on(f"COLUMN core.observed_values.{col}", text)
    op.execute("COMMENT ON TABLE core.observed_values_hourly IS 'Partición de core.observed_values con los datos horarios (H)'")
    op.execute("COMMENT ON TABLE core.observed_values_other IS 'Partición de core.observed_values con los datos diarios, mensuales, trimestrales y anuales'")

    # --- core: calidad ---------------------------------------------------------------------------------------
    op.create_table(
        "anomaly_rules",
        c("code", sa.String(60), "Código de la regla (por ejemplo day_incomplete)", primary_key=True),
        c("variable", sa.String(60), "Variable a la que aplica, si es específica", sa.ForeignKey("core.variables.code")),
        c("source", sa.String(40), "Fuente a la que aplica, si es general", sa.ForeignKey("core.sources.code")),
        c("description", sa.Text, "Qué detecta, en palabras", nullable=False),
        c("params", JSONB, "Umbrales y parámetros (X-24)", server_default="{}", nullable=False),
        c("active", sa.Boolean, "Si se aplica en las cargas", server_default=sa.true(), nullable=False),
        schema="core", comment="Reglas de detección de datos anómalos por fuente o variable (PDA-02)",
    )
    def obs_key():
        """Llave de un dato observado (sin la versión), repetida en las tablas de calidad."""
        return [
            c("variable", sa.String(60), "Variable del dato", nullable=False),
            c("geography", sa.String(80), "Geografía del dato", nullable=False),
            c("frequency", sa.String(1), "Frecuencia del dato", nullable=False),
            c("period", sa.DateTime, "Periodo del dato", nullable=False),
        ]
    op.create_table(
        "data_anomalies",
        c("id", sa.BigInteger, "Identificador", sa.Identity(), primary_key=True),
        *obs_key(),
        c("version", sa.Integer, "Versión marcada como anómala", nullable=False),
        c("rule", sa.String(60), "Regla que no pasó", sa.ForeignKey("core.anomaly_rules.code"), nullable=False),
        c("load_run_id", sa.BigInteger, "Carga que la detectó", sa.ForeignKey("operacion.load_runs.id")),
        c("detected_at", sa.DateTime(timezone=True), "Cuándo se detectó", server_default=sa.func.now(), nullable=False),
        c("status", sa.String(20), "open, accepted, rejected o closed_by_source", server_default="open", nullable=False),
        c("decided_by", sa.Integer, "Persona que la aceptó o rechazó (auth.users)", sa.ForeignKey("auth.users.id")),
        c("decided_at", sa.DateTime(timezone=True), "Cuándo se decidió"),
        c("reason", sa.Text, "Por qué se aceptó o rechazó, o cómo se cerró"),
        sa.ForeignKeyConstraint(["variable", "geography", "frequency", "period", "version"],
                                ["core.observed_values.variable", "core.observed_values.geography",
                                 "core.observed_values.frequency", "core.observed_values.period",
                                 "core.observed_values.version"], name="fk_data_anomalies_observed"),
        check_in("status", "'open', 'accepted', 'rejected', 'closed_by_source'", "ck_data_anomalies_status"),
        schema="core", comment="Cada dato que no pasó una regla y la decisión de una persona sobre él (PDA-02)",
    )
    op.create_table(
        "observed_changes",
        c("id", sa.BigInteger, "Identificador", sa.Identity(), primary_key=True),
        *obs_key(),
        c("old_version", sa.Integer, "Versión anterior", nullable=False),
        c("new_version", sa.Integer, "Versión nueva", nullable=False),
        c("old_value", sa.Numeric(24, 12), "Valor anterior", nullable=False),
        c("new_value", sa.Numeric(24, 12), "Valor nuevo", nullable=False),
        c("diff", sa.Numeric(24, 12), "Diferencia (nuevo − anterior)", nullable=False),
        c("diff_pct", sa.Numeric(12, 6), "Diferencia en %"),
        c("load_run_id", sa.BigInteger, "Carga que lo detectó", sa.ForeignKey("operacion.load_runs.id")),
        c("detected_at", sa.DateTime(timezone=True), "Cuándo se detectó", server_default=sa.func.now(), nullable=False),
        c("reason", sa.Text, "Motivo conocido (por ejemplo «la fuente completó el día»)"),
        schema="core", comment="Cada cambio de valor entre versiones de un dato observado (PBD-05, PDA-03)",
    )
    op.create_table(
        "data_alerts",
        c("id", sa.BigInteger, "Identificador", sa.Identity(), primary_key=True),
        c("revision_id", sa.Integer, "Revisión que usó el dato", sa.ForeignKey("core.revisions.id"), nullable=False),
        *obs_key(),
        c("used_version", sa.Integer, "Versión que usó la revisión", nullable=False),
        c("current_version", sa.Integer, "Versión vigente hoy", nullable=False),
        c("diff_pct", sa.Numeric(12, 6), "Diferencia entre las dos versiones, en %"),
        c("created_at", sa.DateTime(timezone=True), "Cuándo se creó el aviso", server_default=sa.func.now(), nullable=False),
        c("status", sa.String(10), "open, seen o closed", server_default="open", nullable=False),
        c("note", sa.Text, "Nota del modelador o analista"),
        check_in("status", "'open', 'seen', 'closed'", "ck_data_alerts_status"),
        schema="core", comment="Avisos: una revisión usó un dato que después cambió o quedó anómalo (PDA-04)",
    )

    # --- staging: el contrato --------------------------------------------------------------------------------
    run = lambda: c("load_run_id", sa.BigInteger, "Carga que dejó la fila",
                    sa.ForeignKey("operacion.load_runs.id", ondelete="CASCADE"), primary_key=True)
    rev = lambda: [
        c("product", sa.String(10), "Producto de la revisión", primary_key=True),
        c("revision_code", sa.String(20), "Código de la revisión (en core se convierte en revision_id)", primary_key=True),
    ]
    op.create_table(
        "observed_values",
        run(),
        c("variable", sa.String(60), "Variable (core.variables)", sa.ForeignKey("core.variables.code"), primary_key=True),
        c("geography", sa.String(80), "Geografía", sa.ForeignKey("core.geographies.code"), primary_key=True),
        c("frequency", sa.String(1), "H, D, M, Q o A", primary_key=True),
        c("period", sa.DateTime, "Inicio del periodo, hora de Colombia", primary_key=True),
        c("value", sa.Numeric(24, 12), "Valor normalizado, en la unidad de la variable", nullable=False),
        c("source_version", sa.String(20), "Versión propia de la fuente, si la trae"),
        c("quality_status", sa.String(12), "Estado propuesto por las reglas", server_default="provisional", nullable=False),
        c("rule_results", JSONB, "Qué reglas pasó o no", server_default="{}", nullable=False),
        c("extraction_id", sa.BigInteger, "Consulta de donde salió", sa.ForeignKey("operacion.extractions.id")),
        check_in("frequency", FREQ, "ck_staging_observed_values_frequency"),
        schema="staging", comment="Valores reales normalizados de cualquier fuente, antes de versionarlos en core (contrato, PDA-01)",
    )
    op.create_table(
        "revision_values",
        run(), *rev(),
        c("series", sa.String(60), "Serie", sa.ForeignKey("core.series.code"), primary_key=True),
        c("measure", sa.String(40), "Medida", sa.ForeignKey("core.measures.code"), primary_key=True),
        c("geography", sa.String(80), "Geografía", sa.ForeignKey("core.geographies.code"), primary_key=True),
        c("frequency", sa.String(1), "M o A", primary_key=True),
        c("period", sa.Date, "Inicio del periodo", primary_key=True),
        c("value_type", sa.String(20), "Tipo de valor", sa.ForeignKey("core.value_types.code"), primary_key=True),
        c("value", sa.Numeric(24, 12), "Valor publicado", nullable=False),
        c("basis", sa.String(10), "projected o mixed", server_default="projected", nullable=False),
        schema="staging", comment="Valores de las series de una revisión, normalizados (contrato, PDA-01)",
    )
    op.create_table(
        "revision_component_values",
        run(), *rev(),
        c("component", sa.String(80), "Componente (core.components)", primary_key=True),
        c("measure", sa.String(40), "Medida", sa.ForeignKey("core.measures.code"), primary_key=True),
        c("frequency", sa.String(1), "M o A", primary_key=True),
        c("period", sa.Date, "Inicio del periodo", primary_key=True),
        c("value", sa.Numeric(24, 12), "Valor positivo, ya normalizado (PDA-07)", nullable=False),
        schema="staging", comment="Valores de los componentes de una revisión, normalizados (contrato, PDA-01)",
    )
    op.create_table(
        "revision_components",
        run(), *rev(),
        c("component", sa.String(80), "Componente (core.components)", primary_key=True),
        c("published_name", sa.String(200), "Nombre tal como se publicó", nullable=False),
        c("gce_group", sa.SmallInteger, "Grupo del GCE (1 o 2)"),
        c("geography", sa.String(80), "Área", sa.ForeignKey("core.geographies.code")),
        c("entry_date", sa.Date, "Fecha prevista de entrada"),
        c("capacity_mw", sa.Numeric(14, 4), "Capacidad (MW)"),
        c("filing_number", sa.String(60), "Radicado"),
        schema="staging", comment="Atributos de los componentes de una revisión (contrato, PDA-01)",
    )
    op.create_table(
        "revision_assumptions",
        run(), *rev(),
        c("variable", sa.String(60), "Variable supuesta", sa.ForeignKey("core.variables.code"), primary_key=True),
        c("geography", sa.String(80), "Geografía", sa.ForeignKey("core.geographies.code"), primary_key=True),
        c("frequency", sa.String(1), "H, D, M, Q o A", primary_key=True),
        c("period", sa.Date, "Inicio del periodo", primary_key=True),
        c("value_type", sa.String(20), "Escenario", sa.ForeignKey("core.value_types.code"), primary_key=True),
        c("value", sa.Numeric(24, 12), "Valor supuesto", nullable=False),
        schema="staging", comment="Supuestos de una revisión, normalizados (contrato, PDA-01)",
    )

    # --- core: lecturas ----------------------------------------------------------------------------------
    op.execute("""
        CREATE VIEW core.observed_current AS
        SELECT DISTINCT ON (variable, geography, frequency, period)
               variable, geography, frequency, period, version, value, source_version, quality_status, loaded_at
          FROM core.observed_values
         WHERE quality_status = 'accepted'
         ORDER BY variable, geography, frequency, period, version DESC;

        CREATE VIEW core.observed_latest AS
        SELECT DISTINCT ON (variable, geography, frequency, period)
               variable, geography, frequency, period, version, value, source_version, quality_status, loaded_at,
               quality_status = 'provisional' AS is_provisional
          FROM core.observed_values
         WHERE quality_status IN ('accepted', 'provisional')
         ORDER BY variable, geography, frequency, period, version DESC;

        CREATE FUNCTION core.observed_as_of(at_time timestamptz)
        RETURNS TABLE (variable varchar, geography varchar, frequency varchar, period timestamp,
                       version integer, value numeric, loaded_at timestamptz)
        LANGUAGE sql STABLE AS $$
            SELECT DISTINCT ON (o.variable, o.geography, o.frequency, o.period)
                   o.variable, o.geography, o.frequency, o.period, o.version, o.value, o.loaded_at
              FROM core.observed_values o
             WHERE o.quality_status = 'accepted' AND o.loaded_at <= at_time
             ORDER BY o.variable, o.geography, o.frequency, o.period, o.version DESC
        $$;
    """)
    for unit, name in (("month", "observed_monthly"), ("year", "observed_annual")):
        op.execute(f"""
            CREATE VIEW core.{name} AS
            WITH base AS (
                SELECT o.variable, o.geography, o.frequency AS source_frequency,
                       date_trunc('{unit}', o.period)::date AS period, o.period AS raw_period, o.value,
                       COALESCE(m.aggregation, 'mean') AS aggregation
                  FROM core.observed_current o
                  JOIN core.variables v ON v.code = o.variable
                  LEFT JOIN core.measures m ON m.code = v.measure
                 WHERE o.frequency IN ('H', 'D')
            )
            SELECT variable, geography, source_frequency, period,
                   CASE min(aggregation) WHEN 'sum' THEN sum(value) WHEN 'max' THEN max(value) ELSE avg(value) END AS value,
                   count(DISTINCT raw_period::date) AS days_with_data,
                   ((period + interval '1 {unit}')::date - period) AS days_in_period,
                   count(*) = ((period + interval '1 {unit}')::date - period)
                              * CASE source_frequency WHEN 'H' THEN 24 ELSE 1 END AS is_complete
              FROM base
             GROUP BY variable, geography, source_frequency, period;
        """)
    view_comments = {
        "observed_current": ("Valor vigente de cada periodo: la versión máxima aceptada. La usan el error y los indicadores", {
            "variable": "Variable", "geography": "Geografía", "frequency": "Frecuencia", "period": "Inicio del periodo",
            "version": "Versión vigente", "value": "Valor vigente", "source_version": "Versión de la fuente",
            "quality_status": "Siempre accepted", "loaded_at": "Cuándo se cargó la versión vigente"}),
        "observed_latest": ("Lo aceptado más lo provisional, marcado: para gráficos y «El sistema hoy» (PRI-03)", {
            "variable": "Variable", "geography": "Geografía", "frequency": "Frecuencia", "period": "Inicio del periodo",
            "version": "Versión más reciente aceptada o provisional", "value": "Valor", "source_version": "Versión de la fuente",
            "quality_status": "accepted o provisional", "loaded_at": "Cuándo se cargó la versión",
            "is_provisional": "Si el valor todavía es provisional"}),
        "observed_monthly": ("Agregado mensual desde lo diario u horario vigente, con la regla de la medida; un mes incompleto se marca", {
            "variable": "Variable", "geography": "Geografía", "source_frequency": "Frecuencia de origen (H o D)",
            "period": "Primer día del mes", "value": "Valor agregado (suma, máximo o promedio según la medida)",
            "days_with_data": "Días con dato", "days_in_period": "Días del mes",
            "is_complete": "Si el mes tiene todos sus días (y horas, en horaria)"}),
        "observed_annual": ("Agregado anual desde lo diario u horario vigente, con la regla de la medida; un año incompleto se marca", {
            "variable": "Variable", "geography": "Geografía", "source_frequency": "Frecuencia de origen (H o D)",
            "period": "Primer día del año", "value": "Valor agregado (suma, máximo o promedio según la medida)",
            "days_with_data": "Días con dato", "days_in_period": "Días del año",
            "is_complete": "Si el año tiene todos sus días (y horas, en horaria)"}),
    }
    for view, (comment, cols) in view_comments.items():
        comment_on(f"VIEW core.{view}", comment)
        for col, text in cols.items():
            comment_on(f"COLUMN core.{view}.{col}", text)
    comment_on("FUNCTION core.observed_as_of(timestamptz)",
               "Lo que se sabía en una fecha: la versión máxima aceptada cargada hasta at_time (FLU-08)")

    # --- comentarios de esquemas y de auth ------------------------------------------------------------------
    for schema, text in SCHEMA_COMMENTS.items():
        comment_on(f"SCHEMA {schema}", text)
    for (table, col), text in AUTH_COMMENTS.items():
        if text is None:
            continue
        target = f"TABLE auth.{table}" if col is None else f"COLUMN auth.{table}.{col}"
        comment_on(target, text)

    _seed()


def _seed() -> None:
    def ins(table, rows, schema="core"):
        cols = list(rows[0].keys())
        op.bulk_insert(sa.table(table, *[sa.column(k) for k in cols], schema=schema), rows)

    ins("products", [{"code": "ee", "name": "Energía eléctrica"}, {"code": "gn", "name": "Gas natural"}])
    ins("measures", [
        {"code": "ee_energy", "product": "ee", "name": "Energía eléctrica", "unit": "GWh", "aggregation": "sum"},
        {"code": "ee_peak_power", "product": "ee", "name": "Potencia máxima", "unit": "MW", "aggregation": "max"},
        {"code": "gn_demand", "product": "gn", "name": "Demanda de gas natural", "unit": "GBTUD", "aggregation": "mean"},
    ])
    ins("value_types", [
        {"code": "mid", "name": "Escenario medio", "kind": "scenario", "level": None, "bound": None},
        {"code": "low", "name": "Escenario bajo", "kind": "scenario", "level": None, "bound": None},
        {"code": "high", "name": "Escenario alto", "kind": "scenario", "level": None, "bound": None},
        {"code": "ci95_upper", "name": "Intervalo de confianza 95 %, superior", "kind": "interval", "level": 95, "bound": "upper"},
        {"code": "ci95_lower", "name": "Intervalo de confianza 95 %, inferior", "kind": "interval", "level": 95, "bound": "lower"},
        {"code": "ci68_upper", "name": "Intervalo de confianza 68 %, superior", "kind": "interval", "level": 68, "bound": "upper"},
        {"code": "ci68_lower", "name": "Intervalo de confianza 68 %, inferior", "kind": "interval", "level": 68, "bound": "lower"},
        {"code": "historical", "name": "Histórico publicado en la revisión", "kind": "historical", "level": None, "bound": None},
    ])
    ee_areas = [("caribe", "Caribe"), ("oriente", "Oriente"), ("suroccidente", "Suroccidente"),
                ("antioquia", "Antioquia"), ("nordeste", "Nordeste")]
    gn_regions = [("centro", "Centro"), ("costa_atlantica", "Costa Atlántica"), ("costa_interior", "Costa Interior"),
                  ("cqr", "CQR"), ("magdalena_medio", "Magdalena Medio"), ("noreste", "NorEste"),
                  ("noroeste", "NorOeste"), ("suroeste", "SurOeste"), ("tolima_huila", "Tolima Huila")]
    ins("geographies",
        [{"code": "ee_sin", "product": "ee", "name": "SIN (nacional)", "level": "national", "parent": None},
         {"code": "gn_national", "product": "gn", "name": "Nacional", "level": "national", "parent": None}]
        + [{"code": f"ee_area_{k}", "product": "ee", "name": n, "level": "area", "parent": "ee_sin"} for k, n in ee_areas]
        + [{"code": f"gn_region_{k}", "product": "gn", "name": n, "level": "region", "parent": "gn_national"}
           for k, n in gn_regions])
    ins("series", [
        {"code": "ee_sin", "product": "ee", "name": "SIN", "kind": "base", "is_comparable": False,
         "description": "Demanda del SIN sin grandes consumidores especiales nuevos, movilidad eléctrica ni generación distribuida"},
        {"code": "ee_sin_gce_me", "product": "ee", "name": "SIN+GCE+ME", "kind": "composite", "is_comparable": False,
         "description": "SIN más grandes consumidores especiales (GCE) y movilidad eléctrica (vehículos y trenes)"},
        {"code": "ee_sin_gce_me_gd_upme", "product": "ee", "name": "SIN+GCE+ME+GD_UPME", "kind": "composite",
         "is_comparable": True,
         "description": "SIN+GCE+ME menos la generación distribuida del escenario tendencial UPME. Serie de comparación (PER-01)"},
        {"code": "ee_sin_gce_me_gd_pnuma", "product": "ee", "name": "SIN+GCE+ME+GD_PNUMA", "kind": "composite",
         "is_comparable": False,
         "description": "SIN+GCE+ME menos la generación distribuida del potencial máximo de PNUMA (desde dic-2024)"},
    ] + [{"code": f"gn_{k}", "product": "gn", "name": n, "kind": "sector", "is_comparable": False, "description": None}
         for k, n in [("residential", "Residencial"), ("industrial", "Industrial"), ("tertiary", "Terciario"),
                      ("vehicular", "Vehicular (GNV)"), ("petroleum", "Petrolero"), ("thermal", "Termoeléctrico"),
                      ("petrochemical", "Petroquímico"), ("compression", "Compresoras")]]
      + [{"code": "gn_total", "product": "gn", "name": "Total", "kind": "total", "is_comparable": False,
          "description": "Suma de los sectores"}])
    ins("series_composition", [
        {"series": "ee_sin_gce_me", "part": "ee_sin", "part_kind": "series", "sign": 1},
        {"series": "ee_sin_gce_me", "part": "gce", "part_kind": "component_type", "sign": 1},
        {"series": "ee_sin_gce_me", "part": "ev", "part_kind": "component_type", "sign": 1},
        {"series": "ee_sin_gce_me", "part": "rail", "part_kind": "component_type", "sign": 1},
        {"series": "ee_sin_gce_me_gd_upme", "part": "ee_sin_gce_me", "part_kind": "series", "sign": 1},
        {"series": "ee_sin_gce_me_gd_upme", "part": "gd_upme", "part_kind": "component_type", "sign": -1},
        {"series": "ee_sin_gce_me_gd_pnuma", "part": "ee_sin_gce_me", "part_kind": "series", "sign": 1},
        {"series": "ee_sin_gce_me_gd_pnuma", "part": "gd_pnuma", "part_kind": "component_type", "sign": -1},
    ] + [{"series": "gn_total", "part": f"gn_{k}", "part_kind": "series", "sign": 1}
         for k in ["residential", "industrial", "tertiary", "vehicular", "petroleum", "thermal", "petrochemical",
                   "compression"]])
    fichas = "docs/tecnica/base-de-datos/fuentes"
    ins("sources", [
        {"code": "xm_sinergox", "entity": "XM", "name": "API SINERGOX", "url": "https://servapibi.xm.com.co",
         "license": "Datos públicos de XM; texto de licencia por definir (X-04)", "frequency": "Diaria",
         "versioning": "snapshot", "doc_page": f"{fichas}/xm/ficha-sinergox.md"},
        {"code": "xm_simem", "entity": "XM", "name": "API SIMEM", "url": "https://www.simem.co",
         "license": "Datos públicos de XM; texto de licencia por definir (X-04)", "frequency": "Según el conjunto de datos",
         "versioning": "source_version", "doc_page": f"{fichas}/xm/guia-api-xm.md"},
        {"code": "upme_annex", "entity": "UPME", "name": "Anexos de las revisiones de la proyección", "url": "https://www.upme.gov.co",
         "license": "Publicación oficial de la UPME", "frequency": "Al menos dos revisiones al año",
         "versioning": "source_version", "doc_page": f"{fichas}/index.md"},
        {"code": "dane", "entity": "DANE", "name": "PIB y población", "url": "https://www.dane.gov.co",
         "license": None, "frequency": "Trimestral y anual", "versioning": "snapshot", "doc_page": None},
        {"code": "ideam", "entity": "IDEAM", "name": "Temperatura media por área", "url": "https://www.ideam.gov.co",
         "license": None, "frequency": "Mensual", "versioning": "snapshot", "doc_page": None},
    ])

    def xm(code, name, measure, unit, metric, src_unit, factor, official=False):
        return {"code": code, "name": name, "kind": "demand", "product": "ee", "measure": measure, "unit": unit,
                "source": "xm_sinergox", "source_metric": metric, "source_entity": "Sistema", "source_unit": src_unit,
                "factor": factor, "is_official_for_error": official}

    ins("variables", [
        xm("xm_demasin", "Demanda de energía del SIN (DemaSIN)", "ee_energy", "GWh", "DemaSIN", "kWh", 0.000001, True),
        xm("xm_demareal", "Demanda real (DemaReal)", "ee_energy", "GWh", "DemaReal", "kWh", 0.000001),
        xm("xm_demacome", "Demanda comercial (DemaCome)", "ee_energy", "GWh", "DemaCome", "kWh", 0.000001),
        xm("xm_expoener", "Exportaciones de energía (ExpoEner)", "ee_energy", "GWh", "ExpoEner", "kWh", 0.000001),
        xm("xm_demamaxpot", "Demanda máxima de potencia (DemaMaxPot)", "ee_peak_power", "MW", "DemaMaxPot", "kW", 0.001),
    ])


def downgrade() -> None:
    for name in ("observed_annual", "observed_monthly", "observed_latest", "observed_current"):
        op.execute(f"DROP VIEW core.{name}")
    op.execute("DROP FUNCTION core.observed_as_of(timestamptz)")
    for t in ["revision_assumptions", "revision_components", "revision_component_values", "revision_values",
              "observed_values"]:
        op.drop_table(t, schema="staging")
    for t in ["data_alerts", "observed_changes", "data_anomalies", "anomaly_rules"]:
        op.drop_table(t, schema="core")
    op.execute("DROP TABLE core.observed_values")  # incluye sus particiones
    for t in ["aliases", "revision_assumptions", "revision_components", "revision_component_values", "revision_values",
              "revisions"]:
        op.drop_table(t, schema="core")
    for t in ["xm_sinergox_values", "file_cells", "files"]:
        op.drop_table(t, schema="raw")
    for t in ["variables", "sources", "value_types", "series_composition", "components", "series", "geographies",
              "measures", "products"]:
        op.drop_table(t, schema="core")
    for t in ["source_status", "extractions", "load_messages", "load_runs"]:
        op.drop_table(t, schema="operacion")
    op.execute("DROP SCHEMA operacion")
    for schema in ("raw", "staging", "core", "publicacion", "auth"):
        op.execute(f"COMMENT ON SCHEMA {schema} IS NULL")
    for (table, col), text in AUTH_COMMENTS.items():
        if text is None:
            continue
        target = f"TABLE auth.{table}" if col is None else f"COLUMN auth.{table}.{col}"
        op.execute(f"COMMENT ON {target} IS NULL")

    # Vuelve a crear core como en la 0002 (mismo código, para que el estado sea idéntico).
    path = Path(__file__).with_name("0002_core_phase1.py")
    spec = importlib.util.spec_from_file_location("migration_0002", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    module.upgrade()
