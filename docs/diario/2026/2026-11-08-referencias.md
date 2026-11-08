---
fecha: 2026-11-08
autor: David Bedoya
pr: ?
issue: 9
tipo: agrega
vistas: []
features: [referencias]
version: sin publicar
---

## Qué cambió
La documentación técnica tiene una página **Referencias** que explica qué significa cada ID que se cita en el proyecto: las reglas (por ejemplo DOC-04 o FLU-07), los pasos del plan de trabajo (T-05), los pendientes de decisión (X-04) y las decisiones del proyecto (P-0003). Si se escribe un ID en el buscador del sitio, lleva directo a su explicación.

## Por qué
Los documentos, commits y PR citan estos IDs todo el tiempo, y no había un lugar donde consultarlos. Las reglas viven en `reglas/`, fuera del sitio de documentación.

## Cómo se ve
Página «Referencias» en el sitio técnico (sección Técnica), con un índice por familia y una sección por ID.

## Notas técnicas
- `scripts/referencias.py` genera `docs/tecnica/referencias.md` desde `reglas/*.md`, `docs/pendientes.md` y `docs/decisiones/`. Con `--check` falla si la página no está al día; la CI lo ejecuta.
- Los IDs citados que se definen en `upme-estandares` (pendientes P-xx, ADR-xxxx) quedan en la sección «Externos», con la frase donde se citan.
- Cada ID es un título propio (`### DOC-04 · DEBE`) y el buscador pondera los títulos, así que «DOC-04» o «T-05» llevan primero a su sección. Se probó cambiar el separador del buscador para no cortar en el guion, pero el analizador de consultas sigue cortando y la búsqueda empeora; se deja la configuración por defecto.
- El script respeta los bloques de código dentro de las reglas (por ejemplo, la plantilla de DOC-01).
- Enlaces desde el índice técnico y `AGENTS.md` (mapa del repositorio y comandos).
- La estructura (una entrada por ID con los mismos campos) permite exportarla más adelante a una base de datos de Notion (X-12).
