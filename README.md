# Proyecciones de Demanda · UPME

Plataforma de la Subdirección de Demanda de la UPME para **consultar, comparar y monitorear las proyecciones de demanda** de energía eléctrica y gas natural: lo proyectado frente a lo real, cómo cambian las revisiones publicadas y cómo se comportan las variables que las explican. Tiene un **portal público**, un **modo pantalla** para televisores y una **app interna** para el equipo.

Etapa actual: **1 y 1.1**. Se construyen las vistas con cifras ilustrativas mientras se cargan los datos oficiales (ver [Estado](#estado-actual)).

- Guía de usuario: [`docs/usuario/`](docs/usuario/index.md) · sitio local http://localhost:8002
- Documentación técnica: [`docs/tecnica/`](docs/tecnica/index.md) · sitio local http://localhost:8001
- Producto, objetivos y hoja de ruta: [`docs/producto/`](docs/producto/index.md)

## Contenido

1. [Estado actual](#estado-actual)
2. [Empezar en 5 minutos](#empezar-en-5-minutos)
3. [Cómo trabajamos](#cómo-trabajamos)
4. [Todo se documenta: qué va dónde](#todo-se-documenta-qué-va-dónde)
5. [Las reglas en un minuto](#las-reglas-en-un-minuto)
6. [Cómo funciona el proyecto](#cómo-funciona-el-proyecto)
7. [Mapa del repositorio](#mapa-del-repositorio)
8. [Comandos frecuentes](#comandos-frecuentes)
9. [Qué no hacer](#qué-no-hacer)
10. [Antes de tu primer PR](#antes-de-tu-primer-pr)
11. [Trabajar con asistentes de IA](#trabajar-con-asistentes-de-ia)
12. [Glosario rápido](#glosario-rápido)
13. [Ayuda y responsables](#ayuda-y-responsables)

## Estado actual

| Construido (con cifras ilustrativas) | Sigue | Bloqueado |
| --- | --- | --- |
| Portal público · Modo pantalla (energía, gas, comparar proyecciones, el sistema hoy) · App interna: tablero ejecutivo, histórico de revisiones, monitor de variables exógenas | Modelo de datos v2 documentado (T-22); sigue su migración (T-23) y la carga de los datos reales (plan de datos en 7 fases, T-22 a T-35) | Proyección vs. real, comparar revisiones, usuarios y roles, tablero de exógenas en pantalla: sin mockup (X-06) |

El detalle, paso por paso, está en el [plan de trabajo](docs/pendientes.md#plan-de-trabajo); las preguntas abiertas, en los [pendientes de decisión](docs/pendientes.md#pendientes-de-decisión).

## Empezar en 5 minutos

Necesita **Docker Desktop abierto** y **git**. Nada más: Python, Node y el resto corren dentro de los contenedores.

```bash
git clone git@github.com:UPME-SubDemanda/proyecciones-demanda.git
cd proyecciones-demanda
./scripts/dev-setup.sh
```

| Qué | Dirección |
| --- | --- |
| App: portal, modo pantalla (`/pantalla`) y app interna (`/app`) | http://localhost:5173 |
| API y su documentación | http://localhost:8000/docs |
| Guía de usuario | http://localhost:8002 |
| Documentación técnica | http://localhost:8001 |

Para entrar a la app interna: **Ingresar** → «Ingresar con usuario local», usuario `admin@local`, contraseña en `DEV_ADMIN_PASSWORD` de `.env` (cada persona tiene la suya; no se comparte).

Todo se actualiza al guardar. Día a día, cuándo reconstruir y qué hacer si algo falla: [guía técnica](docs/tecnica/index.md).

## Cómo trabajamos

**Todo cambio nace de un issue y entra por un Pull Request.** Nadie escribe directo en `develop` ni en `main`.

```text
Issue → Diseño aprobado (si es una vista) → Rama → Commits → PR → CI en verde → Unir → Cerrar issue
```

1. **Issue** en GitHub con su plantilla (Feature, Corrección, Hotfix o Documentación). Una vista nueva lleva su ficha: qué pregunta responde, para quién, zona, datos y acción que habilita (FLU-01).
2. **Diseño aprobado** antes de programar una vista o un cambio visual: mockup en `docs/tecnica/mockups/` (FLU-03).
3. **Rama** desde `develop`, con el número del issue: `feature/21-revision-history`, `fix/27-docker-dev-env`, `docs/29-readme-repo-map` (FLU-04).
4. **Commits** en inglés con Conventional Commits y la referencia al issue (FLU-06):
   ```text
   feat(app): add revision history view

   Refs: #21
   ```
5. **PR** hacia `develop` con la plantilla y `Closes #<n>` para cerrar el issue al unir. La CI verifica CHANGELOG, diseño, inventario, páginas generadas, pruebas y documentación.
6. **Unir** con la CI en verde; se borra la rama.

**Definición de hecho** (FLU-07): un PR se une cuando tiene

- [ ] pruebas en verde;
- [ ] revisión de diseño, si cambia la interfaz;
- [ ] página del inventario con capturas, si es una vista;
- [ ] documentación técnica, si toca arquitectura, API, datos o herramientas;
- [ ] línea en `CHANGELOG.md`;
- [ ] entrada en `docs/diario/`.

Guía completa, con ejemplos y quién hace qué: [flujo de trabajo del equipo](docs/tecnica/flujo-de-trabajo-equipo.md).

## Todo se documenta: qué va dónde

La documentación vive en este repositorio y **cambia en el mismo PR que el código**.

| Si hiciste… | Actualiza… |
| --- | --- |
| Una **vista** nueva o cambiada | Su página en [`docs/usuario/inventario/`](docs/usuario/inventario/index.md) con las secciones: para qué sirve, cómo llegar, qué muestra, cómo se usa paso a paso, filtros y opciones, preguntas frecuentes e historial (DOC-01). Esa página **es la guía de usuario** de la vista. Más sus capturas (`pnpm screenshots`, DOC-03). |
| **Cualquier PR** | Una línea en [`CHANGELOG.md`](CHANGELOG.md) (DOC-04) y una entrada en [`docs/diario/`](docs/diario/index.md) (DOC-05). |
| Arquitectura, API, modelo de datos, flujos o el frontend | Su página en [`docs/tecnica/`](docs/tecnica/index.md) (DOC-08). |
| Una **herramienta** nueva o cambiada | Su ficha en `docs/tecnica/herramientas/` (DOC-07). Una tecnología nueva pasa primero por TEC-05. |
| Una **decisión** propia del proyecto | Un ADR en [`docs/decisiones/`](docs/decisiones/index.md). |
| Algo que **queda sin resolver** | Una fila en [`docs/pendientes.md`](docs/pendientes.md); si necesita contexto, su página en `docs/pendientes/`. |
| Una **carpeta** nueva | Su descripción en `repo-map.toml` (ver [Mapa](#mapa-del-repositorio)). |

Algunas páginas **se generan solas** y no se editan a mano: el índice del inventario, el índice del diario, las [referencias](docs/tecnica/referencias.md) y el mapa de este README. El hook de git las regenera en cada commit y la CI verifica que estén al día.

## Las reglas en un minuto

Las reglas vienen de `upme-estandares` y hay una copia en [`reglas/`](reglas/) que **no se edita aquí**. Cada regla tiene un ID (por ejemplo FLU-07 o TOK-02) que se cita en issues, PR y documentación; qué significa cada uno está en [Referencias](docs/tecnica/referencias.md), y también se encuentra con el buscador de la documentación técnica.

| Archivo | De qué trata | Léalo antes de… |
| --- | --- | --- |
| `REGLAS-FLUJO.md` | Issues, ramas, PR, versiones, documentación | cualquier cambio |
| `REGLAS-DISENO.md` y `MARCA-UPME.md` | Diseño, componentes, gráficos, accesibilidad, marca | tocar la interfaz |
| `REGLAS-TECNICAS.md` | Arquitectura, tecnologías y base de datos | agregar una librería o cambiar la arquitectura |

Las que más se aplican:

- **Diseño antes que código** (FLU-03): ninguna vista se programa sin mockup aprobado.
- **Solo tokens y componentes del inventario** (TOK-02, CMP-01): nada de colores o tamaños sueltos; `lint_design.py` lo revisa.
- **Gráficos con ECharts y el tema de la marca** (GRA-00), con la codificación fija de real, proyección y escenarios (GRA-01).
- **Sin tecnologías nuevas sin su proceso** (TEC-05): se evalúa y se registra en el estándar antes de instalar.
- **Idiomas** (FLU-06): código y commits en inglés; interfaz y documentación en español de Colombia.
- **Si una regla no encaja**, se pregunta y se propone un ADR; no se ignora.

## Cómo funciona el proyecto

```text
                    ┌─────────────── frontend (React + Vite, :5173) ───────────────┐
 Público ─────────▶ │  Portal  /           Modo pantalla  /pantalla                │
 Equipo  ─Ingresar▶ │  App interna  /app   (tablero, histórico, monitor de exógenas)│
                    └───────────────────────────────┬──────────────────────────────┘
                                                    │ /api
                    ┌───────────────────────────────▼──────────────────────────────┐
                    │  API (FastAPI, :8000) · ingreso local o Google, roles          │
                    └───────────────────────────────┬──────────────────────────────┘
                                                    │
   Fuentes (XM, Gestor del     ┌─────────────────▼──────────────────┐
   Mercado de Gas, DANE…) ───▶ │  PostgreSQL: raw → staging → core     │
         Prefect (:4200) ────▶ │  → publicacion (lo público)           │
                               └───────────────────────────────────────┘
   Documentación: Markdown en docs/ → MkDocs → guía de usuario (:8002) y técnica (:8001)
```

**Hoy** las vistas leen **cifras ilustrativas** desde `frontend/src/demo/`, siempre a través de un único punto de acceso (`frontend/src/data/`) y con el aviso «Cifras ilustrativas». **Cuando lleguen los datos reales** (plan de datos, T-22 a T-34), solo cambia ese punto de acceso: las vistas no se tocan. Detalle: [arquitectura](docs/tecnica/arquitectura.md), [frontend](docs/tecnica/frontend.md) y [modelo de datos](docs/tecnica/modelo-de-datos.md), con el detalle de cada esquema en [base de datos](docs/tecnica/base-de-datos/index.md).

## Mapa del repositorio

Cada carpeta, qué contiene y qué debe ir en ella. Se genera desde [`repo-map.toml`](repo-map.toml) con `scripts/mapa.py`: **toda carpeta nueva se describe ahí en el mismo PR**, o el commit se detiene y la CI falla.

<!-- mapa:inicio (generado por scripts/mapa.py desde repo-map.toml; no editar a mano) -->

```text
.githooks/           # Hooks de git del proyecto
.github/             # Configuración de GitHub
  ISSUE_TEMPLATE/    # Plantillas de issue
  workflows/         # CI (GitHub Actions)
backend/             # API en FastAPI y migraciones
  alembic/           # Migraciones de la base de datos
  app/               # Código de la API
    api/             # Rutas de la API, por versión
    auth/            # Ingreso, sesión, usuarios y roles
    core/            # Configuración de la API
    db/              # Conexión y modelos de la base
  tests/             # Pruebas del backend (pytest)
docs/                # Toda la documentación (MkDocs)
  decisiones/        # Decisiones del proyecto (ADR)
  diario/            # Diario de cambios
  pendientes/        # Detalle de pendientes
  producto/          # Producto: objetivos, públicos y hoja de ruta
  tecnica/           # Documentación técnica (sitio privado)
    base-de-datos/   # Documentación de la base de datos y de las fuentes de datos
    herramientas/    # Fichas locales de herramientas
    mockups/         # Mockups aprobados
  usuario/           # Guía de usuario (sitio público)
    capturas/        # Capturas de la guía
    inventario/      # Una página por vista o feature
frontend/            # Interfaz en React + TypeScript (Vite)
  e2e/               # Pruebas de punta a punta y capturas (Playwright)
  public/            # Archivos servidos tal cual
  src/               # Código del frontend
    auth/            # Sesión e ingreso en el frontend
    components/      # Componentes del inventario de diseño
    data/            # Acceso a datos (único punto)
    demo/            # Cifras ilustrativas
    dev/             # Herramientas solo de desarrollo
    estandares/      # Copia de la marca de upme-estandares
    iconos-locales/  # Íconos pendientes de pasar al estándar
    lib/             # Utilidades compartidas
    zones/           # Vistas por zona
pipelines/           # Flujos de datos (Prefect)
  flows/             # Flujos de Prefect
  lib/               # Lógica de los flujos, sin Prefect
reglas/              # Copia de las reglas de upme-estandares
scripts/             # Scripts del proyecto
```

| Carpeta | Qué debe ir aquí |
| --- | --- |
| `.githooks/` | Solo `pre-commit`, que regenera las páginas generadas. Se activa con `dev-setup.sh` (`git config core.hooksPath .githooks`). |
| `.github/` | Plantillas de issue y de PR, y la CI. Nada de código de la app. |
| `.github/ISSUE_TEMPLATE/` | Feature, Corrección, Hotfix y Documentación (FLU-01). Una plantilla nueva se acuerda con el estándar. |
| `.github/workflows/` | `ci.yml`: verificaciones que un PR debe pasar. Cada página generada o regla verificable nueva suma aquí su paso `--check`. |
| `backend/` | Todo el servidor: API, autenticación, acceso a la base y sus pruebas. Python 3.12 con uv. |
| `backend/alembic/` | Una migración de Alembic por cambio de esquema (BD-04). Nunca cambiar la base a mano. Todo objeto nuevo lleva comentario en español (PBD-01) y se documenta en `docs/tecnica/base-de-datos/` (PBD-02). |
| `backend/app/` | Organizado por capa: rutas (`api`), autenticación (`auth`), configuración (`core`) y base de datos (`db`). |
| `backend/app/api/` | Endpoints en `api/v1/`, uno por recurso. Si cambia la API, actualizar `docs/tecnica/api.md` (DOC-08). |
| `backend/app/auth/` | Ingreso local y con Google, roles y la CLI de usuarios (`cli.py`). Ver `docs/tecnica/herramientas/autenticacion.md`. |
| `backend/app/core/` | Lectura de `.env` (`config.py`) y piezas transversales. Nada de lógica de negocio. |
| `backend/app/db/` | Sesión de SQLAlchemy y modelos por esquema (raw, staging, core, publicacion, auth; BD-03). |
| `backend/tests/` | Una prueba por comportamiento de la API o de la CLI. Usan SQLite (`test.db`, no versionado). |
| `docs/` | Guía de usuario, técnica, diario, decisiones, producto y pendientes. La documentación cambia en el mismo PR que el código. |
| `docs/decisiones/` | Un ADR por decisión propia de esta app (`NNNN-tema.md`, ID P-NNNN). Las generales van en upme-estandares. |
| `docs/diario/` | Una entrada por PR en `AAAA/AAAA-MM-DD-tema.md` (DOC-05). El índice se genera solo (`scripts/diario.py`). |
| `docs/pendientes/` | Una página por pendiente que necesita contexto, alternativas o un prompt (`x-NN-tema.md`), enlazada desde `docs/pendientes.md`. |
| `docs/producto/` | Qué es la plataforma y hacia dónde va. Cambia cuando cambian alcance o etapas. |
| `docs/tecnica/` | Cómo levantar, arquitectura, frontend, reglas del proyecto, modelo y base de datos, API, flujos, versionado, despliegue y referencias (DOC-07, DOC-08). |
| `docs/tecnica/base-de-datos/` | Una página por esquema (raw, staging, core, publicacion, auth, operacion), convenciones, vistas y, en `fuentes/`, la guía de cada entidad y la ficha de cada fuente (PBD-02, PFU-01, PFU-02). Todo esquema o tabla nueva se documenta aquí en el mismo PR. El diccionario de columnas se genera desde la base. |
| `docs/tecnica/herramientas/` | Una ficha por herramienta usada (DOC-07): cómo encaja aquí, comandos y reglas propias. |
| `docs/tecnica/mockups/` | Capturas congeladas de cada diseño aprobado, con su registro en `README.md` (FLU-03). |
| `docs/usuario/` | Escrita para personas no técnicas: inicio, roles, glosario e inventario de vistas. |
| `docs/usuario/capturas/` | Generadas con Playwright (`pnpm screenshots`, DOC-03). No se pegan a mano. Antes de borrar una, buscar quién la enlaza. |
| `docs/usuario/inventario/` | Con las secciones de DOC-01 (para qué sirve, cómo llegar, qué muestra, paso a paso, filtros, preguntas). El índice se genera solo. |
| `frontend/` | Portal, modo pantalla y app interna, con sus pruebas (Vitest) y capturas (Playwright). |
| `frontend/e2e/` | Recorridos de usuario (`app-shell.spec.ts`) y capturas de la guía (`screenshots.spec.ts`). |
| `frontend/public/` | Fuentes autoalojadas (`fonts/`, UPME-TIP-02) y otros estáticos. Nada que deba pasar por el build. |
| `frontend/src/` | Organizado por función: zonas, componentes, datos, utilidades. Ver `docs/tecnica/frontend.md`. |
| `frontend/src/auth/` | Contexto de sesión, ruta protegida, página de ingreso y regreso a la página pedida. |
| `frontend/src/components/` | Uno por carpeta con su prueba (CMP-01); solo tokens. Todo componente nuevo se agrega a la galería en el mismo PR. |
| `frontend/src/data/` | Tipos, hooks de React Query (`queries.ts`) y fuente (`source.ts`). Las vistas solo leen datos por aquí. |
| `frontend/src/demo/` | Datos de ejemplo deterministas mientras no hay datos reales (CON-07). Se elimina en T-34. |
| `frontend/src/dev/` | Galería de componentes (`/dev/componentes`). No entra al build de producción. |
| `frontend/src/estandares/` | Tokens, preset de Tailwind, tema de ECharts, logos e íconos (FLU-09). **No editar**: se actualiza copiando una versión. |
| `frontend/src/iconos-locales/` | Íconos que aún no están en `estandares/`, con su origen en `iconos.json` (X-17). Se vacía al actualizar el estándar. |
| `frontend/src/lib/` | Formatos es-CO, descargas, íconos por concepto, producto activo, hallazgos y pequeños hooks. |
| `frontend/src/zones/` | `app/` (interna), `portal/` (pública) y `pantalla/` (televisores), cada una con su esqueleto (LAY-01). |
| `pipelines/` | Cargas y cálculos programados. Lógica pura en `lib/`, flujos en `flows/`, horarios en `deployments.py`. |
| `pipelines/flows/` | Un flujo por carga o cálculo, documentado en `docs/tecnica/flujos.md`. |
| `pipelines/lib/` | Funciones puras y probables que usan los flujos. |
| `reglas/` | Reglas de flujo, diseño, técnicas y de marca, y `VERSION` (FLU-09). **No editar aquí**: se cambian en upme-estandares. |
| `scripts/` | Preparación del entorno, verificaciones de la CI y páginas generadas. Python sin librerías externas o bash; la excepción es `diccionario.py`, que usa `psycopg` del backend porque lee la base. |

**Archivos principales**

| Archivo | Para qué sirve |
| --- | --- |
| `README.md` | Esta puerta de entrada. El mapa se genera con `scripts/mapa.py`. |
| `AGENTS.md` | Contexto y reglas para asistentes de IA y personas nuevas. `CLAUDE.md` y `GEMINI.md` lo cargan. |
| `CHANGELOG.md` | Cambios por versión (DOC-04). La CI exige una línea en cada PR. |
| `docker-compose.yml` | Entorno local completo: base, API, app, documentación y Prefect. |
| `.env.example` | Variables de entorno de ejemplo. `dev-setup.sh` crea `.env` (no versionado) a partir de este. |
| `repo-map.toml` | Descripción de cada carpeta; fuente de este mapa. |
| `mkdocs.usuario.yml` | Sitio de la guía de usuario (público). |
| `mkdocs.tecnica.yml` | Sitio de la documentación técnica (privado). |
| `.pre-commit-config.yaml` | Configuración del framework pre-commit heredada de la plantilla; hoy no se usa (los hooks activos están en `.githooks`). Ver X-20. |
| `.githooks/pre-commit` | Regenera las páginas generadas en cada commit. |
| `.github/workflows/ci.yml` | Verificaciones de cada PR. |
| `.github/pull_request_template.md` | Plantilla de PR con la definición de hecho (FLU-05, FLU-07). |
| `scripts/dev-setup.sh` | Prepara y levanta el entorno local en un paso. |
| `backend/dev-start.sh` | Arranque de la API en desarrollo: migra, crea admin@local y recarga. |
| `backend/pyproject.toml` | Dependencias del backend (uv). |
| `frontend/package.json` | Dependencias y comandos del frontend (pnpm). |
| `frontend/vite.config.ts` | Servidor de desarrollo, proxy de la API y pruebas. |
| `frontend/src/routes.config.tsx` | Rutas de la app. Toda ruta necesita su página en el inventario (DOC-02). |
| `frontend/src/zones/app/navigation.ts` | Menú lateral de la app interna (LAY-06). |

<!-- mapa:fin -->

## Comandos frecuentes

```bash
docker compose up -d                          # encender el entorno
docker compose stop                           # apagarlo (los datos se conservan)
docker compose logs -f api                    # ver qué pasa en un servicio
docker compose exec api uv run pytest         # pruebas del backend
docker compose exec web pnpm test             # pruebas del frontend
cd frontend && pnpm screenshots               # capturas de la guía (Playwright, en el equipo)
python scripts/lint_design.py frontend/src    # valores de diseño sueltos (TOK-02)
python scripts/mapa.py                        # regenerar el mapa (lo hace el hook)
```

Las páginas generadas se regeneran solas con el hook (`dev-setup.sh` lo activa). Más comandos y la verificación de la documentación como la CI: [guía técnica](docs/tecnica/index.md) y [ficha de MkDocs](docs/tecnica/herramientas/mkdocs.md).

## Qué no hacer

- Editar `reglas/` o `frontend/src/estandares/`: se cambian en `upme-estandares` y se copian (FLU-09).
- Escribir directo en `develop` o `main`: todo entra por PR (FLU-04).
- Editar a mano las páginas generadas (índices, referencias, mapa).
- Programar una vista sin mockup aprobado (FLU-03).
- Instalar una librería o tecnología sin su proceso (TEC-05, TEC-06).
- Escribir colores, tamaños o fuentes sueltos en el código (TOK-02).
- Compartir o versionar `.env` (contraseñas y secretos).
- Borrar una captura sin revisar quién la enlaza: la documentación falla en la CI.

## Antes de tu primer PR

- [ ] Corrí `./scripts/dev-setup.sh` y la app abre en http://localhost:5173.
- [ ] Leí la [guía del flujo de trabajo](docs/tecnica/flujo-de-trabajo-equipo.md) y, si toco la interfaz, `reglas/REGLAS-DISENO.md`.
- [ ] Mi trabajo tiene issue, y mi rama lleva su número.
- [ ] Revisé la [galería de componentes](http://localhost:5173/dev/componentes) antes de crear uno nuevo.
- [ ] Mi PR cumple la definición de hecho y la CI está en verde.

## Trabajar con asistentes de IA

Claude, Cursor, Codex y Gemini leen [`AGENTS.md`](AGENTS.md): contexto, reglas y el **ciclo con un asistente**. En ese ciclo, el asistente redacta el issue con sus supuestos, la persona lo crea, el asistente desarrolla y documenta, y la persona revisa antes de abrir y unir el PR. El trabajo con IA cumple los mismos requisitos que cualquier otro (IA-03) y pasa por la misma CI.

## Glosario rápido

| Término | Significado |
| --- | --- |
| Revisión | Proyección oficial publicada, nombrada por su mes: «Revisión jul-2026». La vigente es la última publicada. |
| Escenario | Bajo, medio o alto: la proyección con supuestos distintos de economía, población y clima. |
| EE / GN | Energía eléctrica / gas natural. |
| Variables exógenas | Lo que explica la demanda y no depende de ella: PIB, población, clima (ONI). |
| Cifras ilustrativas | Datos de ejemplo mientras se cargan los oficiales (CON-07). |
| T-xx / X-xx | Paso del plan de trabajo / pendiente de decisión ([Referencias](docs/tecnica/referencias.md)). |

Glosario completo: [`docs/usuario/glosario.md`](docs/usuario/glosario.md).

## Ayuda y responsables

- **Responsable:** líder del equipo de la Subdirección de Demanda. Aprueba diseños y decide sobre los pendientes.
- **Dudas sobre una tarea:** en su issue. **Dudas sin tarea** o decisiones por tomar: en [`docs/pendientes.md`](docs/pendientes.md).
- **Algo del entorno no funciona:** «Si algo falla», en la [guía técnica](docs/tecnica/index.md).
