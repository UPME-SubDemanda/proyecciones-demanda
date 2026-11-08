# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/es-ES/), versiones SemVer (DOC-04, FLU-08). Cada línea menciona la vista o feature y el PR.

## [Sin publicar]
### Agregado
- Estructura inicial del proyecto (upme-estandares 1.0.0).
- Reglas de upme-estandares 2.1.0 copiadas en `reglas/` (incluye TEC-10); `CLAUDE.md` carga `AGENTS.md` y las reglas de flujo (FLU-09, IA-02).
- Autenticación: cuenta institucional de Google o usuario local, roles asignados por administradores.
- Modelo de datos de la etapa 1: productos, series reales, revisiones publicadas, escenarios, variables exógenas y supuestos (migración 0002).
- Inventario de vistas planeadas con enlace a los mockups de referencia.
- Reglas de versionado del proyecto: casos de vistas, modelos, datos y revisiones (P-0003).
- Mockups aprobados de 8 pantallas (tablero ejecutivo, histórico de revisiones, monitor de exógenas, portal escritorio y móvil, modo pantalla, ejecutar proyección y registro de modelos) en `docs/tecnica/mockups/`, con registro de aprobación (FLU-03, X-06) (issue #2, PR #4).
- Guía del flujo de trabajo del equipo (issues, ramas, PR, CI y publicación, con ejemplos) en `docs/tecnica/flujo-de-trabajo-equipo.md` (FLU-01 a FLU-10) (issue #5).
- Plan de trabajo ordenado (T-01 a T-20) en `docs/pendientes.md`, con la decisión de construir las vistas con cifras ilustrativas en el frontend antes de conectar datos reales; incluye la página de referencias (T-20) como paso siguiente (issue #7).

### Cambiado
- Hoja de ruta: el portal público y el modo pantalla pasan a la etapa 1.1 y las notificaciones a la 1.2 (issue #7).
- Inventario: el campo `diseno` de cada vista apunta a su mockup aprobado; proyección vs. real, comparar revisiones y usuarios y roles quedan sin diseño (issue #2, PR #4).

### Eliminado
- `backend/test.db` del repositorio; las bases SQLite locales quedan ignoradas (issue #1, PR #3).

### Corregido
- Entorno local: `prefect-worker` no compilaba (paquetes de `pipelines/` sin declarar) y arrancaba antes de que `prefect-server` estuviera listo; ahora espera su healthcheck (issue #1, PR #3).
- Entorno local: `web` no compilaba con pnpm reciente; se fija `pnpm@9.15.9` (la versión mayor de la CI), se permite el build de `esbuild` y se versiona `pnpm-lock.yaml` (issue #1, PR #3).
- Migraciones: Alembic no encontraba el paquete `app` (`prepend_sys_path` en `alembic.ini`) (issue #1, PR #3).
- Frontend y CI: `pnpm test` corre Vitest una sola vez (`test:watch` para modo observación); `pnpm test --run` fallaba con pnpm 9 (issue #1, PR #3).
- Guía técnica: migraciones y creación de usuarios se ejecutan dentro del contenedor `api`; desde el equipo usaban SQLite sin avisar (issue #1, PR #3).
