# Flujos de datos (Prefect)

Flujos de carga planeados para el modelo de datos v2 ([Base de datos](base-de-datos/index.md)). Ninguno está construido todavía: se hacen en la etapa 3 del plan (T-27 a T-31). La carga de prueba de T-24 (abajo) ya tiene el lector de anexos y el cliente de XM que usarán. Todo flujo registra cada consulta en `operacion.extractions`, deja su fila en la bitácora `operacion.load_runs` aunque no encuentre nada, y anota cada error o advertencia en `operacion.load_messages` (PDA-05).

| Flujo | Qué hace | Cuándo corre | Tablas que toca | Reglas | Notifica (1.2) |
| --- | --- | --- | --- | --- | --- |
| `load-published-revisions` | Lee un anexo de revisión de la UPME por sus encabezados, verifica sus sumas, normaliza las convenciones y lo carga | Cuando se publica una revisión; una vez para las históricas | `raw.files`, `raw.file_cells` → `staging.revision_*` → `core.revisions` y tablas de la revisión | PDA-06, PDA-07 | Revisión cargada o rechazada |
| `ingest-observed-demand` (diaria) | Consulta a XM SINERGOX los últimos días desde el último dato guardado; guarda solo lo nuevo o cambiado; aplica las reglas de anomalía | Todos los días (hora por definir, X-24) | `raw.xm_sinergox_values` → `staging.observed_values` → `core.observed_values`, `core.observed_changes`, `core.data_anomalies` | PBD-05, PDA-02 | Falla o fuente sin actualizar |
| `ingest-observed-demand` (conciliación) | Vuelve a consultar el histórico (completo o un tramo, X-24) para encontrar cambios que la diaria no vio | Los domingos | Las mismas | PDA-03 | Cambios encontrados |
| `ingest-exogenous` | Carga PIB, población y temperatura | Por definir, cuando se carguen | Ídem, con su `raw` propio | PBD-05 | Exógena fuera de supuesto |
| `check-alerts` | Registra avisos cuando cambia o queda anómalo un dato que ya usó una revisión | Después de cada carga de datos reales | `core.data_alerts` | PDA-04 | Aviso al modelador |

La ficha de cada fuente dice cómo se extrae, qué se valida y qué problemas tiene ([Fuentes de datos](base-de-datos/fuentes/index.md)).

## Carga de prueba (T-24)

Antes de los flujos, T-24 cargó a mano las 5 revisiones de EE y `DemaSIN` diaria desde 2010 para probar el modelo con datos reales. No es un flujo de Prefect ni corre sola: es `pipelines/carga_prueba.py`, que sigue el mismo recorrido `raw → staging → core` (PDA-01) y deja bitácora (PDA-05).

| Pieza | Archivo | Qué hace | La reutiliza |
| --- | --- | --- | --- |
| Lector de anexos | `pipelines/lib/upme_annex.py` | Ubica series, tipos de valor y componentes por sus encabezados; verifica unidad, tipos y sumas (PDA-06); pasa la GD a positiva (PDA-07) | T-27 |
| Cliente de XM | `pipelines/lib/xm_sinergox.py` | Pide `/daily` por meses calendario con 3 reintentos; no lanza errores: los deja en la extracción | T-28, T-29 |
| Cargas | `pipelines/lib/loads.py`, `pipelines/lib/store.py` | Guardan `raw`, `staging` y `core`; solo versionan lo nuevo o lo que cambió (PBD-05) | T-27 a T-29 |
| Datos de las revisiones | `pipelines/revisiones_ee.toml` | Lo que el anexo no trae: nombre, fecha de publicación, modelo, enlace del informe | T-27 |

Cómo se corre, con la base de Docker (los anexos no entran al repositorio; se monta la carpeta donde están):

```bash
docker compose build prefect-worker
docker compose run --rm --no-deps -v "$HOME/Downloads:/anexos:ro" -v ./pipelines:/opt/pipelines prefect-worker python carga_prueba.py anexos /anexos
docker compose run --rm --no-deps -v ./pipelines:/opt/pipelines prefect-worker python carga_prueba.py xm --variable xm_demasin --desde 2010-01-01
```

Qué queda en la base después de correrla:

- **Revisiones:** 5 filas en `core.revisions` (2023-12, 2024-07, 2024-12, 2025-07 y 2026-07), con sus series mensuales y anuales de energía y potencia máxima, y sus componentes (GCE, movilidad eléctrica y GD).
- **Fechas de cada revisión:**
    - el corte (`data_cutoff`) es el último día del mes anterior al primero de la hoja mensual;
    - el primer año del anual se marca `mixed`, porque suma meses reales y proyectados.
- **Mensajes:** cada anexo deja en `operacion.load_messages` las hojas que no se cargan (áreas, promedio diario, capacidad instalada), la normalización del signo de la GD y el resultado de cada verificación de sumas.
- **Repetir es seguro:**
    - un anexo ya cargado (misma huella SHA-256) no se repite;
    - una revisión que ya existe no se vuelve a cargar: sus cifras no cambian (P-0003); sus metadatos se corrigen aparte, con registro (PBD-08, X-31, X-32).
- **`DemaSIN`:** 6156 días, del 2010-01-01 al día anterior a la carga (versión 1, `accepted`). Volver a pedir un tramo solo crea versiones nuevas si XM cambió el valor, y cada cambio queda en `core.observed_changes`.

En esta prueba no hay reglas de anomalía ni avisos: todo entra como `accepted` (T-29, X-24).

