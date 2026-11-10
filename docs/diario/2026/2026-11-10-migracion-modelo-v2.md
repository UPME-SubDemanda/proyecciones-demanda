---
fecha: 2026-11-10
autor: David Bedoya
pr: ?
issue: 34
tipo: agrega
vistas: []
features: [modelo-datos-v2, diccionario-base]
version: sin publicar
---

## Qué cambió
El modelo de datos v2, que estaba documentado, **ya existe en la base**. Una migración nueva crea todas sus tablas: catálogos, revisiones, datos reales con versiones, calidad de los datos, las tablas de entrada (`raw` y `staging`) y la bitácora de cargas (`operacion`). Cada objeto de la base lleva una descripción en español.

Con esas descripciones se genera un **diccionario** con cada tabla y columna, que se puede consultar en la guía técnica. Si alguien agrega una columna sin descripción, la revisión automática lo detecta y dice cuál falta.

La revisión automática de cada PR ahora también levanta una base de datos de prueba: aplica las migraciones, verifica el diccionario, prueba el modelo y deshace las migraciones para comprobar que se pueden revertir.

Todavía no hay datos reales: eso empieza en T-24.

## Por qué
Es el paso que sigue a la documentación del modelo (T-22): sin las tablas no se puede cargar nada. La verificación con una base real evita que una migración con errores llegue a un servidor; antes, las pruebas usaban SQLite y no probaban las migraciones.

## Cómo se ve
Guía técnica → Base de datos → Diccionario.

## Notas técnicas
- `backend/alembic/versions/0003_modelo_datos_v2.py`:
  - borra las tablas de `core` de la `0002`, que estaban vacías salvo los dos productos, y crea el modelo v2;
  - `core.observed_values` usa partición nativa por lista de frecuencias: horaria y resto;
  - siembra productos, medidas, tipos de valor, geografías (EE: SIN y 5 áreas; GN: nacional y 9 regiones), series y su composición, fuentes y las 5 variables de XM;
  - el `downgrade` reutiliza el `upgrade` de la `0002`; se comprobó con `pg_dump` que el esquema queda idéntico.
- Diferencias con la documentación de T-22, ya corregidas en ella:
  - `raw.file_cells` usa `row_index` y `col_index`;
  - las horarias de XM se guardan una fila por hora;
  - las tablas de la revisión en `staging` identifican la revisión con `product` y `revision_code`;
  - `observed_as_of(at_time)` es una función;
  - `load_runs.status` incluye `running`.
- Quedan para después: las vistas anchas (T-24), `publicacion` (T-33), `operacion.notifications` (etapa 1.2) y `operacion.audit_log`.
- `scripts/diccionario.py` usa `psycopg` del backend. El contenedor `api` monta `scripts/` y `docs/` para generarlo: `docker compose exec api uv run --no-dev python /scripts/diccionario.py`. El hook no lo regenera, porque necesita la base.
- `backend/tests/test_db_model.py` (9 pruebas) corre solo con `TEST_POSTGRES_URL`. Cubre:
  - vigente y anomalías;
  - `observed_as_of`;
  - provisional;
  - meses incompletos;
  - potencia máxima;
  - procedencia obligatoria;
  - GD positiva;
  - composición de la serie con GD.
- CI: job nuevo `base-de-datos` con el servicio `postgres:16`.
