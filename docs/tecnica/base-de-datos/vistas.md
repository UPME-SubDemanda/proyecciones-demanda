# Vistas para revisar y analizar

Las tablas de `core` son **largas**: una fila por valor, para guardar bien y no repetir lógica. Para mirar los datos a ojo, conectar Excel o Power BI y simplificar la API, se crean **vistas anchas**. Una vista es una consulta guardada con nombre: se ve como una tabla, no copia datos y siempre muestra lo vigente. Llevan comentario y documentación como cualquier tabla (PBD-01, PBD-02); el detalle de cada columna está en el [diccionario](diccionario.md).

Se crearon en T-24 (migración `0004`) y se probaron con las 5 revisiones de EE y `DemaSIN` desde 2010.

| Vista | Una fila por | Columnas | Responde a |
| --- | --- | --- | --- |
| `core.v_revision_wide` | Revisión, serie, medida, geografía, frecuencia y periodo | Un tipo de valor por columna: `mid`, `low`, `high` y los límites `ci95_*` y `ci68_*`; `basis` (proyectado o mixto) | **Abanico de una revisión** |
| `core.v_revisions_side_by_side` | Revisión publicada, serie, medida, geografía, frecuencia y periodo | Escenario medio de la revisión, la revisión publicada antes, su medio y la diferencia en valor y en % | **Comparar revisiones** |
| `core.v_ee_revision_vs_real` | Revisión y mes desde su primer mes proyectado | Proyectado (medio), IC 68 % y 95 %, real (`DemaSIN` mensual), si el mes real está completo, error en GWh y en %, si el real cae dentro de cada intervalo | **Proyección frente a dato real** y su error (PER-01) |
| `core.v_observed_wide` | Geografía y mes | Una columna por variable de XM (`xm_demasin`, `xm_demareal`, `xm_demacome`, `xm_expoener`, `xm_demamaxpot`) y otra que dice si su mes está completo | Comparar las medidas reales |

## Cómo se calculan

- **Abanico:** `v_revision_wide` pasa a columnas los tipos de valor de `core.revision_values`. EE publica medio e intervalos; GN, bajo, medio y alto. Las columnas que una revisión no publica quedan vacías.
- **Comparar revisiones:** una vista no puede tener una columna por revisión, porque las revisiones crecen con el tiempo. Por eso `v_revisions_side_by_side` pone cada revisión junto a **la anterior** (por fecha de publicación) en el mismo periodo. La tabla con una columna por revisión la arma quien consulta (la API o Excel) a partir de esta vista. Solo entran revisiones `published` o `superseded`.
- **Error (PER-01, provisional hasta T-26 y X-25):**
    - Compara la serie marcada `is_comparable` en `core.series` (SIN+GCE+ME+GD_UPME) con la variable marcada `is_official_for_error` en `core.variables` (`DemaSIN`). Las dos marcas viven en los catálogos, así que si T-26 cambia la variable real, la vista no cambia.
    - Error = proyectado − real. Un error positivo es una sobreestimación.
    - Solo hay error en meses reales completos. Un mes incompleto aparece con `real_is_complete = false` y sin error: se marca, no se escala.
    - `months_ahead` cuenta desde el primer mes proyectado de la revisión (1 = primer mes). Sirve para agrupar el error por horizonte.
    - Las métricas que se muestran (MAPE, sesgo, APE de la UPME…) se calculan sobre esta vista y se deciden en X-25.
- **Dato real:** `v_observed_wide` sale de `core.observed_monthly`, que usa la versión vigente de cada día (`observed_current`) y agrega con la regla de la medida: suma para la energía y máximo para la potencia.

## Ejemplo con los datos reales

Error mensual de cada revisión de EE con `DemaSIN`, meses completos hasta octubre de 2026 (consulta sobre `v_ee_revision_vs_real`). Las cifras dependen de la hipótesis de PER-01 y las métricas son las de X-25: se muestran solo para comprobar que la vista responde.

| Revisión | Meses comparados | Error medio (%) | Error absoluto medio (%) | Meses dentro del IC 95 % |
| --- | --- | --- | --- | --- |
| 2023-12 | 37 | 3,99 | 4,00 | 84 % |
| 2024-07 | 31 | 1,19 | 1,79 | 94 % |
| 2024-12 | 25 | 0,59 | 1,61 | 96 % |
| 2025-07 | 19 | −0,63 | 1,50 | 100 % |
| 2026-07 | 7 | 2,20 | 2,40 | 86 % |

```sql
SELECT revision_code, count(*) AS meses, round(avg(error_pct), 2) AS sesgo_pct,
       round(avg(abs(error_pct)), 2) AS mape, round(100.0 * avg(inside_ci95::int)) AS pct_en_ic95
  FROM core.v_ee_revision_vs_real
 WHERE real_is_complete
 GROUP BY revision_code ORDER BY revision_code;
```

Si una vista se vuelve lenta, pasa a vista materializada (una copia que se refresca después de cada carga), sin tecnología nueva.
