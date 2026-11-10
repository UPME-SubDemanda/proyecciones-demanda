# Convenciones de la base de datos

| Tema | Convención | Regla |
| --- | --- | --- |
| Nombres | Inglés y `snake_case` en todos los esquemas, tablas y columnas, también en `raw` | BD-05, PBD-01 |
| Comentarios | En español en cada esquema, tabla, vista y columna, escritos en la migración. La CI los verifica sobre PostgreSQL real | PBD-01, PBD-03, PBD-04 |
| Documentación | Cada esquema y tabla tiene su explicación en esta sección, en el mismo PR que la crea | PBD-02 |
| Cambios de esquema | Solo con migraciones de Alembic | BD-04 |
| Códigos de catálogo | Con prefijo de producto o fuente (`ee_`, `gn_`, `xm_`, `dane_`, `ideam_`) para que no choquen | — |
| Valores permitidos | Lo que tiene atributos o crece es un catálogo con llave foránea (medidas, geografías, series, componentes, tipos de valor, variables, fuentes). Los conjuntos pequeños y fijos son `CHECK` (frecuencia, estados, tipo de carga, nivel geográfico, `basis`) | — |
| Procedencia | Toda fila de `core` llega a su fuente y fecha de carga, directamente (`source`, `loaded_at`, `load_run_id`) o por su revisión (los valores heredan la de `revisions`, y así lo dice el comentario de la tabla). `loaded_at` es el `created_at` de BD-06. En `revisions` son obligatorios `published_on`, `data_cutoff`, `model` y `document_url` | BD-06 |
| Periodos | `period` es el inicio del periodo en hora de Colombia (UTC−5, sin horario de verano): `2026-04-01` es abril de 2026; en horaria, el inicio de la hora. Frecuencias: `H`, `D`, `M`, `Q`, `A` | — |
| Fechas de carga | Con zona horaria | — |
| Números | `numeric` con decimales suficientes para no perder lo publicado (los anexos traen hasta 12 decimales) | — |
| Unidades | Cada valor en la unidad de su medida o variable (GWh, MW, GBTUD). Las fuentes que llegan en otra unidad se convierten en `staging` con el `factor` del catálogo | — |
| Convenciones de las fuentes | Se normalizan a la más reciente de la fuente (por ejemplo, la GD siempre positiva) | PDA-07 |
| Versiones | Los datos externos no se sobrescriben: cada cambio es una versión nueva | PBD-05 |
| Lo oficial y lo experimental | No comparten tablas | PBD-06 |
| Rendimiento | Índice en la llave de cada tabla. Partición por frecuencia en `core.observed_values`; en `raw`, por métrica o año solo cuando una tabla lo pida | — |
