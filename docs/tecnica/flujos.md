# Flujos de datos (Prefect)

Flujos de carga planeados para el modelo de datos v2 ([Base de datos](base-de-datos/index.md)). Ninguno está construido todavía: se hacen en la etapa 3 del plan (T-27 a T-31). Todo flujo registra cada consulta en `operacion.extractions`, deja su fila en la bitácora `operacion.load_runs` aunque no encuentre nada, y anota cada error o advertencia en `operacion.load_messages` (PDA-05).

| Flujo | Qué hace | Cuándo corre | Tablas que toca | Reglas | Notifica (1.2) |
| --- | --- | --- | --- | --- | --- |
| `load-published-revisions` | Lee un anexo de revisión de la UPME por sus encabezados, verifica sus sumas, normaliza las convenciones y lo carga | Cuando se publica una revisión; una vez para las históricas | `raw.files`, `raw.file_cells` → `staging.revision_*` → `core.revisions` y tablas de la revisión | PDA-06, PDA-07 | Revisión cargada o rechazada |
| `ingest-observed-demand` (diaria) | Consulta a XM SINERGOX los últimos días desde el último dato guardado; guarda solo lo nuevo o cambiado; aplica las reglas de anomalía | Todos los días (hora por definir, X-24) | `raw.xm_sinergox_values` → `staging.observed_values` → `core.observed_values`, `core.observed_changes`, `core.data_anomalies` | PBD-05, PDA-02 | Falla o fuente sin actualizar |
| `ingest-observed-demand` (conciliación) | Vuelve a consultar el histórico (completo o un tramo, X-24) para encontrar cambios que la diaria no vio | Los domingos | Las mismas | PDA-03 | Cambios encontrados |
| `ingest-exogenous` | Carga PIB, población y temperatura | Por definir, cuando se carguen | Ídem, con su `raw` propio | PBD-05 | Exógena fuera de supuesto |
| `check-alerts` | Registra avisos cuando cambia o queda anómalo un dato que ya usó una revisión | Después de cada carga de datos reales | `core.data_alerts` | PDA-04 | Aviso al modelador |

La ficha de cada fuente dice cómo se extrae, qué se valida y qué problemas tiene ([Fuentes de datos](base-de-datos/fuentes/index.md)).
