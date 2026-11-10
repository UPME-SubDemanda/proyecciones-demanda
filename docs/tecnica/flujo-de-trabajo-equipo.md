# Flujo de trabajo del equipo

Guía práctica de cómo trabajamos con GitHub: issues, ramas, Pull Requests y publicación. Las reglas oficiales están en `reglas/REGLAS-FLUJO.md` (FLU, DOC); esta página las explica con ejemplos del proyecto. Si algo aquí contradice las reglas, mandan las reglas.

!!! tip "Regla corta para recordar"
    Sin issue no hay rama. Sin PR no entra a `develop`. Sin CI en verde no se une.

## Las tres piezas

| Pieza | Qué es | Responde a |
| --- | --- | --- |
| **Issue** | Ficha de trabajo numerada en GitHub (#1, #2…). | Qué se necesita y por qué. |
| **Rama** | Copia aparte del código donde se hacen los cambios sin afectar al resto del equipo. | Dónde se trabaja. |
| **Pull Request (PR)** | Solicitud para unir una rama a `develop` (o a `main`). | Cómo entra el cambio y quién lo revisó. |

La relación es **un issue → una rama → un PR**. Issues y PR comparten la numeración de GitHub: si el último issue fue el #2, el siguiente PR será el #3.

### Issue: el qué y el porqué

Un issue es un ticket, parecido a una tarjeta de Trello. Sirve para:

- **Pedir y discutir antes de programar.** Ahí queda qué se necesita, para quién y cómo se sabe que está terminado. La conversación queda guardada en el issue, no en correos o chats.
- **Rastrear.** Cada commit dice `Refs: #<n>`. Dentro de seis meses, quien vea una línea de código puede llegar al issue y entender el problema original.
- **Organizar al equipo.** La lista de issues abiertos es la lista de trabajo de desarrollo: quién tiene qué (*Assignees*) y qué falta.

Se crea en GitHub → pestaña **Issues** → **New issue**, eligiendo una plantilla (`.github/ISSUE_TEMPLATE/`):

| Plantilla | Cuándo | Prefijo de rama |
| --- | --- | --- |
| Feature o vista nueva | Una vista o funcionalidad nueva. Incluye la ficha de 5 líneas (FLU-01). | `feature/` |
| Corrección | Algo no funciona en `develop`. | `fix/` |
| Hotfix en producción | Algo no funciona en lo publicado (`main`). | `hotfix/` |
| Documentación | Falta o está mal la documentación. | `docs/` |

Lo que **no** es un issue de desarrollo: una decisión pendiente o una pregunta abierta (por ejemplo, «¿qué desagregaciones son públicas?»). Eso va en `docs/pendientes.md` y se convierte en issue cuando ya se sabe qué construir.

### Rama: el lugar de trabajo

Su nombre lleva el número del issue y una descripción corta en inglés: `feature/5-compare-revisions`, `fix/1-dev-env-setup`. Así se sabe a qué issue pertenece.

### Pull Request: la solicitud para integrar

Al terminar, se abre un PR con la plantilla del proyecto. En el PR:

- La **CI** corre sola (`.github/workflows/ci.yml`) y aparece en el PR como dos checks: **ci / checks** (CHANGELOG, diseño, páginas generadas, pruebas de backend, pipelines y frontend, y documentación) y **ci / base-de-datos** (migraciones, comentarios y pruebas contra un PostgreSQL real). Qué hace cada paso y cómo correrlo en local: [ficha de GitHub Actions](herramientas/github-actions.md).
- Alguien puede revisar y comentar. Mientras P-06 siga pendiente, el autor puede unir su propio PR con la CI en verde (FLU-05).
- En el campo *Issue* de la plantilla, escribir `Closes #<n>`: al unir el PR a `develop` (rama por defecto del repositorio), GitHub cierra el issue solo. Con `Refs: #<n>` solo lo enlaza y hay que cerrarlo a mano.

## Las dos ramas fijas

- **`develop`**: integración. Aquí entra el trabajo terminado; es la versión «en construcción».
- **`main`**: lo que está en producción. Solo recibe `release/*` y `hotfix/*`.

Nadie empuja directo a ninguna de las dos; todo entra por PR (FLU-04).

```
feature/5-…           o───o
                     /     \   PR a develop
develop      ───o───o───────o─────────────o───
                             \           /    se une de vuelta a develop
release/v0.2.0                o───o─────o
                                         \
main         ───o─────────────────────────o    etiqueta v0.2.0
```

## El ciclo completo

```
Issue → Diseño → Aprobación → Rama → Commits → PR → CI en verde → Merge → Cerrar issue y borrar rama
```

Los pasos de diseño y aprobación aplican solo a vistas nuevas o cambios visuales (FLU-03).

En la terminal, el ciclo de una rama se ve así:

```bash
git switch develop && git pull                 # partir de develop actualizado
git switch -c fix/7-energy-units               # rama con el número del issue
# ... cambios, pruebas, CHANGELOG, diario ...
git add -A
git commit -m "fix(dashboard): show demand in GWh" -m "Refs: #7"
git push -u origin fix/7-energy-units          # luego abrir el PR en GitHub
```

Después de unir el PR:

```bash
git switch develop && git pull
git branch -d fix/7-energy-units               # borrar la rama local
git push origin --delete fix/7-energy-units    # o el botón «Delete branch» del PR
```

Los commits van en inglés con Conventional Commits (FLU-06); la documentación y la interfaz, en español.

Con el hook activo (`git config core.hooksPath .githooks`, una vez), cada commit regenera las páginas de referencias y del inventario. Ver [Páginas generadas](index.md#paginas-generadas).

## Trabajar con un asistente de IA

Con un asistente (Claude, Cursor, Codex, Gemini) el ciclo es **el mismo**: issue, rama, definición de hecho y PR (IA-03). Lo que cambia es el reparto del trabajo. El asistente redacta y desarrolla; la persona crea el issue y el PR en GitHub, revisa y decide.

| Paso | Asistente | Persona |
| --- | --- | --- |
| 1. Issue | Redacta el título y el cuerpo con la plantilla que corresponda, con una sección **Supuestos**. | Revisa el texto (y, si puede, lo pasa al líder para que lo apruebe), crea el issue en GitHub y le pasa el número. |
| 2. Rama | La crea desde `develop` actualizado, con el número del issue. | — |
| 3. Desarrollo | Programa y documenta hasta cumplir la definición de hecho (FLU-07). | Responde las dudas. Si un supuesto cambia, actualiza el issue. |
| 4. Entrega | Redacta el título y el cuerpo del PR con `Closes #<n>`, y recuerda qué revisar. | Revisa el desarrollo, hace las pruebas que considere y compara con el mockup aprobado. |
| 5. Ajustes | Corrige **en la misma rama** y actualiza el cuerpo del PR. | Repite la revisión hasta que el cambio esté listo. |
| 6. PR | — | Abre el PR, espera la CI en verde y lo une. El issue se cierra solo. |

Por qué así:

- **Los supuestos quedan escritos.** Un asistente suele llenar los vacíos de la ficha con decisiones propias: ruta, datos, qué hacer con un botón que depende de algo sin definir. En el issue se ven y se pueden corregir antes de programar. Si un supuesto cambia, el issue se actualiza para que siga describiendo lo que se construye.
- **La revisión humana va antes del PR.** Mientras P-06 permita que el autor una su propio PR con la CI en verde, revisar la rama contra el mockup es la única revisión humana. Por eso los ajustes se hacen antes de abrir el PR, y el PR se abre una sola vez, ya listo.
- **El PR cierra el issue.** Con `Closes #<n>` el issue se cierra al unir a `develop`, sin pasos manuales.

Sin asistente vale lo mismo: quien desarrolla hace las dos columnas, y también revisa su rama contra el mockup antes de abrir el PR.

Las instrucciones para el asistente están en `AGENTS.md` («Ciclo con un asistente»). La propuesta de llevar este ciclo a `upme-estandares` es el pendiente [X-20](../pendientes/x-20-ciclo-con-asistentes.md).

## Ejemplos

### 1. Corrección: el entorno local no levantaba (issue #1, PR #3)

1. **Problema:** el entorno de desarrollo no arrancaba.
2. **Issue #1** con la plantilla *Corrección*: qué pasa, qué debería pasar, cómo reproducirlo.
3. **Rama** `fix/1-dev-env-setup` desde `develop`.
4. **Commits** como `fix: make local dev environment start…` con `Refs: #1`.
5. **CHANGELOG** (sección *Corregido*) y **diario** (`docs/diario/2026/2026-11-08-entorno-local.md`) en el mismo cambio (DOC-04, DOC-05).
6. **PR #3** hacia `develop`, CI en verde, merge, se borra la rama y se cierra el #1.

En ese caso el issue se creó al final; lo correcto es crearlo **antes** de empezar.

### 2. Vista nueva: Comparar revisiones

1. **Issue** con la plantilla *Feature*, con la ficha de FLU-01:
    - **Pregunta que responde:** ¿en qué se diferencian dos revisiones publicadas?
    - **Público:** modeladores y Subdirectora.
    - **Zona:** app interna.
    - **Datos y fuente:** `core.revisions` y `core.revision_values`.
    - **Acción que habilita:** explicar los cambios entre publicaciones.

    Más la ubicación en el menú y los criterios de aceptación (por ejemplo: «se eligen dos revisiones y un escenario; el gráfico muestra la diferencia año a año»).
2. **Diseño:** se hace el mockup. Hoy esta vista no tiene uno (X-06).
3. **Aprobación:** el líder aprueba; en el issue quedan el enlace o la captura, la fecha y quién aprobó. La captura se guarda en `docs/tecnica/mockups/`.
4. **Rama** `feature/<n>-compare-revisions` desde `develop`.
5. **Desarrollo y documentación:** código, pruebas, página del inventario con capturas, CHANGELOG y diario: la definición de hecho (FLU-07).
6. **PR, CI, merge, cierre.**

Sin diseño aprobado no se empieza a programar.

### 3. Solo documentación: mockups aprobados (issue #2, PR #4)

Issue con la plantilla *Documentación*, rama `docs/2-mockups-approved`, PR a `develop`. No lleva diseño ni pruebas de código, pero sí CHANGELOG y diario.

### 4. Urgencia en producción (hotfix)

Con la app publicada, el tablero muestra la demanda en MWh en lugar de GWh:

1. **Issue** con la plantilla *Hotfix en producción*: impacto, qué pasa y versión afectada.
2. **Rama** `hotfix/v1.0.1-energy-units` desde **`main`**, no desde `develop`, porque se corrige lo publicado.
3. Se une a `main` con la etiqueta `v1.0.1` **y también a `develop`**, para que la corrección no se pierda en la siguiente versión.

### 5. Una librería nueva

Si una tarea necesita una tecnología o librería nueva, **no se instala** en la rama: se sigue TEC-05 (ver `reglas/REGLAS-TECNICAS.md`) y se abre el proceso en `upme-estandares` (IA-05). Las librerías pequeñas de soporte solo requieren TEC-06.

## Publicar una versión

Cuando `develop` tiene un conjunto de cambios listo para producción:

1. Rama `release/vX.Y.Z` desde `develop` (versión según `docs/tecnica/versionado.md`; mientras no haya producción, `0.y.z`).
2. Se estabiliza: solo correcciones; `[Sin publicar]` del CHANGELOG pasa a `## [X.Y.Z] - AAAA-MM-DD`; se regeneran las capturas (DOC-03).
3. PR a `main`, merge y etiqueta `vX.Y.Z`; luego se une de vuelta a `develop`.

## Quién hace qué

| Rol | Responsabilidad |
| --- | --- |
| Líder del equipo | Asigna responsabilidades y prioriza los issues. Revisa el texto de los issues cuando puede, aprueba los diseños (FLU-03) y decide las publicaciones. También puede crear issues. |
| Quien desarrolla | Puede crear el issue de lo que le asignaron cuando ya sabe cómo resolverlo. Lo recomendable es pasarle antes el texto al líder y crearlo cuando esté aprobado; según la disponibilidad o la urgencia, lo puede crear directamente. Crea la rama, los commits, la documentación y el PR, y une su PR con la CI en verde (FLU-05). |
| CI (revisión automática) | No es una persona: son las verificaciones que GitHub Actions corre solas en cada PR (`.github/workflows/ci.yml`). Revisan CHANGELOG, diseño, inventario, pruebas y documentación. Si alguna falla, el PR no se une hasta corregirla. |
| Asistentes de IA | Siguen las mismas reglas (IA-03); su trabajo pasa por el mismo PR y la misma CI. Redactan el issue y el PR, pero no los crean ni los unen (ver [Trabajar con un asistente de IA](#trabajar-con-un-asistente-de-ia)). |
