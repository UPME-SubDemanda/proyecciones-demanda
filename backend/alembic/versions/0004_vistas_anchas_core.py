"""Vistas anchas de core para las consultas de las vistas (T-24, issue #36): abanico de una revisión, dato real
mensual por variable, comparación entre revisiones y proyección frente a dato real (PER-01, provisional).

Documentación: docs/tecnica/base-de-datos/vistas.md. Cada vista y columna lleva comentario (PBD-01).

Revision ID: 0004
Revises: 0003
"""
from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None

VALUE_TYPES = ["mid", "low", "high", "ci95_upper", "ci95_lower", "ci68_upper", "ci68_lower"]
XM_VARIABLES = ["xm_demasin", "xm_demareal", "xm_demacome", "xm_expoener", "xm_demamaxpot"]
VIEWS = ["v_ee_revision_vs_real", "v_revisions_side_by_side", "v_observed_wide", "v_revision_wide"]


def comment_on(target, text):
    """COMMENT ON no acepta parámetros: el texto va como literal con las comillas escapadas."""
    op.execute(f"COMMENT ON {target} IS '{text.replace(chr(39), chr(39) * 2)}'")


def upgrade() -> None:
    pivot = ",\n".join(f"max(v.value) FILTER (WHERE v.value_type = '{t}') AS {t}" for t in VALUE_TYPES)
    op.execute(f"""
        CREATE VIEW core.v_revision_wide AS
        SELECT r.id AS revision_id, r.product, r.code AS revision_code, r.name AS revision_name, r.status,
               r.published_on, v.series, v.measure, v.geography, v.frequency, v.period, max(v.basis) AS basis,
               {pivot}
          FROM core.revision_values v
          JOIN core.revisions r ON r.id = v.revision_id
         GROUP BY r.id, v.series, v.measure, v.geography, v.frequency, v.period
    """)

    observed = ",\n".join(
        f"max(value) FILTER (WHERE variable = '{x}') AS {x},\n"
        f"bool_or(is_complete) FILTER (WHERE variable = '{x}') AS {x}_complete" for x in XM_VARIABLES)
    op.execute(f"""
        CREATE VIEW core.v_observed_wide AS
        SELECT geography, period, {observed}
          FROM core.observed_monthly
         WHERE variable IN ({", ".join(f"'{x}'" for x in XM_VARIABLES)})
         GROUP BY geography, period
    """)

    op.execute("""
        CREATE VIEW core.v_revisions_side_by_side AS
        SELECT product, series, measure, geography, frequency, period, revision_id, revision_code, published_on, mid,
               lag(revision_code) OVER w AS previous_revision_code,
               lag(mid) OVER w AS previous_mid,
               mid - lag(mid) OVER w AS diff_vs_previous,
               (mid - lag(mid) OVER w) / NULLIF(lag(mid) OVER w, 0) * 100 AS diff_pct_vs_previous
          FROM core.v_revision_wide
         WHERE status IN ('published', 'superseded') AND mid IS NOT NULL
        WINDOW w AS (PARTITION BY product, series, measure, geography, frequency, period
                     ORDER BY published_on, revision_code)
    """)

    op.execute("""
        CREATE VIEW core.v_ee_revision_vs_real AS
        SELECT w.revision_id, w.revision_code, w.revision_name, w.status, r.first_projected_period, w.series,
               w.period,
               (extract(year FROM age(w.period, r.first_projected_period)) * 12
                + extract(month FROM age(w.period, r.first_projected_period)))::int + 1 AS months_ahead,
               w.mid AS projected, w.ci95_lower, w.ci95_upper, w.ci68_lower, w.ci68_upper,
               var.code AS real_variable, o.value AS real, o.is_complete AS real_is_complete,
               CASE WHEN o.is_complete THEN w.mid - o.value END AS error,
               CASE WHEN o.is_complete THEN (w.mid - o.value) / NULLIF(o.value, 0) * 100 END AS error_pct,
               CASE WHEN o.is_complete THEN o.value BETWEEN w.ci95_lower AND w.ci95_upper END AS inside_ci95,
               CASE WHEN o.is_complete THEN o.value BETWEEN w.ci68_lower AND w.ci68_upper END AS inside_ci68
          FROM core.v_revision_wide w
          JOIN core.revisions r ON r.id = w.revision_id
          JOIN core.series s ON s.code = w.series AND s.is_comparable
          JOIN core.variables var ON var.product = 'ee' AND var.measure = w.measure AND var.is_official_for_error
          JOIN core.observed_monthly o ON o.variable = var.code AND o.geography = w.geography AND o.period = w.period
         WHERE w.product = 'ee' AND w.frequency = 'M' AND w.measure = 'ee_energy'
           AND w.period >= r.first_projected_period
    """)

    revision_cols = {
        "revision_id": "Revisión (core.revisions.id)", "product": "Producto", "revision_code": "Código de la revisión",
        "revision_name": "Nombre oficial de la revisión", "status": "Estado de la revisión",
        "published_on": "Fecha de publicación de la revisión", "series": "Serie", "measure": "Medida",
        "geography": "Geografía", "frequency": "M mensual o A anual", "period": "Inicio del periodo",
        "basis": "projected o mixed (el anual del primer año suma meses reales y proyectados)",
        "mid": "Escenario medio", "low": "Escenario bajo (EE no lo publica)", "high": "Escenario alto (EE no lo publica)",
        "ci95_upper": "Límite superior del intervalo de confianza del 95 %",
        "ci95_lower": "Límite inferior del intervalo de confianza del 95 %",
        "ci68_upper": "Límite superior del intervalo de confianza del 68 %",
        "ci68_lower": "Límite inferior del intervalo de confianza del 68 %",
    }
    observed_cols = {"geography": "Geografía", "period": "Primer día del mes"}
    for x in XM_VARIABLES:
        observed_cols[x] = f"Valor mensual vigente de {x} (suma o máximo según la medida)"
        observed_cols[f"{x}_complete"] = f"Si el mes de {x} tiene todos sus días; un mes incompleto se marca, no se escala"
    side_cols = {
        "product": "Producto", "series": "Serie", "measure": "Medida", "geography": "Geografía",
        "frequency": "M mensual o A anual", "period": "Inicio del periodo", "revision_id": "Revisión",
        "revision_code": "Código de la revisión", "published_on": "Fecha de publicación", "mid": "Escenario medio",
        "previous_revision_code": "Revisión publicada antes con valor en ese periodo",
        "previous_mid": "Escenario medio de la revisión anterior",
        "diff_vs_previous": "Diferencia frente a la revisión anterior (esta − anterior)",
        "diff_pct_vs_previous": "Diferencia frente a la revisión anterior, en %",
    }
    vs_real_cols = {
        "revision_id": "Revisión", "revision_code": "Código de la revisión", "revision_name": "Nombre oficial",
        "status": "Estado de la revisión", "first_projected_period": "Primer mes proyectado de la revisión",
        "series": "Serie comparable (core.series.is_comparable; PER-01: SIN+GCE+ME+GD_UPME)",
        "period": "Mes", "months_ahead": "Meses desde el primer mes proyectado (1 = primer mes)",
        "projected": "Escenario medio proyectado (GWh)", "ci95_lower": "Límite inferior del IC 95 %",
        "ci95_upper": "Límite superior del IC 95 %", "ci68_lower": "Límite inferior del IC 68 %",
        "ci68_upper": "Límite superior del IC 68 %",
        "real_variable": "Variable del dato real oficial para el error (PER-01: xm_demasin)",
        "real": "Dato real mensual vigente (GWh)", "real_is_complete": "Si el mes real está completo",
        "error": "Error = proyectado − real (PER-01); vacío si el mes real está incompleto",
        "error_pct": "Error en % del real; vacío si el mes real está incompleto",
        "inside_ci95": "Si el real cae dentro del IC 95 %", "inside_ci68": "Si el real cae dentro del IC 68 %",
    }
    views = {
        "v_revision_wide": ("Valores de cada revisión con una columna por tipo de valor: abanico de una revisión", revision_cols),
        "v_observed_wide": ("Dato real mensual vigente de XM con una columna por variable", observed_cols),
        "v_revisions_side_by_side": (("Escenario medio de cada revisión publicada junto al de la revisión anterior, "
                                      "por periodo: comparar revisiones"), side_cols),
        "v_ee_revision_vs_real": (("Proyección mensual de EE frente al dato real, con error provisional (PER-01, X-25): "
                                   "solo la serie comparable y desde el primer mes proyectado"), vs_real_cols),
    }
    for view, (comment, cols) in views.items():
        comment_on(f"VIEW core.{view}", comment)
        for col, text in cols.items():
            comment_on(f"COLUMN core.{view}.{col}", text)


def downgrade() -> None:
    for view in VIEWS:
        op.execute(f"DROP VIEW core.{view}")
