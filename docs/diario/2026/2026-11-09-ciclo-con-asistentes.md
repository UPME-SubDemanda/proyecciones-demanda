---
fecha: 2026-11-09
autor: David Bedoya
pr: 24
issue: 23
tipo: agrega
vistas: []
features: [guia-flujo-de-trabajo]
version: sin publicar
---

## Qué cambió
Quedó escrito cómo trabajamos con un asistente de IA (Claude, Cursor, Codex o Gemini) en cada paso del plan:

1. El asistente redacta el issue, con una sección de **supuestos**. Si un supuesto cambia, el issue se actualiza.
2. La persona crea el issue en GitHub y le pasa el número al asistente.
3. El asistente crea la rama y desarrolla hasta cumplir la definición de hecho.
4. El asistente entrega el texto del PR, que cierra el issue al unirse.
5. La persona revisa el desarrollo, prueba y lo compara con el mockup aprobado. Los ajustes se hacen en la misma rama, **antes** de abrir el PR.
6. La persona abre el PR y lo une.

Sin asistente vale lo mismo: quien desarrolla hace las dos partes.

También se precisó «Quién hace qué». El líder asigna y prioriza, revisa los issues cuando puede, aprueba diseños y decide publicaciones. Quien desarrolla puede crear el issue de lo que le asignaron, idealmente después de que el líder apruebe el texto, y une su propio PR. La CI no es una persona: son las verificaciones automáticas de cada PR.

## Por qué
Las reglas decían qué debe existir en cada cambio, pero no cómo se reparte el trabajo con un asistente ni cuándo revisa la persona. Mientras el autor pueda unir su propio PR (P-06), revisar la rama contra el mockup es la única revisión humana. Por eso conviene que esté escrita.

## Cómo se ve
Sección «Trabajar con un asistente de IA» en la página «Flujo de trabajo del equipo» del sitio técnico.

## Notas técnicas
- `AGENTS.md`: sección «Ciclo con un asistente».
- `docs/tecnica/flujo-de-trabajo-equipo.md`: sección nueva y fila de asistentes en «Quién hace qué».
- Pendiente X-20 (`docs/pendientes/x-20-ciclo-con-asistentes.md`) con el contexto completo y el prompt para proponer el ciclo en `upme-estandares` como regla IA.
