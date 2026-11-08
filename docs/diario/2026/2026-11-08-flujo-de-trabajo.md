---
fecha: 2026-11-08
autor: David Bedoya
pr: ?
issue: 5
tipo: agrega
vistas: []
features: [guia-flujo-de-trabajo]
version: sin publicar
---

## Qué cambió
Nueva página en la documentación técnica que explica cómo trabaja el equipo con GitHub: qué es un issue y para qué sirve, cómo se nombran las ramas, qué revisa un Pull Request, cuándo se usa `develop` y cuándo `main`, y cómo se publica una versión. Trae ejemplos reales del proyecto (issues #1 y #2) y casos típicos: una vista nueva, una corrección urgente en producción y una librería nueva.

## Por qué
Las reglas de flujo (`reglas/REGLAS-FLUJO.md`) dicen qué hay que hacer, pero no cómo se ve en la práctica. Esta guía sirve para quien llega al equipo.

## Cómo se ve
Página «Flujo de trabajo del equipo» en el sitio técnico (sección Técnica).

## Notas técnicas
- `docs/tecnica/flujo-de-trabajo-equipo.md` (nueva), enlazada desde `mkdocs.tecnica.yml`, `docs/tecnica/index.md` y `AGENTS.md`.
- La página recomienda `Closes #<n>` en el PR para que GitHub cierre el issue al unir a `develop`.
