# Modelo de datos (etapa 1)

Base PostgreSQL `proyecciones_demanda` (BD-01). Migración: `backend/alembic/versions/0002_core_phase1.py`. Todo lo de `core` lleva procedencia (BD-06).

```
core.products ──< core.series_observed            (dato real por producto y periodo)
      │
      └──< core.revisions ──< core.revision_values (valor por escenario y periodo)
                    │
                    └──< core.revision_assumptions >── core.exogenous_variables ──< core.exogenous_observed
```

| Tabla | Contenido | Llave |
| --- | --- | --- |
| `core.products` | Productos: `ee` (Energía eléctrica, GWh), `gn` (Gas natural, GBTUD) | `code` |
| `core.series_observed` | Dato real por producto, frecuencia (`A` anual, `M` mensual, `D` diaria), periodo y región (`SIN`/nacional por defecto) | producto + frecuencia + periodo + región |
| `core.revisions` | Revisiones publicadas: `code` (ej. `2026-07`), producto, fecha de publicación, fecha de corte, modelo (texto libre en etapa 1), documento oficial, estado | `id`; único producto + code |
| `core.revision_values` | Valores proyectados por revisión, escenario (`low`, `mid`, `high`), frecuencia y periodo | revisión + escenario + frecuencia + periodo + región |
| `core.exogenous_variables` | Catálogo: código (`gdp`, `population`, `oni`…), nombre, unidad, fuente, frecuencia | `code` |
| `core.exogenous_observed` | Valores observados de cada variable | variable + periodo |
| `core.revision_assumptions` | Supuesto de cada revisión por variable, escenario y periodo | revisión + variable + escenario + periodo |

Esquemas `raw` y `staging`: tablas de carga por fuente (archivos de revisiones pasadas, XM, Gestor del Mercado de Gas, DANE), definidas al conocer los formatos (pendiente X-01).

Vistas `publicacion.*` (etapa 1.1): solo revisiones con estado `published`.
