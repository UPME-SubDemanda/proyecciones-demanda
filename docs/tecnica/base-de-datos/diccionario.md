# Diccionario de la base de datos

Cada esquema, tabla, vista, función y columna con su comentario en la base (PBD-01).

Generado por `scripts/diccionario.py` desde una base con las migraciones aplicadas. No editar a mano: cambie el comentario en una migración y regenere (PBD-03). Explicación de cada esquema, con contexto y ejemplos: [Base de datos](index.md).

## `raw`

Datos tal como llegan de cada fuente, sin limpiar. Solo se agrega; lo leen solo los flujos de carga (BD-03, PBD-05).

### `raw.file_cells`

*Tabla.* Celdas con dato de cada hoja de un archivo, para releerlo sin el archivo y depurar el lector

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `file_id` | bigint | Sí | Sí | Archivo |
| `sheet` | character varying(100) | Sí | Sí | Hoja |
| `row_index` | integer | Sí | Sí | Fila (desde 1) |
| `col_index` | integer | Sí | Sí | Columna (desde 1) |
| `header_path` | text | No |  | Ruta de encabezados de la celda (hoja › serie › tipo de valor) |
| `value_text` | text | No |  | Valor como texto |
| `value_num` | numeric | No |  | Valor numérico, si lo es |

### `raw.files`

*Tabla.* Archivos recibidos (anexos y informes de las revisiones), tal cual

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `id` | bigint | Sí | Sí | Identificador del archivo |
| `source` | character varying(40) | Sí |  | Fuente del archivo (por ejemplo upme_annex) |
| `file_name` | character varying(300) | Sí |  | Nombre del archivo como llegó |
| `sha256` | character varying(64) | Sí |  | Huella SHA-256; el mismo archivo no se carga dos veces |
| `size_bytes` | bigint | Sí |  | Tamaño en bytes |
| `content` | bytea | Sí |  | Contenido del archivo (puede pasar a un almacenamiento externo, ver raw.md) |
| `revision_code` | character varying(20) | No |  | Código de la revisión a la que pertenece, si aplica |
| `received_at` | timestamp with time zone | No |  | Cuándo se recibió el archivo |
| `load_run_id` | bigint | No |  | Carga que lo guardó |
| `loaded_at` | timestamp with time zone | Sí |  | Fecha y hora de carga (created_at de BD-06) |

### `raw.xm_sinergox_values`

*Tabla.* Valores de la API SINERGOX de XM tal como llegan; una tabla para todas sus métricas

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `id` | bigint | Sí | Sí | Identificador de la fila |
| `extraction_id` | bigint | Sí |  | Consulta de donde salió |
| `metric` | character varying(40) | Sí |  | Métrica de XM (DemaSIN, DemaReal…) |
| `entity` | character varying(40) | Sí |  | Entidad de XM (Sistema, Agente…) |
| `code` | character varying(80) | Sí |  | Código del agente, recurso o sistema |
| `date` | date | Sí |  | Día |
| `hour` | smallint | No |  | Hora de 1 a 24 (Hour01 = 00:00–01:00); vacía en las diarias |
| `value_text` | character varying(40) | No |  | Valor como llega (texto, en la unidad de XM) |
| `source` | character varying(40) | Sí |  | Fuente |
| `loaded_at` | timestamp with time zone | Sí |  | Fecha y hora de carga (created_at de BD-06) |

## `staging`

Datos validados y normalizados con la misma forma para todas las fuentes: el contrato entre las fuentes y core (PDA-01).

### `staging.observed_values`

*Tabla.* Valores reales normalizados de cualquier fuente, antes de versionarlos en core (contrato, PDA-01)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `load_run_id` | bigint | Sí | Sí | Carga que dejó la fila |
| `variable` | character varying(60) | Sí | Sí | Variable (core.variables) |
| `geography` | character varying(80) | Sí | Sí | Geografía |
| `frequency` | character varying(1) | Sí | Sí | H, D, M, Q o A |
| `period` | timestamp without time zone | Sí | Sí | Inicio del periodo, hora de Colombia |
| `value` | numeric(24,12) | Sí |  | Valor normalizado, en la unidad de la variable |
| `source_version` | character varying(20) | No |  | Versión propia de la fuente, si la trae |
| `quality_status` | character varying(12) | Sí |  | Estado propuesto por las reglas |
| `rule_results` | jsonb | Sí |  | Qué reglas pasó o no |
| `extraction_id` | bigint | No |  | Consulta de donde salió |

### `staging.revision_assumptions`

*Tabla.* Supuestos de una revisión, normalizados (contrato, PDA-01)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `load_run_id` | bigint | Sí | Sí | Carga que dejó la fila |
| `product` | character varying(10) | Sí | Sí | Producto de la revisión |
| `revision_code` | character varying(20) | Sí | Sí | Código de la revisión (en core se convierte en revision_id) |
| `variable` | character varying(60) | Sí | Sí | Variable supuesta |
| `geography` | character varying(80) | Sí | Sí | Geografía |
| `frequency` | character varying(1) | Sí | Sí | H, D, M, Q o A |
| `period` | date | Sí | Sí | Inicio del periodo |
| `value_type` | character varying(20) | Sí | Sí | Escenario |
| `value` | numeric(24,12) | Sí |  | Valor supuesto |

### `staging.revision_component_values`

*Tabla.* Valores de los componentes de una revisión, normalizados (contrato, PDA-01)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `load_run_id` | bigint | Sí | Sí | Carga que dejó la fila |
| `product` | character varying(10) | Sí | Sí | Producto de la revisión |
| `revision_code` | character varying(20) | Sí | Sí | Código de la revisión (en core se convierte en revision_id) |
| `component` | character varying(80) | Sí | Sí | Componente (core.components) |
| `measure` | character varying(40) | Sí | Sí | Medida |
| `frequency` | character varying(1) | Sí | Sí | M o A |
| `period` | date | Sí | Sí | Inicio del periodo |
| `value` | numeric(24,12) | Sí |  | Valor positivo, ya normalizado (PDA-07) |

### `staging.revision_components`

*Tabla.* Atributos de los componentes de una revisión (contrato, PDA-01)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `load_run_id` | bigint | Sí | Sí | Carga que dejó la fila |
| `product` | character varying(10) | Sí | Sí | Producto de la revisión |
| `revision_code` | character varying(20) | Sí | Sí | Código de la revisión (en core se convierte en revision_id) |
| `component` | character varying(80) | Sí | Sí | Componente (core.components) |
| `published_name` | character varying(200) | Sí |  | Nombre tal como se publicó |
| `gce_group` | smallint | No |  | Grupo del GCE (1 o 2) |
| `geography` | character varying(80) | No |  | Área |
| `entry_date` | date | No |  | Fecha prevista de entrada |
| `capacity_mw` | numeric(14,4) | No |  | Capacidad (MW) |
| `filing_number` | character varying(60) | No |  | Radicado |

### `staging.revision_values`

*Tabla.* Valores de las series de una revisión, normalizados (contrato, PDA-01)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `load_run_id` | bigint | Sí | Sí | Carga que dejó la fila |
| `product` | character varying(10) | Sí | Sí | Producto de la revisión |
| `revision_code` | character varying(20) | Sí | Sí | Código de la revisión (en core se convierte en revision_id) |
| `series` | character varying(60) | Sí | Sí | Serie |
| `measure` | character varying(40) | Sí | Sí | Medida |
| `geography` | character varying(80) | Sí | Sí | Geografía |
| `frequency` | character varying(1) | Sí | Sí | M o A |
| `period` | date | Sí | Sí | Inicio del periodo |
| `value_type` | character varying(20) | Sí | Sí | Tipo de valor |
| `value` | numeric(24,12) | Sí |  | Valor publicado |
| `basis` | character varying(10) | Sí |  | projected o mixed |

## `core`

Entidades del producto: catálogos, revisiones publicadas, datos reales versionados y su calidad. Lo leen la API y las vistas internas.

### `core.aliases`

*Tabla.* Otros nombres de cualquier código, por revisión o fuente

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `id` | integer | Sí | Sí | Identificador |
| `entity` | character varying(12) | Sí |  | Qué se nombra: revision, series, component o geography |
| `code` | character varying(80) | Sí |  | Código del catálogo al que equivale |
| `alias` | character varying(200) | Sí |  | Otro nombre (como aparece en un archivo o informe) |
| `revision_id` | integer | No |  | Revisión en la que aparece ese nombre, si aplica |
| `note` | text | No |  | Nota, por ejemplo quién confirmó la equivalencia |

### `core.anomaly_rules`

*Tabla.* Reglas de detección de datos anómalos por fuente o variable (PDA-02)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `code` | character varying(60) | Sí | Sí | Código de la regla (por ejemplo day_incomplete) |
| `variable` | character varying(60) | No |  | Variable a la que aplica, si es específica |
| `source` | character varying(40) | No |  | Fuente a la que aplica, si es general |
| `description` | text | Sí |  | Qué detecta, en palabras |
| `params` | jsonb | Sí |  | Umbrales y parámetros (X-24) |
| `active` | boolean | Sí |  | Si se aplica en las cargas |

### `core.components`

*Tabla.* Partes que forman las series compuestas de EE (GCE, movilidad eléctrica, GD)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `code` | character varying(80) | Sí | Sí | Código del componente (por ejemplo gce_rubiales) |
| `product` | character varying(10) | Sí |  | Producto |
| `type` | character varying(10) | Sí |  | gce, ev (vehículos eléctricos), rail (trenes), gd_upme o gd_pnuma |
| `name` | character varying(150) | Sí |  | Nombre visible |
| `geography` | character varying(80) | No |  | Área o región, si aplica |

### `core.data_alerts`

*Tabla.* Avisos: una revisión usó un dato que después cambió o quedó anómalo (PDA-04)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `id` | bigint | Sí | Sí | Identificador |
| `revision_id` | integer | Sí |  | Revisión que usó el dato |
| `variable` | character varying(60) | Sí |  | Variable del dato |
| `geography` | character varying(80) | Sí |  | Geografía del dato |
| `frequency` | character varying(1) | Sí |  | Frecuencia del dato |
| `period` | timestamp without time zone | Sí |  | Periodo del dato |
| `used_version` | integer | Sí |  | Versión que usó la revisión |
| `current_version` | integer | Sí |  | Versión vigente hoy |
| `diff_pct` | numeric(12,6) | No |  | Diferencia entre las dos versiones, en % |
| `created_at` | timestamp with time zone | Sí |  | Cuándo se creó el aviso |
| `status` | character varying(10) | Sí |  | open, seen o closed |
| `note` | text | No |  | Nota del modelador o analista |

### `core.data_anomalies`

*Tabla.* Cada dato que no pasó una regla y la decisión de una persona sobre él (PDA-02)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `id` | bigint | Sí | Sí | Identificador |
| `variable` | character varying(60) | Sí |  | Variable del dato |
| `geography` | character varying(80) | Sí |  | Geografía del dato |
| `frequency` | character varying(1) | Sí |  | Frecuencia del dato |
| `period` | timestamp without time zone | Sí |  | Periodo del dato |
| `version` | integer | Sí |  | Versión marcada como anómala |
| `rule` | character varying(60) | Sí |  | Regla que no pasó |
| `load_run_id` | bigint | No |  | Carga que la detectó |
| `detected_at` | timestamp with time zone | Sí |  | Cuándo se detectó |
| `status` | character varying(20) | Sí |  | open, accepted, rejected o closed_by_source |
| `decided_by` | integer | No |  | Persona que la aceptó o rechazó (auth.users) |
| `decided_at` | timestamp with time zone | No |  | Cuándo se decidió |
| `reason` | text | No |  | Por qué se aceptó o rechazó, o cómo se cerró |

### `core.geographies`

*Tabla.* Territorio con jerarquía: EE nacional → área; GN nacional → región → nodo

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `code` | character varying(80) | Sí | Sí | Código de la geografía (por ejemplo ee_area_caribe) |
| `product` | character varying(10) | Sí |  | Producto |
| `name` | character varying(150) | Sí |  | Nombre visible |
| `level` | character varying(10) | Sí |  | national, area, region o node |
| `parent` | character varying(80) | No |  | Geografía que la contiene; vacío en la nacional |

### `core.measures`

*Tabla.* Qué se mide, en qué unidad y cómo se agrega en el tiempo

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `code` | character varying(40) | Sí | Sí | Código de la medida (por ejemplo ee_energy) |
| `product` | character varying(10) | Sí |  | Producto |
| `name` | character varying(120) | Sí |  | Nombre visible |
| `unit` | character varying(20) | Sí |  | Unidad en la que se guardan los valores (GWh, MW, GBTUD) |
| `aggregation` | character varying(10) | Sí |  | Cómo se agrega en el tiempo: sum, max o mean |

### `core.observed_annual`

*Vista.* Agregado anual desde lo diario u horario vigente, con la regla de la medida; un año incompleto se marca

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `variable` | character varying(60) | No |  | Variable |
| `geography` | character varying(80) | No |  | Geografía |
| `source_frequency` | character varying(1) | No |  | Frecuencia de origen (H o D) |
| `period` | date | No |  | Primer día del año |
| `value` | numeric | No |  | Valor agregado (suma, máximo o promedio según la medida) |
| `days_with_data` | bigint | No |  | Días con dato |
| `days_in_period` | integer | No |  | Días del año |
| `is_complete` | boolean | No |  | Si el año tiene todos sus días (y horas, en horaria) |

### `core.observed_changes`

*Tabla.* Cada cambio de valor entre versiones de un dato observado (PBD-05, PDA-03)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `id` | bigint | Sí | Sí | Identificador |
| `variable` | character varying(60) | Sí |  | Variable del dato |
| `geography` | character varying(80) | Sí |  | Geografía del dato |
| `frequency` | character varying(1) | Sí |  | Frecuencia del dato |
| `period` | timestamp without time zone | Sí |  | Periodo del dato |
| `old_version` | integer | Sí |  | Versión anterior |
| `new_version` | integer | Sí |  | Versión nueva |
| `old_value` | numeric(24,12) | Sí |  | Valor anterior |
| `new_value` | numeric(24,12) | Sí |  | Valor nuevo |
| `diff` | numeric(24,12) | Sí |  | Diferencia (nuevo − anterior) |
| `diff_pct` | numeric(12,6) | No |  | Diferencia en % |
| `load_run_id` | bigint | No |  | Carga que lo detectó |
| `detected_at` | timestamp with time zone | Sí |  | Cuándo se detectó |
| `reason` | text | No |  | Motivo conocido (por ejemplo «la fuente completó el día») |

### `core.observed_current`

*Vista.* Valor vigente de cada periodo: la versión máxima aceptada. La usan el error y los indicadores

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `variable` | character varying(60) | No |  | Variable |
| `geography` | character varying(80) | No |  | Geografía |
| `frequency` | character varying(1) | No |  | Frecuencia |
| `period` | timestamp without time zone | No |  | Inicio del periodo |
| `version` | integer | No |  | Versión vigente |
| `value` | numeric(24,12) | No |  | Valor vigente |
| `source_version` | character varying(20) | No |  | Versión de la fuente |
| `quality_status` | character varying(12) | No |  | Siempre accepted |
| `loaded_at` | timestamp with time zone | No |  | Cuándo se cargó la versión vigente |

### `core.observed_latest`

*Vista.* Lo aceptado más lo provisional, marcado: para gráficos y «El sistema hoy» (PRI-03)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `variable` | character varying(60) | No |  | Variable |
| `geography` | character varying(80) | No |  | Geografía |
| `frequency` | character varying(1) | No |  | Frecuencia |
| `period` | timestamp without time zone | No |  | Inicio del periodo |
| `version` | integer | No |  | Versión más reciente aceptada o provisional |
| `value` | numeric(24,12) | No |  | Valor |
| `source_version` | character varying(20) | No |  | Versión de la fuente |
| `quality_status` | character varying(12) | No |  | accepted o provisional |
| `loaded_at` | timestamp with time zone | No |  | Cuándo se cargó la versión |
| `is_provisional` | boolean | No |  | Si el valor todavía es provisional |

### `core.observed_monthly`

*Vista.* Agregado mensual desde lo diario u horario vigente, con la regla de la medida; un mes incompleto se marca

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `variable` | character varying(60) | No |  | Variable |
| `geography` | character varying(80) | No |  | Geografía |
| `source_frequency` | character varying(1) | No |  | Frecuencia de origen (H o D) |
| `period` | date | No |  | Primer día del mes |
| `value` | numeric | No |  | Valor agregado (suma, máximo o promedio según la medida) |
| `days_with_data` | bigint | No |  | Días con dato |
| `days_in_period` | integer | No |  | Días del mes |
| `is_complete` | boolean | No |  | Si el mes tiene todos sus días (y horas, en horaria) |

### `core.observed_values`

*Tabla particionada.* Dato real de cualquier fuente y variable, versionado: una fila por versión de cada periodo (PBD-05). Particionada por frecuencia

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `variable` | character varying(60) | Sí | Sí | Qué se observó (core.variables) |
| `geography` | character varying(80) | Sí | Sí | Dónde (core.geographies) |
| `frequency` | character varying(1) | Sí | Sí | H horaria, D diaria, M mensual, Q trimestral, A anual |
| `period` | timestamp without time zone | Sí | Sí | Inicio del periodo, en hora de Colombia (UTC−5) |
| `version` | integer | Sí | Sí | 1, 2, 3… por periodo; nunca se repite ni se modifica el valor (PBD-05) |
| `value` | numeric(24,12) | Sí |  | Valor en la unidad de la variable, ya convertido |
| `source_version` | character varying(20) | No |  | Versión propia de la fuente, si la trae (por ejemplo TXF en SIMEM) |
| `quality_status` | character varying(12) | Sí |  | provisional, anomalous, accepted o rejected (PDA-02). Es lo único que cambia en una fila |
| `loaded_at` | timestamp with time zone | Sí |  | Fecha y hora de carga (created_at de BD-06) |
| `load_run_id` | bigint | No |  | Carga que guardó la versión (operacion.load_runs) |
| `extraction_id` | bigint | No |  | Consulta de donde salió (operacion.extractions) |

### `core.observed_values_hourly`

*Partición.* Partición de core.observed_values con los datos horarios (H)

Columnas: las de `core.observed_values`.

### `core.observed_values_other`

*Partición.* Partición de core.observed_values con los datos diarios, mensuales, trimestrales y anuales

Columnas: las de `core.observed_values`.

### `core.products`

*Tabla.* Productos de la Subdirección de Demanda

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `code` | character varying(10) | Sí | Sí | Código del producto: ee o gn |
| `name` | character varying(100) | Sí |  | Nombre visible |

### `core.revision_assumptions`

*Tabla.* Supuestos con forma de serie de cada revisión (PIB, población, temperatura, capacidad de GD)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `revision_id` | integer | Sí | Sí | Revisión |
| `variable` | character varying(60) | Sí | Sí | Variable supuesta |
| `geography` | character varying(80) | Sí | Sí | Geografía |
| `frequency` | character varying(1) | Sí | Sí | H, D, M, Q o A |
| `period` | date | Sí | Sí | Inicio del periodo |
| `value_type` | character varying(20) | Sí | Sí | Escenario del supuesto |
| `value` | numeric(24,12) | Sí |  | Valor supuesto, en la unidad de la variable |

### `core.revision_component_values`

*Tabla.* Valores de cada componente en cada revisión. Heredan la procedencia de core.revisions

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `revision_id` | integer | Sí | Sí | Revisión |
| `component` | character varying(80) | Sí | Sí | Componente |
| `measure` | character varying(40) | Sí | Sí | Medida |
| `frequency` | character varying(1) | Sí | Sí | M mensual o A anual |
| `period` | date | Sí | Sí | Inicio del periodo |
| `value` | numeric(24,12) | Sí |  | Valor siempre positivo; la resta la aplica series_composition (PDA-07) |

### `core.revision_components`

*Tabla.* Atributos de cada componente en una revisión (grupo, área, entrada, capacidad, radicado)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `revision_id` | integer | Sí | Sí | Revisión |
| `component` | character varying(80) | Sí | Sí | Componente |
| `published_name` | character varying(200) | Sí |  | Nombre tal como se publicó en esa revisión |
| `gce_group` | smallint | No |  | Grupo del GCE: 1 conectado al SIN, 2 por conectar |
| `geography` | character varying(80) | No |  | Área |
| `entry_date` | date | No |  | Fecha prevista de entrada |
| `capacity_mw` | numeric(14,4) | No |  | Capacidad (MW) |
| `filing_number` | character varying(60) | No |  | Radicado ante la UPME |

### `core.revision_values`

*Tabla.* Valores publicados de las series de cada revisión. Heredan la procedencia de core.revisions

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `revision_id` | integer | Sí | Sí | Revisión |
| `series` | character varying(60) | Sí | Sí | Serie |
| `measure` | character varying(40) | Sí | Sí | Medida |
| `geography` | character varying(80) | Sí | Sí | Geografía |
| `frequency` | character varying(1) | Sí | Sí | M mensual o A anual |
| `period` | date | Sí | Sí | Inicio del periodo |
| `value_type` | character varying(20) | Sí | Sí | Tipo de valor |
| `value` | numeric(24,12) | Sí |  | Valor publicado, en la unidad de la medida |
| `basis` | character varying(10) | Sí |  | projected o mixed (suma meses reales y proyectados, como el anual del primer año) |

### `core.revisions`

*Tabla.* Revisiones de la proyección. Una publicada no se modifica: se corrige con otra (P-0003)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `id` | integer | Sí | Sí | Identificador interno |
| `product` | character varying(10) | Sí |  | Producto |
| `code` | character varying(20) | Sí |  | Año y mes del informe oficial (2026-07); la corrección lleva sufijo (2026-07.1) |
| `name` | character varying(120) | Sí |  | Nombre oficial (Rev. Julio 2026) |
| `published_on` | date | Sí |  | Fecha de publicación |
| `data_cutoff` | date | Sí |  | Corte del dato real que usó |
| `source_consulted_on` | date | No |  | Día en que se consultaron los datos de la fuente (para observed_as_of) |
| `first_projected_period` | date | No |  | Primer mes proyectado |
| `horizon_end` | date | No |  | Último periodo proyectado |
| `model` | character varying(300) | Sí |  | Modelo o método, en texto (catálogo de modelos en la fase 2) |
| `document_url` | character varying(500) | Sí |  | Informe oficial publicado |
| `annex_file_id` | bigint | No |  | Archivo de datos de la revisión |
| `status` | character varying(20) | Sí |  | draft, in_review, approved, published o superseded (UX-03) |
| `supersedes_id` | integer | No |  | Revisión que esta corrige (X-09) |
| `notes` | text | No |  | Notas |
| `source` | character varying(40) | Sí |  | Fuente de la revisión |
| `loaded_at` | timestamp with time zone | Sí |  | Fecha y hora de carga (created_at de BD-06) |

### `core.series`

*Tabla.* Lo que se proyecta: series compuestas de EE y sectores de GN

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `code` | character varying(60) | Sí | Sí | Código de la serie (por ejemplo ee_sin_gce_me_gd_upme) |
| `product` | character varying(10) | Sí |  | Producto |
| `name` | character varying(150) | Sí |  | Nombre visible |
| `kind` | character varying(10) | Sí |  | base, composite (serie compuesta), sector o total |
| `is_comparable` | boolean | Sí |  | Si es la serie que se compara con el dato real para el error (PER-01) |
| `description` | text | No |  | Qué incluye la serie |

### `core.series_composition`

*Tabla.* Cómo se forma cada serie compuesta; la carga verifica la suma con esto (PDA-06)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `series` | character varying(60) | Sí | Sí | Serie compuesta |
| `part` | character varying(80) | Sí | Sí | Serie o tipo de componente que la forma |
| `part_kind` | character varying(20) | Sí |  | series (otra serie) o component_type (un tipo de componente) |
| `sign` | smallint | Sí |  | 1 suma, -1 resta (los componentes se guardan positivos, PDA-07) |

### `core.sources`

*Tabla.* Fuentes de datos y cómo se versionan

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `code` | character varying(40) | Sí | Sí | Código de la fuente (por ejemplo xm_sinergox) |
| `entity` | character varying(80) | Sí |  | Entidad que publica (XM, UPME, DANE…) |
| `name` | character varying(150) | Sí |  | Nombre visible |
| `url` | character varying(500) | No |  | Dirección de la fuente |
| `license` | text | No |  | Licencia o condiciones de uso (X-04) |
| `frequency` | character varying(40) | No |  | Cada cuánto publica |
| `versioning` | character varying(20) | Sí |  | snapshot (cada consulta puede cambiar) o source_version (la fuente numera versiones) |
| `doc_page` | character varying(300) | No |  | Ficha de la fuente en la documentación (PFU-01) |

### `core.value_types`

*Tabla.* Qué representa un número: escenario (bajo, medio, alto) o límite de un intervalo

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `code` | character varying(20) | Sí | Sí | Código del tipo de valor (mid, ci95_upper…) |
| `name` | character varying(80) | Sí |  | Nombre visible |
| `kind` | character varying(10) | Sí |  | scenario, interval o historical |
| `level` | smallint | No |  | Nivel del intervalo (68 o 95); vacío si no es intervalo |
| `bound` | character varying(5) | No |  | upper o lower; vacío si no es intervalo |

### `core.variables`

*Tabla.* Toda variable observada o supuesta: demanda real, exógenas y supuestos

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `code` | character varying(60) | Sí | Sí | Código de la variable (por ejemplo xm_demasin) |
| `name` | character varying(150) | Sí |  | Nombre visible |
| `kind` | character varying(12) | Sí |  | demand (medidas reales de demanda), exogenous o assumption |
| `product` | character varying(10) | No |  | Producto, si aplica |
| `measure` | character varying(40) | No |  | Medida, si aplica (define cómo se agrega) |
| `unit` | character varying(40) | Sí |  | Unidad en la que se guardan los valores |
| `source` | character varying(40) | No |  | Fuente |
| `source_metric` | character varying(80) | No |  | Nombre de la métrica en la fuente (por ejemplo DemaSIN) |
| `source_entity` | character varying(80) | No |  | Entidad o agregación en la fuente (por ejemplo Sistema) |
| `source_unit` | character varying(40) | No |  | Unidad en la que llega de la fuente |
| `factor` | numeric(30,12) | Sí |  | Factor para pasar de la unidad de la fuente a la unidad guardada |
| `is_official_for_error` | boolean | Sí |  | Si es el dato real oficial para el cálculo del error (PER-01) |

### Funciones

| Función | Descripción |
| --- | --- |
| `core.observed_as_of(at_time timestamp with time zone)` | Lo que se sabía en una fecha: la versión máxima aceptada cargada hasta at_time (FLU-08) |

## `publicacion`

Solo lo publicable, para el portal, el modo pantalla y la API pública (TV-06). Vistas sobre core, etapa 5.

Sin tablas todavía.

## `auth`

Usuarios, roles y su asignación para el módulo de autenticación.

### `auth.roles`

*Tabla.* Roles de la aplicación

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `name` | character varying(50) | Sí | Sí | Código del rol: admin, approver, modeler o viewer |
| `description` | character varying(200) | Sí |  | Qué permite el rol, en palabras |

### `auth.user_roles`

*Tabla.* Qué roles tiene cada usuario

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `user_id` | integer | Sí | Sí | Usuario (auth.users.id) |
| `role_name` | character varying(50) | Sí | Sí | Rol asignado (auth.roles.name) |

### `auth.users`

*Tabla.* Usuarios: cuenta Google UPME o usuario local

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `id` | integer | Sí | Sí | Identificador interno del usuario |
| `email` | character varying(254) | Sí |  | Correo del usuario; único. Es su nombre de ingreso |
| `name` | character varying(200) | Sí |  | Nombre visible |
| `provider` | character varying(20) | Sí |  | Cómo ingresa: google (cuenta institucional) o local |
| `password_hash` | character varying(300) | No |  | Hash de la contraseña (solo cuentas locales; vacío en Google) |
| `active` | boolean | Sí |  | Si la cuenta puede ingresar |
| `created_at` | timestamp without time zone | No |  | Fecha de creación de la cuenta |

## `operacion`

Cómo funciona el sistema: bitácora y mensajes de las cargas, consultas a las fuentes y estado de cada fuente (PBD-07).

### `operacion.extractions`

*Tabla.* Cada consulta a una fuente: qué se pidió, cuándo, respuesta y huella (PBD-05)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `id` | bigint | Sí | Sí | Identificador de la consulta |
| `load_run_id` | bigint | Sí |  | Carga que hizo la consulta |
| `source` | character varying(40) | Sí |  | Fuente consultada (código de core.sources) |
| `request` | jsonb | Sí |  | Qué se pidió: métrica, entidad, rango, archivo |
| `requested_at` | timestamp with time zone | Sí |  | Cuándo se consultó |
| `http_status` | smallint | No |  | Respuesta HTTP de la fuente (vacío si no es una API) |
| `row_count` | integer | No |  | Filas recibidas |
| `content_hash` | character varying(64) | No |  | Huella SHA-256 del contenido; si es igual a la de la última consulta igual, no se guarda el contenido |
| `error` | text | No |  | Error de la consulta, si falló |

### `operacion.load_messages`

*Tabla.* Detalle de cada carga: una fila por error, advertencia o información (PDA-05)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `id` | bigint | Sí | Sí | Identificador del mensaje |
| `load_run_id` | bigint | Sí |  | Carga a la que pertenece |
| `level` | character varying(10) | Sí |  | error, warning o info |
| `code` | character varying(60) | Sí |  | Código del mensaje (por ejemplo file_sum_mismatch) |
| `message` | text | Sí |  | Mensaje legible, con el objeto afectado |
| `context` | jsonb | Sí |  | Objeto afectado: hoja, serie, periodo, celda, variable o extracción |
| `created_at` | timestamp with time zone | Sí |  | Fecha del mensaje |

### `operacion.load_runs`

*Tabla.* Bitácora: una fila por ejecución de cada flujo de carga, aunque no encuentre nada (PDA-05)

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `id` | bigint | Sí | Sí | Identificador de la carga |
| `flow` | character varying(80) | Sí |  | Flujo que corrió (por ejemplo ingest-observed-demand) |
| `source` | character varying(40) | Sí |  | Fuente consultada (código de core.sources) |
| `load_type` | character varying(10) | Sí |  | daily, weekly (conciliación), backfill (histórico) o file (archivo) |
| `started_at` | timestamp with time zone | Sí |  | Inicio de la carga |
| `finished_at` | timestamp with time zone | No |  | Fin de la carga; vacío mientras corre |
| `status` | character varying(20) | Sí |  | running, ok, ok_with_warnings o failed |
| `range_start` | date | No |  | Primer periodo consultado |
| `range_end` | date | No |  | Último periodo consultado |
| `n_queried` | integer | Sí |  | Periodos consultados |
| `n_new` | integer | Sí |  | Periodos nuevos guardados |
| `n_changed` | integer | Sí |  | Periodos que cambiaron y crearon una versión nueva |
| `n_unchanged` | integer | Sí |  | Periodos sin cambio (no se guardan) |
| `n_anomalous` | integer | Sí |  | Datos nuevos marcados como anómalos |
| `n_errors` | integer | Sí |  | Errores de la carga |
| `retries` | integer | Sí |  | Reintentos ante fallas de la fuente |
| `message` | text | No |  | Resumen legible de la carga (PDA-05) |
| `app_version` | character varying(20) | No |  | Versión de la app que ejecutó la carga (FLU-08) |

### `operacion.source_status`

*Tabla.* Estado de cada fuente, para detectar una fuente sin actualizar

| Columna | Tipo | Obligatoria | Llave | Descripción |
| --- | --- | --- | --- | --- |
| `source` | character varying(40) | Sí | Sí | Fuente (código de core.sources) |
| `last_success_at` | timestamp with time zone | No |  | Última carga exitosa |
| `last_period` | date | No |  | Último periodo disponible en la base |
| `days_stale` | integer | No |  | Días sin datos nuevos |
| `updated_at` | timestamp with time zone | Sí |  | Última actualización de esta fila |
