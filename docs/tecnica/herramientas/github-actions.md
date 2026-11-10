# github-actions en este proyecto

Ficha local (DOC-07). La ficha general está en `upme-estandares/herramientas/`. GitHub Actions corre la **CI** (integración continua): las verificaciones automáticas de cada PR a `develop` o `main`. Para unir un PR, todas tienen que salir en verde (FLU-05).

## Cómo encaja aquí

Cada PR muestra dos *checks*: **ci / checks** y **ci / base-de-datos**. Son los dos *jobs* de `.github/workflows/ci.yml`. Cada uno corre en una máquina virtual distinta de GitHub, al mismo tiempo.

Están separados por tres razones:

- **Necesitan cosas distintas:** `base-de-datos` levanta un PostgreSQL y `checks` no.
- **Esperas menos:** corren en paralelo.
- **Sabes dónde buscar:** si algo falla, el nombre del check ya dice si es un problema de código y documentación o de la base de datos.

### `checks`: lo que no necesita base de datos

| Paso | Qué verifica | Regla |
| --- | --- | --- |
| Changelog obligatorio | Que el PR modifique `CHANGELOG.md`. Se salta con la etiqueta `sin-changelog` | FLU-10 |
| Lint de diseño | Que el frontend no tenga colores, tamaños ni valores de diseño sueltos: solo los tokens de la marca | TOK-02 |
| Inventario completo | Que cada ruta del frontend tenga su página en el inventario | DOC-02 |
| Índice del diario, mapa del repositorio y referencias | Que las páginas generadas por los scripts estén al día con lo que hay en el repositorio | DOC-05 |
| Pruebas backend | Pruebas de la API | — |
| Pruebas pipelines | Lector de anexos, cliente de XM y flujo de Prefect, con XM simulado y sin internet | — |
| Pruebas frontend | Pruebas de React y que la app compile | — |
| Documentación | Que las dos guías de MkDocs se construyan en modo estricto, sin enlaces rotos | — |

Las pruebas que necesitan PostgreSQL aparecen aquí como *skipped* (saltadas): este job no tiene base. Las corre el otro.

### `base-de-datos`: lo que necesita un PostgreSQL real

Levanta un PostgreSQL 16 vacío, la misma versión de `docker-compose.yml`, y sobre él corre estos pasos (PBD-04):

| Paso | Qué verifica | Regla |
| --- | --- | --- |
| Migraciones hacia arriba | Que todas las migraciones de Alembic se apliquen desde cero | BD-04 |
| Comentarios y diccionario | Que todo esquema, tabla, vista y columna tenga su comentario, y que `diccionario.md` esté al día | PBD-01, PBD-03 |
| Pruebas del modelo y de las vistas | Que las tablas, las restricciones y las vistas de `core` respondan lo que deben: versiones, abanico, comparación de revisiones, error | PBD-04 |
| Carga de XM contra la base | La carga completa de una medida con XM simulado (`pipelines/tests/test_xm_load_db.py`). Revisa cinco cosas: que convierta unidades, que no cree versiones si nada cambió, que registre los cambios, que avise los días que faltan y que marque la carga como fallida si XM no responde | PBD-05, PDA-05 |
| Migraciones de ida y vuelta | Que todas se puedan revertir y volver a aplicar sin errores | PBD-04 |

## Dónde está

- **Definición:** `.github/workflows/ci.yml`.
- **Resultados:** pestaña *Checks* del PR o *Actions* del repositorio. Cada paso muestra su salida y el error si falla.

## Cómo se usa (casos del proyecto)

**Correr lo mismo en local antes de abrir el PR.** Los pasos de `checks` se corren desde la raíz del repositorio:

```bash
python scripts/check_changelog.py
```

```bash
python scripts/lint_design.py frontend/src
```

```bash
cd backend && uv run pytest -q
```

```bash
cd pipelines && uv run pytest -q
```

```bash
uvx --with mkdocs-material mkdocs build --strict -f mkdocs.tecnica.yml
```

`check_changelog.py` compara contra lo confirmado en la rama, así que falla hasta que se hace commit del CHANGELOG. El hook `.githooks/pre-commit` regenera el diario, el mapa, las referencias y el inventario en cada commit.

**Las pruebas de base de datos en local** van contra la base de Docker, porque el puerto 5432 del equipo puede estar ocupado por otro PostgreSQL:

```bash
docker compose exec -e TEST_POSTGRES_URL=postgresql://app:app@db:5432/proyecciones_demanda api uv run pytest -q tests/test_db_model.py tests/test_db_views.py
```

```bash
docker compose run --rm --no-deps -v ./pipelines:/opt/pipelines -e TEST_POSTGRES_URL=postgresql://app:app@db:5432/proyecciones_demanda prefect-worker sh -c "pip install -q pytest && python -m pytest -q tests"
```

Estas pruebas usan periodos de 2099 y borran lo que crean, así que no tocan los datos reales de la base de desarrollo.

**Si un check falla:** abrir el check en el PR y leer el paso en rojo. Los scripts del proyecto dicen qué falta y cómo corregirlo; por ejemplo, el del diccionario nombra la columna sin comentario. Se corrige en la misma rama y el PR vuelve a correr la CI solo.

## Reglas propias

- **Esta ficha se actualiza en el mismo PR que cambia la CI o un hook (PFL-03).** Por cada paso: qué verifica y la regla, en qué job corre, cómo correrlo en local y qué hacer si falla.
- Los dos checks tienen que salir en verde para unir un PR (FLU-05). Con GitHub Free y un repositorio privado no hay protección de ramas: se cumple por disciplina (P-17).
- Toda prueba que necesite PostgreSQL va en el job `base-de-datos`. SQLite no la reemplaza (PBD-04).
- Las pruebas no salen a internet: XM y las demás fuentes se simulan.

## Cómo extender

1. Un paso que no necesita base va en `checks`; uno que sí, en `base-de-datos`.
2. Cada paso lleva un nombre en español que diga qué verifica y la regla, como los de hoy.
3. El paso se agrega en esta ficha, en la tabla de su job, con cómo correrlo en local, en el mismo PR (PFL-03).
