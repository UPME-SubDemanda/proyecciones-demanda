# ADR P-0003 · Reglas de versionado del proyecto

- **Estado:** Aceptada · **Fecha:** 2026-11-07

## Contexto
FLU-08 define cuatro relojes (app, modelo, datos, revisión), pero no decía qué salto corresponde a los cambios típicos del proyecto.

## Decisión
Se adoptan las tablas de `docs/tecnica/versionado.md`. En resumen:
- vista, gráfica, filtro, KPI o función nueva sube el MENOR de la app;
- mejoras y correcciones suben el PARCHE;
- quitar algo o romper URL, API o descargas sube el MAYOR (MENOR mientras se esté en 0.x);
- publicar proyecciones, cargar datos o reentrenar modelos no cambia la versión de la app;
- los modelos de prueba empiezan en 0.1.0 y solo desde 1.0.0 pueden publicar;
- las revisiones publicadas no se sobrescriben: se corrigen con una revisión nueva (`2026-11.1`).

La app pasa a 1.0.0 cuando la etapa 1 esté en producción.

## Consecuencias
El líder fija el número en cada release. La corrección de revisiones requiere un ajuste del modelo de datos (X-09).
