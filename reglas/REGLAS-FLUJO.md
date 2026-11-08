# Reglas de flujo de trabajo

Ramas, commits, versionado, documentación obligatoria, revisión y uso de asistentes de IA.

Versión del estándar: ver `reglas/VERSION`. Historial: `CHANGELOG.md`.

## Flujo de trabajo (FLU)

### Ciclo de una vista o feature

```
1. Ficha (issue)  →  2. Diseño (mockup)  →  3. Aprobación del diseño  →  4. Desarrollo (rama + PR)
      →  5. Documentación (usuario + técnica + changelog + diario)  →  6. Revisión y unión  →  7. Publicación
```

**FLU-01 (DEBE)** Todo trabajo nace de un **issue** en GitHub con la plantilla correspondiente (Feature, Fix, Hotfix, Documentación, Nueva tecnología). La ficha de una feature incluye en 5 líneas: pregunta que responde, público, zona, datos y fuente, acción que habilita; más ubicación en el menú y criterios de aceptación.

**FLU-02 (DEBE)** Tipos de trabajo y su prefijo de rama: `feature/`, `fix/`, `hotfix/`, `docs/`, `chore/`, `release/`.

**FLU-03 (DEBE)** **Diseño antes que código.** Ninguna vista nueva o cambio visual se desarrolla sin un diseño aprobado. La herramienta es libre (Claude, Figma, Cursor, Codex, Gemini, HTML); en la ficha se pega el enlace o la captura, la fecha y quién aprobó. El diseño pasa la revisión de diseño. Aprueba el líder del equipo, o quien él delegue o la Subdirectora.

**FLU-04 (DEBE)** Ramas (Git flow simplificado):
- `main`: lo que está en producción. Solo recibe `release/*` y `hotfix/*`.
- `develop`: integración. Recibe `feature/*`, `fix/*`, `docs/*`, `chore/*`.
- `feature/<issue>-<descripcion-corta>` sale de `develop` y vuelve a `develop` por PR.
- `release/vX.Y.Z` sale de `develop`, se estabiliza y se une a `main` (con etiqueta) y de vuelta a `develop`.
- `hotfix/vX.Y.Z-<descripcion>` sale de `main`, se une a `main` (con etiqueta) y a `develop`.
- `main` y `develop` no reciben push directo; todo por PR con CI en verde. *Con GitHub Free, la protección de ramas solo existe en repositorios públicos: en los privados esta regla se cumple por disciplina del equipo y la revisión automática (P-17).*

**FLU-05 (DEBE)** Todo cambio entra por **Pull Request** con la plantilla del proyecto (enlace al issue, diseño aprobado, reglas aplicadas, lista de verificación, capturas). *Aprobación por una segunda persona: pendiente (P-06); por ahora el autor puede unir con CI en verde.*

**FLU-06 (DEBE)** Idioma: código, nombres técnicos y commits en **inglés**; documentación e interfaz en **español**. Commits con Conventional Commits.

**FLU-07 (DEBE)** **Definición de hecho** de una feature: código + pruebas + revisión de diseño + página del inventario actualizada (con capturas) + documentación técnica si toca una herramienta o arquitectura + entrada en CHANGELOG + entrada en el diario. Sin esto, el PR no se une.

**FLU-08 (DEBE)** Versionado: ver Versionado.

**FLU-09 (DEBE)** Cada proyecto lleva una **copia** de las reglas en `reglas/` (los cuatro archivos de reglas y `VERSION`) y de los recursos de su marca (`dist/<marca>/`) en `frontend/src/estandares/`. Las reglas **se editan solo en `upme-estandares`**, nunca en la copia. Para actualizar: copiar `reglas/` y `dist/<marca>/` de la versión elegida, revisar qué cambió (CHANGELOG del estándar) y qué código deja de cumplir, y registrarlo en el CHANGELOG del proyecto (`chore: update standards to vX.Y.Z`).

**FLU-10 (DEBE)** CHANGELOG obligatorio: la CI rechaza un PR a `develop` o `main` que no modifique `CHANGELOG.md` (salvo etiqueta `sin-changelog` justificada, por ejemplo cambios solo de CI).

**FLU-11 (DEBE)** Diario de cambios: ver Documentación.

**FLU-12 (DEBE)** Inventario de vistas y features con capturas: ver Documentación.

**FLU-13 (DEBE)** Fichas técnicas locales de cada herramienta usada: ver Documentación.

**FLU-14 (DEBE)** Notificaciones (correo, Google Chat): cada evento se registra en el inventario con evento, destino y responsable antes de implementarse.

**FLU-15 (DEBE)** Nueva tecnología: proceso TEC-05 de `REGLAS-TECNICAS.md`.

**FLU-16 (DEBE)** Revisión automática de documentación: ver Revisión automática.

**FLU-17 (DEBE)** Contexto para asistentes de IA: ver Asistentes de IA.

## Mensajes de commit (Conventional Commits)

Formato, en inglés:

```
<tipo>(<alcance opcional>): <resumen en imperativo, minúsculas, sin punto>

<cuerpo opcional: qué y por qué>

Refs: #<issue>
```

| Tipo | Uso | Efecto en versión |
| --- | --- | --- |
| `feat` | Nueva funcionalidad o vista | MENOR |
| `fix` | Corrección | PARCHE |
| `docs` | Solo documentación | — |
| `refactor` | Cambio interno sin cambiar comportamiento | — |
| `perf` | Rendimiento | PARCHE |
| `test` | Pruebas | — |
| `build` / `ci` / `chore` | Dependencias, CI, mantenimiento | — |
| `data` | Cargas o congelamiento de datos | — |
| `feat!` o `BREAKING CHANGE:` | Cambio incompatible | MAYOR |

Alcances sugeridos: el nombre de la vista o módulo (`revisions`, `kiosk`, `auth`, `pipelines`).

Ejemplos:
```
feat(revisions): add revision fan chart with scenario band
fix(kiosk): pause rotation for 30 s after any pointer interaction
docs(user-guide): add screenshots for exogenous monitor
```

La revisión automática (FLU-16) verifica el formato y propone correcciones de documentación; los mensajes no se reescriben en `main`.

## Versionado: los cuatro relojes

Cada cosa versionable lleva su propia versión. **No** son la misma.

| Reloj | Ejemplo | Esquema | Cambia cuando… | Dónde se registra |
| --- | --- | --- | --- | --- |
| **Aplicación** (código) | `v1.4.2` | SemVer: MAYOR.MENOR.PARCHE | Cada publicación (`release/` o `hotfix/`) | Etiqueta Git + CHANGELOG |
| **Modelo** | `EE-LP v3.2.0` | SemVer por modelo: MAYOR cambia método o variables; MENOR reentrena; PARCHE corrige | Cada cambio del modelo | Registro de modelos (MLflow, fase 2); hoy, tabla `core.models` |
| **Datos** | `datos-ee-2026-06-30` | Fecha de corte | Cada foto congelada | DVC (fase 2); hoy, `cutoff_date` en la base |
| **Publicación** (revisión) | `Revisión jul-2026` | Mes de publicación | Cada proyección oficial | Tabla `core.revisions` |

**FLU-08 (DEBE)** Una publicación **enlaza los otros tres**: "Revisión jul-2026 = modelo EE-LP 3.2.0 + datos con corte 2026-06-30 + ejecutada con app v1.4.2". Con eso siempre se puede reconstruir.

Además, `upme-estandares` tiene su propia versión SemVer y cada proyecto declara cuál sigue en `estandares.lock`.

#### Cómo se sube la versión de la app
- `fix` → PARCHE (1.4.2 → 1.4.3) · `feat` → MENOR (1.4.3 → 1.5.0) · cambio incompatible → MAYOR (1.5.0 → 2.0.0).
- Mientras la app no esté en producción, se usa `0.y.z`.

## Estándar de documentación

**Todo lo que se desarrolla queda documentado en el mismo PR.** La documentación de cada app vive **dentro de su repositorio** (cambia junto con el código); los estándares viven en `upme-estandares` y cada proyecto lleva su copia en `reglas/` (FLU-09).

### Estructura en cada proyecto

```
CHANGELOG.md                 changelog técnico por versión (Keep a Changelog)
docs/
  usuario/                   GUÍA DE USUARIO (sitio público) — mkdocs.usuario.yml
    index.md                 qué es la app y cómo entrar
    inventario/              una página por vista o feature
      index.md               tabla generada del inventario
      <vista>.md
    roles.md                 qué puede hacer cada rol
    glosario.md
    capturas/                generadas por Playwright
  tecnica/                   DOCUMENTACIÓN TÉCNICA (sitio privado) — mkdocs.tecnica.yml
    index.md                 cómo levantar el proyecto
    arquitectura.md
    diseno-app.md            menú, productos y excepciones de diseño de esta app
    modelo-de-datos.md
    api.md
    flujos.md                flujos de Prefect
    notificaciones.md        (cuando aplique)
    herramientas/<nombre>.md ficha local de cada herramienta
    despliegue.md
  diario/                    DIARIO DE CAMBIOS (privado)
    AAAA/AAAA-MM-DD-<slug>.md
  decisiones/                ADR del proyecto
  producto/                  objetivos, alcance, hoja de ruta
  pendientes.md
```

### Dos sitios con MkDocs

| Sitio | Público | Configuración | Publicación |
| --- | --- | --- | --- |
| Guía de usuario | Sí | `mkdocs.usuario.yml` (solo `docs/usuario/`) | **Pendiente P-08.** Con GitHub Free, GitHub Pages solo publica desde repositorios públicos. Opciones: un repositorio público `<proyecto>-guia` que recibe el sitio construido por una Action, o un servidor de la UPME. |
| Documentación técnica | No | `mkdocs.tecnica.yml` (técnica, diario, decisiones, producto) | **Pendiente P-09.** Mientras tanto se lee en GitHub (el Markdown se ve formateado) o con `mkdocs serve`. |

### Inventario de vistas y features

**DOC-01 (DEBE)** Cada vista o feature tiene una página en `docs/usuario/inventario/` con este encabezado (front matter) y secciones:

```markdown
---
id: monitor-exogenas
titulo: Monitor de variables exógenas
zona: app            # app | portal | pantalla
ruta: /app/exogenas
roles: [viewer, modeler, approver, admin]
estado: publicada    # diseno | desarrollo | publicada | retirada
version_desde: 0.3.0
diseno: <enlace al mockup aprobado>
capturas: [capturas/monitor-exogenas.png]
actualizado: 2026-11-07
---

## Para qué sirve
## Cómo llegar
## Qué muestra
## Cómo se usa (paso a paso)
## Filtros y opciones
## Preguntas frecuentes
## Historial (enlaces a entradas del diario)
```

**DOC-02 (DEBE)** `docs/usuario/inventario/index.md` es una tabla de todas las vistas (generada por `scripts/inventario.py` a partir del front matter). La CI falla si una ruta del frontend no tiene página en el inventario.

**DOC-03 (DEBE)** Las capturas se generan con Playwright (`pnpm screenshots`) con datos de ejemplo marcados como ilustrativos, en cada `release/`. No se pegan capturas manuales salvo que la vista no pueda automatizarse.

### Changelog

**DOC-04 (DEBE)** `CHANGELOG.md` en formato [Keep a Changelog](https://keepachangelog.com/es-ES/), en español, con sección `## [Sin publicar]` y secciones `Agregado`, `Cambiado`, `Corregido`, `Eliminado`, `Seguridad`, `Obsoleto`. Cada línea menciona la vista o feature y el PR. Al publicar, `[Sin publicar]` pasa a `## [X.Y.Z] - AAAA-MM-DD`.

### Diario de cambios

**DOC-05 (DEBE)** Cada PR unido a `develop` agrega una entrada en `docs/diario/AAAA/AAAA-MM-DD-<slug>.md`:

```markdown
---
fecha: 2026-11-07
autor: <nombre>
pr: 42
tipo: agrega        # agrega | modifica | elimina | corrige
vistas: [monitor-exogenas]
features: [alerta-pib]
version: sin publicar
---

## Qué cambió
Descripción para una persona no técnica.

## Por qué

## Cómo se ve
![antes](...) ![después](...)

## Notas técnicas
Tablas, flujos o endpoints tocados; enlaces a fichas.
```

**DOC-06 (DEBE)** Los **reportes periódicos** (semana, mes, rango) se generan desde el diario con `scripts/reporte.py --desde AAAA-MM-DD --hasta AAAA-MM-DD`, o pidiéndolo a un asistente con la plantilla de abajo. Estructura fija: resumen en 3 líneas · vistas agregadas · vistas modificadas · vistas eliminadas · correcciones · cambios técnicos · pendientes que avanzaron · próximos pasos.

### Documentación técnica

**DOC-07 (DEBE)** Toda herramienta usada en el proyecto tiene ficha local en `docs/tecnica/herramientas/` con: cómo encaja aquí, dónde está, configuración, comandos, casos del proyecto (por ejemplo, qué flujos de Prefect existen) y reglas propias, enlazando a la ficha general de `upme-estandares/herramientas/`.

**DOC-08 (DEBE)** Cambios de arquitectura, modelo de datos, API o flujos actualizan su página técnica en el mismo PR.

### Plantilla para pedir documentación a un asistente

```
Documenta los cambios unidos a develop entre <fecha> y <fecha> según
reglas/REGLAS-FLUJO.md (Estándar de documentación): verifica que cada PR tenga entrada en
CHANGELOG (DOC-04) y en docs/diario (DOC-05), que cada vista nueva o modificada tenga su
página de inventario actualizada (DOC-01) y que las herramientas tocadas tengan ficha local
(DOC-07). Crea lo que falte y genera el reporte del periodo con la estructura de DOC-06.
```

## Revisión automática de documentación

**Estado:** documentada, **no programada todavía** (pendiente P-07).

Una **tarea programada de Claude** revisa cada cierto tiempo lo que se unió a `develop` y completa la documentación que falte, abriendo un PR para que el equipo lo revise.

### Qué revisa
1. Que cada PR unido tenga entrada en `CHANGELOG.md` (DOC-04) y en `docs/diario/` (DOC-05).
2. Que los commits sigan Conventional Commits (FLU-06); si no, lo anota en el reporte.
3. Que cada vista nueva o modificada tenga su página de inventario actualizada (DOC-01) y capturas (DOC-03).
4. Que cada herramienta nueva tenga ficha general y local (TEC-02, DOC-07).
5. Que las páginas técnicas tocadas por el cambio estén al día (DOC-08).
6. Que no haya valores de diseño sueltos (`lint_design.py`).

### Qué entrega
- Un PR `docs/auto-review-AAAA-MM-DD` a `develop` con lo que agregó o corrigió.
- Un reporte del periodo (DOC-06) en `docs/diario/reportes/`.
- Un resumen en la conversación de la tarea con lo que no pudo resolver.

### Cómo programarla (cuando se decida)
1. Conectar el repositorio de GitHub a Claude con permiso de escritura (para abrir PR).
2. Pedir a Claude: "Crea una tarea programada semanal, los lunes a las 7:00 (hora de Bogotá), con este prompt".
3. Elegir si sus ejecuciones se aprueban automáticamente o piden confirmación.

Prompt de la tarea:
```
Eres el revisor de documentación del repositorio <org>/<proyecto>. Sigue
reglas/REGLAS-FLUJO.md (Revisión automática de documentación). Revisa los PR unidos a develop desde
la última ejecución (o los últimos 7 días). Para cada punto de "Qué revisa" corrige lo que
puedas en una rama docs/auto-review-<fecha> y abre un PR a develop con el resumen. No
modifiques código de la aplicación. Si algo requiere decisión humana, déjalo en el reporte.
```

Alternativa futura: una revisión en cada PR con GitHub Actions y Claude (requiere clave de API de Anthropic en los secretos del repositorio).

## Asistentes de IA (Claude, Cursor, Codex, Gemini)

El equipo usa varias herramientas. Para que todas sigan las mismas reglas:

**IA-01 (DEBE)** Cada proyecto tiene en la raíz un **`AGENTS.md`** con el contexto y las reglas (lo leen Codex, Cursor y otras herramientas). `CLAUDE.md` contiene solo `@AGENTS.md` (Claude Code importa el archivo; si hay un `CLAUDE.md` sin esa línea, Claude Code no lee `AGENTS.md`). `GEMINI.md` remite a `AGENTS.md`. Las reglas están dentro del propio proyecto (`reglas/`, FLU-09), así que cualquier herramienta las lee sin configuración adicional.

**IA-02 (DEBE)** `AGENTS.md` incluye: qué es el proyecto, versión del estándar, stack, mapa del repositorio, comandos, **cuándo leer cada archivo de `reglas/`** (diseño y marca antes de tocar interfaz; técnicas antes de agregar o cambiar tecnología; flujo siempre) y "si una regla no encaja: detente y pregunta; propone un ADR". `CLAUDE.md` importa `AGENTS.md` y `reglas/REGLAS-FLUJO.md`; los demás se leen cuando la tarea lo requiere, para no cargar todo en cada sesión.

**IA-03 (DEBE)** Cualquier trabajo hecho con IA cumple igual la revisión de diseño (REV), la definición de hecho (FLU-07) y la documentación (DOC). La herramienta usada no cambia los requisitos.

**IA-04 (DEBERÍA)** Para diseñar o revisar con una IA (chat, Proyecto de Claude, skill), darle como contexto: `REGLAS-DISENO.md`, `MARCA-UPME.md` (o la marca que aplique), la ficha de la feature y, si existe, una vista similar ya aprobada o capturas de la app a revisar.

**IA-05 (DEBE)** Los asistentes no introducen, cambian ni retiran librerías o tecnologías sin seguir TEC-05. Si la necesidad aparece trabajando en un proyecto, se detienen y entregan el prompt de TEC-10 para ejecutarlo en Claude Code abierto en `upme-estandares`; las librerías pequeñas de soporte solo requieren TEC-06.

Prompt corto de contexto, para pegar en cualquier herramienta:
```
Proyecto de la UPME. Sigue las reglas adjuntas (REGLAS-DISENO, MARCA-UPME,
REGLAS-TECNICAS, REGLAS-FLUJO, versión vX.Y.Z). Cita los IDs de las reglas que apliques.
Si algo no está cubierto o requiere una tecnología nueva, detente y pregunta.
```
