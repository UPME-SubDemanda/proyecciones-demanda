# Documentación técnica

¿Nuevo en el equipo? Empiece por el [flujo de trabajo del equipo](flujo-de-trabajo-equipo.md): issues, ramas, Pull Requests y publicación, con ejemplos. Para saber qué significa un ID como `DOC-04`, `T-05` o `X-04`, búsquelo en el buscador o en [Referencias](referencias.md).

## Levantar el proyecto

```bash
git config core.hooksPath .githooks   # una vez por copia: activa el hook de páginas generadas
cp .env.example .env          # cambiar SESSION_SECRET por un valor aleatorio
docker compose up -d --build
docker compose exec api uv run alembic upgrade head
docker compose exec api uv run python -m app.auth.cli create-user admin@local --role admin
```

API: http://localhost:8000/docs · Web: http://localhost:5173 · Prefect: http://localhost:4200

Las migraciones y la CLI se ejecutan **dentro del contenedor `api`**: ahí `DATABASE_URL` apunta al servicio `db` (nombre que solo existe en la red de Docker). La configuración lee `.env` desde la carpeta donde se ejecuta el comando; si se corren desde `backend/` en el equipo, no lo encuentran y usan SQLite (`local.db`) sin avisar.

## Páginas generadas

Dos páginas se generan con scripts y la CI falla si no están al día:

| Página | Script | Se regenera cuando cambia |
| --- | --- | --- |
| `docs/tecnica/referencias.md` | `scripts/referencias.py` | Cualquier `.md` (reglas, pendientes, decisiones o una cita nueva) |
| `docs/usuario/inventario/index.md` | `scripts/inventario.py` | Una página del inventario o las rutas del frontend |

El hook `.githooks/pre-commit` las regenera y las agrega al mismo commit, sin hacer nada a mano. Se activa una vez por copia del repositorio con `git config core.hooksPath .githooks`. Sin el hook, hay que correr los scripts antes del commit; si se olvida, la CI lo avisa.

## Pruebas

```bash
cd backend && uv run pytest              # usa SQLite en backend/test.db (no versionado)
docker compose exec web pnpm test       # o, con pnpm 9 instalado: cd frontend && pnpm test
```

`pnpm test` corre Vitest una vez (CI y verificación); `pnpm test:watch` lo deja en modo observación.

El frontend fija pnpm en `package.json` (`packageManager`, la misma versión mayor que la CI) y versiona `pnpm-lock.yaml`.
