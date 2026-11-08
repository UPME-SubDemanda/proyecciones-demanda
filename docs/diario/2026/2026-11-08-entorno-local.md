---
fecha: 2026-11-08
autor: David Bedoya
pr: 3
issue: 1
tipo: corrige
vistas: []
features: [entorno-local]
version: sin publicar
---

## Qué cambió
El entorno de desarrollo ahora se levanta completo con los comandos de la guía técnica: base de datos, API, aplicación web y los dos servicios de Prefect. Las migraciones, la creación del usuario administrador local y las pruebas funcionan sin pasos manuales adicionales.

## Por qué
Al preparar el entorno por primera vez fallaban la construcción de la web y del trabajador de Prefect, las migraciones no encontraban el código de la app y la guía llevaba a crear la base en un archivo SQLite en lugar de PostgreSQL. El comando de pruebas del frontend tampoco funcionaba con la versión de pnpm que usa la CI.

## Cómo se ve
Sin cambios visuales.

## Notas técnicas
- `pipelines/pyproject.toml`: `[build-system]` y `packages.find` con `flows*` y `lib*`.
- `docker-compose.yml`: healthcheck de `prefect-server` (`/api/health`); `prefect-worker` espera `service_healthy`.
- `frontend/package.json`: `packageManager: pnpm@9.15.9`, `pnpm.onlyBuiltDependencies: [esbuild]`, `test` = `vitest run`, nuevo `test:watch`. Se agrega `pnpm-lock.yaml`; el Dockerfile instala con `--frozen-lockfile`.
- `.github/workflows/ci.yml`: `pnpm test` en lugar de `pnpm test --run`.
- `backend/alembic.ini`: `prepend_sys_path = .`.
- `.gitignore`: `*.db` y `.DS_Store`; `backend/test.db` deja de versionarse.
- `docs/tecnica/index.md`: comandos de migración y CLI dentro del contenedor `api`, y sección de pruebas.
