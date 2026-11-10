# prefect en este proyecto

Ficha local (DOC-07). La ficha general está en `upme-estandares/herramientas/`. Prefect está en el stack como orquestador **provisional**: si se cambia, los flujos se mueven pero la lógica de `pipelines/lib/` sigue igual, porque no depende de Prefect.

## Cómo encaja aquí

Prefect ejecuta las cargas de datos y guarda su historial (cuándo corrió cada una, con qué parámetros y cómo terminó). Lo que entra a la base y su detalle quedan en la bitácora del proyecto (`operacion.load_runs` y `operacion.load_messages`, PDA-05). Prefect es solo quien las lanza.

- **Flujos** (`pipelines/flows/`): una función por carga. Recibe los parámetros, llama a `pipelines/lib/` y falla si la carga falló.
- **Lógica** (`pipelines/lib/`): extracción, `raw → staging → core` y bitácora. Se prueba sin Prefect.
- **Despliegues** (`pipelines/deployments.py`): los flujos que el servidor muestra y puede ejecutar, con su horario cuando lo tengan.

## Conceptos: flujo, despliegue y ejecución

| Concepto | Qué es | En este proyecto |
| --- | --- | --- |
| **Flow** (flujo) | El código: una función de Python marcada con `@flow` que dice qué hacer. Existe aunque no haya servidor: se puede correr como cualquier función | `ingest_observed_demand` en `pipelines/flows/xm_observed.py` |
| **Task** (tarea) | Un paso del flujo, marcado con `@task`. Prefect registra el estado de cada una por separado | `load-xm-variable`, una por medida |
| **Deployment** (despliegue) | El flujo publicado en el servidor para ejecutarlo sin tocar código: qué flujo, con qué parámetros por omisión, con qué horario (si tiene), con qué etiquetas. Un mismo flujo puede tener varios despliegues | `xm-historico-diario` en `pipelines/deployments.py`. La carga diaria de T-29 será otro despliegue del mismo flujo, con horario y rango corto |
| **Flow run** (ejecución) | Cada vez que se ejecuta un flujo, desde un despliegue o desde la línea de comandos. Tiene sus *task runs* | Cada carga lanzada desde la interfaz |
| **Worker** | El proceso que atiende los despliegues. Corre `deployments.py` con `serve` y queda escuchando: cuando alguien oprime *Run*, el servidor le avisa y el worker ejecuta el flujo. Si está apagado, la ejecución queda en espera | Contenedor `prefect-worker`. Al arrancar, antes de `serve`, corre una vez `load-published-revisions` (`start.sh`) |

En pocas palabras: el flujo es la receta, el despliegue es la receta publicada con su forma de usarla, y cada ejecución es una vez que se cocinó.

### Qué muestra la interfaz

| Pestaña | Qué muestra |
| --- | --- |
| **Flows** | Cada flujo y todas sus ejecuciones, vengan de un despliegue o de la línea de comandos |
| **Deployments** | Cada despliegue: descripción, parámetros, horario y el botón *Run* para ejecutarlo |
| **Runs** | Cada ejecución: estado, duración, parámetros usados, tareas, mensajes (`logs`) y el error si lo hubo |

**La interfaz no muestra el código.** Muestra lo que pasó: los parámetros, el estado de cada tarea y los mensajes que escribe el flujo (por ejemplo, «xm_demareal [carga 17] ok: DemaReal del 2010-01-01 al 2026-11-09…»). El código está en el repositorio: `pipelines/flows/` (flujos), `pipelines/lib/` (lógica) y `pipelines/deployments.py` (despliegues).

**Prefect tampoco guarda el detalle de lo que entró a la base:** solo sabe si la ejecución salió bien o mal. Qué se cargó, qué cambió y qué faltó está en la bitácora del proyecto (`operacion.load_runs` y `operacion.load_messages`, PDA-05).

## Dónde está

| Pieza | Dónde |
| --- | --- |
| Servidor e interfaz | Servicio `prefect-server` de `docker-compose.yml`: http://localhost:4200 |
| Quien ejecuta los flujos | Servicio `prefect-worker`: imagen de `pipelines/Dockerfile`, corre `start.sh`: carga las revisiones que falten y después `deployments.py` con `serve` |
| Flujos | `pipelines/flows/` |
| Despliegues | `pipelines/deployments.py` |
| Pruebas | `pipelines/tests/` |

## Configuración

- `PREFECT_API_URL` y `DATABASE_URL` en `.env` (ver `.env.example`). El worker usa la base del servicio `db`.
- El worker copia el código al construir la imagen: después de cambiar un flujo, `docker compose up -d --build prefect-worker`.
- Los despliegues no tienen horario todavía. La programación es de T-29 y T-31, en zona `America/Bogota`.

## Cómo se usa (casos del proyecto)

| Flujo | Despliegue | Qué hace | Paso |
| --- | --- | --- | --- |
| `ingest-observed-demand` | `xm-historico-diario` | Carga histórica de las medidas diarias de XM SINERGOX (`DemaSIN` y `DemaMaxPot`) | T-28 |
| `load-published-revisions` | `revisiones-ee` | Descarga y carga las revisiones de EE de `revisiones_ee.toml` que falten. También corre sola al arrancar el worker | T-27 (issue #42) |

Ejecutar un despliegue:

- **Desde la interfaz:** Deployments → `xm-historico-diario` → *Run* → *Custom run*. Ahí se cambian los parámetros (`variables`, `desde`, `hasta`).
- **Desde la línea de comandos:**

```bash
docker compose exec prefect-worker prefect deployment run ingest-observed-demand/xm-historico-diario --watch
```

```bash
docker compose exec prefect-worker prefect deployment run ingest-observed-demand/xm-historico-diario -p desde=2026-10-01 -p 'variables=["xm_demasin"]'
```

- **Sin pasar por el servidor:** `docker compose exec prefect-worker python -m flows.xm_observed --desde 2026-10-01`, o `python -m flows.upme_revisions` para las revisiones.

**Al arrancar el worker** no hace falta oprimir nada para las revisiones: `start.sh` corre `load-published-revisions` y la ejecución aparece en *Runs* como cualquier otra.

El detalle de cada flujo está en [Flujos de datos](../flujos.md).

## Reglas propias

- Un flujo no tiene lógica de datos: la lógica va en `pipelines/lib/`, con pruebas que no necesitan Prefect.
- Cada ejecución deja su bitácora en `operacion`, aunque falle (PDA-05). El estado en Prefect sale de ella: si una carga queda `failed`, el flujo termina en error.
- Volver a correr un rango debe ser seguro: solo se guarda lo nuevo o lo que cambió (PBD-05).
- Un despliegue nuevo se documenta en [Flujos de datos](../flujos.md) y en esta ficha en el mismo PR (DOC-08).

## Cómo extender

1. La lógica va en `pipelines/lib/`, con sus pruebas.
2. El flujo va en `pipelines/flows/<nombre>.py`, con prueba del flujo simulando la carga (como `tests/test_xm_flow.py`).
3. Se registra en `deployments.py` con `to_deployment(name=…)`, sin horario hasta que se decida.
4. Se reconstruye el worker y se comprueba que aparece en la interfaz.
5. Se documenta en `flujos.md` y en esta ficha.
