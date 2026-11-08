# Documentación técnica

## Levantar el proyecto

```bash
cp .env.example .env
docker compose up -d
cd backend && uv run alembic upgrade head && uv run python -m app.auth.cli create-user admin@local --role admin
```

API: http://localhost:8000/docs · Web: http://localhost:5173 · Prefect: http://localhost:4200
