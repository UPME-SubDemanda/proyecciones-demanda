# Documentación técnica

## Levantar el proyecto

```bash
cp .env.example .env          # cambiar SESSION_SECRET por un valor aleatorio
docker compose up -d --build
docker compose exec api uv run alembic upgrade head
docker compose exec api uv run python -m app.auth.cli create-user admin@local --role admin
```

API: http://localhost:8000/docs · Web: http://localhost:5173 · Prefect: http://localhost:4200

Las migraciones y la CLI se ejecutan **dentro del contenedor `api`**: ahí `DATABASE_URL` apunta al servicio `db` (nombre que solo existe en la red de Docker). La configuración lee `.env` desde la carpeta donde se ejecuta el comando; si se corren desde `backend/` en el equipo, no lo encuentran y usan SQLite (`local.db`) sin avisar.

## Pruebas

```bash
cd backend && uv run pytest              # usa SQLite en backend/test.db (no versionado)
docker compose exec web pnpm test       # o, con pnpm 9 instalado: cd frontend && pnpm test
```

`pnpm test` corre Vitest una vez (CI y verificación); `pnpm test:watch` lo deja en modo observación.

El frontend fija pnpm en `package.json` (`packageManager`, la misma versión mayor que la CI) y versiona `pnpm-lock.yaml`.
