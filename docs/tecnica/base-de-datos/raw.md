# Esquema `raw`

**Para qué existe:** guardar los datos **tal como llegan** de cada fuente, antes de limpiarlos (BD-03). Es la evidencia de qué entregó la fuente y cuándo: si un dato de `core` parece raro, aquí se ve qué llegó realmente.

**Quién lo usa:** solo los flujos de carga. La API y las vistas no lo leen nunca (PDA-01).

## Reglas

- **Solo se agrega.** Nada se modifica ni se borra (PBD-05).
- **Solo se guarda lo nuevo.** Si una consulta trae exactamente lo mismo que la anterior consulta igual (misma huella en `operacion.extractions`), no se vuelve a guardar el contenido; queda solo el registro de la consulta.
- **Una tabla por forma de dato**, no una por variable ni una sola para todo. Ver abajo.
- Columnas en inglés y comentarios en español, también aquí (PBD-01). Las columnas comunes son `source`, `loaded_at` y, cuando aplica, `source_file`.

## Tablas

| Tabla | Qué guarda | Columnas principales | Nota |
| --- | --- | --- | --- |
| `xm_sinergox_values` | Valores de la API SINERGOX de XM como llegan | `extraction_id`, `metric` (`DemaSIN`, `DemaReal`…), `entity` (`Sistema`, `Agente`…), `code`, `date`, `hour` (vacía en las diarias), `value_text`, `loaded_at` | Todas las métricas de SINERGOX tienen la misma forma, así que van en una sola tabla |
| `files` | Cada archivo recibido: anexos de revisiones (Excel), informes (PDF) | `id`, `source`, `file_name`, `sha256`, `size_bytes`, `content` (binario), `revision_code`, `received_at`, `load_run_id`, `loaded_at` | El mismo archivo (misma huella) no se carga dos veces |
| `file_cells` | Las celdas con dato de cada hoja de un archivo | `file_id`, `sheet`, `row_index`, `col_index`, `header_path` («DEE_Mensual › SIN+GCE+ME+GD_UPME › IC Superior 95 %»), `value_text`, `value_num` | Permite volver a leer un anexo sin el archivo y depurar el lector |

Las consultas a las fuentes (qué se pidió, cuándo, respuesta, huella) no van aquí sino en [`operacion.extractions`](operacion.md), porque son de operación y siguen existiendo aunque cambie el origen de una fuente.

## Una tabla por forma de dato

- **SINERGOX:** todas sus métricas tienen la misma estructura (código, fecha, valor o 24 horas), así que una sola tabla con una columna `metric` sirve para todas. Una métrica nueva no exige migración.
- **SIMEM** (cuando se cargue): cada conjunto de datos tiene columnas distintas, así que va una tabla por conjunto que se use (`raw.xm_simem_<id>_values`), no los 399. Los muy grandes (generación por planta, ≈ 1,8 millones de filas por mes) se llevan a `core` ya agregados y se particionan por mes.
- **Una fuente nueva** con otra forma tiene su propia tabla (`raw.<fuente>_values`) y su ficha (PFU-01).

**Rendimiento:** `raw` solo se lee por extracción o por métrica y rango de fechas, con índice. Unos millones de filas no son un problema para PostgreSQL. Si una tabla crece mucho, se particiona por métrica o por año, sin cambiar cómo se consulta.

**Volumen esperado de SINERGOX:** `DemaSIN` diaria desde 2000 son unas 9 800 filas. Las horarias se guardan una fila por hora (XM las entrega con 24 columnas por día): unas 235 000 filas por métrica. Más lo que XM corrige, que solo se guarda si cambió.

## Ejemplo

XM devuelve para `DemaSIN` del 2026-03-14 el valor `"238900000.00000"` (texto, kWh). En `raw.xm_sinergox_values` queda así, con su `extraction_id`. En `staging` se convierte a 238,90 GWh. Cuando XM lo corrige a `"239120000.00000"`, la extracción nueva trae otra huella y se guarda la fila nueva; la anterior se conserva.

## Archivos de las revisiones

Los anexos y los informes de la UPME se guardan **en la base**, en `raw.files` (contenido binario y huella). Hoy son unos 30 MB en total, entran en los respaldos diarios (BD-07) y no requieren tecnología nueva. La tabla está pensada para que el contenido pase después a un almacenamiento de archivos (por ejemplo, una carpeta del servidor de la UPME o un servicio de la nube) cambiando solo la columna `content` por una ruta, cuando TI defina la infraestructura (TEC-05). Los archivos no van al repositorio.
