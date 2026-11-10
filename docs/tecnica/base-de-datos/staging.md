# Esquema `staging`

**Para qué existe:** es la **frontera** entre las fuentes y el producto. Aquí llegan los datos ya validados y normalizados, con los códigos de los catálogos y en unidades canónicas, con **la misma forma para todas las fuentes** (el contrato, PDA-01). Cada fuente tiene su `raw` y su lector, pero todas entregan aquí lo mismo.

**Por qué importa:** si mañana una fuente cambia de origen (por ejemplo, a una base de datos común de la UPME), solo cambia su lector, que sigue llenando estas tablas. `core`, la API y las vistas no se enteran.

**Quién lo usa:** solo los flujos de carga.

## Tablas (el contrato)

| Tabla | Qué guarda | Columnas |
| --- | --- | --- |
| `observed_values` | Valores reales de cualquier variable y fuente | `load_run_id`, `variable`, `geography`, `frequency`, `period`, `value` (unidad del catálogo), `source_version`, `quality_status` propuesto, `rule_results` (qué reglas pasó o no) |
| `revision_values` | Valores publicados de las series de una revisión | La misma forma que [`core.revision_values`](core.md#revisiones-publicadas), con `load_run_id` y la revisión como `product` + `revision_code` (en `core` se convierte en `revision_id`) |
| `revision_component_values` | Valores de los componentes de una revisión | Igual que en `core`, con `load_run_id`, `product` y `revision_code` |
| `revision_components` | Atributos de cada componente en esa revisión (GCE con grupo, área, entrada, capacidad, radicado) | Igual que en `core`, con `load_run_id`, `product` y `revision_code` |
| `revision_assumptions` | Supuestos con forma de serie (PIB, población, temperatura, capacidad de GD) | Igual que en `core`, con `load_run_id`, `product` y `revision_code` |

## Qué pasa en `staging`

1. **Normalizar:** unidades (kWh → GWh, kW → MW), formato (de 24 columnas horarias a una fila por hora), nombres (alias → código del catálogo) y convenciones entre versiones (PDA-07).
2. **Validar:** reglas de anomalía de la ficha de la fuente (PDA-02) e identidades de los archivos publicados (PDA-06).
3. **Pasar a `core`:** se compara cada valor con su versión vigente. Solo lo nuevo o cambiado crea una versión; los cambios y las anomalías se registran; la bitácora resume la carga (PDA-05).
4. **Limpiar:** después de una carga exitosa, las filas de esa carga se borran de `staging`. La historia queda en `raw` y en `core`.

## Ejemplo

El anexo de la revisión 2026-07 trae «Demanda Energía Eléctrica SIN+GCE+ME+GD_UPME (GWh-mes)», columna «IC Superior 95 %», abril de 2026: 7 334,83. En `staging.revision_values` queda con `series` = `ee_sin_gce_me_gd_upme`, `measure` = `ee_energy`, `geography` = `ee_sin`, `frequency` = `M`, `period` = 2026-04-01, `value_type` = `ci95_upper`, `value` = 7 334,83. Ya no importa cómo lo llamó el archivo.
