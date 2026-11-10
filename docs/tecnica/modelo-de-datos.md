# Modelo de datos

Resumen del modelo de datos del proyecto. El detalle completo, con cada esquema, tabla, columna y ejemplos, está en la sección [Base de datos](base-de-datos/index.md) (PBD-02).

## Estado

| Versión | Qué es | Estado |
| --- | --- | --- |
| **v2** | Modelo de la etapa 1 revisado con los datos reales de EE y GN ([P-0004](../decisiones/0004-modelo-datos-v2.md)) | Aprobado el 2026-11-10. Su migración (`0003`) es el paso T-23 |
| v1 | Primer modelo de la etapa 1 (migración `0002`, [P-0002](../decisiones/0002-modelo-datos-etapa-1.md)) | Reemplazado. Es el que tiene hoy la base, sin datos salvo los dos productos |

## Modelo v2 en una tabla

| Esquema | Tablas principales | Para qué |
| --- | --- | --- |
| `core`, catálogos | `products`, `measures`, `geographies`, `series`, `series_composition`, `components`, `value_types`, `variables`, `sources`, `aliases` | Describir los datos. Todo lo que cambia entre productos (EE y GN) es un catálogo |
| `core`, revisiones | `revisions`, `revision_values`, `revision_component_values`, `revision_components`, `revision_assumptions` | Las proyecciones publicadas, inmutables, con series, componentes, intervalos o escenarios, y supuestos |
| `core`, datos reales | `observed_values` (versionada) y las lecturas `observed_current`, `observed_latest`, `observed_as_of`, `observed_monthly`, `observed_annual` | El dato real de cualquier fuente, con versión, fecha de carga y estado de calidad |
| `core`, calidad | `anomaly_rules`, `data_anomalies`, `observed_changes`, `data_alerts` | Anomalías con validación humana, cambios entre versiones y avisos a revisiones |
| `raw` | `xm_sinergox_values`, `files`, `file_cells` | Lo que llegó de cada fuente, tal cual |
| `staging` | `observed_values`, `revision_values` y las demás tablas de la revisión | El contrato: misma forma para todas las fuentes |
| `operacion` | `load_runs`, `load_messages`, `extractions`, `source_status`, `notifications`, `audit_log` | Bitácora y operación de las cargas |
| `publicacion` | Vistas (etapa 5) | Solo lo publicable |
| `auth` | `roles`, `users`, `user_roles` | Usuarios y roles (sin cambios) |

## Qué cambió de v1 a v2

| v1 (`0002`) | v2 | Por qué |
| --- | --- | --- |
| `products` con unidad | `products` sin unidad + `measures` | EE tiene energía (GWh) y potencia máxima (MW) |
| `series_observed` | `core.observed_values`, versionada | XM corrige datos ya publicados; hay que guardar las versiones y su calidad, y la resolución horaria |
| `exogenous_variables`, `exogenous_observed` | `core.variables` y `core.observed_values` | Un solo catálogo y una sola tabla versionada para todo lo observado |
| `revisions` | Con nombre, fecha de consulta de la fuente, primer mes proyectado, horizonte, archivo, estado `superseded` y `supersedes_id`; procedencia obligatoria | Trazabilidad (FLU-08) y corrección de revisiones (X-09) |
| `revision_values` (escenario, periodo, región) | Con serie, medida, geografía, tipo de valor y `basis` | Las revisiones traen series compuestas, intervalos (EE) o escenarios (GN) |
| — | Tablas de componentes, catálogos, calidad, `raw`, `staging` y `operacion` | Ver la tabla anterior |
