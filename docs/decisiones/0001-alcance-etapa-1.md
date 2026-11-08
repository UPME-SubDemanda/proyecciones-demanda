# ADR P-0001 · Alcance de la etapa 1 sin modelos

- **Estado:** Aceptada · **Fecha:** 2026-11-07

## Contexto
Hay modelos en MATLAB y otros lenguajes; su migración a Python aún no está definida para todos.

## Decisión
La etapa 1 solo carga en PostgreSQL datos históricos, revisiones ya publicadas y variables exógenas, y construye las vistas de consulta y comparación. Ejecutar, entrenar y versionar modelos (DVC, MLflow) es la fase 2.

## Consecuencias
Se entrega valor visible antes y la fase 2 parte de una base de datos ya ordenada. DVC es obligatorio al iniciar la fase 2 (ADR-0010 del estándar).
