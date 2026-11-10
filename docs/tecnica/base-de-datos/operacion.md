# Esquema `operacion`

**Para qué existe:** guardar lo que describe **cómo funciona el sistema**, no los datos del producto: qué cargas corrieron, qué encontraron, qué se consultó a cada fuente y cómo están las fuentes. Es propio de este proyecto (PBD-07), porque BD-03 solo define cinco esquemas; está propuesto al estándar en [X-22](../../pendientes/x-22-reglas-al-estandar.md).

**Por qué no va en `raw` ni en `core`:** las cargas existen con cualquier origen de los datos (si una fuente pasa a una base de datos común de la UPME, su `raw` puede desaparecer, pero la carga sigue dejando registro), y no son entidades del producto.

**Quién lo usa:** los flujos de carga lo escriben; las personas que revisan las cargas lo consultan. Mientras no exista una vista en la app (necesita ficha y diseño aprobado, FLU-03), se consulta con SQL o con un comando.

## Tablas

| Tabla | Qué guarda | Columnas principales | Regla |
| --- | --- | --- | --- |
| `load_runs` | La bitácora: una fila por ejecución de cada flujo, aunque no encuentre nada | `id`, `flow`, `source`, `load_type` (`daily`, `weekly`, `backfill`, `file`), `started_at`, `finished_at`, `status` (`ok`, `ok_with_warnings`, `failed`), `range_start`, `range_end`, `n_queried`, `n_new`, `n_changed`, `n_unchanged`, `n_anomalous`, `n_errors`, `retries`, `message` | PDA-05 |
| `load_messages` | El detalle de cada carga: una fila por error, advertencia o información | `load_run_id`, `level` (`error`, `warning`, `info`), `code`, `message`, `context` (hoja, serie, periodo, celda, variable o extracción), `created_at` | PDA-05 |
| `extractions` | Cada consulta a una fuente: qué se pidió, cuándo, respuesta, filas y huella del contenido | `id`, `load_run_id`, `source`, `request` (métrica, entidad, rango), `requested_at`, `http_status`, `rows`, `content_hash`, `error` | PBD-05 |
| `source_status` | Por fuente: última carga exitosa, último periodo disponible, días sin actualizarse | `source`, `last_success_at`, `last_period`, `days_stale` | Alerta «fuente sin actualizar» (etapa 1.2) |
| `notifications` | Cada aviso enviado (etapa 1.2) | `event`, `channel`, `recipient`, `sent_at`, `status` | FLU-14 |
| `audit_log` | Acciones de personas: quién aceptó una anomalía, quién publicó o corrigió una revisión | `user_id`, `action`, `object`, `at`, `detail` | Trazabilidad |

## Las tres capas del registro de una carga

1. **`load_runs`:** el resumen que se mira primero, por ejemplo «terminada con avisos: 1 error, 3 advertencias».
2. **`load_messages`:** el detalle legible de cada problema. Se guarda siempre.
3. **Registros de Prefect:** el detalle técnico paso a paso, para depurar. Se borran con el tiempo.

## Ejemplos

Una fila de `load_runs` de la conciliación semanal:

| Campo | Valor |
| --- | --- |
| `flow`, `source`, `load_type` | `ingest-observed-demand` · `xm_sinergox` · `weekly` |
| `started_at` → `finished_at`, `status` | 2026-11-15 03:00 → 03:42 · `ok_with_warnings` |
| `range_start` → `range_end` | 2000-01-01 → 2026-11-14 |
| `n_queried` / `n_new` / `n_changed` / `n_unchanged` | 9 450 / 0 / 3 / 9 447 |
| `n_anomalous`, `n_errors`, `retries` | 1 · 0 · 2 |
| `message` | «Semanal XM: 3 cambios (sep-2026, +15 GWh máx.), 1 anómalo pendiente de validar, sin errores.» |

Mensajes de `load_messages` que podría dejar:

| `level` | `code` | `message` |
| --- | --- | --- |
| `error` | `file_sum_mismatch` | «Hoja DEE_Mensual, serie SIN+GCE+ME+GD_UPME, abr-2026: la suma de componentes no da la serie publicada» |
| `warning` | `known_gap` | «XM devolvió vacío para DemaReal del 2022-08-08 al 2022-08-27 (hueco conocido)» |
| `warning` | `day_incomplete` | «DemaSIN 2026-11-14: día con menos de 24 horas; queda anómalo» |
| `info` | `retries` | «2 reintentos por tiempo de espera de XM» |
