#!/bin/sh
# Arranque de la API en desarrollo (docker-compose.yml): migra la base, crea el administrador local
# si falta y sirve la API con recarga al guardar. En otros entornos se usa el CMD del Dockerfile.
set -e

echo "Aplicando migraciones…"
uv run --no-dev alembic upgrade head

if [ -n "$DEV_ADMIN_PASSWORD" ]; then
  uv run --no-dev python -m app.auth.cli create-user admin@local --role admin --password "$DEV_ADMIN_PASSWORD" --if-missing
else
  echo "DEV_ADMIN_PASSWORD está vacío en .env: no se crea admin@local (ver docs/tecnica/index.md)."
fi

exec uv run --no-dev fastapi run app/main.py --host 0.0.0.0 --port 8000 --reload
