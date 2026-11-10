# Flujos de datos (Prefect)

Flujos de carga del modelo de datos v2 ([Base de datos](base-de-datos/index.md)). Se construyen en la fase 3 del plan de datos (T-27 a T-31). El primero es la carga histórica diaria de XM (T-28, abajo); los demás están planeados. La carga de prueba de T-24 dejó el lector de anexos que usará T-27. Cómo se opera Prefect aquí: [ficha local](herramientas/prefect.md). Todo flujo registra cada consulta en `operacion.extractions`, deja su fila en la bitácora `operacion.load_runs` aunque no encuentre nada, y anota cada error o advertencia en `operacion.load_messages` (PDA-05).

| Flujo | Qué hace | Cuándo corre | Tablas que toca | Reglas | Notifica (1.2) |
| --- | --- | --- | --- | --- | --- |
| `load-published-revisions` | Lee un anexo de revisión de la UPME por sus encabezados, verifica sus sumas, normaliza las convenciones y lo carga | Cuando se publica una revisión; una vez para las históricas | `raw.files`, `raw.file_cells` → `staging.revision_*` → `core.revisions` y tablas de la revisión | PDA-06, PDA-07 | Revisión cargada o rechazada |
| `ingest-observed-demand` (histórica) **construido** | Carga las medidas diarias de XM (`DemaSIN` y `DemaMaxPot`) en un rango (por omisión, del 2010-01-01 a ayer); guarda solo lo nuevo o cambiado | A mano (despliegue `xm-historico-diario`, sin horario) | `raw.xm_sinergox_values` → `staging.observed_values` → `core.observed_values`, `core.observed_changes` | PBD-05, PDA-05 | — |
| `ingest-observed-demand` (diaria) | Consulta a XM SINERGOX los últimos días desde el último dato guardado; guarda solo lo nuevo o cambiado; aplica las reglas de anomalía | Todos los días (hora por definir, X-24) | `raw.xm_sinergox_values` → `staging.observed_values` → `core.observed_values`, `core.observed_changes`, `core.data_anomalies` | PBD-05, PDA-02 | Falla o fuente sin actualizar |
| `ingest-observed-demand` (conciliación) | Vuelve a consultar el histórico (completo o un tramo, X-24) para encontrar cambios que la diaria no vio | Los domingos | Las mismas | PDA-03 | Cambios encontrados |
| `ingest-exogenous` | Carga PIB, población y temperatura | Por definir, cuando se carguen | Ídem, con su `raw` propio | PBD-05 | Exógena fuera de supuesto |
| `check-alerts` | Registra avisos cuando cambia o queda anómalo un dato que ya usó una revisión | Después de cada carga de datos reales | `core.data_alerts` | PDA-04 | Aviso al modelador |

La ficha de cada fuente dice cómo se extrae, qué se valida y qué problemas tiene ([Fuentes de datos](base-de-datos/fuentes/index.md)).

## Carga histórica de XM (T-28)

Flujo `ingest-observed-demand` (`pipelines/flows/xm_observed.py`), despliegue `xm-historico-diario`. No tiene horario: se ejecuta a mano desde la interfaz de Prefect (http://localhost:4200) o con la línea de comandos ([ficha de Prefect](herramientas/prefect.md#como-se-usa-casos-del-proyecto)).

| Parámetro | Por omisión | Qué es |
| --- | --- | --- |
| `variables` | Las medidas que XM publica por día (X-26): `xm_demasin` y `xm_demamaxpot` | Códigos de `core.variables` con fuente `xm_sinergox` |
| `desde` | 2010-01-01 | Primer día del rango |
| `hasta` | Ayer | Último día del rango |

Cómo funciona:

- **Primero verifica que XM publique cada variable por día**, con su listado de métricas. Una variable que solo existe por hora (`DemaReal`, `DemaCome`, `ExpoEner`) o que no existe se rechaza de entrada, con el motivo, sin consultar sus datos. Si XM no entrega el listado, carga sin verificar y lo avisa.
- **Una tarea por variable.** Cada una abre su carga en `operacion.load_runs` y pide a XM un mes calendario por consulta, con 3 reintentos ante fallas de red, errores 5xx o 429 (demasiadas consultas). Un error 4xx no se reintenta: no se arregla esperando ([ficha de SINERGOX](base-de-datos/fuentes/xm/ficha-sinergox.md)).
- **Se puede repetir.** Solo se guarda lo nuevo o lo que cambió (PBD-05): volver a correr un rango sin cambios en XM no crea versiones, y un día que XM cambió queda como versión nueva y en `core.observed_changes`.
- **Una variable que falla no detiene las demás.** Al final, el flujo termina en error y dice cuál falló. Lo que ya estaba cargado no se toca.
- **Días que XM no entrega:** quedan como advertencia en `operacion.load_messages` con sus fechas, y el mes queda marcado incompleto en `core.observed_monthly`.
- **Todo entra como `accepted`:** las reglas de anomalía, la carga diaria automática, la conciliación y los avisos son de T-29 (X-24).
- **Lo horario no está aquí:** `DemaReal`, `DemaCome` y `ExpoEner` solo existen por hora en SINERGOX. Su carga y el ajuste de las vistas que necesitan son T-36.

Primera ejecución (2026-11-10, del 2010-01-01 al 2026-11-09):

| Variable | Días recibidos | Nuevos | Sin cambio | Duración | Faltan |
| --- | --- | --- | --- | --- | --- |
| `DemaSIN` | 6156 | 0 | 6156 | 27 s | El día anterior a la carga (rezago de XM) |
| `DemaMaxPot` | 6117 | 6117 | 0 | 31 s | Del 2026-10-01 al 2026-11-09: XM la publica con más de un mes de rezago |

`DemaSIN` ya estaba completa (T-24): volver a pasarla no creó ninguna versión, como pide PBD-05.

## Carga de prueba (T-24)

Antes de los flujos, T-24 cargó a mano las 5 revisiones de EE y `DemaSIN` diaria desde 2010 para probar el modelo con datos reales. No era un flujo de Prefect ni corría sola: era `pipelines/carga_prueba.py`, que sigue el mismo recorrido `raw → staging → core` (PDA-01) y deja bitácora (PDA-05). Desde T-28 la parte de XM es el flujo de arriba y `carga_prueba.py` solo carga los anexos, hasta que T-27 tenga su flujo.

| Pieza | Archivo | Qué hace | La reutiliza |
| --- | --- | --- | --- |
| Lector de anexos | `pipelines/lib/upme_annex.py` | Ubica series, tipos de valor y componentes por sus encabezados; verifica unidad, tipos y sumas (PDA-06); pasa la GD a positiva (PDA-07) | T-27 |
| Cliente de XM | `pipelines/lib/xm_sinergox.py` | Pide `/daily` por meses calendario con 3 reintentos; no lanza errores: los deja en la extracción | T-28 (ya lo usa), T-29 |
| Cargas | `pipelines/lib/loads.py`, `pipelines/lib/store.py` | Guardan `raw`, `staging` y `core`; solo versionan lo nuevo o lo que cambió (PBD-05) | T-27 a T-29 |
| Datos de las revisiones | `pipelines/revisiones_ee.toml` | Lo que el anexo no trae: nombre, fecha de publicación, modelo, enlace del informe | T-27 |

Cómo se corre, con la base de Docker (los anexos no entran al repositorio; se monta la carpeta donde están):

```bash
docker compose build prefect-worker
docker compose run --rm --no-deps -v "$HOME/Downloads:/anexos:ro" -v ./pipelines:/opt/pipelines prefect-worker python carga_prueba.py anexos /anexos
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

