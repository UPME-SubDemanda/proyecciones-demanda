# ADR P-0002 · Modelo de datos de la etapa 1

- **Estado:** Reemplazada por P-0004 · **Fecha:** 2026-11-07
- **Reemplazada por:** [P-0004 · Modelo de datos v2](0004-modelo-datos-v2.md)

## Decisión
Tablas en `core` según `docs/tecnica/modelo-de-datos.md`: una revisión es una versión publicada por producto (`code` = mes de publicación), con valores por escenario y supuestos por variable exógena. Migración `0002_core_phase1`.

## Consecuencias
Las tablas `raw`/`staging` se definen al confirmar formatos de origen (X-01).
