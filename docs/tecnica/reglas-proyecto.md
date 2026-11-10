# Reglas del proyecto

Reglas propias de este repositorio, además de las del estándar (`reglas/`, que es una copia y no se edita, FLU-09). Nacieron de la revisión del modelo de datos de noviembre de 2026 (issue #32), cuando el estándar no cubría lo que hacía falta.

- **Cómo se leen:** igual que las del estándar. «DEBE» es obligatorio; cada regla tiene un ID que se cita en issues, PR y documentación. La página de [referencias](referencias.md) las incluye.
- **Cómo se crean:** toda necesidad de aclarar o documentar que aparezca se vuelve regla aquí y, a la vez, entra al pendiente para llevarla a `upme-estandares` (PFL-01). El pendiente vigente es [X-22](../pendientes/x-22-reglas-al-estandar.md).
- **Cuando el estándar las incorpora:** al copiar una versión nueva de `reglas/`, cada regla de aquí que ya esté en el estándar se reemplaza por la referencia a la regla del estándar (PFL-02).
- **Si una regla de aquí contradice al estándar:** manda el estándar. Se detiene el trabajo, se anota y se propone el cambio (`AGENTS.md`, regla 6).

Familias: **PBD** base de datos · **PDA** datos y cargas · **PFU** fuentes de datos · **PFL** flujo de trabajo · **PER** cálculo del error.

## Base de datos (PBD)

**PBD-01 (DEBE)** Todo esquema, tabla, vista y columna de la base lleva un comentario en español (`COMMENT ON`) que dice qué es y para qué sirve. El comentario se escribe en la migración de Alembic que crea el objeto. Los nombres van en inglés y `snake_case` en todos los esquemas, incluido `raw` (BD-05).

**PBD-02 (DEBE)** Todo esquema y toda tabla o vista tiene su documentación en la sección [Base de datos](base-de-datos/index.md) de esta guía, con para qué existe, contexto, cómo se usa y ejemplos puntuales, en el mismo PR que lo crea o lo cambia (DOC-08).

**PBD-03 (DEBE)** El diccionario de tablas y columnas se genera desde los comentarios de la base, no se escribe a mano. La CI falla si falta un comentario, con un mensaje que nombra el objeto y cómo corregirlo. Ejemplo: «Falta el comentario de la columna `core.revision_values.value`. Agrégalo con `comment=` en la migración». Igual para esquemas, tablas y vistas.

**PBD-04 (DEBE)** La CI aplica las migraciones en una base PostgreSQL de prueba de la misma versión del proyecto, las revierte y, sobre esa base, verifica los comentarios (PBD-03) y que el diccionario esté al día. Ningún cambio de esquema entra sin pasar por ahí. Las pruebas del backend con SQLite no reemplazan esta verificación.

**PBD-05 (DEBE)** Los datos de fuentes externas nunca se sobrescriben:

- cada extracción queda registrada, y los valores se guardan solo si son nuevos o cambiaron frente a la última versión;
- cada valor guarda su `version` (1, 2, 3… por periodo, sin repetirse) y su fecha de carga (`loaded_at`), y la versión propia de la fuente si la trae;
- el valor vigente es la versión máxima aceptada de cada periodo, y el valor a una fecha es la versión máxima aceptada cargada hasta esa fecha;
- todo cambio detectado queda registrado con su fecha y sus valores anterior y nuevo.

Así siempre se puede responder qué se sabía en una fecha dada (FLU-08).

**PBD-06 (DEBE)** Lo oficial nunca comparte tablas con lo experimental. Las salidas de modelos candidatos, sus pruebas y sus métricas (fase 2) viven en un esquema propio o en las herramientas de MLOps (MLflow, DVC). Solo una revisión aprobada y publicada entra a `core.revisions` y `core.revision_values`.

**PBD-07 (DEBE)** Además de los cinco esquemas de BD-03, la base tiene el esquema `operacion` para lo que describe cómo funciona el sistema: bitácora de cargas, mensajes de carga, extracciones, estado de las fuentes, notificaciones y auditoría. No guarda datos del producto ni depende de una fuente, así que sigue igual si cambia el origen de los datos (P-0004).

**PBD-08 (DEBE)** Lo que no cambia en una revisión publicada son sus **cifras**: valores, componentes, intervalos, escenarios y supuestos (P-0003, PRI-06). Una cifra equivocada se corrige con una revisión nueva (`2026-11.1`, X-09). Los **metadatos** de la revisión sí se pueden completar o corregir en la misma fila: enlace del informe, fecha de publicación, modelo, nombre y notas. Cada cambio deja registro: qué campo, valor anterior y nuevo, quién, cuándo y por qué. El registro va en la bitácora (`operacion`, PDA-05). Ejemplo: cuando se tenga el enlace del informe de la revisión 2026-07, se reemplaza `https://www.upme.gov.co` por el enlace exacto, sin crear una revisión nueva.

## Datos y cargas (PDA)

**PDA-01 (DEBE)** La arquitectura está desacoplada del origen de los datos:

- cada fuente externa tiene su lector y sus tablas `raw`;
- la transformación a `staging` entrega una forma fija por tipo de dato (el contrato);
- `core`, la API y las vistas nunca leen `raw` ni dependen de una fuente.

Cambiar el origen de una fuente (por ejemplo, a una base de datos común de la UPME) solo toca su lector y su transformación a `staging`.

**PDA-02 (DEBE)** Toda carga aplica las reglas de detección de datos anómalos que documenta la ficha de la fuente. Un dato anómalo queda marcado, se reporta y no se usa en cálculos ni vistas. Solo una persona con el rol autorizado puede aceptarlo o rechazarlo, y queda registrado quién, cuándo y por qué. Si la fuente entrega después una versión que pasa las reglas, la anomalía se cierra y queda anotado.

**PDA-03 (DEBE)** La carga incremental de cada fuente se complementa con una carga completa periódica del histórico (conciliación). Toda diferencia se versiona (PBD-05) y se registra como cambio; lo que no cambió no se vuelve a guardar.

**PDA-04 (DEBE)** Si cambia o queda anómalo un dato que ya usó una revisión publicada o un modelo, se registra un aviso para el modelador o analista responsable, que decide qué hacer.

**PDA-05 (DEBE)** Toda ejecución de un flujo de carga deja una fila en la bitácora (`operacion.load_runs`), aunque no encuentre nada, con:

- rango consultado;
- periodos nuevos, cambiados y sin cambio;
- datos anómalos nuevos y errores;
- un mensaje legible.

Cada error, advertencia o información de la carga va en `operacion.load_messages`, con el objeto afectado (hoja, serie, periodo, variable o extracción).

**PDA-06 (DEBE)** Toda carga de un archivo publicado (por ejemplo, un anexo de una revisión) ubica los datos por los textos de los encabezados, no por posiciones fijas, y verifica las identidades internas del archivo antes de aceptarlo: sumas de componentes, total anual igual a la suma de los meses y límites del intervalo alrededor del valor medio. Si algo no cuadra, la carga falla con un mensaje que dice qué hoja, qué serie y qué periodo, y queda en la bitácora (PDA-05).

**PDA-07 (DEBE)** Cuando una fuente cambia de convención entre publicaciones (signo, nombres, unidades), todo el histórico se normaliza a la convención más reciente al cargarlo; no se guardan valores con convenciones distintas. La regla de normalización de cada versión queda en la ficha de la fuente y en su lector. Ejemplo: la generación distribuida (GD) se guarda siempre positiva y la resta la aplica `core.series_composition`.

## Fuentes de datos (PFU)

**PFU-01 (DEBE)** Toda fuente externa tiene su ficha en el apartado [Fuentes de datos](base-de-datos/fuentes/index.md) antes de su primera carga, con la [plantilla de ficha](base-de-datos/fuentes/plantilla-ficha.md).

**PFU-02 (DEBE)** Toda entidad que entrega datos al proyecto tiene una guía de sus fuentes al nivel de la [guía de XM](base-de-datos/fuentes/xm/guia-api-xm.md): mapa de fuentes, endpoints, cómo descubrir una variable, definiciones, trampas, ejemplos y arquitectura recomendada. La guía se construye a medida que se analiza la fuente. `AGENTS.md` dice qué documento leer antes de trabajar con cada fuente.

**PFU-03 (DEBE)** Todo lo que se documente del modelo de una revisión, o de cualquier dato tomado de un informe publicado, cita el informe y la página donde se dice. Se usa la página impresa en el informe y, si el PDF numera distinto, también la del PDF. Aplica a la documentación de [Modelos](modelos/index.md) y a los metadatos de la base (`core.revisions.model`, `notes`). Lo que el informe no dice no se escribe como hecho: se anota como duda (X-23) o como dato por confirmar. Ejemplo: «el VEC lleva variables dummy de impulso o escalón (Rev. Julio 2026, p. 43, nota 38)».

## Flujo de trabajo (PFL)

**PFL-01 (DEBE)** Toda necesidad de aclarar o documentar que aparezca se vuelve regla de este documento y, a la vez, entra a un pendiente para llevarla a `upme-estandares`, con su contexto y un prompt listo para ejecutarlo completo. Siempre que una regla, script o paso de CI pueda servir a otros proyectos, entra a ese pendiente con todo lo necesario para copiarlo.

**PFL-02 (DEBE)** Al copiar una versión nueva de `reglas/` desde `upme-estandares` (FLU-09), el asistente o la persona que la copia:

1. revisa qué reglas de este documento ya están en el estándar y las reemplaza por la referencia a la regla del estándar;
2. verifica que ninguna regla de aquí contradiga una del estándar;
3. lo reporta en el PR de la actualización.

## Cálculo del error (PER)

**PER-01 (DEBE)** Provisional hasta validarla con los datos cargados en este proyecto (T-26). El error de una revisión de energía eléctrica se calcula así:

- **Dato real:** `DemaSIN` de XM, agregada a meses completos.
- **Serie de comparación:** `SIN+GCE+ME+GD_UPME`.
- **Error:** proyectado − real, en GWh y en %. Un valor positivo significa que la UPME sobreestimó.
- **Meses parciales:** se descartan; no se escalan.
- **Horizonte:** se mide desde el primer mes proyectado de la revisión.
- **Las demás series:** solo muestran cuánto aporta cada componente (GCE, ME y GD); no se usan para medir el error.

Esta regla es del dominio de la Subdirección y no va al estándar.
