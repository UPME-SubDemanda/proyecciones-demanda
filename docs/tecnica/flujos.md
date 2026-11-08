# Flujos de datos (Prefect)

| Flujo | Qué hace | Cuándo corre | Tablas que toca | Etapa | Notifica (1.1) |
| --- | --- | --- | --- | --- | --- |
| `load-published-revisions` | Carga los archivos de revisiones ya publicadas (escenarios y supuestos) | Una vez y cuando se publique una revisión | `raw.*` → `core.revisions`, `core.revision_values`, `core.revision_assumptions` | 1 | Revisión cargada |
| `ingest-observed-demand` | Carga el dato real de EE (XM) y GN (Gestor del Mercado de Gas) | Diario 6:00 (Bogotá) | `raw.*` → `core.series_observed` | 1 | Falla o fuente sin actualizar |
| `ingest-exogenous` | Carga PIB, población, ONI, temperatura… | Semanal; detecta publicaciones nuevas | `raw.*` → `core.exogenous_observed` | 1 | Exógena fuera de supuesto |
| `compute-errors` | Recalcula error de la revisión vigente frente al dato real | Después de `ingest-observed-demand` | `core.*` → vistas de indicadores | 1 | Fuera de umbral |

Formatos de origen por confirmar (X-01).
