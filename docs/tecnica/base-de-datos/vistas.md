# Vistas para revisar y analizar

Las tablas de `core` son **largas**: una fila por valor, para guardar bien y no repetir lógica. Para mirar los datos a ojo, conectar Excel o Power BI y simplificar la API, se crean **vistas anchas**. Una vista es una consulta guardada con nombre: se ve como una tabla, no copia datos y siempre muestra lo vigente. Llevan comentario y documentación como cualquier tabla (PBD-01, PBD-02).

| Vista | Una fila por | Columnas | Para qué |
| --- | --- | --- | --- |
| `core.v_ee_revision_vs_real` | Revisión y mes | real (`DemaSIN`), medio, IC 68 % superior e inferior, IC 95 % superior e inferior, error en GWh y en % | Seguimiento de cada revisión y su error (PER-01) |
| `core.v_revision_wide` | Revisión, serie, medida, geografía y periodo | Un tipo de valor por columna: medio y límites en EE, bajo, medio y alto en GN | Ver una revisión completa |
| `core.v_observed_wide` | Fecha | Una columna por variable (`DemaSIN`, `DemaReal`, `DemaCome`, `ExpoEner`…) | Comparar las medidas reales |
| `core.v_revisions_side_by_side` | Periodo | Una columna por revisión, con el escenario medio de la serie comparable | Ver cómo cambió la proyección entre revisiones |

Ejemplo de `core.v_ee_revision_vs_real` (revisión 2026-07, abril de 2026, GWh; el real y el error aparecen cuando se cargue `DemaSIN`):

| periodo | revisión | real | medio | ic68_sup | ic68_inf | ic95_sup | ic95_inf | error % |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-04 | 2026-07 | … | 7 169,10 | 7 258,31 | 7 080,09 | 7 334,83 | 7 003,77 | … |

Si una vista se vuelve lenta, pasa a vista materializada (una copia que se refresca después de cada carga), sin tecnología nueva.
