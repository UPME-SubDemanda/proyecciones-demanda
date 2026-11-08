# Reglas técnicas

Stack aprobado, cómo se agrega o cambia una tecnología, arquitectura y bases de datos. Las fichas de uso de cada herramienta están en `herramientas/`.

Versión del estándar: ver `reglas/VERSION`. Historial: `CHANGELOG.md`.

## Estándar técnico

**Objetivo:** que un proyecto nuevo no tenga que decidir tecnologías. Todos los desarrollos del equipo usan el mismo stack, salvo que una necesidad extrema justifique otra cosa con un ADR.

**TEC-01 (DEBE)** Todo proyecto usa las tecnologías en estado **Estándar** o **Provisional** del registro de tecnologías para cada capa. Usar otra cosa requiere el proceso de nueva tecnología.

**TEC-02 (DEBE)** Toda tecnología usada en un proyecto tiene su **ficha de herramienta** (plantilla en `herramientas/_plantilla.md`): en este repositorio la ficha general y, en el proyecto, la ficha de cómo se usa ahí. Sin ficha no se une el PR que la introduce.

**TEC-03 (DEBE)** Un proyecto nuevo arranca copiando `reglas/` de este repositorio (FLU-09) y siguiendo la arquitectura de referencia. Para no reescribir lo común (módulo de autenticación, CI, plantillas de PR, estructura de `docs/`), se toma como **proyecto de referencia** el más reciente que cumpla el estándar (hoy, `proyecciones-demanda`). La versión del estándar que sigue queda en `reglas/VERSION`.

**TEC-04 (DEBE)** Las versiones mayores de lenguajes y frameworks se fijan aquí (tabla de stack) y se actualizan para todos los proyectos a la vez, con ADR.

### Contenido
- Stack por capa
- Registro de tecnologías (estados: Estándar, Provisional, En evaluación, Planeada, Aplazada, Retirada)
- Proceso para agregar una tecnología
- Arquitectura de referencia
- Bases de datos
- Fichas de herramientas

## Stack por capa

| Capa | Tecnología | Versión fijada | Estado | Ficha |
| --- | --- | --- | --- | --- |
| Lenguaje backend y datos | Python | 3.12 | Estándar | python-uv |
| Gestor de paquetes Python | uv | 0.x reciente | Estándar | python-uv |
| API | FastAPI + Pydantic v2 | FastAPI 0.11x | Estándar | fastapi |
| Acceso a datos | SQLAlchemy 2 + Alembic | 2.0 / 1.13 | Estándar | sqlalchemy-alembic |
| Base de datos | PostgreSQL | 16 | Estándar | postgresql |
| Autenticación | Módulo compartido (Google + usuarios locales + roles en BD) | — | Estándar | autenticacion |
| Frontend | React + TypeScript + Vite | React 18 · TS 5 · Vite 5 | Estándar | react-vite |
| Gestor de paquetes JS | pnpm (Node 22 LTS) | 9 | Estándar | react-vite |
| Estilos | Tailwind CSS + preset de tokens de marca | 3.4 | Estándar | tailwind-tokens |
| Gráficos | Apache ECharts + tema de marca | 5 | Estándar | echarts |
| Datos en el cliente | TanStack Query · React Router | 5 · 6 | Estándar | react-vite |
| Orquestación de tareas | Prefect | 3 | **Provisional** (evaluar Dagster, P-04) | prefect |
| Pruebas | pytest · Vitest · Playwright | — | Estándar | pruebas |
| Calidad de código | Ruff · ESLint · Prettier · pre-commit | — | Estándar | calidad-codigo |
| Contenedores | Docker + Docker Compose | — | Estándar | docker |
| CI/CD | GitHub Actions | — | Estándar | github-actions |
| Documentación | MkDocs + Material | 1.6 / 9 | Estándar | mkdocs |
| Plantilla de proyectos | Copier | — | **Retirada** (ADR-0016): se usa un proyecto de referencia | copier |
| Versionado de datos | DVC | — | **Aplazada** (P-03) | dvc |
| Experimentos y modelos | MLflow | — | **Planeada** (fase 2, P-10) | mlflow |
| Orquestación alternativa | Dagster | — | **En evaluación** (P-04) | dagster |
| Identidad centralizada | Keycloak | — | **En evaluación** (piloto, P-02) | keycloak |
| Notificaciones | Google Chat (webhooks) | — | **Planeada** (etapa 1.1, P-05) | google-chat |
| Observabilidad | Grafana + Prometheus | — | **Planeada** (P-12) | grafana |
| Almacenamiento de objetos | MinIO | — | **Retirada** (ADR-0015) | — |

Versiones exactas de librerías: las fija cada proyecto en `uv.lock` y `pnpm-lock.yaml`, partiendo de las de la plantilla.

## Registro de tecnologías

Cada tecnología tiene un estado. El estado decide si se puede usar.

| Estado | Significa | ¿Se puede usar en un proyecto? |
| --- | --- | --- |
| **Estándar** | Decisión firme | Sí, y es obligatoria para su capa |
| **Provisional** | Se usa, pero hay una evaluación abierta que podría cambiarla | Sí; escribir el código de forma que el cambio sea acotado |
| **En evaluación** | Se prueba en un piloto controlado | Solo en el piloto declarado en el ADR |
| **Planeada** | Se adoptará cuando llegue la necesidad descrita | No todavía; su ficha explica cuándo y cómo |
| **Aplazada** | Se decidió no usarla por ahora, con condición de entrada clara | No, hasta que se cumpla la condición |
| **Retirada** | No se usa en proyectos nuevos | No; los proyectos existentes planean migrar |

La tabla vigente está en Stack por capa. Cada cambio de estado se registra con un ADR y en el CHANGELOG.

### Condiciones de entrada de las tecnologías no estándar

| Tecnología | Estado | Entra cuando… |
| --- | --- | --- |
| DVC | Aplazada | Se versionen modelos, se prueben modelos nuevos o se congelen datasets de entrenamiento (fase 2). Es **obligatorio** adoptarla en ese momento. |
| MLflow | Planeada | Se entrenen modelos en la plataforma (migración de MATLAB a Python, modelos nuevos). |
| Dagster | En evaluación | La evaluación P-04 muestre ventajas claras frente a Prefect para el equipo. |
| Keycloak | En evaluación | El piloto P-02 muestre que el equipo puede operarlo y que hay 2 o más apps con usuarios compartidos. |
| Google Chat | Planeada | Etapa 1.1 del proyecto de proyecciones (después del montaje inicial). |
| Grafana + Prometheus | Planeada | Haya un servidor de producción con más de una app en ejecución. |

## Proceso para agregar una tecnología

Aplica también para **cambiar** o **retirar** una (por ejemplo, reemplazar Prefect por Dagster). Con un asistente de IA basta pedir: *"Quiero usar X en lugar de Y. Sigue TEC-05: evalúa licencia, mantenimiento y alternativas; escribe ADR, ficha y actualiza REGLAS-TECNICAS"*.

Ejemplo: antes del proyecto de proyecciones no se necesitaban MLflow ni DVC. Cuando una necesidad así aparece, se sigue este proceso. **Es obligatorio**: una tecnología que no esté en el registro no se puede unir a `develop`.

**TEC-05 (DEBE)** Pasos:

1. **Abrir un issue** en `upme-estandares` con la plantilla "Nueva tecnología": necesidad, proyecto que la requiere, alternativas consideradas (incluida "usar lo que ya tenemos").
2. **Escribir el ADR** (`decisiones/NNNN-*.md`) con estado propuesto (Provisional, En evaluación o Planeada) y condiciones.
3. **Escribir la ficha de herramienta** en `herramientas/<nombre>.md` con la plantilla, completa.
4. **Actualizar** este archivo (Stack por capa y Condiciones de entrada), `reglas/VERSION` y el CHANGELOG (versión MENOR; MAYOR si reemplaza un estándar).
5. **Aprobación** del líder del equipo (o de quien delegue o de la Subdirectora, según el alcance).
6. **En cada proyecto que la use**: copiar las reglas actualizadas (FLU-09) y hacer el cambio en una rama propia, con su entrada en el CHANGELOG del proyecto.
7. **Ficha local**: agregar la ficha "cómo se usa aquí" en `docs/tecnica/herramientas/` del proyecto (FLU-13).

**TEC-10 (DEBE)** **Cuando la necesidad aparece trabajando en un proyecto.** El asistente de IA que trabaja en el proyecto **no instala ni cambia la tecnología**. Se detiene, explica la necesidad y entrega a la persona un prompt listo para pegar en una sesión de Claude Code **abierta en `upme-estandares`**, que hace los pasos 2 a 4 de TEC-05. Cuando el cambio queda unido en `upme-estandares`, se vuelve al proyecto, se copian las reglas (FLU-09) y se hacen los pasos 6 y 7. El prompt sigue esta plantilla:

```
Trabajo en el proyecto <proyecto> y necesito <agregar | cambiar | retirar> <tecnología>
(<en lugar de <tecnología actual>>) para <necesidad concreta>.
Contexto: <qué se intentó, por qué lo actual no alcanza, volumen o restricciones>.
Alternativas consideradas: <incluida "usar lo que ya tenemos">.
Sigue TEC-05 de reglas/REGLAS-TECNICAS.md en una rama chore/tec-<nombre>:
1. Evalúa licencia, mantenimiento, comunidad, encaje con el stack y alternativas; si no
   conviene, dímelo y no sigas.
2. Escribe el ADR en decisiones/ con estado propuesto (Provisional o En evaluación).
3. Escribe la ficha completa en herramientas/<nombre>.md con herramientas/_plantilla.md.
4. Actualiza Stack por capa (y Condiciones de entrada si aplica) en reglas/REGLAS-TECNICAS.md,
   reglas/VERSION, README.md y CHANGELOG.md con la versión que corresponda.
Muéstrame el resumen y la versión nueva antes de hacer commit.
```

**TEC-06 (DEBE)** Una librería pequeña de soporte (por ejemplo, una utilidad de fechas) no requiere ADR, pero sí una línea en la ficha de la herramienta principal o en `docs/tecnica/dependencias.md` del proyecto con su propósito.

## Arquitectura de referencia

Todos los proyectos siguen esta forma. Las piezas en estado Planeada o Aplazada se agregan cuando corresponda.

```
                 ┌───────────────────────────── Navegador ─────────────────────────────┐
                 │  React + Vite + TS · Tailwind (tokens de marca) · ECharts (tema)    │
                 │  Zonas: /app (interna)  ·  / (portal público)  ·  /pantalla (TV)    │
                 └──────────────────────────────┬──────────────────────────────────────┘
                                                │ HTTPS / JSON
                 ┌──────────────────────────────▼──────────────────────────────────────┐
                 │  FastAPI  · módulo de autenticación (Google + local + roles)        │
                 │  /api/v1/... · OpenAPI · SQLAlchemy 2                               │
                 └───────┬───────────────────────────────┬─────────────────────────────┘
                         │                               │ dispara / consulta
       ┌─────────────────▼──────────────┐     ┌──────────▼───────────────────────────────┐
       │ PostgreSQL del producto         │◄────┤ Prefect (tareas programadas)            │
       │ esquemas: raw · staging · core  │     │ ingesta → validación → cálculo →         │
       │ · publicacion · auth            │     │ publicación · (1.1) Google Chat          │
       └─────────────────┬──────────────┘     └──────────┬───────────────────────────────┘
                         │ lectura                        │ fase 2
       ┌─────────────────▼──────────────┐     ┌──────────▼───────────────────────────────┐
       │ BD de datos primarios (futura)  │     │ DVC (datos versionados) · MLflow        │
       │ PIB, población… (solo lectura)  │     │ (experimentos y modelos)                 │
       └─────────────────────────────────┘     └──────────────────────────────────────────┘
```

**TEC-07 (DEBE)** Monorepositorio por proyecto: `backend/`, `frontend/`, `pipelines/`, `docs/`, `infra/` en un solo repositorio, para que código, documentación y changelog cambien juntos.

**TEC-08 (DEBE)** API versionada (`/api/v1`), con contrato OpenAPI generado y tipos TypeScript generados desde él (`pnpm gen:api`).

**TEC-09 (DEBE)** Configuración por variables de entorno (`.env`, nunca versionado; `.env.example` sí). Secretos en GitHub Secrets o en el gestor que defina TI.

## Bases de datos

**BD-01 (DEBE)** Una base PostgreSQL **por producto** (Proyecciones, BECO, PEN, Incentivos…). Ahí van supuestos, resultados, simulaciones, iteraciones y datos intermedios o finales del producto.

**BD-02 (DEBE)** Los **datos primarios** comunes a varias subdirecciones (población, PIB, otros registros) vivirán en la base de datos primarios de la entidad (en construcción). Los productos los leen en **modo solo lectura** y nunca los copian como fuente propia: si necesitan una copia por rendimiento, va en `staging` con la fecha de extracción. Mientras esa base no exista, se cargan en `raw` del producto con su fuente (pendiente P-11).

**BD-03 (DEBE)** Esquemas en cada base:

| Esquema | Contiene |
| --- | --- |
| `raw` | Datos tal como llegan de la fuente, con `fuente`, `fecha_carga`, `archivo_origen` |
| `staging` | Datos validados y normalizados |
| `core` | Entidades del producto (revisiones, escenarios, series, modelos) |
| `publicacion` | Vistas o tablas que alimentan portal y modo pantalla (solo lo publicable) |
| `auth` | Usuarios, roles y sesiones del módulo de autenticación |

**BD-04 (DEBE)** Toda modificación de esquema se hace con una migración de Alembic versionada, nunca a mano.

**BD-05 (DEBE)** Nombres en inglés y `snake_case` para tablas y columnas; comentarios (`COMMENT ON`) en español describiendo cada tabla y columna.

**BD-06 (DEBE)** Toda tabla de `core` y `publicacion` registra procedencia: `source`, `cutoff_date`, `version` (o la llave de la revisión) y `created_at`.

**BD-07 (DEBE)** Respaldos diarios y prueba de restauración trimestral (responsable por definir con TI, P-01).
