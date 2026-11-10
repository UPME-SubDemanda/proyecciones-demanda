"""Lector de los anexos de energía eléctrica de las revisiones de la UPME (T-24, base de T-27).

Ubica los datos por encabezados, no por posición (PDA-06), porque el formato cambió entre revisiones:
columnas que se agregan (GD_PNUMA desde dic-2024), componentes por área, nombres con espacios.
No toca la base: devuelve filas normalizadas y mensajes; quien llama decide qué guardar.

Hojas que lee:
- DEE_/DPMÁX_ Mensual y Anual: las 4 series con escenario medio e intervalos de confianza.
- DEEGCE_/DPMÁXGCE_ Mensual y Anual: los componentes (GCE, movilidad eléctrica, GD).

Las demás (áreas, promedio diario, capacidad instalada) se informan como no cargadas.
"""
from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date, datetime
from pathlib import Path

import openpyxl

AREAS = {"caribe", "oriente", "suroccidente", "antioquia", "nordeste"}
RAIL = {"metrobog", "regiotram", "metromed la 80"}  # trenes urbanos (movilidad eléctrica, ME)

# Título de bloque → serie. Se comparan del más largo al más corto.
SERIES_TITLES = [
    ("SIN+GCE+ME+GD_PNUMA", "ee_sin_gce_me_gd_pnuma"),
    ("SIN+GCE+ME+GD_UPME", "ee_sin_gce_me_gd_upme"),
    ("SIN+GCE+ME+GD", "ee_sin_gce_me_gd_upme"),  # antes de dic-2024 «GD» es la GD UPME (X-23)
    ("SIN+GCE+ME", "ee_sin_gce_me"),
    ("SIN", "ee_sin"),
]
VALUE_TYPES = {
    "esc. medio": "mid",
    "ic superior 95%": "ci95_upper",
    "ic inferior 95%": "ci95_lower",
    "ic superior 68%": "ci68_upper",
    "ic inferior 68%": "ci68_lower",
}
# Prefijo de la hoja → (medida, unidad esperada en los títulos, clase de hoja)
SHEET_KINDS = [
    ("DPMÁXGCE_", "ee_peak_power", "MW", "components"),
    ("DEEGCE_", "ee_energy", "GWh", "components"),
    ("DPMÁX_", "ee_peak_power", "MW", "series"),
    ("DEE_", "ee_energy", "GWh", "series"),
]


@dataclass
class Message:
    level: str  # error, warning o info
    code: str
    message: str
    context: dict = field(default_factory=dict)


@dataclass
class Cell:
    sheet: str
    row: int
    col: int
    header_path: str | None
    value_text: str | None
    value_num: float | None


@dataclass
class SeriesValue:
    series: str
    measure: str
    frequency: str
    period: date
    value_type: str
    value: float
    basis: str = "projected"


@dataclass
class Component:
    code: str
    type: str
    published_name: str
    geography: str | None


@dataclass
class ComponentValue:
    component: str
    measure: str
    frequency: str
    period: date
    value: float


@dataclass
class Annex:
    series_values: list[SeriesValue] = field(default_factory=list)
    components: dict[str, Component] = field(default_factory=dict)
    component_values: list[ComponentValue] = field(default_factory=list)
    series_aliases: dict[str, str] = field(default_factory=dict)  # título publicado → serie
    cells: list[Cell] = field(default_factory=list)
    messages: list[Message] = field(default_factory=list)
    header_paths: dict[tuple[str, int, int], str] = field(default_factory=dict)  # celda leída → ruta de encabezados
    first_projected_period: date | None = None
    horizon_end: date | None = None

    def error(self, code, message, **context):
        self.messages.append(Message("error", code, message, context))

    def warning(self, code, message, **context):
        self.messages.append(Message("warning", code, message, context))

    def info(self, code, message, **context):
        self.messages.append(Message("info", code, message, context))

    @property
    def has_errors(self):
        return any(m.level == "error" for m in self.messages)


def norm(text) -> str:
    """Texto comparable: sin espacios de más ni saltos de línea, en minúsculas."""
    return re.sub(r"\s+", " ", str(text)).strip().lower()


def slug(text) -> str:
    plain = unicodedata.normalize("NFKD", norm(text)).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "_", plain).strip("_")


def period_of(value, frequency) -> date | None:
    """Fecha de inicio del periodo: un mes viene como fecha y un año como número."""
    if frequency == "M" and isinstance(value, datetime):
        return value.date().replace(day=1)
    if frequency == "A" and isinstance(value, (int, float)) and 1990 <= value <= 2100 and float(value).is_integer():
        return date(int(value), 1, 1)
    return None


def sheet_kind(title):
    for prefix, measure, unit, kind in SHEET_KINDS:
        if title.startswith(prefix):
            frequency = "M" if "Mensual" in title else "A" if "Anual" in title else None
            return measure, unit, kind, frequency
    return None


def series_of(title) -> str | None:
    text = re.sub(r"\s+", "", str(title))
    match = re.search(r"(SIN[+A-Z_]*)\(", text)
    if not match:
        return None
    key = match.group(1)
    return next((code for name, code in SERIES_TITLES if key == name), None)


def first_data_row(rows):
    """Primera fila con un periodo seguido de números: ahí empiezan los datos."""
    for i, row in enumerate(rows):
        for j in range(len(row) - 1):
            if (period_of(row[j], "M") or period_of(row[j], "A")) and isinstance(row[j + 1], (int, float)):
                return i
    return None


def read_annex(path: Path) -> Annex:
    annex = Annex()
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    for ws in wb.worksheets:
        rows = [tuple(r) for r in ws.iter_rows(values_only=True)]
        kind = sheet_kind(ws.title)
        _keep_cells(annex, ws.title, rows)
        if kind is None or kind[3] is None:
            annex.info("sheet_not_loaded", f"La hoja «{ws.title}» no se carga en esta etapa.", sheet=ws.title)
            continue
        measure, unit, sheet_class, frequency = kind
        start = first_data_row(rows)
        if start is None or start < 2:
            annex.error("sheet_without_data", f"No se encontraron datos en la hoja «{ws.title}».", sheet=ws.title)
            continue
        if sheet_class == "series":
            _read_series(annex, ws.title, rows, start, measure, unit, frequency)
        else:
            _read_components(annex, ws.title, rows, start, measure, unit, frequency)
    wb.close()
    _set_horizon_and_basis(annex)
    _check_sums(annex)
    return annex


def _keep_cells(annex, sheet, rows):
    for i, row in enumerate(rows, 1):
        for j, v in enumerate(row, 1):
            if v is None or (isinstance(v, str) and not v.strip()):
                continue
            num = float(v) if isinstance(v, (int, float)) and not isinstance(v, bool) else None
            text = v.isoformat() if isinstance(v, datetime) else str(v)
            annex.cells.append(Cell(sheet, i, j, None, text, num))


def _read_series(annex, sheet, rows, start, measure, unit, frequency):
    title_row, type_row = rows[start - 2], rows[start - 1]
    blocks = [(j, t) for j, t in enumerate(title_row) if t is not None and str(t).strip()]
    if not blocks:
        annex.error("series_titles_missing", f"La hoja «{sheet}» no tiene títulos de serie.", sheet=sheet)
        return
    for j, title in blocks:
        series = series_of(title)
        if series is None:
            annex.error("series_unknown", f"Serie no reconocida en «{sheet}»: «{norm(title)}».", sheet=sheet, title=str(title))
            continue
        if f"({unit}-" not in re.sub(r"\s+", "", str(title)):
            annex.error("unit_mismatch", f"La serie «{norm(title)}» de «{sheet}» no está en {unit}.", sheet=sheet)
            continue
        annex.series_aliases[re.sub(r"\s+", " ", str(title)).strip()] = series
        date_col = j - 1
        col = j
        while col < len(type_row) and type_row[col] is not None:
            label = norm(type_row[col])
            value_type = VALUE_TYPES.get(label)
            if value_type is None:
                annex.error("value_type_unknown", f"Tipo de valor no reconocido en «{sheet}»: «{label}».",
                            sheet=sheet, col=col + 1)
                col += 1
                continue
            for i in range(start, len(rows)):
                row = rows[i]
                period = period_of(row[date_col], frequency) if date_col < len(row) else None
                value = row[col] if col < len(row) else None
                if period is None:
                    continue
                if not isinstance(value, (int, float)):
                    annex.warning("value_missing", f"Falta el valor de {series} {value_type} {period} en «{sheet}».",
                                  sheet=sheet, row=i + 1, col=col + 1)
                    continue
                annex.series_values.append(SeriesValue(series, measure, frequency, period, value_type, float(value)))
                annex.header_paths[(sheet, i + 1, col + 1)] = f"{sheet} › {series} › {value_type}"
            col += 1


def _is_title(value, unit=None):
    """Un título de hoja dice la unidad: «Demanda Energía Eléctrica (GWh-mes)»."""
    text = re.sub(r"\s+", "", str(value)) if isinstance(value, str) else ""
    return any(f"({u}-" in text for u in ([unit] if unit else ["GWh", "MW"]))


def _classify(name, group):
    """Tipo, código y geografía de un componente a partir de su nombre y del grupo que lo encabeza."""
    key = norm(name)
    if key in AREAS and group:
        if group == "vehículos eléctricos":
            return "ev", f"ev_{slug(key)}", f"ee_area_{slug(key)}"
        if group in ("gd_upme", "gd"):
            return "gd_upme", f"gd_upme_{slug(key)}", f"ee_area_{slug(key)}"
        return None
    if key == "vehículos eléctricos":
        return "ev", "ev_sin", "ee_sin"
    if key in ("gd", "gd_upme"):
        return "gd_upme", "gd_upme_sin", "ee_sin"
    if key == "gd_pnuma":
        return "gd_pnuma", "gd_pnuma_sin", "ee_sin"
    if key in RAIL:
        return "rail", f"rail_{slug(key)}", None
    return "gce", f"gce_{slug(key)}", None


def _read_components(annex, sheet, rows, start, measure, unit, frequency):
    name_row = rows[start - 1]
    title_index = next((i for i in range(start) if any(_is_title(v) for v in rows[i])), None)
    if title_index is None:
        annex.error("sheet_title_missing", f"La hoja «{sheet}» no tiene título con unidad.", sheet=sheet)
        return
    if not any(_is_title(v, unit) for v in rows[title_index]):
        annex.error("unit_mismatch", f"La hoja «{sheet}» no está en {unit}.", sheet=sheet)
        return
    # Entre el título y los nombres puede haber una fila de grupos (desde jul-2025): vehículos y GD por área.
    group_row = rows[start - 2] if start - 2 > title_index else ()
    date_col = next((j for j, v in enumerate(rows[start]) if period_of(v, frequency)), None)
    if date_col is None:
        annex.error("period_column_missing", f"No se encontró la columna de periodos en «{sheet}».", sheet=sheet)
        return
    group = None
    gd_columns = []
    for j, name in enumerate(name_row):
        if j < len(group_row) and group_row[j] is not None:
            group = norm(group_row[j])
        if name is None or j <= date_col:
            continue
        found = _classify(name, group)
        if found is None:
            annex.error("component_unknown", f"Componente no reconocido en «{sheet}»: «{norm(name)}» (grupo «{group}»).",
                        sheet=sheet, col=j + 1)
            continue
        type_, code, geography = found
        published = re.sub(r"\s+", " ", str(name)).strip()
        if type_ in ("ev", "gd_upme") and geography != "ee_sin":
            published = f"{'Vehículos eléctricos' if type_ == 'ev' else 'GD_UPME'} {published}"
        annex.components.setdefault(code, Component(code, type_, published, geography))
        values = []
        for i in range(start, len(rows)):
            row = rows[i]
            period = period_of(row[date_col], frequency) if date_col < len(row) else None
            value = row[j] if j < len(row) else None
            if period is None or not isinstance(value, (int, float)):
                continue  # un GCE sin valor es un mes antes de su entrada
            values.append((i, period, float(value)))
            annex.header_paths[(sheet, i + 1, j + 1)] = f"{sheet} › {code}"
        if type_ in ("gd_upme", "gd_pnuma"):
            gd_columns.append((code, values))
            continue
        if any(v < 0 for _, _, v in values):
            annex.error("component_negative", f"El componente {code} de «{sheet}» tiene valores negativos.", sheet=sheet)
            continue
        for _i, period, value in values:
            annex.component_values.append(ComponentValue(code, measure, frequency, period, value))
    for code, values in gd_columns:
        signs = {v > 0 for _, _, v in values if v != 0}
        if signs == {False}:  # publicada en negativo (hasta dic-2024): se guarda positiva (PDA-07)
            values = [(i, p, -v) for i, p, v in values]
            annex.info("gd_sign_normalized", f"La GD {code} de «{sheet}» venía en negativo; se guarda positiva (PDA-07).",
                       sheet=sheet, component=code)
        elif len(signs) > 1:
            annex.error("gd_mixed_sign", f"La GD {code} de «{sheet}» mezcla signos; no se puede normalizar.",
                        sheet=sheet, component=code)
            continue
        for _i, period, value in values:
            annex.component_values.append(ComponentValue(code, measure, frequency, period, value))


def _set_horizon_and_basis(annex):
    """Primer mes proyectado y fin del horizonte salen de la serie SIN mensual; el anual del primer año es mixto."""
    months = sorted({v.period for v in annex.series_values if v.frequency == "M" and v.measure == "ee_energy"})
    if not months:
        annex.error("monthly_energy_missing", "El anexo no trae la energía mensual: no se puede ubicar el horizonte.")
        return
    annex.first_projected_period, annex.horizon_end = months[0], months[-1]
    if annex.first_projected_period.month > 1:
        for v in annex.series_values:
            if v.frequency == "A" and v.period.year == annex.first_projected_period.year:
                v.basis = "mixed"


def _check_sums(annex, tolerance=0.01):
    """Cada serie compuesta de energía debe ser la suma de sus partes en el escenario medio (PDA-06).

    SIN+GCE+ME = SIN + GCE + vehículos + trenes; SIN+GCE+ME+GD_x = SIN+GCE+ME − GD_x.
    La potencia máxima no se verifica: la máxima del total no es la suma de las máximas.
    """
    types = {c.code: c.type for c in annex.components.values()}
    for freq in ("M", "A"):
        mid = {(v.series, v.period): v.value for v in annex.series_values
               if v.value_type == "mid" and v.measure == "ee_energy" and v.frequency == freq}
        parts: dict[tuple[str, date], float] = {}
        for cv in annex.component_values:
            if cv.measure == "ee_energy" and cv.frequency == freq:
                group = "me_gce" if types[cv.component] in ("gce", "ev", "rail") else types[cv.component]
                parts[(group, cv.period)] = parts.get((group, cv.period), 0.0) + cv.value
        # serie → (serie base, grupo de componentes, signo)
        checks = {"ee_sin_gce_me": ("ee_sin", "me_gce", 1),
                  "ee_sin_gce_me_gd_upme": ("ee_sin_gce_me", "gd_upme", -1),
                  "ee_sin_gce_me_gd_pnuma": ("ee_sin_gce_me", "gd_pnuma", -1)}
        for series, (base, group, sign) in checks.items():
            periods = sorted(p for s, p in mid if s == series)
            if not periods:
                continue
            diffs = [(p, mid[(series, p)] - (mid.get((base, p), 0) + sign * parts.get((group, p), 0))) for p in periods]
            bad = [(p, d) for p, d in diffs if abs(d) > tolerance]
            worst = max(diffs, key=lambda x: abs(x[1]))
            if bad:
                annex.warning("file_sum_mismatch",
                              f"{series} ({'mensual' if freq == 'M' else 'anual'}) no es la suma de sus partes en "
                              f"{len(bad)} de {len(periods)} periodos; la mayor diferencia es {worst[1]:.4f} GWh en {worst[0]}.",
                              series=series, frequency=freq, n_bad=len(bad), worst_period=str(worst[0]),
                              worst_diff=round(worst[1], 6))
            else:
                annex.info("file_sum_ok", f"{series} ({'mensual' if freq == 'M' else 'anual'}) cuadra con sus partes "
                           f"(diferencia máxima {abs(worst[1]):.6f} GWh).", series=series, frequency=freq)
