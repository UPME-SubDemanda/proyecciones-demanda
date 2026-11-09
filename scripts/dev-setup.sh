#!/usr/bin/env bash
# Prepara y levanta el entorno local de desarrollo en un solo paso. Se puede repetir sin problema.
#
#   ./scripts/dev-setup.sh
#
# 1. Revisa que estén Docker y git.
# 2. Activa el hook de git que regenera las páginas generadas.
# 3. Crea .env desde .env.example (si no existe) con SESSION_SECRET y DEV_ADMIN_PASSWORD aleatorios.
#    Nunca los muestra: la contraseña de admin@local queda en .env.
# 4. Levanta todo con Docker. La API migra la base y crea admin@local sola (backend/dev-start.sh).
# 5. Espera a que la API responda y muestra las direcciones.
set -euo pipefail

cd "$(dirname "$0")/.."

say() { printf '\n\033[1m%s\033[0m\n' "$1"; }
fail() { printf '\n\033[31m%s\033[0m\n' "$1" >&2; exit 1; }

say "1/5 · Revisando herramientas"
command -v docker >/dev/null || fail "Falta Docker Desktop: instálelo y vuelva a correr este script."
docker info >/dev/null 2>&1 || fail "Docker no está corriendo: abra Docker Desktop y vuelva a intentar."
command -v git >/dev/null || fail "Falta git."
echo "Docker y git listos."

say "2/5 · Activando el hook de git (páginas generadas)"
git config core.hooksPath .githooks
echo "Hook activo (.githooks/pre-commit)."

say "3/5 · Preparando .env"
random_value() { LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c "$1"; }
set_if_empty() {
  # Escribe KEY=valor solo si la variable falta o está vacía (o tiene el valor de ejemplo).
  local key="$1" value="$2"
  if grep -qE "^${key}=(cambiar-en-cada-entorno)?$" .env; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" .env && rm -f .env.bak
    echo "${key}: generado."
  elif ! grep -qE "^${key}=" .env; then
    printf '%s=%s\n' "$key" "$value" >> .env
    echo "${key}: generado."
  else
    echo "${key}: ya tenía valor, se deja igual."
  fi
}
if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env creado desde .env.example."
fi
set_if_empty SESSION_SECRET "$(random_value 48)"
set_if_empty DEV_ADMIN_PASSWORD "$(random_value 20)"

say "4/5 · Levantando el entorno con Docker (la primera vez tarda unos minutos)"
docker compose up -d --build

say "5/5 · Esperando a la API"
for _ in $(seq 1 60); do
  if curl -fsS http://localhost:8000/api/v1/health >/dev/null 2>&1; then ok=1; break; fi
  sleep 2
done
[ "${ok:-}" = 1 ] || fail "La API no respondió. Revise: docker compose logs api"
docker compose logs api 2>/dev/null | grep -E "Usuario admin@local|DEV_ADMIN_PASSWORD" | tail -1 || true

cat <<'EOF'

Listo. Direcciones:
  App (portal, modo pantalla y app interna)  http://localhost:5173
  API y su documentación                      http://localhost:8000/docs
  Guía de usuario                             http://localhost:8002
  Documentación técnica                       http://localhost:8001
  Prefect                                     http://localhost:4200

Para entrar a la app interna: http://localhost:5173 → Ingresar → «Ingresar con usuario local»
  usuario: admin@local · contraseña: la de DEV_ADMIN_PASSWORD en .env (no se comparte)

Siguiente lectura: docs/tecnica/flujo-de-trabajo-equipo.md (cómo trabajamos con issues, ramas y PR).
EOF
