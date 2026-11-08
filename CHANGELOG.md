# Changelog

Formato [Keep a Changelog](https://keepachangelog.com/es-ES/), versiones SemVer (DOC-04, FLU-08). Cada línea menciona la vista o feature y el PR.

## [Sin publicar]
### Agregado
- Estructura inicial del proyecto (upme-estandares 1.0.0).
- Reglas de upme-estandares 2.1.0 copiadas en `reglas/` (incluye TEC-10); `CLAUDE.md` carga `AGENTS.md` y las reglas de flujo (FLU-09, IA-02).
- Autenticación: cuenta institucional de Google o usuario local, roles asignados por administradores.
- Modelo de datos de la etapa 1: productos, series reales, revisiones publicadas, escenarios, variables exógenas y supuestos (migración 0002).
- Inventario de vistas planeadas con enlace a los mockups de referencia.
- Reglas de versionado del proyecto: casos de vistas, modelos, datos y revisiones (P-0003).
- Mockups aprobados de 8 pantallas (tablero ejecutivo, histórico de revisiones, monitor de exógenas, portal escritorio y móvil, modo pantalla, ejecutar proyección y registro de modelos) en `docs/tecnica/mockups/`, con registro de aprobación (FLU-03, X-06) (issue #2, PR #4).

### Cambiado
- Inventario: el campo `diseno` de cada vista apunta a su mockup aprobado; proyección vs. real, comparar revisiones y usuarios y roles quedan sin diseño (issue #2, PR #4).
