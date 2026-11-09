---
fecha: 2026-11-09
autor: David Bedoya
pr: 28
issue: 27
tipo: corrige
vistas: []
features: [entorno-local]
version: sin publicar
---

## Qué cambió
Levantar el proyecto en un computador nuevo es ahora **un solo comando**: `./scripts/dev-setup.sh`. Con eso quedan, siempre al día con el código:
- la app (portal, modo pantalla y app interna) en el 5173;
- la API en el 8000;
- la guía de usuario en el 8002;
- la documentación técnica en el 8001;
- Prefect en el 4200.

El script crea la configuración con contraseñas aleatorias. La API prepara la base y el usuario administrador sola. Los cambios al código y a la documentación se ven al guardar, sin reconstruir nada.

Antes, el 5173 mostraba una versión vieja de la app, el ingreso no funcionaba dentro de Docker y la documentación había que levantarla a mano.

## Por qué
Para que cualquier persona del equipo pueda empezar a trabajar rápido y sin pasos que olvidar.

## Cómo se ve
Guía «Levantar el proyecto» en `docs/tecnica/index.md`: primera vez, direcciones, día a día y solución de problemas.

## Notas técnicas
- `docker-compose.yml`:
    - `web` con `frontend/` montado, `node_modules` en volumen, `API_PROXY_TARGET=http://api:8000` y sondeo de cambios;
    - `api` con `backend/` montado, `.venv` en volumen y `backend/dev-start.sh` (migraciones, `admin@local` con `--if-missing`, recarga);
    - `db` con healthcheck;
    - servicios `docs-usuario` y `docs-tecnica` con `squidfunk/mkdocs-material:9.8.1` (misma versión que la CI).
- `frontend/vite.config.ts`: proxy configurable y `usePolling` con `VITE_USE_POLLING`. `frontend/.dockerignore`.
- CLI `create-user --if-missing` con pruebas (`backend/tests/test_cli.py`).
- Probado desde una copia limpia del proyecto: un solo comando (≈ 30 s con imágenes en caché), todas las direcciones responden, ingreso de `admin@local` con la contraseña de `.env`, script repetible, recarga de API y frontend, y pruebas del backend (8) y del frontend (165) dentro de los contenedores.
- Ficha local `docs/tecnica/herramientas/mkdocs.md`. T-11 pasa a Hecho (PR #26).
