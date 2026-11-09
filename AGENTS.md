# AGENTS.md · Proyecciones de Demanda

Contexto y reglas para cualquier asistente de IA (Claude, Cursor, Codex, Gemini) y para personas nuevas en el equipo. Léelo completo antes de cualquier tarea.

## Qué es
Plataforma de la Subdirección de Demanda de la UPME para consultar, comparar y monitorear las proyecciones de demanda de energía eléctrica y gas natural.
Responsable: Líder del equipo de la Subdirección de Demanda. Detalle del producto en `docs/producto/`. Pendientes en `docs/pendientes.md`.

## Contexto del producto (resumen)
- Productos: Energía eléctrica (`ee`) y Gas natural (`gn`).
- **Etapa 1 (actual):** solo carga y consulta de datos históricos, revisiones ya publicadas y variables exógenas. **No** ejecutar, entrenar ni versionar modelos (eso es fase 2, con DVC y MLflow obligatorios).
- Mockups de referencia: https://claude.ai/artifact/DJrR79dHKDgYv77oe9b3sX (borradores; cada vista requiere aprobación, X-06).

## Reglas que sigue
Copia de `upme-estandares` en `reglas/` (versión en `reglas/VERSION`), marca **upme**. **No edites `reglas/`**: las reglas se cambian en `upme-estandares` y se copian aquí (FLU-09). Lee cada archivo cuando la tarea lo pida:

| Antes de… | Lee |
| --- | --- |
| Cualquier tarea (ya cargado por `CLAUDE.md`) | `reglas/REGLAS-FLUJO.md` |
| Diseñar, revisar o tocar el frontend, gráficos, portal o modo pantalla | `reglas/REGLAS-DISENO.md` y `reglas/MARCA-UPME.md`; diseño propio de esta app en `docs/tecnica/diseno-app.md` |
| Agregar, cambiar o quitar una librería o tecnología; tocar arquitectura, base de datos o autenticación | `reglas/REGLAS-TECNICAS.md`. Para una tecnología: **no la instales**; entrega el prompt de TEC-10 para Claude Code en `upme-estandares` |
| Publicar un release o decidir una versión | `docs/tecnica/versionado.md` |

Cita los IDs de las reglas (GRA-03, FLU-07…) en tus resúmenes y PR. Qué significa cada ID (reglas, pasos T-xx, pendientes X-xx, decisiones): `docs/tecnica/referencias.md`, generada con `python scripts/referencias.py`.

## Stack
Python 3.12 + uv · FastAPI · SQLAlchemy 2 + Alembic · PostgreSQL 16 · React + TypeScript + Vite · Tailwind (preset de marca) · ECharts (tema de marca) · Prefect (provisional) · pytest, Vitest, Playwright · Docker Compose · MkDocs.

## Mapa del repositorio
```
backend/      API FastAPI (app/api/v1, app/services, app/auth, app/db) y migraciones Alembic
frontend/     React: src/zones/{app,portal,pantalla}, src/components, src/estandares (copia de dist/upme)
pipelines/    Flujos de Prefect (flows/), lógica pura (lib/), horarios (deployments.py)
reglas/       Copia de las reglas de upme-estandares (no editar)
docs/         usuario/ (pública) · tecnica/ (privada) · diario/ · decisiones/ · producto/
scripts/      lint_design.py · check_changelog.py · inventario.py · referencias.py · diario.py · reporte.py
```

## Comandos
```bash
docker compose up -d                         # db, api, web, prefect
# Usuario admin@local de desarrollo: contraseña en DEV_ADMIN_PASSWORD de .env (docs/tecnica/index.md). No la muestres ni la copies.
cd backend && uv run pytest
cd frontend && pnpm dev | pnpm test | pnpm screenshots
python scripts/lint_design.py frontend/src
python scripts/inventario.py                 # regenera docs/usuario/inventario/index.md
python scripts/referencias.py                # regenera docs/tecnica/referencias.md (tras cambiar reglas, pendientes o ADR)
git config core.hooksPath .githooks          # una vez: el hook pre-commit regenera referencias e inventario solo
uv run mkdocs serve -f mkdocs.usuario.yml    # o mkdocs.tecnica.yml
```

## Reglas para trabajar aquí
1. **Vista o feature nueva**: debe existir un issue con ficha y **diseño aprobado** (FLU-01, FLU-03). Si no existe, pídelo antes de programar.
2. **Ramas**: `feature/<issue>-<slug>` desde `develop`; `hotfix/` desde `main` (FLU-04). Commits en inglés con Conventional Commits (FLU-06). Guía con ejemplos: `docs/tecnica/flujo-de-trabajo-equipo.md`.
3. **Diseño**: solo tokens, componentes del inventario, íconos de la marca, ECharts con el tema (TOK-02, CMP-01, GRA-00). Ejecuta `lint_design.py`. Convención del proyecto: todo componente nuevo se agrega a la galería `/dev/componentes` (`frontend/src/dev/ComponentGallery.tsx`) en el mismo PR (ver `docs/tecnica/frontend.md` y X-13).
4. **Definición de hecho (FLU-07)**: pruebas + revisión de diseño (REV) + página del inventario con capturas (DOC-01, DOC-03) + documentación técnica si aplica (DOC-07, DOC-08) + entrada en `CHANGELOG.md` (DOC-04) + entrada en `docs/diario/` (DOC-05).
5. **Base de datos**: cambios solo con migraciones de Alembic; esquemas raw/staging/core/publicacion/auth (BD-03, BD-04).
6. **Si una regla no encaja o falta una**: detente y pregunta. Propón un ADR (en el proyecto si es propio de esta app, o en `upme-estandares` si es general). Anota lo no resuelto en `docs/pendientes.md`.
7. Interfaz y documentación en español de Colombia; código en inglés.
8. **Páginas generadas**: `docs/tecnica/referencias.md`, `docs/usuario/inventario/index.md` y `docs/diario/index.md` no se editan a mano. Si el hook `.githooks/pre-commit` no está activo, ejecuta `scripts/diario.py`, `scripts/referencias.py` e `scripts/inventario.py` antes de cada commit que toque Markdown o rutas.

## Ciclo con un asistente
Así se trabaja cada paso del plan (T-xx) o cada corrección con un asistente. Explicación para personas: `docs/tecnica/flujo-de-trabajo-equipo.md` (sección «Trabajar con un asistente de IA»). Propuesta al estándar: X-20.

1. **Issue:** redacta el título y el cuerpo con la plantilla que corresponda (`.github/ISSUE_TEMPLATE/`) e incluye una sección **Supuestos**, con el aviso de que si un supuesto cambia, el issue se actualiza antes de seguir. No crees el issue: lo crea la persona y te pasa el número.
2. **Rama:** desde `develop` actualizado (`git switch develop && git pull`), con el número del issue (FLU-04). Commits con `Refs: #<n>` (FLU-06).
3. **Desarrollo:** cumple la definición de hecho (FLU-07). Si un supuesto del issue resulta falso, detente, explícalo y propone el texto nuevo del issue.
4. **Entrega:** redacta el título y el cuerpo del PR con `.github/pull_request_template.md`, con `Closes #<n>` en el campo *Issue*. Recuérdale a la persona que revise el desarrollo, haga las pruebas que considere y compare con el mockup aprobado (`docs/tecnica/mockups/`).
5. **Ajustes:** todo cambio o feedback se hace **en la misma rama, antes de abrir el PR**, y actualizas el cuerpo del PR hasta que la persona diga que está listo. No abras ni unas el PR: lo hace la persona.
