# Esquema `core`

**Para qué existe:** guarda las **entidades del producto** (BD-03): los catálogos que describen los datos, las revisiones publicadas de las proyecciones, los datos reales versionados y su calidad. Es la fuente de verdad que leen la API y las vistas internas.

**Quién lo escribe:** los flujos de carga (desde `staging`) y las personas cuando deciden sobre una anomalía o publican una revisión. **Quién lo lee:** la API, las vistas internas y las vistas de `publicacion`.

Energía eléctrica (EE) y gas natural (GN) usan las mismas tablas: lo que cambia entre productos está en los catálogos.

## Catálogos

Cada catálogo tiene un código estable en inglés y `snake_case` (la llave), un nombre visible en español y una descripción. Los códigos llevan prefijo de producto o fuente (`ee_`, `gn_`, `xm_`, `dane_`) para que no choquen.

| Tabla | Qué guarda | Columnas principales | Ejemplos |
| --- | --- | --- | --- |
| `products` | Productos | `code`, `name` | `ee` Energía eléctrica, `gn` Gas natural |
| `measures` | Qué se mide, en qué unidad y cómo se agrega en el tiempo | `code`, `product`, `name`, `unit`, `aggregation` (`sum`, `max`, `mean`) | `ee_energy` (GWh, suma), `ee_peak_power` (MW, máximo), `gn_demand` (GBTUD, promedio; unidad por confirmar) |
| `geographies` | Territorio, con jerarquía | `code`, `product`, `name`, `level` (`national`, `area`, `region`, `node`), `parent` | EE: `ee_sin` → `ee_area_caribe`, `ee_area_oriente`, `ee_area_suroccidente`, `ee_area_antioquia`, `ee_area_nordeste`. GN: `gn_national` → 9 regiones → 82 nodos |
| `series` | Lo que se proyecta: una serie compuesta (EE) o un sector (GN) | `code`, `product`, `name`, `kind` (`base`, `composite`, `sector`, `total`), `is_comparable` | EE: `ee_sin`, `ee_sin_gce_me`, `ee_sin_gce_me_gd_upme`, `ee_sin_gce_me_gd_pnuma`. GN: `gn_residential`, `gn_industrial`… `gn_total` |
| `series_composition` | Cómo se forma una serie compuesta, para validar la suma al cargar | `series`, `part`, `part_kind` (serie o tipo de componente), `sign` (+1 suma, −1 resta) | `ee_sin_gce_me` = `ee_sin` + GCE + vehículos + trenes; `ee_sin_gce_me_gd_upme` = `ee_sin_gce_me` − GD UPME |
| `components` | Partes que forman las series de EE | `code`, `product`, `type` (`gce`, `ev`, `rail`, `gd_upme`, `gd_pnuma`), `name`, `geography` | `gce_rubiales`, `gce_serena_del_mar`, `ev_caribe`, `rail_metrobog`, `gd_upme_caribe` |
| `value_types` | Qué representa un número | `code`, `kind` (`scenario`, `interval`, `historical`), `level` (68, 95), `bound` (`upper`, `lower`) | `mid`, `low`, `high`, `ci95_upper`, `ci95_lower`, `ci68_upper`, `ci68_lower`, `historical` |
| `variables` | Toda variable observada o supuesta: demanda real, exógenas y supuestos | `code`, `name`, `kind` (`demand`, `exogenous`, `assumption`), `product`, `measure` o `unit`, `source`, `source_metric`, `source_entity`, `source_unit`, `factor`, `is_official_for_error` | `xm_demasin` (`DemaSIN`/`Sistema`, kWh → GWh, factor 10⁻⁶, oficial para el error), `xm_demareal`, `xm_demacome`, `xm_expoener`, `xm_demamaxpot`, `dane_gdp_real`, `ideam_temp_mean`, `gd_capacity_upme` |
| `sources` | Cada fuente y cómo se versiona | `code`, `entity`, `name`, `url`, `license`, `frequency`, `versioning` (`snapshot` o `source_version`), `doc_page` | `xm_sinergox` (snapshot), `xm_simem` (source_version), `upme_annex`, `dane`, `ideam` |
| `aliases` | Otros nombres de cualquier código, por revisión o fuente | `entity` (`revision`, `series`, `component`, `geography`), `code`, `alias`, `revision`, `note` | «ver_Ago2026» → revisión `2026-07`; «SIN+GCE+ME+GD» → `ee_sin_gce_me_gd_upme`; «Dt Serena del Mar Fase 1 y 2» → `gce_serena_del_mar` |

**Por qué hay `value_types`:** las revisiones de EE traen escenario medio con intervalos de confianza del 68 % y del 95 %, y las de GN traen escenarios bajo, medio y alto. Las dos formas caben en la misma tabla sin columnas nuevas.

**Por qué hay `series_composition`:** la serie con GD es la serie con GCE y ME *menos* la GD. Los componentes se guardan siempre positivos y el signo lo pone la composición (PDA-07). Así, la carga verifica que la serie publicada sea la suma de sus partes (PDA-06), y la cifra oficial nunca se recalcula.

## Revisiones publicadas

### `revisions`

Una fila por revisión y producto. Una revisión publicada nunca se modifica: si tiene un error, se publica una corrección con otro código (P-0003).

| Columna | Qué es | Ejemplo (Rev. Julio 2026 de EE) |
| --- | --- | --- |
| `id` | Identificador interno | 12 |
| `product`, `code` | Producto y código único: año y mes del informe oficial; la corrección lleva sufijo | `ee`, `2026-07` (su corrección sería `2026-07.1`) |
| `name` | Nombre oficial | «Rev. Julio 2026» |
| `published_on` | Fecha de publicación | El día exacto se confirma con el equipo; el informe dice julio de 2026 |
| `data_cutoff` | Corte del dato real que usó | 2026-03-31 |
| `source_consulted_on` | Día en que se consultaron los datos de la fuente | 2026-04-14 (consulta a XM) |
| `first_projected_period` | Primer mes proyectado | 2026-04-01 |
| `horizon_end` | Último periodo proyectado | 2040-12-01 |
| `model` | Modelo o método, en texto (el catálogo de modelos queda para la fase 2) | «Combinación de pronósticos VAR endógeno 22 %, VAR exógeno 56 %, VEC 22 %» |
| `document_url`, `annex_file` | Informe oficial y archivo de datos (enlace a `raw.files`) | El PDF y el anexo «ver_Ago2026» |
| `status` | `draft`, `in_review`, `approved`, `published`, `superseded` (UX-03) | `published` |
| `supersedes_id` | Revisión que esta corrige | vacío |
| `notes`, `source`, `loaded_at` | Notas, fuente y fecha de carga | — |

`published_on`, `data_cutoff`, `model` y `document_url` son obligatorios: sin ellos no hay procedencia (BD-06). Los otros nombres de la revisión («ver_Ago2026») van en `aliases`.

### `revision_values`

Los números publicados de las series. **Llave:** `revision_id` + `series` + `measure` + `geography` + `frequency` (`M` o `A`) + `period` + `value_type`. **Otras columnas:** `value` (en la unidad de la medida) y `basis`, que dice si el valor es proyectado (`projected`) o mezcla meses reales y proyectados (`mixed`, como el total anual del primer año). Los valores heredan la procedencia de su revisión, y así lo dice el comentario de la tabla.

### `revision_component_values`

Los números de cada componente. **Llave:** `revision_id` + `component` + `measure` + `frequency` + `period`. El `value` va **siempre positivo**, como lo publican las revisiones desde jul-2025, aunque algunos anexos anteriores traen la GD negativa (PDA-07). La resta la aplica `series_composition`.

### `revision_components`

Los atributos de cada componente en una revisión: nombre tal como se publicó, grupo de los GCE (1: ya conectado al SIN; 2: por conectar), área, fecha prevista de entrada, capacidad (MW) y radicado. **Llave:** `revision_id` + `component`. Así se sigue un mismo proyecto entre revisiones aunque cambie su nombre (con `aliases`).

### `revision_assumptions`

Los supuestos con forma de serie: PIB, población, temperatura por área, capacidad instalada de GD. **Llave:** `revision_id` + `variable` + `geography` + `frequency` + `period` + `value_type`.

## Datos observados versionados

### `observed_values`

Una sola tabla para toda variable real de cualquier fuente: demanda de XM, PIB del DANE, temperatura del IDEAM.

| Columna | Qué es | Ejemplo |
| --- | --- | --- |
| `variable` | Qué se observó (el catálogo dice fuente, métrica y unidad) | `xm_demasin` |
| `geography` | Dónde | `ee_sin` |
| `frequency` | `H` horaria, `D` diaria, `M` mensual, `Q` trimestral, `A` anual | `D` |
| `period` | Inicio del periodo, en hora de Colombia | 2026-03-14 00:00 |
| `version` | 1, 2, 3… por periodo; nunca se repite | 2 |
| `value` | Valor en la unidad del catálogo, ya convertido | 239,12 GWh |
| `source_version` | Versión propia de la fuente, si la trae | vacío en SINERGOX; `TXF` en SIMEM |
| `quality_status` | `provisional`, `anomalous`, `accepted`, `rejected` | `accepted` |
| `loaded_at` | Fecha y hora de carga | 2026-11-15 03:10 |
| `load_run_id`, `extraction_id` | Carga y consulta de donde salió (`operacion`) | 3140 |

**Llave:** `variable` + `geography` + `frequency` + `period` + `version`. Solo se agrega una fila cuando el valor es nuevo o cambió; el valor de una fila nunca se modifica (PBD-05). Lo único que cambia es `quality_status`, cuando una persona acepta o rechaza una anomalía.

**Lectura:**

- `observed_current`: el valor vigente, que es la versión máxima **aceptada** de cada periodo. Lo usan el error y los indicadores.
- `observed_latest`: lo aceptado más lo provisional, marcado. Lo usan los gráficos y «El sistema hoy», para que se vean los días recientes que la fuente todavía puede corregir (PRI-03).
- `observed_as_of(at_time)`: función que devuelve lo que se sabía en una fecha, que es la versión máxima aceptada cargada hasta ese momento. Con `revisions.source_consulted_on` reconstruye el dato que tuvo cada revisión.
- `observed_monthly` y `observed_annual`: agregados calculados desde lo diario u horario vigente con la regla de la medida (la energía se suma; la potencia máxima toma el máximo; sin medida, el promedio), con `source_frequency`, `days_with_data`, `days_in_period` e `is_complete`. Un mes incompleto se marca, no se escala.

**Volumen y rendimiento:** diez variables horarias en 25 años son 2 o 3 millones de filas, que con el índice de la llave se consultan de inmediato. La tabla se **particiona por frecuencia** para que lo horario (incluido el que usen los modelos de la fase 2) no afecte las consultas diarias, mensuales y anuales que cruzan con las revisiones.

## Calidad de los datos

| Tabla | Qué guarda | Columnas principales |
| --- | --- | --- |
| `anomaly_rules` | Reglas de detección por fuente o variable, con sus umbrales (documentadas en la ficha de la fuente) | `code`, `variable` o `source`, `description`, `params`, `active` |
| `data_anomalies` | Cada dato que no pasó una regla y la decisión sobre él | el dato (`variable`, `geography`, `frequency`, `period`, `version`), `rule`, `load_run_id`, `detected_at`, `status` (`open`, `accepted`, `rejected`, `closed_by_source`), `decided_by`, `decided_at`, `reason` |
| `observed_changes` | Cada cambio de valor entre versiones | el dato, `old_version`, `new_version`, `old_value`, `new_value`, `diff`, `diff_pct`, `load_run_id`, `detected_at`, `reason` |
| `data_alerts` | Avisos: una revisión usó un dato que después cambió o quedó anómalo | `revision_id`, el dato, `used_version`, `current_version`, `diff_pct`, `created_at`, `status` (`open`, `seen`, `closed`), `note` |

**Estado de un dato y qué ve la app:**

- `accepted`: entra a los cálculos y a las vistas.
- `provisional`: se puede mostrar marcado, pero no entra al error.
- `anomalous` y `rejected`: no se usan.

Una versión nueva no reemplaza a la vigente hasta quedar `accepted` (PDA-02). Quién puede aceptar o rechazar está pendiente (X-24).

## Ejemplos

**1. Revisión 2026-07 de EE, abril de 2026, serie con GD de la UPME** (cifras del anexo «ver_Ago2026», GWh), en `revision_values`:

| series | measure | geography | frequency | period | value_type | value | basis |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ee_sin_gce_me_gd_upme` | `ee_energy` | `ee_sin` | `M` | 2026-04-01 | `mid` | 7 169,10 | `projected` |
| `ee_sin_gce_me_gd_upme` | `ee_energy` | `ee_sin` | `M` | 2026-04-01 | `ci95_upper` | 7 334,83 | `projected` |
| `ee_sin_gce_me_gd_upme` | `ee_energy` | `ee_sin` | `M` | 2026-04-01 | `ci95_lower` | 7 003,77 | `projected` |
| `ee_sin_gce_me_gd_upme` | `ee_energy` | `ee_sin` | `M` | 2026-04-01 | `ci68_upper` | 7 258,31 | `projected` |
| `ee_sin_gce_me_gd_upme` | `ee_energy` | `ee_sin` | `M` | 2026-04-01 | `ci68_lower` | 7 080,09 | `projected` |
| `ee_sin_gce_me_gd_upme` | `ee_energy` | `ee_sin` | `A` | 2026-01-01 | `mid` | 90 805,54 | `mixed` (enero a marzo reales) |

**2. Componentes del mismo mes**, en `revision_component_values`: `gce_rubiales` = 137,54 GWh y `gd_upme_caribe` = 51,73 GWh. En el anexo de ago-2026 la GD viene positiva y se resta; en el de dic-2024 viene negativa y se suma. Aquí las dos quedan positivas.

**3. Un GCE con nombres distintos**, en `aliases`: `gce_serena_del_mar` ← «Dt Serena del Mar Fase1» y «Dt Serena del Mar Fase2» (dic-2023 a dic-2024) y «Dt Serena del Mar Fase 1 y 2» (desde jul-2025). Las equivalencias dudosas las confirma el equipo de modelación (X-23).

**4. Gas natural, residencial nacional, dic-2042** (anexo de abr-2026): `series` = `gn_residential`, `geography` = `gn_national`, `frequency` = `M`, y tres filas con `value_type` `low` = 167,55, `mid` = 182,58 y `high` = 197,59. Son las mismas tablas, sin columnas nuevas.

**5. Dato real versionado** (cifras de ejemplo): `xm_demasin`, `ee_sin`, `D`, 2026-03-14 tiene la versión 1 = 238,90 GWh (cargada el 2026-03-16) y la versión 2 = 239,12 GWh (cargada el 2026-11-15).

- `observed_current` da 239,12.
- `observed_as_of('2026-04-14')`, el día en que la revisión 2026-07 consultó a XM, da 238,90.
- El cambio queda en `observed_changes`, y el aviso a la revisión 2026-07 en `data_alerts`.
