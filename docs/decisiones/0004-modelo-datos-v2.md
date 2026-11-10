# ADR P-0004 · Modelo de datos v2 y esquema operacion

- **Estado:** Aceptada · **Fecha:** 2026-11-10 · **Reemplaza a:** P-0002

## Contexto
El modelo de la etapa 1 (P-0002, migración `0002`) se diseñó antes de conocer los datos reales. En noviembre de 2026 se revisó con los insumos reales (issue #32):

- la API de XM (SINERGOX y SIMEM);
- cinco anexos de revisiones de energía eléctrica (dic-2023 a ago-2026) y el informe Rev. Julio 2026;
- un anexo de gas natural (abr-2026).

Lo que el modelo no podía guardar:

- energía y potencia máxima;
- series compuestas (SIN, +GCE+ME, +GD) y sus componentes;
- intervalos de confianza (EE) y escenarios (GN);
- datos reales que la fuente corrige después;
- resolución horaria;
- la corrección de una revisión publicada (X-09);
- la calidad de los datos y la trazabilidad de las cargas.

Además, faltaban comentarios en los esquemas y en la mitad de las columnas de `core`, y no había reglas para documentar la base ni las fuentes.

## Decisión
1. Se adopta el **modelo de datos v2** descrito en la sección [Base de datos](../tecnica/base-de-datos/index.md):
   - todo lo que varía entre productos es un catálogo, así que EE y GN usan las mismas tablas;
   - lo observado va en una sola tabla versionada, con versión, fecha de carga y estado de calidad;
   - las revisiones son inmutables y guardan series, componentes, tipos de valor y supuestos;
   - lo oficial no se mezcla con lo experimental.
2. Se agrega el esquema **`operacion`** (bitácora de cargas, mensajes de carga, extracciones, estado de las fuentes, notificaciones y auditoría), además de los cinco de BD-03 (PBD-07). Es una excepción local al estándar mientras se propone allá (X-22).
3. Se adoptan las reglas del proyecto PBD, PDA, PFU, PFL y PER ([Reglas del proyecto](../tecnica/reglas-proyecto.md)).

## Consecuencias
- La migración `0003` borra y vuelve a crear las tablas de `core` (están vacías salvo los dos productos), crea `raw`, `staging` y `operacion`, y comenta todo. Es el paso T-23, con su propio PR.
- P-0002 queda reemplazada. X-09 queda resuelto en el diseño (estado `superseded` y `supersedes_id`).
- El catálogo de modelos y la integración con MLflow y DVC quedan para la fase 2 (P-0001). El modelo v2 no los bloquea: permite reconstruir datos «a la fecha», tiene resolución horaria y separa lo oficial de lo experimental.
- La API pública, la base de datos común de la UPME y los umbrales de calidad siguen pendientes (X-24, X-28, X-29).
