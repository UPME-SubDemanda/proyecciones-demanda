---
id: X-21
tema: Llevar al estándar las prácticas del proyecto
responsable: Líder
estado: Abierto
revisar: cuando haya espacio para trabajar en upme-estandares
creado: 2026-11-09
relacionado: [FLU-09, DOC-01, DOC-02, DOC-05, DOC-07, DOC-08, IA-01, IA-02, TEC-05, TEC-06, X-13, X-17, X-20]
---

# X-21 · Llevar al estándar las prácticas del proyecto

**Qué hay que hacer:** proponer en `upme-estandares` las prácticas, scripts y archivos que este proyecto construyó para documentar, verificar y arrancar, para que todos los proyectos de la UPME los tengan desde el inicio y este proyecto los reciba con la copia del estándar (FLU-09).

## Contexto

El estándar (versión 2.1.0) define **qué** se documenta (DOC-01 a DOC-08) y entrega a cada proyecto las reglas (`reglas/`) y la marca (`dist/<marca>/`). No entrega herramientas para **cumplirlo sin depender de la memoria**: verificar que lo generado esté al día, que cada carpeta esté explicada o que el entorno se levante igual en cualquier computador.

Al construir las vistas de la etapa 1 (T-03 a T-11 y los issues #5, #9, #13, #27 y #29) este proyecto agregó varias de esas herramientas. Funcionaron y no tienen nada propio de las proyecciones de demanda: sirven a cualquier proyecto.

Este pendiente las reúne. Tres temas relacionados ya tienen su propio pendiente y prompt, y no se repiten aquí:

- **X-13:** componentes compartidos y la galería de componentes (regla CMP-04).
- **X-17:** íconos locales al estándar (pausa, reproducir, pantalla completa, chevrones).
- **X-20:** ciclo de trabajo con asistentes de IA (regla IA-06).

## Qué llevar al estándar

| # | Práctica | En este proyecto | Por qué sirve a todos |
| --- | --- | --- | --- |
| 1 | **README como puerta de entrada**, con estructura fija: qué es, estado, empezar en 5 minutos, cómo trabajamos, qué se documenta dónde, reglas en un minuto, cómo funciona, mapa, comandos, qué no hacer, primer PR, asistentes de IA, glosario, ayuda. Resume y enlaza. | `README.md` (#29) | Lo primero que ve un desarrollador; hoy cada proyecto lo arma distinto o queda casi vacío. |
| 2 | **Mapa del repositorio verificado:** descripción de cada carpeta en `repo-map.toml` y `scripts/mapa.py`, que lo escribe en el README y falla si hay una carpeta sin describir o una descripción de más. | `repo-map.toml`, `scripts/mapa.py` (#29) | La estructura queda explicada y no se desactualiza: quien crea una carpeta la describe en el mismo PR. |
| 3 | **Páginas generadas con `--check`:** índice del inventario (ya existe en el estándar), índice del diario y página de referencias de IDs buscable. | `scripts/diario.py`, `scripts/referencias.py` (#9, #13) | Cada ID (FLU-07, T-05, X-04) se puede consultar; el diario se navega. |
| 4 | **Hook de git versionado** que regenera las páginas generadas en cada commit, y los pasos `--check` en la CI como red de seguridad. | `.githooks/pre-commit`, `.github/workflows/ci.yml` (#9, #29) | Nadie tiene que acordarse de correr los scripts. |
| 5 | **Entorno local de un comando:** `scripts/dev-setup.sh` (crea `.env` con secretos aleatorios, activa el hook, levanta todo); código montado con recarga al guardar; la API migra y crea el administrador local al arrancar (`create-user --if-missing`); documentación en Docker. | `scripts/dev-setup.sh`, `docker-compose.yml`, `backend/dev-start.sh` (#27) | Una persona nueva trabaja en minutos y sin instalar Python ni Node. |
| 6 | **Usuario administrador local documentado:** usuario fijo, contraseña en `DEV_ADMIN_PASSWORD` de `.env` (no versionado), nunca compartida. | `docs/tecnica/index.md`, `.env.example` (#17, #27) | Evita contraseñas pegadas en chats o en el repositorio. |
| 7 | **Guía del flujo de trabajo** para personas, con ejemplos y quién hace qué. | `docs/tecnica/flujo-de-trabajo-equipo.md` (#5) | Las reglas dicen qué; la guía muestra cómo. |
| 8 | **Una página por pendiente** que necesita contexto, alternativas o un prompt (`docs/pendientes/x-NN-tema.md`). | `docs/pendientes/` (#8) | Los pendientes complejos no caben en una fila; también facilita llevarlos a Notion (X-12). |
| 9 | **Verificación de la documentación sin `-q`:** con `-q`, MkDocs no cuenta las advertencias en modo estricto y la CI falla aunque en local parezca bien. | `docs/tecnica/herramientas/mkdocs.md` (#19, #27) | Evita PR rotos por enlaces a archivos borrados. |
| 10 | **Capturas y recorridos con sesión simulada:** Playwright responde `/api/v1/auth/me` con un usuario de ejemplo. | `frontend/e2e/` (#17) | Capturas de la guía (DOC-03) sin credenciales reales. |

**Decisión que conviene tomar allá:** la plantilla del estándar trae `.pre-commit-config.yaml` (framework *pre-commit*, con ruff y `lint_design.py`), pero este proyecto usa `.githooks/` con `core.hooksPath`, que tiene prioridad, así que esa configuración no corre. Hay que elegir uno de los dos (o hacer que `.githooks/pre-commit` también corra ruff y `lint_design.py`) y quitar el otro de la plantilla.

## Insumos

Todo está en `proyecciones-demanda`, rama `develop` (después de unir el PR del #29):

- `README.md`, `repo-map.toml`, `scripts/mapa.py`
- `scripts/referencias.py`, `scripts/diario.py`, `scripts/dev-setup.sh`
- `.githooks/pre-commit`, `.github/workflows/ci.yml`
- `docker-compose.yml`, `backend/dev-start.sh`, `backend/app/auth/cli.py` (`--if-missing`), `frontend/vite.config.ts` (`API_PROXY_TARGET`, `VITE_USE_POLLING`), `frontend/.dockerignore`, `.env.example`
- `docs/tecnica/index.md` (levantar el proyecto, usuario administrador, páginas generadas), `docs/tecnica/flujo-de-trabajo-equipo.md`, `docs/tecnica/herramientas/mkdocs.md`
- `docs/pendientes.md` y `docs/pendientes/` (formato de página por pendiente)
- `frontend/e2e/screenshots.spec.ts`, `frontend/e2e/app-shell.spec.ts`
- `AGENTS.md` (reglas 8 y 9 sobre páginas generadas y carpetas nuevas)

Los scripts usan solo Python estándar (3.11 o más, por `tomllib`) y bash: no agregan tecnologías (TEC-05).

## Qué proponer en el estándar

1. **REGLAS-FLUJO.md, documentación:**
    - una regla para el README con la estructura de la práctica 1;
    - una regla para el mapa verificado (práctica 2): toda carpeta se describe en `repo-map.toml` en el mismo PR;
    - extender DOC-02 a todas las páginas generadas, con `--check` en la CI y hook (prácticas 3 y 4);
    - la convención de página por pendiente (práctica 8).
2. **IA-02:** que `AGENTS.md` incluya las reglas de páginas generadas y carpetas nuevas.
3. **Plantilla de proyecto del estándar:** incluir los scripts, el hook, `repo-map.toml` de ejemplo, el README con sus marcas, `dev-setup.sh`, el patrón de `docker-compose.yml` para desarrollo y la guía del flujo. Definir cómo llegan a cada proyecto (copia con FLU-09, como `reglas/`, o como parte de la plantilla inicial).
4. **Ficha general de MkDocs:** la nota de verificar sin `-q` (práctica 9).
5. **Decidir** entre `.pre-commit-config.yaml` y `.githooks/`.
6. Versión MENOR del estándar si todo es nuevo y compatible.

## Pasos

- [ ] Unir el PR del #29 (README y mapa) para que todos los insumos estén en `develop`.
- [ ] Ejecutar el prompt de abajo en Claude Code abierto en `upme-estandares` y revisar el PR.
- [ ] Decidir allá entre `.pre-commit-config.yaml` y `.githooks/`.
- [ ] Publicar la versión nueva del estándar.
- [ ] En este proyecto: copiar la versión nueva (FLU-09, `chore: update standards to vX.Y.Z`), reemplazar los archivos locales por los del estándar donde corresponda, cambiar las referencias a X-21 por las reglas nuevas y cerrar este pendiente.

## Prompt para `upme-estandares`

Para ejecutar en Claude Code abierto en `upme-estandares`. Antes, ten a mano `proyecciones-demanda` (en el disco o en GitHub, rama `develop`).

```
Propuesta desde proyecciones-demanda (pendiente X-21): llevar al estándar las prácticas que ese
proyecto construyó para documentar, verificar y arrancar.

Contexto: el estándar dice qué se documenta (DOC-01 a DOC-08) pero no entrega herramientas para
cumplirlo sin depender de la memoria. proyecciones-demanda agregó varias y funcionaron. Lee primero
en ese repositorio: README.md, repo-map.toml, scripts/mapa.py, scripts/referencias.py,
scripts/diario.py, scripts/dev-setup.sh, .githooks/pre-commit, .github/workflows/ci.yml,
docker-compose.yml, backend/dev-start.sh, docs/tecnica/index.md,
docs/tecnica/flujo-de-trabajo-equipo.md, docs/tecnica/herramientas/mkdocs.md, AGENTS.md (reglas 8
y 9) y docs/pendientes/x-21-estandarizar-practicas.md (tabla «Qué llevar al estándar»).

No repitas lo que ya tiene pendiente propio: componentes y galería (X-13, CMP-04), íconos (X-17) y
ciclo con asistentes (X-20, IA-06).

Haz lo siguiente y abre un PR:
1. REGLAS-FLUJO.md (sección de documentación): propone reglas nuevas, con IDs que no se usen:
   a) README con la estructura fija de la práctica 1 (resume y enlaza; nada de repetir la
      documentación);
   b) mapa del repositorio verificado: toda carpeta versionada de primer y segundo nivel (y las de
      tercer nivel que el proyecto elija) se describe en repo-map.toml en el mismo PR; la CI falla
      si falta o sobra una descripción;
   c) extender DOC-02 a todas las páginas generadas (índices, referencias, mapa), con --check en la
      CI y un hook de git versionado que las regenera;
   d) una página por pendiente que necesite contexto (docs/pendientes/x-NN-tema.md).
   Nivel DEBE para b y c; DEBERÍA para a y d, salvo que veas razón para otro nivel.
2. IA-02: que AGENTS.md incluya las reglas de páginas generadas y carpetas nuevas.
3. Plantilla de proyecto: agrega scripts/mapa.py, scripts/referencias.py, scripts/diario.py,
   scripts/dev-setup.sh, .githooks/pre-commit, un repo-map.toml de ejemplo, el README con las
   marcas del mapa, el patrón de docker-compose.yml de desarrollo (código montado, documentación en
   Docker, base con healthcheck) y la guía del flujo de trabajo. Adapta lo que sea propio de
   proyecciones-demanda (rutas, nombres, IDs T-xx y X-xx) para que sirva a cualquier proyecto.
   Propone cómo llegan a cada proyecto: por copia con FLU-09 (como reglas/) o solo en la plantilla
   inicial. No elijas: deja las dos opciones en el resumen del PR.
4. La plantilla trae .pre-commit-config.yaml (framework pre-commit), pero el proyecto usa .githooks
   con core.hooksPath, que tiene prioridad, así que esa configuración no corre. Propone una sola
   opción (por ejemplo, que .githooks/pre-commit también corra ruff y lint_design.py) y explica el
   cambio. No borres nada sin explicarlo en el PR.
5. Ficha general de MkDocs: agrega «verificar --strict sin -q; con -q las advertencias no cuentan».
6. Los scripts usan solo Python estándar (3.11+) y bash: confirma que no introducen tecnologías
   nuevas (TEC-05) y anótalo.
7. CHANGELOG del estándar con versión MENOR y un resumen del PR que cite los IDs.

Si una regla existente choca con algo de esto, no la cambies por tu cuenta: anótalo en el resumen y
propone un ADR.
```

## Historial

- 2026-11-09: se crea con el README y el mapa del repositorio (#29).
