# Documentación técnica

¿Nuevo en el equipo? Empiece por el [flujo de trabajo del equipo](flujo-de-trabajo-equipo.md): issues, ramas, Pull Requests y publicación, con ejemplos. Para saber qué significa un ID como `DOC-04`, `T-05` o `X-04`, búsquelo en el buscador o en [Referencias](referencias.md).

## Levantar el proyecto (primera vez)

**Necesita:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) abierto y git. Nada más: Python, uv, Node y pnpm corren dentro de los contenedores.

```bash
git clone git@github.com:UPME-SubDemanda/proyecciones-demanda.git
cd proyecciones-demanda
./scripts/dev-setup.sh
```

El script hace todo y se puede repetir sin problema:

1. revisa que Docker esté corriendo;
2. activa el hook de git que regenera las páginas generadas;
3. crea `.env` desde `.env.example` con `SESSION_SECRET` y `DEV_ADMIN_PASSWORD` aleatorios (no los muestra);
4. levanta todo con `docker compose up -d --build`;
5. espera a la API y muestra las direcciones.

Al arrancar, la API **aplica las migraciones y crea `admin@local`** si falta (`backend/dev-start.sh`), así que no hay pasos manuales. La primera vez tarda unos minutos mientras descarga las imágenes.

## Direcciones

| Qué | Dirección | Se actualiza al guardar |
| --- | --- | --- |
| App: portal, modo pantalla (`/pantalla`) y app interna (`/app`) | http://localhost:5173 | Sí |
| API y su documentación | http://localhost:8000/docs | Sí |
| Guía de usuario | http://localhost:8002 | Sí |
| Documentación técnica (esta) | http://localhost:8001 | Sí |
| Prefect | http://localhost:4200 | — |
| Galería de componentes (solo desarrollo) | http://localhost:5173/dev/componentes | Sí |

El código de `frontend/` y `backend/` y la carpeta `docs/` están montados en los contenedores: los cambios se ven sin reconstruir.

## Día a día

```bash
docker compose up -d          # encender (después de reiniciar el computador)
docker compose stop           # apagar (los datos se conservan)
docker compose logs -f api    # ver qué pasa en un servicio (api, web, docs-tecnica…)
```

**Reconstruir** (`docker compose up -d --build`) solo cuando cambian las dependencias (`frontend/package.json`, `backend/pyproject.toml`) o un `Dockerfile`. Tras un `git pull` con migraciones nuevas basta reiniciar la API: `docker compose restart api`.

**Empezar de cero** (borra la base local): `docker compose down -v` y luego `./scripts/dev-setup.sh`.

Las migraciones y la CLI se ejecutan **dentro del contenedor `api`**: ahí `DATABASE_URL` apunta al servicio `db` (nombre que solo existe en la red de Docker). La configuración lee `.env` desde la carpeta donde se ejecuta el comando; si se corren desde `backend/` en el equipo, no lo encuentran y usan SQLite (`local.db`) sin avisar.

## Usuario administrador local

Para entrar a la app interna en desarrollo (http://localhost:5173 → **Ingresar** → «Ingresar con usuario local»):

| Dato | Dónde está |
| --- | --- |
| Usuario | `admin@local` |
| Contraseña | En **`.env`**, variable `DEV_ADMIN_PASSWORD` |

- `dev-setup.sh` genera la contraseña y la API crea el usuario al arrancar.
- `.env` está ignorado por git: la contraseña existe solo en el computador de cada persona y **no se comparte** por chat, correo ni en el repositorio.
- La app no lee `DEV_ADMIN_PASSWORD`: solo sirve para crear el usuario y para recordarla.
- Solo para desarrollo local. En pruebas y producción los usuarios entran con la cuenta institucional de Google y sus roles los asigna un administrador.

**Otro usuario con su propia contraseña** (el comando la pide sin mostrarla):

```bash
docker compose exec api uv run python -m app.auth.cli create-user su.correo@upme.gov.co --role admin
```

**Si se olvidó la contraseña:** está en `.env`. Si `.env` se perdió, cree otro usuario con el comando anterior; la CLI todavía no tiene un comando para cambiar contraseñas.

## Si algo falla

| Síntoma | Qué hacer |
| --- | --- |
| «Docker no está corriendo» | Abra Docker Desktop y repita `./scripts/dev-setup.sh`. |
| Un puerto está ocupado (5173, 8000, 8001, 8002, 4200, 5432) | Cierre el programa que lo usa, o detenga el otro proyecto con Docker. |
| La API no arranca | `docker compose logs api`: normalmente es una migración o `.env` incompleto. |
| La app no muestra un cambio | Recargue el navegador; si cambió `package.json`, `docker compose up -d --build web`. |
| No puedo ingresar | Revise `DEV_ADMIN_PASSWORD` en `.env`; `docker compose logs api` dice si se creó `admin@local`. |

## Páginas generadas

Cinco páginas se generan con scripts y la CI falla si no están al día:

| Página | Script | Se regenera cuando cambia |
| --- | --- | --- |
| `docs/tecnica/referencias.md` | `scripts/referencias.py` | Cualquier `.md` (reglas, pendientes, decisiones o una cita nueva) |
| `docs/usuario/inventario/index.md` | `scripts/inventario.py` | Una página del inventario o las rutas del frontend |
| `docs/diario/index.md` | `scripts/diario.py` | Una entrada del diario (su encabezado) |
| Mapa del repositorio en `README.md` | `scripts/mapa.py` desde `repo-map.toml` | Se agregan o borran archivos, o cambia `repo-map.toml` |
| `docs/tecnica/base-de-datos/diccionario.md` | `scripts/diccionario.py` desde la base | Una migración cambia el esquema o un comentario |

El hook `.githooks/pre-commit` regenera las cuatro primeras y las agrega al mismo commit, sin hacer nada a mano. Se activa una vez por copia del repositorio con `git config core.hooksPath .githooks`. Sin el hook, hay que correr los scripts antes del commit; si se olvida, la CI lo avisa.

### Diccionario de la base: se genera con la base encendida

El diccionario sale de los comentarios de la base (PBD-03), así que el hook no lo regenera: necesita una base con las migraciones aplicadas. Quien cambia el esquema lo regenera con la base de Docker encendida:

```bash
docker compose restart api                                      # aplica las migraciones nuevas
docker compose exec api uv run --no-dev python /scripts/diccionario.py   # escribe docs/tecnica/base-de-datos/diccionario.md
```

Si falta un comentario, el script dice cuál y cómo agregarlo. La CI aplica las migraciones en una base de prueba, verifica el diccionario y prueba que las migraciones se pueden revertir (PBD-04).

### Mapa del repositorio: toda carpeta se describe

`repo-map.toml` describe cada carpeta (una línea breve y qué debe ir en ella) y los archivos de configuración principales. Deben estar descritas todas las carpetas versionadas de primer y segundo nivel, y las de tercer nivel dentro de `frontend/src`, `backend/app`, `docs/tecnica` y `docs/usuario`.

Si alguien crea una carpeta y no la describe, **el commit se detiene** (hook) y **la CI falla**, diciendo cuál falta. Lo mismo si se borra una carpeta y su descripción queda. Para arreglarlo, agregar o quitar su entrada en `repo-map.toml`; el mapa del README se regenera solo.

## Pruebas

```bash
docker compose exec api uv run pytest   # backend (SQLite en backend/test.db, no versionado)
docker compose exec web pnpm test       # frontend (Vitest)
```

Las pruebas del modelo de datos (`backend/tests/test_db_model.py`) corren solo contra PostgreSQL: en la CI, con la base de prueba; en Docker, con `docker compose exec -e TEST_POSTGRES_URL=postgresql://app:app@db:5432/proyecciones_demanda api uv run pytest tests/test_db_model.py`. Sin esa variable se saltan.

Con uv y pnpm 9 instalados también se pueden correr en el equipo: `cd backend && uv run pytest` y `cd frontend && pnpm test`. Las capturas y los recorridos de Playwright sí se corren en el equipo (`docs/tecnica/frontend.md`, «Capturas»).

`pnpm test` corre Vitest una vez (CI y verificación); `pnpm test:watch` lo deja en modo observación.

El frontend fija pnpm en `package.json` (`packageManager`, la misma versión mayor que la CI) y versiona `pnpm-lock.yaml`.
