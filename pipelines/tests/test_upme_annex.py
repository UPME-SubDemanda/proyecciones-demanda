"""Pruebas del lector de anexos de EE (PDA-06, PDA-07) con libros pequeños que imitan los dos formatos reales.

Los anexos reales no entran al repositorio: aquí se arma un libro con la misma forma.
"""
from datetime import datetime

import openpyxl
import pytest

from lib.upme_annex import read_annex

TYPES = ["Esc. Medio", "IC Superior 95%", "IC Inferior 95%", "IC Superior 68%", "IC Inferior 68%"]
MONTHS = [datetime(2026, 4, 1), datetime(2026, 5, 1)]


def series_sheet(wb, title, unit, periods, blocks):
    """blocks: [(título de serie, [valor medio por periodo])]; los intervalos son ±10 y ±5."""
    ws = wb.create_sheet(title)
    for b, (name, mids) in enumerate(blocks):
        col = 3 + 7 * b
        ws.cell(8, col, f"Demanda Energía Eléctrica {name} ({unit})")
        for k, label in enumerate(TYPES):
            ws.cell(9, col + k, label)
        for i, (period, mid) in enumerate(zip(periods, mids)):
            ws.cell(10 + i, col - 1, period)
            for k, delta in enumerate([0, 10, -10, 5, -5]):
                ws.cell(10 + i, col + k, mid + delta)
    return ws


def components_sheet_old(wb, title, unit, periods, columns):
    """Formato hasta jul-2024: título, fila de nombres y datos; la GD viene en negativo."""
    ws = wb.create_sheet(title)
    ws.cell(8, 3, f"Demanda Energía Eléctrica ({unit})")
    for j, (name, values) in enumerate(columns):
        ws.cell(9, 3 + j, name)
        for i, (period, value) in enumerate(zip(periods, values)):
            ws.cell(10 + i, 2, period)
            if value is not None:
                ws.cell(10 + i, 3 + j, value)
    return ws


def components_sheet_new(wb, title, unit, periods):
    """Formato desde jul-2025: fila de grupos (vehículos y GD por área) entre el título y los nombres."""
    ws = wb.create_sheet(title)
    ws.cell(8, 3, f"Demanda Energía Eléctrica ({unit})")
    ws.cell(9, 4, "Vehículos eléctricos")
    ws.cell(9, 6, "GD_UPME")
    for j, name in enumerate(["Rubiales", "Caribe", "MetroBog", "Caribe", "GD_PNUMA"]):
        ws.cell(10, 3 + j, name)
    for i, period in enumerate(periods):
        ws.cell(11 + i, 2, period)
        for j, value in enumerate([100, 1, 2, 30, 50]):
            ws.cell(11 + i, 3 + j, value)
    return ws


@pytest.fixture()
def old_format(tmp_path):
    wb = openpyxl.Workbook()
    wb.active.title = "Índice"
    # SIN 1000; GCE+ME = 100 + 5 + 3 = 108; GD = 20 → SIN+GCE+ME = 1108; +GD = 1088
    series_sheet(wb, "DEE_Mensual(GWh_mes)", "GWh-mes", MONTHS,
                 [("SIN", [1000, 1000]), ("SIN+GCE+ME", [1108, 1108]), ("SIN+GCE+ME+GD", [1088, 1088])])
    series_sheet(wb, "DEE_Anual(GWh_año)", "GWh-año", [2026, 2027],
                 [("SIN", [12000, 12500]), ("SIN+GCE+ME", [12000, 12500]), ("SIN+GCE+ME+GD", [12000, 12500])])
    components_sheet_old(wb, "DEEGCE_Mensual (GWh_mes)", "GWh-mes", MONTHS,
                         [("Rubiales", [100, 100]), (" Cemex Caracolito", [None, None]), ("Vehículos eléctricos", [5, 5]),
                          ("MetroMed La 80 ", [3, 3]), ("GD", [-20, -20])])
    wb.create_sheet("MensualSIN_Regionales_EE")
    path = tmp_path / "anexo.xlsx"
    wb.save(path)
    return path


def test_reads_series_by_headers(old_format):
    annex = read_annex(old_format)
    mids = {(v.series, v.period.isoformat()): v.value for v in annex.series_values
            if v.value_type == "mid" and v.frequency == "M"}
    assert mids[("ee_sin_gce_me_gd_upme", "2026-04-01")] == 1088  # «+GD» antes de dic-2024 es la GD UPME
    assert {v.value_type for v in annex.series_values} == {"mid", "ci95_upper", "ci95_lower", "ci68_upper", "ci68_lower"}
    assert annex.first_projected_period.isoformat() == "2026-04-01"
    assert annex.horizon_end.isoformat() == "2026-05-01"


def test_first_annual_year_is_mixed(old_format):
    annex = read_annex(old_format)
    basis = {v.period.year: v.basis for v in annex.series_values if v.frequency == "A"}
    assert basis == {2026: "mixed", 2027: "projected"}


def test_components_are_classified_and_gd_is_positive(old_format):
    annex = read_annex(old_format)
    types = {c.code: c.type for c in annex.components.values()}
    assert types == {"gce_rubiales": "gce", "gce_cemex_caracolito": "gce", "ev_sin": "ev", "rail_metromed_la_80": "rail",
                     "gd_upme_sin": "gd_upme"}
    gd = [cv.value for cv in annex.component_values if cv.component == "gd_upme_sin"]
    assert gd == [20, 20]  # PDA-07: se guarda positiva
    assert any(m.code == "gd_sign_normalized" for m in annex.messages)
    assert not [cv for cv in annex.component_values if cv.component == "gce_cemex_caracolito"]  # sin valores: no entra


def test_sums_are_checked(old_format):
    annex = read_annex(old_format)
    ok = {m.context["series"] for m in annex.messages if m.code == "file_sum_ok" and m.context["frequency"] == "M"}
    assert ok == {"ee_sin_gce_me", "ee_sin_gce_me_gd_upme"}
    assert not annex.has_errors


def test_sum_mismatch_is_a_warning(tmp_path):
    wb = openpyxl.Workbook()
    series_sheet(wb, "DEE_Mensual(GWh_mes)", "GWh-mes", MONTHS,
                 [("SIN", [1000, 1000]), ("SIN+GCE+ME", [1200, 1108])])
    components_sheet_old(wb, "DEEGCE_Mensual (GWh_mes)", "GWh-mes", MONTHS, [("Rubiales", [108, 108])])
    wb.save(tmp_path / "a.xlsx")
    annex = read_annex(tmp_path / "a.xlsx")
    warning = next(m for m in annex.messages if m.code == "file_sum_mismatch")
    assert warning.context["n_bad"] == 1 and warning.context["worst_period"] == "2026-04-01"


def test_unknown_header_is_an_error(tmp_path):
    wb = openpyxl.Workbook()
    ws = series_sheet(wb, "DEE_Mensual(GWh_mes)", "GWh-mes", MONTHS, [("SIN", [1000, 1000])])
    ws.cell(9, 4, "Escenario alto")
    wb.save(tmp_path / "a.xlsx")
    annex = read_annex(tmp_path / "a.xlsx")
    assert annex.has_errors and any(m.code == "value_type_unknown" for m in annex.messages)


def test_wrong_unit_is_an_error(tmp_path):
    wb = openpyxl.Workbook()
    series_sheet(wb, "DEE_Mensual(GWh_mes)", "MW-mes", MONTHS, [("SIN", [1000, 1000])])
    wb.save(tmp_path / "a.xlsx")
    assert any(m.code == "unit_mismatch" for m in read_annex(tmp_path / "a.xlsx").messages)


def test_new_format_with_groups_by_area(tmp_path):
    wb = openpyxl.Workbook()
    series_sheet(wb, "DEE_Mensual(GWh_mes)", "GWh-mes", MONTHS, [("SIN", [1000, 1000])])
    components_sheet_new(wb, "DEEGCE_Mensual (GWh_mes)", "GWh-mes", MONTHS)
    wb.save(tmp_path / "a.xlsx")
    annex = read_annex(tmp_path / "a.xlsx")
    found = {c.code: (c.type, c.geography) for c in annex.components.values()}
    assert found == {"gce_rubiales": ("gce", None), "ev_caribe": ("ev", "ee_area_caribe"),
                     "rail_metrobog": ("rail", None), "gd_upme_caribe": ("gd_upme", "ee_area_caribe"),
                     "gd_pnuma_sin": ("gd_pnuma", "ee_sin")}
    assert not any(m.code == "gd_sign_normalized" for m in annex.messages)  # desde jul-2025 ya viene positiva


def test_other_sheets_are_reported_not_loaded(old_format):
    annex = read_annex(old_format)
    assert {m.context["sheet"] for m in annex.messages if m.code == "sheet_not_loaded"} == {
        "Índice", "MensualSIN_Regionales_EE"}
