---
id: X-20
tema: Ciclo de trabajo con asistentes en el estándar
responsable: Líder
estado: Abierto
revisar: cuando haya espacio para trabajar en upme-estandares
creado: 2026-11-09
relacionado: [IA-01, IA-02, IA-03, FLU-01, FLU-03, FLU-05, FLU-07, FLU-09, P-06]
---

# X-20 · Ciclo de trabajo con asistentes en el estándar

**Qué hay que hacer:** proponer en `upme-estandares` el ciclo de trabajo con asistentes de IA que adoptó este proyecto, para que todos los proyectos de la UPME trabajen igual con Claude, Cursor, Codex o Gemini, y que este proyecto lo reciba con la copia de las reglas (FLU-09).

## Contexto

Las reglas del estándar (versión 2.1.0) dicen **qué** debe existir en cada cambio:

- un issue con su ficha antes de empezar (FLU-01);
- un diseño aprobado antes de programar una vista (FLU-03);
- un PR con la plantilla del proyecto (FLU-05);
- la definición de hecho (FLU-07).

En la sección «Asistentes de IA» dicen además que el trabajo hecho con IA cumple los mismos requisitos (IA-03).

Lo que **no** dicen es cómo se reparte el trabajo entre el asistente y la persona, ni en qué momento revisa la persona. Al construir las vistas de la app (T-08 a T-10, PR #18, #20 y #22) apareció un ciclo que funcionó bien y se acordó el 2026-11-09 (issue #23):

1. **Issue.** El asistente redacta el título y el cuerpo con la plantilla que corresponda, con una sección **Supuestos** y el aviso de que si un supuesto cambia, el issue se actualiza antes de seguir. La persona revisa el texto, crea el issue en GitHub y le pasa el número.
2. **Rama.** El asistente la crea desde `develop` actualizado, con el número del issue (FLU-04).
3. **Desarrollo.** El asistente programa y documenta hasta cumplir la definición de hecho (FLU-07). Si un supuesto resulta falso, se detiene y propone el texto nuevo del issue.
4. **Entrega.** El asistente redacta el título y el cuerpo del PR con la plantilla, con `Closes #<n>` para que el issue se cierre al unir. Le recuerda a la persona que revise el desarrollo, haga las pruebas que considere y compare con el mockup aprobado.
5. **Ajustes.** Todo cambio o feedback se hace **en la misma rama, antes de abrir el PR**, y el asistente actualiza el cuerpo del PR hasta que la persona lo considere listo.
6. **PR.** La persona abre el PR, espera la CI en verde y lo une.

Por qué importa en el estándar:

- **Los supuestos quedan escritos.** Un asistente llena los vacíos de la ficha con decisiones propias (rutas, datos, qué hacer con lo que depende de un pendiente). En el issue se ven y se corrigen antes de programar, y el issue sigue describiendo lo que se construye.
- **La revisión humana va antes del PR.** Con P-06 pendiente, el autor puede unir su propio PR con la CI en verde. Revisar la rama contra el mockup es entonces la única revisión humana, y conviene que sea explícita.
- **El asistente no crea ni une nada en GitHub.** La persona controla qué entra al repositorio. Esto también evita que el asistente necesite permisos de escritura en GitHub.
- **Aplica igual sin asistente.** Quien desarrolla hace ambos papeles y revisa su rama antes de abrir el PR. No es una regla aparte para la IA, sino la forma concreta de cumplir FLU-01 a FLU-07 (IA-03).

## Dónde está hoy en este proyecto

- `AGENTS.md`, sección «Ciclo con un asistente»: instrucciones para el asistente.
- `docs/tecnica/flujo-de-trabajo-equipo.md`, sección «Trabajar con un asistente de IA»: el ciclo explicado para personas, con la tabla de quién hace qué.
- Issue #23 y su PR: el cambio que lo introdujo.

## Qué proponer en el estándar

1. Una regla nueva en `REGLAS-FLUJO.md`, sección «Asistentes de IA». Se propone **IA-06 (DEBERÍA)**, con el ciclo de seis pasos, los supuestos en el issue y la revisión antes del PR.
2. En **IA-02**, agregar a lo que incluye `AGENTS.md` la sección «Ciclo con un asistente».
3. Si el estándar trae plantillas de issue: una sección **Supuestos** opcional en las plantillas de Feature y Fix.
4. Si el estándar trae plantilla de PR: el campo *Issue* con `Closes #<n>`.
5. Versión MENOR del estándar (regla nueva de nivel DEBERÍA, sin cambios incompatibles).

## Pasos

- [ ] Ejecutar el prompt de abajo en Claude Code abierto en `upme-estandares` y revisar el PR.
- [ ] Publicar la versión nueva del estándar (MENOR).
- [ ] En este proyecto: copiar la versión nueva (FLU-09, `chore: update standards to vX.Y.Z`), cambiar en `AGENTS.md` y en la guía del flujo la referencia a X-20 por la regla nueva (IA-06 o la que quede), y cerrar este pendiente.

## Prompt para `upme-estandares`

Para ejecutar en Claude Code abierto en `upme-estandares`. Antes, ten a mano `AGENTS.md` y `docs/tecnica/flujo-de-trabajo-equipo.md` de `proyecciones-demanda` (en el disco o en GitHub, rama `develop`).

```
Propuesta desde proyecciones-demanda (pendiente X-20): agregar al estándar el ciclo de trabajo
con asistentes de IA.

Contexto: REGLAS-FLUJO.md dice qué debe existir en cada cambio (FLU-01 issue, FLU-03 diseño
aprobado, FLU-05 PR, FLU-07 definición de hecho) y que el trabajo con IA cumple lo mismo (IA-03),
pero no cómo se reparte el trabajo entre el asistente y la persona ni cuándo revisa la persona.
proyecciones-demanda adoptó este ciclo el 2026-11-09 (issue #23). Está en su AGENTS.md
(sección «Ciclo con un asistente») y en docs/tecnica/flujo-de-trabajo-equipo.md (sección
«Trabajar con un asistente de IA»). Léelas antes de empezar.

El ciclo:
1. Issue: el asistente redacta título y cuerpo con la plantilla que corresponda, con una sección
   «Supuestos» y el aviso de que si un supuesto cambia, el issue se actualiza antes de seguir.
   La persona revisa, crea el issue en GitHub y le pasa el número.
2. Rama: el asistente la crea desde develop actualizado con el número del issue (FLU-04).
3. Desarrollo: el asistente cumple la definición de hecho (FLU-07). Si un supuesto resulta falso,
   se detiene y propone el texto nuevo del issue.
4. Entrega: el asistente redacta título y cuerpo del PR con la plantilla, con «Closes #<n>», y
   recuerda a la persona revisar el desarrollo, probar y comparar con el mockup aprobado.
5. Ajustes: todo feedback se resuelve en la misma rama antes de abrir el PR; el asistente
   actualiza el cuerpo del PR hasta que la persona lo considere listo.
6. PR: la persona abre el PR, espera la CI en verde y lo une. El asistente no crea ni une issues
   ni PR.
Sin asistente aplica igual: quien desarrolla hace ambos papeles y revisa su rama antes del PR.
Razones: los supuestos quedan escritos y corregibles antes de programar; mientras P-06 permita
que el autor una su propio PR, la revisión de la rama es la única revisión humana; la persona
controla qué entra a GitHub.

Tareas:
1. En REGLAS-FLUJO.md, sección «Asistentes de IA», agrega una regla nueva con el siguiente número
   libre (se propone IA-06), nivel DEBERÍA, con el ciclo, los supuestos en el issue y la revisión
   antes del PR. Redáctala en el estilo de las demás reglas; no copies las secciones del proyecto
   palabra por palabra.
2. En IA-02, agrega a lo que incluye AGENTS.md la sección «Ciclo con un asistente».
3. Si el estándar tiene plantillas de issue o de PR (o una plantilla de AGENTS.md), agrega una
   sección «Supuestos» opcional a las de Feature y Fix, «Closes #<n>» en el campo Issue del PR
   y la sección del ciclo en la plantilla de AGENTS.md. Si no las tiene, no las crees: menciónalo
   en el resumen.
4. Si algo del ciclo choca con una regla existente (por ejemplo FLU-05 o P-06), no inventes la
   solución: explícalo en el resumen y propone un ADR.
5. Agrega la entrada al CHANGELOG del estándar (versión MENOR), actualiza la página de referencias
   o índices de IDs si el estándar los tiene, y abre el PR. En el resumen cita los IDs tocados
   (IA-02, IA-03, IA-06, FLU-01, FLU-05, FLU-07) y la versión propuesta.
```

## Historial

- 2026-11-09: se crea al documentar el ciclo en el proyecto (#23).
