# Documentación técnica

¿Nuevo en el equipo? Empiece por el [flujo de trabajo del equipo](flujo-de-trabajo-equipo.md): issues, ramas, Pull Requests y publicación, con ejemplos. Para saber qué significa un ID como `DOC-04`, `T-05` o `X-04`, búsquelo en el buscador o en [Referencias](referencias.md).

## Levantar el proyecto

```bash
git config core.hooksPath .githooks   # una vez por copia: activa el hook de páginas generadas
cp .env.example .env          # cambiar SESSION_SECRET y poner DEV_ADMIN_PASSWORD (valores aleatorios, ver abajo)
docker compose up -d --build
docker compose exec api uv run alembic upgrade head
docker compose exec api sh -c 'uv run python -m app.auth.cli create-user admin@local --role admin --password "$DEV_ADMIN_PASSWORD"'
```

API: http://localhost:8000/docs · Web: http://localhost:5173 · Prefect: http://localhost:4200

Las migraciones y la CLI se ejecutan **dentro del contenedor `api`**: ahí `DATABASE_URL` apunta al servicio `db` (nombre que solo existe en la red de Docker). La configuración lee `.env` desde la carpeta donde se ejecuta el comando; si se corren desde `backend/` en el equipo, no lo encuentran y usan SQLite (`local.db`) sin avisar.

## Usuario administrador local

Para entrar a la app interna en desarrollo (`/app`, o **Ingresar** en el portal → «Ingresar con usuario local»):

| Dato | Dónde está |
| --- | --- |
| Usuario | `admin@local` |
| Contraseña | En **`.env`**, variable `DEV_ADMIN_PASSWORD` |

- `.env` está ignorado por git: la contraseña existe solo en el computador de cada persona y **no se comparte** por chat, correo ni en el repositorio. Cada quien genera la suya.
- La app no lee `DEV_ADMIN_PASSWORD`: solo sirve para crear el usuario y para recordarla. El contenedor `api` recibe las variables de `.env`, por eso el comando de creación la toma de ahí sin escribirla en la terminal.
- Solo para desarrollo local. En pruebas y producción los usuarios entran con la cuenta institucional de Google y sus roles los asigna un administrador.

**Primera vez:**

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(18))"   # copie el valor en DEV_ADMIN_PASSWORD de .env
docker compose up -d api                                         # el contenedor relee .env al recrearse
docker compose exec api sh -c 'uv run python -m app.auth.cli create-user admin@local --role admin --password "$DEV_ADMIN_PASSWORD"'
```

**Otro usuario con su propia contraseña** (el comando la pide sin mostrarla):

```bash
docker compose exec api uv run python -m app.auth.cli create-user su.correo@upme.gov.co --role admin
```

**Si se olvidó la contraseña:** está en `.env`. Si `.env` se perdió, cree otro usuario con el comando anterior; la CLI todavía no tiene un comando para cambiar contraseñas.

## Páginas generadas

Tres páginas se generan con scripts y la CI falla si no están al día:

| Página | Script | Se regenera cuando cambia |
| --- | --- | --- |
| `docs/tecnica/referencias.md` | `scripts/referencias.py` | Cualquier `.md` (reglas, pendientes, decisiones o una cita nueva) |
| `docs/usuario/inventario/index.md` | `scripts/inventario.py` | Una página del inventario o las rutas del frontend |
| `docs/diario/index.md` | `scripts/diario.py` | Una entrada del diario (su encabezado) |

El hook `.githooks/pre-commit` las regenera y las agrega al mismo commit, sin hacer nada a mano. Se activa una vez por copia del repositorio con `git config core.hooksPath .githooks`. Sin el hook, hay que correr los scripts antes del commit; si se olvida, la CI lo avisa.

## Pruebas

```bash
cd backend && uv run pytest              # usa SQLite en backend/test.db (no versionado)
docker compose exec web pnpm test       # o, con pnpm 9 instalado: cd frontend && pnpm test
```

`pnpm test` corre Vitest una vez (CI y verificación); `pnpm test:watch` lo deja en modo observación.

El frontend fija pnpm en `package.json` (`packageManager`, la misma versión mayor que la CI) y versiona `pnpm-lock.yaml`.
