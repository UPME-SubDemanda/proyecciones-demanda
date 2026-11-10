---
hide: [toc]
---

# Referencias

Qué significa cada ID que se cita en el proyecto. Escriba el ID en el buscador (por ejemplo `DOC-04` o `T-05`) o use el índice.

Generado por `scripts/referencias.py` desde `reglas/`, `docs/tecnica/reglas-proyecto.md`, `docs/pendientes.md` y `docs/decisiones/`. No editar a mano: cambie la fuente y regenere.

## Índice

| Familia | Sección | Fuente | IDs |
| --- | --- | --- | --- |
| [UPME-LOG](#upme-log) | Logos (UPME-LOG) | `reglas/MARCA-UPME.md` | 2 |
| [UPME-COL](#upme-col) | Colores (UPME-COL) | `reglas/MARCA-UPME.md` | 4 |
| [UPME-TIP](#upme-tip) | Tipografía (UPME-TIP) | `reglas/MARCA-UPME.md` | 2 |
| [UPME-ICO](#upme-ico) | Íconos (UPME-ICO) | `reglas/MARCA-UPME.md` | 3 |
| [UPME-LEG](#upme-leg) | Requisitos legales (UPME-LEG) | `reglas/MARCA-UPME.md` | 3 |
| [UPME-VOC](#upme-voc) | Tono y vocabulario (UPME-VOC) | `reglas/MARCA-UPME.md` | 1 |
| [PRI](#pri) | Principios (PRI) | `reglas/REGLAS-DISENO.md` | 7 |
| [TOK](#tok) | Tokens (TOK) | `reglas/REGLAS-DISENO.md` | 5 |
| [LAY](#lay) | Layout y navegación (LAY) | `reglas/REGLAS-DISENO.md` | 8 |
| [CMP](#cmp) | Componentes (CMP) | `reglas/REGLAS-DISENO.md` | 3 |
| [GRA](#gra) | Gráficos (GRA) | `reglas/REGLAS-DISENO.md` | 12 |
| [UX](#ux) | Patrones de experiencia (UX) | `reglas/REGLAS-DISENO.md` | 9 |
| [TV](#tv) | Modo pantalla (TV) | `reglas/REGLAS-DISENO.md` | 8 |
| [CON](#con) | Contenido y lenguaje (CON) | `reglas/REGLAS-DISENO.md` | 8 |
| [A11](#a11) | Accesibilidad (A11) | `reglas/REGLAS-DISENO.md` | 8 |
| [MAR](#mar) | Contrato de marca (MAR) | `reglas/REGLAS-DISENO.md` | 9 |
| [REV](#rev) | Revisión de diseño (REV) | `reglas/REGLAS-DISENO.md` | 3 |
| [FLU](#flu) | Flujo de trabajo (FLU) | `reglas/REGLAS-FLUJO.md` | 17 |
| [DOC](#doc) | Estándar de documentación | `reglas/REGLAS-FLUJO.md` | 8 |
| [IA](#ia) | Asistentes de IA (Claude, Cursor, Codex, Gemini) | `reglas/REGLAS-FLUJO.md` | 5 |
| [TEC](#tec) | Estándar técnico | `reglas/REGLAS-TECNICAS.md` | 10 |
| [BD](#bd) | Bases de datos | `reglas/REGLAS-TECNICAS.md` | 7 |
| [PBD](#pbd) | Base de datos (PBD) | `docs/tecnica/reglas-proyecto.md` | 8 |
| [PDA](#pda) | Datos y cargas (PDA) | `docs/tecnica/reglas-proyecto.md` | 7 |
| [PFU](#pfu) | Fuentes de datos (PFU) | `docs/tecnica/reglas-proyecto.md` | 3 |
| [PFL](#pfl) | Flujo de trabajo (PFL) | `docs/tecnica/reglas-proyecto.md` | 2 |
| [PER](#per) | Cálculo del error (PER) | `docs/tecnica/reglas-proyecto.md` | 1 |
| [T](#t) | Plan de trabajo | `docs/pendientes.md` | 36 |
| [X](#x) | Pendientes de decisión | `docs/pendientes.md` | 33 |
| [P-0000](#p-0000) | Decisiones del proyecto (ADR) | `docs/decisiones/` | 4 |
| [Externos](#externos) | Citados pero definidos fuera de este repositorio | `upme-estandares` | 18 |

## UPME-LOG · Logos (UPME-LOG) {#upme-log}

### UPME-LOG-01 · DEBE {#upme-log-01}

Usar solo los archivos de `marcas/upme/logos/`, sin modificar. No recolorear, deformar, rotar, sombrear ni separar la franja tricolor.

Fuente: [MARCA-UPME.md · Logos (UPME-LOG)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#logos-upme-log)

### UPME-LOG-02 · DEBE {#upme-log-02}

Área de reserva libre alrededor del logo igual a la altura de la franja tricolor.

Fuente: [MARCA-UPME.md · Logos (UPME-LOG)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#logos-upme-log)

## UPME-COL · Colores (UPME-COL) {#upme-col}

### UPME-COL-01 · DEBE {#upme-col-01}

Roles de color:
| Token | Valor | Rol |
| --- | --- | --- |
| `brand` | #E4B33C amarillo UPME (sector Minas y Energía) | Identidad; además, producto Energía eléctrica |
| `primary` | #003189 azul de la bandera (presente en el logo) | Acciones, enlaces, foco |
| `on-brand` | #262626 | Texto sobre amarillo y verde, ambos temas |
| `ink` / `ink-muted` | #262626 / #5C5C5C | Texto (negro 85 % de la Librería de Iconos) |
| `surface` | #F7F7F5 | Fondo cálido |
| `flag-yellow` / `flag-red` | #FFC800 / #D80025 | Solo dentro de la franja tricolor |
| `warning` | #B54708 naranja | Distinto del amarillo de marca |

Fuente: [MARCA-UPME.md · Colores (UPME-COL)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#colores-upme-col)

### UPME-COL-02 · DEBE {#upme-col-02}

El amarillo (#E4B33C, 1,9:1 sobre blanco) y el verde (#B8FF65, 1,2:1) son claros: se usan como **relleno** con `on-brand` encima. Para texto o líneas en tema claro se usan sus versiones oscurecidas (`ee-line` #8C6400, `gn-line` #3B7300). En tema oscuro, los tonos puros sirven también como texto y línea.

Fuente: [MARCA-UPME.md · Colores (UPME-COL)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#colores-upme-col)

### UPME-COL-03 · DEBE {#upme-col-03}

Productos de la Subdirección de Demanda (MAR-04):
| Clave | Producto | `line` | `fill` | Ícono |
| --- | --- | --- | --- | --- |
| `ee` | Energía eléctrica | #8C6400 | #E4B33C | `Energia` |
| `gn` | Gas natural | #3B7300 | #B8FF65 | `gasNatural` |

Fuente: [MARCA-UPME.md · Colores (UPME-COL)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#colores-upme-col)

### UPME-COL-04 · DEBERÍA {#upme-col-04}

El amarillo no cubre áreas grandes en la app interna (solo acentos de LAY-04, etiquetas y gráficos). En portal y modo pantalla PUEDE usarse en bloques destacados.

Fuente: [MARCA-UPME.md · Colores (UPME-COL)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#colores-upme-col)

## UPME-TIP · Tipografía (UPME-TIP) {#upme-tip}

### UPME-TIP-01 · DEBE {#upme-tip-01}

**Nunito Sans** (Google Fonts, SIL OFL) en toda la interfaz: 900/800 cifras y títulos grandes, 700 títulos y etiquetas, 400 texto. **IBM Plex Mono** para versiones e identificadores. **Verdana** (complementaria del manual) solo en correos y documentos de oficina, nunca en interfaz.

Fuente: [MARCA-UPME.md · Tipografía (UPME-TIP)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#tipografía-upme-tip)

### UPME-TIP-02 · DEBE {#upme-tip-02}

Autoalojar las fuentes en el proyecto (`public/fonts/`) para que el modo pantalla funcione sin conexión.

Fuente: [MARCA-UPME.md · Tipografía (UPME-TIP)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#tipografía-upme-tip)

## UPME-ICO · Íconos (UPME-ICO) {#upme-ico}

### UPME-ICO-01 · DEBE {#upme-ico-01}

Solo la **Librería de Iconos UPME**, variante «Sin fondo negro», incrustada con `fill="currentColor"`. Proceso para buscar y agregar íconos: Íconos UPME.

Fuente: [MARCA-UPME.md · Íconos (UPME-ICO)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#íconos-upme-ico)

### UPME-ICO-02 · DEBE {#upme-ico-02}

Tamaños: 20 px navegación y botones; 24 px tarjetas; 40–60 px íconos de producto en círculo (variantes amarilla y verde de la librería).

Fuente: [MARCA-UPME.md · Íconos (UPME-ICO)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#íconos-upme-ico)

### UPME-ICO-03 · DEBE {#upme-ico-03}

Asignación fija concepto → ícono:
| Concepto | Ícono | Concepto | Ícono |
| --- | --- | --- | --- |
| Inicio | `home` | Alertas / notificaciones | `Notification` |
| Serie real vs. estimada | `OfertaDemanda` | Documentación | `Planes` |
| Historial / versiones | `time` | Descargar | `download` |
| Variables externas / clima | `clima` | Filtrar | `filter` |
| Modelos / control | `Control` | Buscar | `lupa` |
| Ejecutar / procesos | `Process` | Usuario | `perfil` |
| Advertencia | `Alert` | Correcto | `check` |
| Energía eléctrica | `Energia` | Gas natural | `gasNatural` |

Fuente: [MARCA-UPME.md · Íconos (UPME-ICO)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#íconos-upme-ico)

## UPME-LEG · Requisitos legales (UPME-LEG) {#upme-leg}

### UPME-LEG-01 · DEBE {#upme-leg-01}

Portal público: barra superior GOV.CO de 48 px (`govco` #3366CC) en todas las páginas, con el logo oficial del CDN de GOV.CO enlazado a https://www.gov.co (Kit UI GOV.CO). App interna y modo pantalla no la llevan.

Fuente: [MARCA-UPME.md · Requisitos legales (UPME-LEG)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#requisitos-legales-upme-leg)

### UPME-LEG-02 · DEBE {#upme-leg-02}

Pie de página del portal con datos de la entidad (dirección, horario, teléfonos, correo de notificaciones judiciales), enlaces a política de tratamiento de datos (Ley 1581 de 2012), términos de uso y accesibilidad, y barra inferior GOV.CO.

Fuente: [MARCA-UPME.md · Requisitos legales (UPME-LEG)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#requisitos-legales-upme-leg)

### UPME-LEG-03 · DEBE {#upme-leg-03}

Portal conforme a la Resolución 1519 de 2020 (accesibilidad y publicación) y Ley 1712 de 2014 (transparencia).

Fuente: [MARCA-UPME.md · Requisitos legales (UPME-LEG)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#requisitos-legales-upme-leg)

## UPME-VOC · Tono y vocabulario (UPME-VOC) {#upme-voc}

### UPME-VOC-01 {#upme-voc-01}

Nombre oficial: "Unidad de Planeación Minero Energética (UPME)"; después, "UPME". Productos: "Energía eléctrica", "Gas natural" (EE/GN solo en etiquetas compactas y archivos). Versiones publicadas: "Revisión mmm-aaaa".

Fuente: [MARCA-UPME.md · Tono y vocabulario (UPME-VOC)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/MARCA-UPME.md#tono-y-vocabulario-upme-voc)

## PRI · Principios (PRI) {#pri}

### PRI-01 {#pri-01}

**La cifra primero, la explicación al lado.** Cada vista abre con la respuesta (el número, el semáforo, el hallazgo) y deja el detalle a un clic.

Fuente: [REGLAS-DISENO.md · Principios (PRI)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#principios-pri)

### PRI-02 {#pri-02}

**Todo número dice de dónde viene.** Junto a cada cifra o gráfico va su procedencia: versión del dato o de la publicación, fecha de corte y fuente.

Fuente: [REGLAS-DISENO.md · Principios (PRI)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#principios-pri)

### PRI-03 {#pri-03}

**Lo observado y lo estimado nunca se confunden.** Dato real, proyección, simulación y escenario tienen codificación visual fija en todas las vistas (GRA-01).

Fuente: [REGLAS-DISENO.md · Principios (PRI)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#principios-pri)

### PRI-04 {#pri-04}

**Una alerta es una tarea.** Nada se señala como problema sin severidad, responsable, estado y una acción que lleve a la causa.

Fuente: [REGLAS-DISENO.md · Principios (PRI)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#principios-pri)

### PRI-05 {#pri-05}

**Mismo dato, distinto nivel de detalle.** Técnico para especialistas, ejecutivo para directivos, ciudadano para el público. Nunca jerga sin explicar en vistas públicas.

Fuente: [REGLAS-DISENO.md · Principios (PRI)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#principios-pri)

### PRI-06 {#pri-06}

**Lo publicado es inmutable y trazable.** Un resultado publicado no se edita: se corrige con una nueva versión. Toda descarga y gráfico se puede reconstruir.

Fuente: [REGLAS-DISENO.md · Principios (PRI)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#principios-pri)

### PRI-07 {#pri-07}

**Diseño antes que código.** Ninguna vista se desarrolla sin un diseño aprobado (ver flujo de trabajo, FLU-03).

Fuente: [REGLAS-DISENO.md · Principios (PRI)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#principios-pri)

## TOK · Tokens (TOK) {#tok}

### TOK-01 · DEBE {#tok-01}

Fuentes de verdad: `tokens/base.json` (lo común a cualquier marca: espaciado, radios, escala tipográfica, sombras, estados por defecto, parámetros de gráficos) y `marcas/<marca>/tokens.json` (todo lo que define la marca, ver contrato MAR). El script `scripts/build_tokens.py --marca <marca>` los combina y genera `dist/<marca>/tokens.css`, `tailwind.preset.js` y `echarts-theme.js`. Los archivos generados **no se editan a mano**.

Fuente: [REGLAS-DISENO.md · Tokens (TOK)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#tokens-tok)

### TOK-02 · DEBE {#tok-02}

En el código solo se usan nombres: CSS `var(--surface-raised)`, Tailwind `bg-surface-raised`, ECharts `roles.real`. Prohibidos hexadecimales, `rgb()`, tamaños de fuente, radios o familias tipográficas sueltos en componentes. Lo verifica `scripts/lint_design.py`.

Fuente: [REGLAS-DISENO.md · Tokens (TOK)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#tokens-tok)

### TOK-03 · DEBE {#tok-03}

Todo token lleva `usage` (dónde se usa y sobre qué fondos es legible) y valor para tema claro y oscuro.

Fuente: [REGLAS-DISENO.md · Tokens (TOK)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#tokens-tok)

### TOK-04 · DEBE {#tok-04}

Tema oscuro con `data-theme="dark"` en `<html>`. Obligatorio en el modo pantalla; opcional por usuario en las demás zonas.

Fuente: [REGLAS-DISENO.md · Tokens (TOK)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#tokens-tok)

### TOK-05 · DEBE {#tok-05}

Los proyectos no copian valores: instalan una **versión** del paquete de tokens de su marca (`dist/<marca>/`, versión anotada en `reglas/VERSION`) y la actualizan con el proceso de FLU-09.

Fuente: [REGLAS-DISENO.md · Tokens (TOK)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#tokens-tok)

## LAY · Layout y navegación (LAY) {#lay}

### LAY-01 · DEBE {#lay-01}

Toda vista nueva declara su zona y usa el esqueleto de esa zona. No se mezclan navegaciones.

Fuente: [REGLAS-DISENO.md · Layout y navegación (LAY)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#layout-y-navegación-lay)

### LAY-02 · DEBE {#lay-02}

Retícula de 12 columnas, ancho máximo de contenido 1.280 px (1.200 en portal), márgenes `space-6`, separación entre tarjetas `space-4`. Base de 4 px; componentes en múltiplos de 8.

Fuente: [REGLAS-DISENO.md · Layout y navegación (LAY)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#layout-y-navegación-lay)

### LAY-03 · DEBE {#lay-03}

Superficies: página `surface`; tarjetas `surface-raised` + borde 1 px `line` + `radius-md`; filtros, barra lateral y encabezados de tabla en `surface-sunken`. Sin sombras en tarjetas; `shadow-overlay` solo en capas flotantes.

Fuente: [REGLAS-DISENO.md · Layout y navegación (LAY)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#layout-y-navegación-lay)

### LAY-04 · DEBE {#lay-04}

Acento de marca: franja de 4 px `brand` bajo el encabezado; barra de 3 px `brand` a la izquierda del ítem activo del menú lateral; subrayado de 3 px `brand` en el ítem activo del menú superior.

Fuente: [REGLAS-DISENO.md · Layout y navegación (LAY)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#layout-y-navegación-lay)

### LAY-05 · DEBE {#lay-05}

Estructura de una vista interna, de arriba abajo:
1. Encabezado: `h1` + subtítulo con procedencia (PRI-02) + acciones a la derecha (máximo 1 botón primario).
2. Banner, solo si una alerta alta afecta lo que se ve.
3. Fila de 2 a 4 KPIs.
4. Gráfico principal (~2/3 del ancho) y hasta 2 secundarios apilados; luego tablas.

Fuente: [REGLAS-DISENO.md · Layout y navegación (LAY)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#layout-y-navegación-lay)

### LAY-06 · DEBE {#lay-06}

El menú lateral de cada app se documenta en el repositorio de la app (`docs/tecnica/diseno-app.md`) con grupos y orden fijos. Agregar un grupo requiere actualizar ese documento en el mismo PR.

Fuente: [REGLAS-DISENO.md · Layout y navegación (LAY)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#layout-y-navegación-lay)

### LAY-07 · DEBE {#lay-07}

Si la app maneja varios productos o contextos (por ejemplo, energía eléctrica y gas natural), hay un **selector global de contexto** en el encabezado que persiste entre vistas y en la URL.

Fuente: [REGLAS-DISENO.md · Layout y navegación (LAY)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#layout-y-navegación-lay)

### LAY-08 · DEBE {#lay-08}

Responsivo. Portal: móvil primero, quiebres 640 / 1024 / 1280 px, objetivos táctiles ≥ 44 px. App interna: optimizada ≥ 1280 px, usable en tablet; en móvil solo las vistas marcadas como móviles en el inventario. Modo pantalla: 1920 × 1080 escalado a otras resoluciones 16:9.

Fuente: [REGLAS-DISENO.md · Layout y navegación (LAY)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#layout-y-navegación-lay)

## CMP · Componentes (CMP) {#cmp}

### CMP-01 · DEBE {#cmp-01}

Antes de crear un componente, buscarlo en este inventario y en el código del proyecto. Si existe, se reutiliza o se extiende con una variante. Si no, se agrega a este inventario (en un PR a este repositorio) y al del proyecto.

Fuente: [REGLAS-DISENO.md · Componentes (CMP)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#componentes-cmp)

### CMP-02 · DEBE {#cmp-02}

Los componentes leen solo tokens, aceptan `className` para layout y no fijan márgenes externos.

Fuente: [REGLAS-DISENO.md · Componentes (CMP)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#componentes-cmp)

### CMP-03 · DEBE {#cmp-03}

Elementos nativos accesibles: `<button>`, `<a href>`, `<input>` + `<label>`, `<select>`. Nunca `onClick` en un `div`.

Fuente: [REGLAS-DISENO.md · Componentes (CMP)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#componentes-cmp)

## GRA · Gráficos (GRA) {#gra}

### GRA-00 · DEBE {#gra-00}

Todos los gráficos con Apache ECharts y el tema generado de la marca (`echarts-theme.js`: `<marca>Light`, `<marca>Dark`, `roles`). No se mezclan librerías de gráficos.

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

### GRA-01 · DEBE {#gra-01}

Codificación fija:
| Elemento | Marca | Rol en el tema |
| --- | --- | --- |
| Dato observado | Línea sólida 2,5 px (3,5 en modo pantalla) | `roles.real` (= `ink`) |
| Proyección / estimación vigente | Discontinua `[10, 7]` | `roles.products.<producto>.line` |
| Escenarios bajo–alto | Banda translúcida sin borde (dos áreas apiladas, la inferior transparente) | `roles.products.<producto>.band` |
| Escenarios como líneas | Punteada fina `[3, 4]` | `roles.scenario` |
| Versiones anteriores | Línea 1 px | `roles.revisionPast` |
| Corte de datos, umbrales | `markLine` punteada con etiqueta | `roles.reference` |
| Eventos | `markArea` vertical con etiqueta | `surface-sunken` |
| Barras de producto | Relleno | `roles.products.<producto>.fill` |
| Valores negativos / fuera de umbral | `visualMap` | `roles.negative` (= `critical`) |

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

### GRA-02 · DEBE {#gra-02}

El título dice el hallazgo con su cifra ("La demanda real va 1,8 % bajo la proyección"), no el tema. El subtítulo dice unidad, alcance y versión.

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

### GRA-03 · DEBE {#gra-03}

Tipo de gráfico según la pregunta:
| Pregunta | Gráfico |
| --- | --- |
| ¿Cómo va lo real frente a lo estimado? | Línea real + estimación + banda |
| ¿Cómo han cambiado las versiones publicadas? | Abanico de versiones |
| ¿Qué tan buena es cada versión? | Barras horizontales de error, ordenadas |
| ¿Qué variable explica más? | Barras horizontales de importancia o correlación |
| ¿Cómo cambia una relación? | Correlación móvil con banda |
| ¿Se cumple un supuesto? | Observado (con puntos) vs. supuesto por escenario |
| Desviación por periodo | Barras con signo alrededor de cero |
| Partes de un total | Barras horizontales ordenadas. **Prohibidos** tortas, donas y 3D. |

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

### GRA-04 · DEBE {#gra-04}

Etiqueta al final de cada línea (`endLabel`) con hasta 4 series; leyenda superior con más.

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

### GRA-05 · DEBE {#gra-05}

Tooltip con fecha, observado, estimado, diferencia en % y versión, en formato de CON-04.

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

### GRA-06 · DEBE {#gra-06}

Para comparar versiones se usa la paleta `chart.series` de la marca, en orden; la vigente siempre discontinua y más gruesa.

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

### GRA-07 · DEBE {#gra-07}

Unidad en el nombre del eje Y. Barras desde cero; líneas ajustadas al rango visible.

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

### GRA-08 · DEBE {#gra-08}

Cada gráfico: acciones (datos CSV/Excel, imagen PNG, ver como tabla, pantalla completa), nota de fuente y tabla accesible equivalente.

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

### GRA-09 · DEBE {#gra-09}

Rango de fechas con `dataZoom` sincronizado con el RangeSlider y reflejado en la URL.

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

### GRA-10 · DEBERÍA {#gra-10}

Máximo 6 series visibles; con más, el usuario elige con chips.

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

### GRA-11 · DEBE {#gra-11}

Animaciones ≤ 500 ms y desactivadas con `prefers-reduced-motion`.

Fuente: [REGLAS-DISENO.md · Gráficos (GRA)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#gráficos-gra)

## UX · Patrones de experiencia (UX) {#ux}

### UX-01 · DEBE {#ux-01}

Filtros estándar, en este orden: contexto global (LAY-07) · versión publicada (por defecto la vigente) · rango de fechas · escenarios o categorías (chips). Todos se reflejan en la URL.

Fuente: [REGLAS-DISENO.md · Patrones de experiencia (UX)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#patrones-de-experiencia-ux)

### UX-02 · DEBE {#ux-02}

Cambiar un filtro actualiza la vista sin recargar ni mover el scroll; KPIs y gráficos usan los mismos filtros.

Fuente: [REGLAS-DISENO.md · Patrones de experiencia (UX)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#patrones-de-experiencia-ux)

### UX-03 · DEBE {#ux-03}

Estados de una publicación: Borrador → En revisión → Aprobada → Publicada (inmutable). Estados de un modelo o método: Candidato → Validado → Oficial → Retirado. Siempre con Badge. Lo publicado muestra "Crear corrección", nunca "Editar".

Fuente: [REGLAS-DISENO.md · Patrones de experiencia (UX)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#patrones-de-experiencia-ux)

### UX-04 · DEBE {#ux-04}

Procesos largos (ejecuciones, simulaciones, cargas) se lanzan con un asistente por pasos, corren en segundo plano, muestran avance y notifican al terminar.

Fuente: [REGLAS-DISENO.md · Patrones de experiencia (UX)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#patrones-de-experiencia-ux)

### UX-05 · DEBE {#ux-05}

Alertas: severidad alta = banner en la vista afectada + notificación + contador `critical` en el menú; media = contador y lista; baja = lista. Cada alerta enlaza a su causa; cerrarla exige comentario. Las alertas internas nunca se muestran en portal ni modo pantalla.

Fuente: [REGLAS-DISENO.md · Patrones de experiencia (UX)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#patrones-de-experiencia-ux)

### UX-06 · DEBE {#ux-06}

Toda vista define: carga (esqueletos, nunca spinner a pantalla completa), vacío (por qué y qué hacer), error (qué pasó y cómo seguir; detalle técnico plegado) y sin permiso (qué rol se necesita y a quién pedirlo).

Fuente: [REGLAS-DISENO.md · Patrones de experiencia (UX)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#patrones-de-experiencia-ux)

### UX-07 · DEBE {#ux-07}

Todo gráfico y tabla se descarga. Nombre: `{contexto}_{version}_{contenido}.{ext}`. El archivo incluye encabezado con fuente, versión, fecha de corte y licencia de uso.

Fuente: [REGLAS-DISENO.md · Patrones de experiencia (UX)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#patrones-de-experiencia-ux)

### UX-08 · DEBE {#ux-08}

Cada perfil tiene su página de inicio; lo que un perfil no puede usar no se muestra.

Fuente: [REGLAS-DISENO.md · Patrones de experiencia (UX)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#patrones-de-experiencia-ux)

### UX-09 · DEBE {#ux-09}

Las notificaciones externas (correo, Google Chat) siguen FLU-14: se definen en el inventario de la app con evento, destinatario y canal.

Fuente: [REGLAS-DISENO.md · Patrones de experiencia (UX)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#patrones-de-experiencia-ux)

## TV · Modo pantalla (TV) {#tv}

### TV-01 · DEBE {#tv-01}

Tema oscuro, diseñado a 1920 × 1080, escala tipográfica de pantalla (ver tabla de TIP en la marca: títulos 36 px, KPI 56 px, texto ≥ 18 px).

Fuente: [REGLAS-DISENO.md · Modo pantalla (TV)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#modo-pantalla-tv)

### TV-02 · DEBE {#tv-02}

Rotación automática con intervalo configurable 10 / 20 / 30 / 60 s (por defecto 20 s) y barra de progreso de 6 px en `brand`.

Fuente: [REGLAS-DISENO.md · Modo pantalla (TV)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#modo-pantalla-tv)

### TV-03 · DEBE {#tv-03}

Navegación manual: arrastre con dedo o mouse (umbral 80 px), flechas laterales sutiles, puntos inferiores, botón de pausa y de pantalla completa. Sin atajos de teclado globales.

Fuente: [REGLAS-DISENO.md · Modo pantalla (TV)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#modo-pantalla-tv)

### TV-04 · DEBE {#tv-04}

Cualquier interacción pausa la rotación 30 s y muestra "Pausa por interacción · continúa en N s". Tras 5 minutos sin interacción, los filtros vuelven a sus valores por defecto.

Fuente: [REGLAS-DISENO.md · Modo pantalla (TV)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#modo-pantalla-tv)

### TV-05 · DEBE {#tv-05}

Estructura fija de cada tablero: encabezado (logo para fondo oscuro, ícono de contexto, título, hora y fecha) · filtros · 4 KPIs · gráfico principal + 2 secundarios · pie con fuente, puntos y estado.

Fuente: [REGLAS-DISENO.md · Modo pantalla (TV)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#modo-pantalla-tv)

### TV-06 · DEBE {#tv-06}

Solo datos públicos. Nunca alertas internas, borradores ni experimentos.

Fuente: [REGLAS-DISENO.md · Modo pantalla (TV)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#modo-pantalla-tv)

### TV-07 · DEBE {#tv-07}

Funciona sin conexión mostrando los últimos datos con "Actualizado hace N horas".

Fuente: [REGLAS-DISENO.md · Modo pantalla (TV)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#modo-pantalla-tv)

### TV-08 · DEBE {#tv-08}

Configuración por URL: `/pantalla?tableros=a,b,c&intervalo=30`.

Fuente: [REGLAS-DISENO.md · Modo pantalla (TV)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#modo-pantalla-tv)

## CON · Contenido y lenguaje (CON) {#con}

### CON-01 · DEBE {#con-01}

Lenguaje claro (guía del DAFP): frases de menos de 25 palabras, voz activa, siglas explicadas en la primera mención en vistas públicas.

Fuente: [REGLAS-DISENO.md · Contenido y lenguaje (CON)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contenido-y-lenguaje-con)

### CON-02 · DEBE {#con-02}

Botones y enlaces: verbo en infinitivo + objeto, mayúscula inicial ("Descargar CSV"). Nunca "Clic aquí".

Fuente: [REGLAS-DISENO.md · Contenido y lenguaje (CON)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contenido-y-lenguaje-con)

### CON-03 · DEBE {#con-03}

Interfaz en español de Colombia. Código, nombres técnicos y mensajes de commit en inglés (FLU-06).

Fuente: [REGLAS-DISENO.md · Contenido y lenguaje (CON)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contenido-y-lenguaje-con)

### CON-04 · DEBE {#con-04}

Números con `Intl.NumberFormat('es-CO')`: punto de miles, coma decimal, espacio antes de `%` y unidades (`78.452 GWh`, `3,2 %`), signo menos tipográfico `−`. Unidades siempre visibles.

Fuente: [REGLAS-DISENO.md · Contenido y lenguaje (CON)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contenido-y-lenguaje-con)

### CON-05 · DEBE {#con-05}

Fechas: `15 oct 2026` en texto; `2026-10-15` en archivos y API; horas en 24 h. Versiones publicadas por mes: "Revisión jul-2026".

Fuente: [REGLAS-DISENO.md · Contenido y lenguaje (CON)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contenido-y-lenguaje-con)

### CON-06 · DEBE {#con-06}

Procedencia con formato `<Versión> · <modelo o método> · datos a <corte> · Fuente: <fuente>`.

Fuente: [REGLAS-DISENO.md · Contenido y lenguaje (CON)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contenido-y-lenguaje-con)

### CON-07 · DEBE {#con-07}

Datos de ejemplo marcados "Cifras ilustrativas" hasta conectar datos reales.

Fuente: [REGLAS-DISENO.md · Contenido y lenguaje (CON)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contenido-y-lenguaje-con)

### CON-08 · DEBERÍA {#con-08}

Glosario visible en portales públicos.

Fuente: [REGLAS-DISENO.md · Contenido y lenguaje (CON)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contenido-y-lenguaje-con)

## A11 · Accesibilidad (A11) {#a11}

### A11-01 · DEBE {#a11-01}

Contraste: texto ≥ 4,5:1 (≥ 3:1 desde 24 px o 18,7 px en negrita); bordes de controles, íconos informativos y líneas de gráfico ≥ 3:1. En ambos temas. `build_tokens.py --check` lo verifica para los pares de tokens.

Fuente: [REGLAS-DISENO.md · Accesibilidad (A11)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#accesibilidad-a11)

### A11-02 · DEBE {#a11-02}

Todo se opera con teclado; foco visible (2 px `focus` con 2 px de separación); orden de tabulación = orden visual.

Fuente: [REGLAS-DISENO.md · Accesibilidad (A11)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#accesibilidad-a11)

### A11-03 · DEBE {#a11-03}

Nombre accesible en todo control: `<label>`, `aria-label` en botones de solo ícono, `aria-pressed` en chips, `aria-current` en navegación.

Fuente: [REGLAS-DISENO.md · Accesibilidad (A11)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#accesibilidad-a11)

### A11-04 · DEBE {#a11-04}

Gráficos con `aria-label` (su título), `aria.enabled` de ECharts y tabla equivalente.

Fuente: [REGLAS-DISENO.md · Accesibilidad (A11)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#accesibilidad-a11)

### A11-05 · DEBE {#a11-05}

Nunca transmitir información solo con color: estados con texto e ícono; series distinguidas también por trazo o etiqueta.

Fuente: [REGLAS-DISENO.md · Accesibilidad (A11)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#accesibilidad-a11)

### A11-06 · DEBE {#a11-06}

Respetar `prefers-reduced-motion`.

Fuente: [REGLAS-DISENO.md · Accesibilidad (A11)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#accesibilidad-a11)

### A11-07 · DEBE {#a11-07}

Objetivos táctiles ≥ 44 × 44 px en portal y modo pantalla.

Fuente: [REGLAS-DISENO.md · Accesibilidad (A11)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#accesibilidad-a11)

### A11-08 · DEBE {#a11-08}

`lang` declarado, título único por vista, un solo `h1`, encabezados en orden.

Fuente: [REGLAS-DISENO.md · Accesibilidad (A11)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#accesibilidad-a11)

## MAR · Contrato de marca (MAR) {#mar}

### MAR-01 {#mar-01}

**Manual de identidad.** Referencia al manual oficial (PDF o enlace) y versión. Es la fuente de verdad de la marca (precedencia 2).

Fuente: [REGLAS-DISENO.md · Contrato de marca (MAR)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contrato-de-marca-mar)

### MAR-02 {#mar-02}

**Logos.** En `marcas/<marca>/logos/`, en SVG vectorial sin modificar:
- versión principal para fondo claro;
- versión para fondo oscuro (negativo);
- versión a una tinta;
- versión compacta o cuadrada (ícono de app, cargas, portadas).

Fuente: [REGLAS-DISENO.md · Contrato de marca (MAR)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contrato-de-marca-mar)

### MAR-03 {#mar-03}

**Colores obligatorios.** en `marcas/<marca>/tokens.json`, tema claro y oscuro:
| Token | Rol | Requisito |
| --- | --- | --- |
| `brand` | Color de identidad: acentos, menú activo, bloques | Si su contraste con `surface` es < 3:1, solo como relleno |
| `brand-soft` | Fondo suave de marca | `ink` ≥ 4,5:1 encima |
| `on-brand` | Texto sobre `brand` y rellenos de producto | ≥ 4,5:1 sobre `brand` en ambos temas |
| `primary` | Acciones: botón principal, enlaces, foco | ≥ 4,5:1 sobre `surface` y `surface-raised` |
| `primary-soft`, `on-primary`, `focus` | Complementos de acción | `on-primary` ≥ 4,5:1 sobre `primary` |

Fuente: [REGLAS-DISENO.md · Contrato de marca (MAR)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contrato-de-marca-mar)

### MAR-04 {#mar-04}

**Productos o contextos.** (si la app los tiene). Lista `products` en `tokens.json`; cada uno con `key`, `name` y cuatro colores: `line` (texto y líneas, ≥ 4,5:1 sobre `surface`), `fill` (relleno, con `on-brand` ≥ 4,5:1), `soft` (fondo de etiqueta) y `band` (banda translúcida). Los productos deben distinguirse entre sí también por claridad, no solo por tono.

Fuente: [REGLAS-DISENO.md · Contrato de marca (MAR)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contrato-de-marca-mar)

### MAR-05 {#mar-05}

**Tipografía.** Familia principal (`font-sans`) y monoespaciada (`font-mono`), con licencia que permita su uso web, y los pesos disponibles. La escala de tamaños es de la base; la marca solo puede ajustar pesos.

Fuente: [REGLAS-DISENO.md · Contrato de marca (MAR)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contrato-de-marca-mar)

### MAR-06 {#mar-06}

**Librería de íconos.** Origen, licencia o autorización, variante a usar en interfaz, proceso para buscar y agregar íconos, y la tabla de asignación concepto → ícono (inicio, alertas, descargar, buscar, filtrar, usuario y cada producto).

Fuente: [REGLAS-DISENO.md · Contrato de marca (MAR)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contrato-de-marca-mar)

### MAR-07 {#mar-07}

**Paleta de series.** (`chart.series`): 6 colores para comparar versiones en gráficos, el primero el de identidad, todos ≥ 3:1 sobre `surface-raised` del tema oscuro y claro donde se usen.

Fuente: [REGLAS-DISENO.md · Contrato de marca (MAR)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contrato-de-marca-mar)

### MAR-08 {#mar-08}

**Requisitos legales y de canal.** Barras, pies de página, avisos o sellos obligatorios (por ejemplo GOV.CO para entidades públicas colombianas), con medidas y enlaces.

Fuente: [REGLAS-DISENO.md · Contrato de marca (MAR)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contrato-de-marca-mar)

### MAR-09 {#mar-09}

**Tono y vocabulario.** Nombre oficial de la entidad, abreviaturas permitidas, términos propios (por ejemplo "Revisión jul-2026").

Fuente: [REGLAS-DISENO.md · Contrato de marca (MAR)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#contrato-de-marca-mar)

## REV · Revisión de diseño (REV) {#rev}

### REV-01 · DEBE {#rev-01}

Ningún desarrollo de vista empieza sin un diseño aprobado por el líder del equipo (o quien delegue), registrado en la ficha de la feature con enlace y fecha (FLU-03).

Fuente: [REGLAS-DISENO.md · Revisión de diseño (REV)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#revisión-de-diseño-rev)

### REV-02 · DEBE {#rev-02}

La herramienta de diseño es libre (Claude, Figma, Cursor, Codex, Gemini, HTML). Lo obligatorio es: enlace o captura del diseño, y que pase esta lista.

Fuente: [REGLAS-DISENO.md · Revisión de diseño (REV)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#revisión-de-diseño-rev)

### REV-03 · DEBE {#rev-03}

Toda vista construida pasa esta lista antes del PR; el resultado va en la descripción del PR.

Fuente: [REGLAS-DISENO.md · Revisión de diseño (REV)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-DISENO.md#revisión-de-diseño-rev)

## FLU · Flujo de trabajo (FLU) {#flu}

### FLU-01 · DEBE {#flu-01}

Todo trabajo nace de un **issue** en GitHub con la plantilla correspondiente (Feature, Fix, Hotfix, Documentación, Nueva tecnología). La ficha de una feature incluye en 5 líneas: pregunta que responde, público, zona, datos y fuente, acción que habilita; más ubicación en el menú y criterios de aceptación.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-02 · DEBE {#flu-02}

Tipos de trabajo y su prefijo de rama: `feature/`, `fix/`, `hotfix/`, `docs/`, `chore/`, `release/`.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-03 · DEBE {#flu-03}

**Diseño antes que código.** Ninguna vista nueva o cambio visual se desarrolla sin un diseño aprobado. La herramienta es libre (Claude, Figma, Cursor, Codex, Gemini, HTML); en la ficha se pega el enlace o la captura, la fecha y quién aprobó. El diseño pasa la revisión de diseño. Aprueba el líder del equipo, o quien él delegue o la Subdirectora.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-04 · DEBE {#flu-04}

Ramas (Git flow simplificado):
- `main`: lo que está en producción. Solo recibe `release/*` y `hotfix/*`.
- `develop`: integración. Recibe `feature/*`, `fix/*`, `docs/*`, `chore/*`.
- `feature/<issue>-<descripcion-corta>` sale de `develop` y vuelve a `develop` por PR.
- `release/vX.Y.Z` sale de `develop`, se estabiliza y se une a `main` (con etiqueta) y de vuelta a `develop`.
- `hotfix/vX.Y.Z-<descripcion>` sale de `main`, se une a `main` (con etiqueta) y a `develop`.
- `main` y `develop` no reciben push directo; todo por PR con CI en verde. *Con GitHub Free, la protección de ramas solo existe en repositorios públicos: en los privados esta regla se cumple por disciplina del equipo y la revisión automática (P-17).*

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-05 · DEBE {#flu-05}

Todo cambio entra por **Pull Request** con la plantilla del proyecto (enlace al issue, diseño aprobado, reglas aplicadas, lista de verificación, capturas). *Aprobación por una segunda persona: pendiente (P-06); por ahora el autor puede unir con CI en verde.*

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-06 · DEBE {#flu-06}

Idioma: código, nombres técnicos y commits en **inglés**; documentación e interfaz en **español**. Commits con Conventional Commits.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-07 · DEBE {#flu-07}

**Definición de hecho** de una feature: código + pruebas + revisión de diseño + página del inventario actualizada (con capturas) + documentación técnica si toca una herramienta o arquitectura + entrada en CHANGELOG + entrada en el diario. Sin esto, el PR no se une.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-08 · DEBE {#flu-08}

Versionado: ver Versionado.

Una publicación **enlaza los otros tres**: "Revisión jul-2026 = modelo EE-LP 3.2.0 + datos con corte 2026-06-30 + ejecutada con app v1.4.2". Con eso siempre se puede reconstruir.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU); REGLAS-FLUJO.md · Versionado: los cuatro relojes](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-09 · DEBE {#flu-09}

Cada proyecto lleva una **copia** de las reglas en `reglas/` (los cuatro archivos de reglas y `VERSION`) y de los recursos de su marca (`dist/<marca>/`) en `frontend/src/estandares/`. Las reglas **se editan solo en `upme-estandares`**, nunca en la copia. Para actualizar: copiar `reglas/` y `dist/<marca>/` de la versión elegida, revisar qué cambió (CHANGELOG del estándar) y qué código deja de cumplir, y registrarlo en el CHANGELOG del proyecto (`chore: update standards to vX.Y.Z`).

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-10 · DEBE {#flu-10}

CHANGELOG obligatorio: la CI rechaza un PR a `develop` o `main` que no modifique `CHANGELOG.md` (salvo etiqueta `sin-changelog` justificada, por ejemplo cambios solo de CI).

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-11 · DEBE {#flu-11}

Diario de cambios: ver Documentación.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-12 · DEBE {#flu-12}

Inventario de vistas y features con capturas: ver Documentación.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-13 · DEBE {#flu-13}

Fichas técnicas locales de cada herramienta usada: ver Documentación.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-14 · DEBE {#flu-14}

Notificaciones (correo, Google Chat): cada evento se registra en el inventario con evento, destino y responsable antes de implementarse.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-15 · DEBE {#flu-15}

Nueva tecnología: proceso TEC-05 de `REGLAS-TECNICAS.md`.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-16 · DEBE {#flu-16}

Revisión automática de documentación: ver Revisión automática.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

### FLU-17 · DEBE {#flu-17}

Contexto para asistentes de IA: ver Asistentes de IA.

Fuente: [REGLAS-FLUJO.md · Flujo de trabajo (FLU)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#flujo-de-trabajo-flu)

## DOC · Estándar de documentación {#doc}

### DOC-01 · DEBE {#doc-01}

Cada vista o feature tiene una página en `docs/usuario/inventario/` con este encabezado (front matter) y secciones:
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

Fuente: [REGLAS-FLUJO.md · Estándar de documentación](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#estándar-de-documentación)

### DOC-02 · DEBE {#doc-02}

`docs/usuario/inventario/index.md` es una tabla de todas las vistas (generada por `scripts/inventario.py` a partir del front matter). La CI falla si una ruta del frontend no tiene página en el inventario.

Fuente: [REGLAS-FLUJO.md · Estándar de documentación](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#estándar-de-documentación)

### DOC-03 · DEBE {#doc-03}

Las capturas se generan con Playwright (`pnpm screenshots`) con datos de ejemplo marcados como ilustrativos, en cada `release/`. No se pegan capturas manuales salvo que la vista no pueda automatizarse.

Fuente: [REGLAS-FLUJO.md · Estándar de documentación](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#estándar-de-documentación)

### DOC-04 · DEBE {#doc-04}

`CHANGELOG.md` en formato [Keep a Changelog](https://keepachangelog.com/es-ES/), en español, con sección `## [Sin publicar]` y secciones `Agregado`, `Cambiado`, `Corregido`, `Eliminado`, `Seguridad`, `Obsoleto`. Cada línea menciona la vista o feature y el PR. Al publicar, `[Sin publicar]` pasa a `## [X.Y.Z] - AAAA-MM-DD`.

Fuente: [REGLAS-FLUJO.md · Estándar de documentación](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#estándar-de-documentación)

### DOC-05 · DEBE {#doc-05}

Cada PR unido a `develop` agrega una entrada en `docs/diario/AAAA/AAAA-MM-DD-<slug>.md`:
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

Fuente: [REGLAS-FLUJO.md · Estándar de documentación](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#estándar-de-documentación)

### DOC-06 · DEBE {#doc-06}

Los **reportes periódicos** (semana, mes, rango) se generan desde el diario con `scripts/reporte.py --desde AAAA-MM-DD --hasta AAAA-MM-DD`, o pidiéndolo a un asistente con la plantilla de abajo. Estructura fija: resumen en 3 líneas · vistas agregadas · vistas modificadas · vistas eliminadas · correcciones · cambios técnicos · pendientes que avanzaron · próximos pasos.

Fuente: [REGLAS-FLUJO.md · Estándar de documentación](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#estándar-de-documentación)

### DOC-07 · DEBE {#doc-07}

Toda herramienta usada en el proyecto tiene ficha local en `docs/tecnica/herramientas/` con: cómo encaja aquí, dónde está, configuración, comandos, casos del proyecto (por ejemplo, qué flujos de Prefect existen) y reglas propias, enlazando a la ficha general de `upme-estandares/herramientas/`.

Fuente: [REGLAS-FLUJO.md · Estándar de documentación](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#estándar-de-documentación)

### DOC-08 · DEBE {#doc-08}

Cambios de arquitectura, modelo de datos, API o flujos actualizan su página técnica en el mismo PR.

Fuente: [REGLAS-FLUJO.md · Estándar de documentación](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#estándar-de-documentación)

## IA · Asistentes de IA (Claude, Cursor, Codex, Gemini) {#ia}

### IA-01 · DEBE {#ia-01}

Cada proyecto tiene en la raíz un **`AGENTS.md`** con el contexto y las reglas (lo leen Codex, Cursor y otras herramientas). `CLAUDE.md` contiene solo `@AGENTS.md` (Claude Code importa el archivo; si hay un `CLAUDE.md` sin esa línea, Claude Code no lee `AGENTS.md`). `GEMINI.md` remite a `AGENTS.md`. Las reglas están dentro del propio proyecto (`reglas/`, FLU-09), así que cualquier herramienta las lee sin configuración adicional.

Fuente: [REGLAS-FLUJO.md · Asistentes de IA (Claude, Cursor, Codex, Gemini)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#asistentes-de-ia-claude-cursor-codex-gemini)

### IA-02 · DEBE {#ia-02}

`AGENTS.md` incluye: qué es el proyecto, versión del estándar, stack, mapa del repositorio, comandos, **cuándo leer cada archivo de `reglas/`** (diseño y marca antes de tocar interfaz; técnicas antes de agregar o cambiar tecnología; flujo siempre) y "si una regla no encaja: detente y pregunta; propone un ADR". `CLAUDE.md` importa `AGENTS.md` y `reglas/REGLAS-FLUJO.md`; los demás se leen cuando la tarea lo requiere, para no cargar todo en cada sesión.

Fuente: [REGLAS-FLUJO.md · Asistentes de IA (Claude, Cursor, Codex, Gemini)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#asistentes-de-ia-claude-cursor-codex-gemini)

### IA-03 · DEBE {#ia-03}

Cualquier trabajo hecho con IA cumple igual la revisión de diseño (REV), la definición de hecho (FLU-07) y la documentación (DOC). La herramienta usada no cambia los requisitos.

Fuente: [REGLAS-FLUJO.md · Asistentes de IA (Claude, Cursor, Codex, Gemini)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#asistentes-de-ia-claude-cursor-codex-gemini)

### IA-04 · DEBERÍA {#ia-04}

Para diseñar o revisar con una IA (chat, Proyecto de Claude, skill), darle como contexto: `REGLAS-DISENO.md`, `MARCA-UPME.md` (o la marca que aplique), la ficha de la feature y, si existe, una vista similar ya aprobada o capturas de la app a revisar.

Fuente: [REGLAS-FLUJO.md · Asistentes de IA (Claude, Cursor, Codex, Gemini)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#asistentes-de-ia-claude-cursor-codex-gemini)

### IA-05 · DEBE {#ia-05}

Los asistentes no introducen, cambian ni retiran librerías o tecnologías sin seguir TEC-05. Si la necesidad aparece trabajando en un proyecto, se detienen y entregan el prompt de TEC-10 para ejecutarlo en Claude Code abierto en `upme-estandares`; las librerías pequeñas de soporte solo requieren TEC-06.

Fuente: [REGLAS-FLUJO.md · Asistentes de IA (Claude, Cursor, Codex, Gemini)](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-FLUJO.md#asistentes-de-ia-claude-cursor-codex-gemini)

## TEC · Estándar técnico {#tec}

### TEC-01 · DEBE {#tec-01}

Todo proyecto usa las tecnologías en estado **Estándar** o **Provisional** del registro de tecnologías para cada capa. Usar otra cosa requiere el proceso de nueva tecnología.

Fuente: [REGLAS-TECNICAS.md · Estándar técnico](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#estándar-técnico)

### TEC-02 · DEBE {#tec-02}

Toda tecnología usada en un proyecto tiene su **ficha de herramienta** (plantilla en `herramientas/_plantilla.md`): en este repositorio la ficha general y, en el proyecto, la ficha de cómo se usa ahí. Sin ficha no se une el PR que la introduce.

Fuente: [REGLAS-TECNICAS.md · Estándar técnico](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#estándar-técnico)

### TEC-03 · DEBE {#tec-03}

Un proyecto nuevo arranca copiando `reglas/` de este repositorio (FLU-09) y siguiendo la arquitectura de referencia. Para no reescribir lo común (módulo de autenticación, CI, plantillas de PR, estructura de `docs/`), se toma como **proyecto de referencia** el más reciente que cumpla el estándar (hoy, `proyecciones-demanda`). La versión del estándar que sigue queda en `reglas/VERSION`.

Fuente: [REGLAS-TECNICAS.md · Estándar técnico](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#estándar-técnico)

### TEC-04 · DEBE {#tec-04}

Las versiones mayores de lenguajes y frameworks se fijan aquí (tabla de stack) y se actualizan para todos los proyectos a la vez, con ADR.

Fuente: [REGLAS-TECNICAS.md · Estándar técnico](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#estándar-técnico)

### TEC-05 · DEBE {#tec-05}

Pasos:
1. **Abrir un issue** en `upme-estandares` con la plantilla "Nueva tecnología": necesidad, proyecto que la requiere, alternativas consideradas (incluida "usar lo que ya tenemos").
2. **Escribir el ADR** (`decisiones/NNNN-*.md`) con estado propuesto (Provisional, En evaluación o Planeada) y condiciones.
3. **Escribir la ficha de herramienta** en `herramientas/<nombre>.md` con la plantilla, completa.
4. **Actualizar** este archivo (Stack por capa y Condiciones de entrada), `reglas/VERSION` y el CHANGELOG (versión MENOR; MAYOR si reemplaza un estándar).
5. **Aprobación** del líder del equipo (o de quien delegue o de la Subdirectora, según el alcance).
6. **En cada proyecto que la use**: copiar las reglas actualizadas (FLU-09) y hacer el cambio en una rama propia, con su entrada en el CHANGELOG del proyecto.
7. **Ficha local**: agregar la ficha "cómo se usa aquí" en `docs/tecnica/herramientas/` del proyecto (FLU-13).

Fuente: [REGLAS-TECNICAS.md · Proceso para agregar una tecnología](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#proceso-para-agregar-una-tecnología)

### TEC-10 · DEBE {#tec-10}

**Cuando la necesidad aparece trabajando en un proyecto.** El asistente de IA que trabaja en el proyecto **no instala ni cambia la tecnología**. Se detiene, explica la necesidad y entrega a la persona un prompt listo para pegar en una sesión de Claude Code **abierta en `upme-estandares`**, que hace los pasos 2 a 4 de TEC-05. Cuando el cambio queda unido en `upme-estandares`, se vuelve al proyecto, se copian las reglas (FLU-09) y se hacen los pasos 6 y 7. El prompt sigue esta plantilla:
```
Trabajo en el proyecto <proyecto> y necesito <agregar | cambiar | retirar> <tecnología>
(<en lugar de <tecnología actual>>) para <necesidad concreta>.
Contexto: <qué se intentó, por qué lo actual no alcanza, volumen o restricciones>.
Alternativas consideradas: <incluida "usar lo que ya tenemos">.
Sigue TEC-05 de reglas/REGLAS-TECNICAS.md en una rama chore/tec-<nombre>:
1. Evalúa licencia, mantenimiento, comunidad, encaje con el stack y alternativas; si no
   conviene, dímelo y no sigas.
2. Escribe el ADR en decisiones/ con estado propuesto (Provisional o En evaluación).
3. Escribe la ficha completa en herramientas/<nombre>.md con herramientas/_plantilla.md.
4. Actualiza Stack por capa (y Condiciones de entrada si aplica) en reglas/REGLAS-TECNICAS.md,
   reglas/VERSION, README.md y CHANGELOG.md con la versión que corresponda.
Muéstrame el resumen y la versión nueva antes de hacer commit.
```

Fuente: [REGLAS-TECNICAS.md · Proceso para agregar una tecnología](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#proceso-para-agregar-una-tecnología)

### TEC-06 · DEBE {#tec-06}

Una librería pequeña de soporte (por ejemplo, una utilidad de fechas) no requiere ADR, pero sí una línea en la ficha de la herramienta principal o en `docs/tecnica/dependencias.md` del proyecto con su propósito.

Fuente: [REGLAS-TECNICAS.md · Proceso para agregar una tecnología](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#proceso-para-agregar-una-tecnología)

### TEC-07 · DEBE {#tec-07}

Monorepositorio por proyecto: `backend/`, `frontend/`, `pipelines/`, `docs/`, `infra/` en un solo repositorio, para que código, documentación y changelog cambien juntos.

Fuente: [REGLAS-TECNICAS.md · Arquitectura de referencia](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#arquitectura-de-referencia)

### TEC-08 · DEBE {#tec-08}

API versionada (`/api/v1`), con contrato OpenAPI generado y tipos TypeScript generados desde él (`pnpm gen:api`).

Fuente: [REGLAS-TECNICAS.md · Arquitectura de referencia](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#arquitectura-de-referencia)

### TEC-09 · DEBE {#tec-09}

Configuración por variables de entorno (`.env`, nunca versionado; `.env.example` sí). Secretos en GitHub Secrets o en el gestor que defina TI.

Fuente: [REGLAS-TECNICAS.md · Arquitectura de referencia](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#arquitectura-de-referencia)

## BD · Bases de datos {#bd}

### BD-01 · DEBE {#bd-01}

Una base PostgreSQL **por producto** (Proyecciones, BECO, PEN, Incentivos…). Ahí van supuestos, resultados, simulaciones, iteraciones y datos intermedios o finales del producto.

Fuente: [REGLAS-TECNICAS.md · Bases de datos](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#bases-de-datos)

### BD-02 · DEBE {#bd-02}

Los **datos primarios** comunes a varias subdirecciones (población, PIB, otros registros) vivirán en la base de datos primarios de la entidad (en construcción). Los productos los leen en **modo solo lectura** y nunca los copian como fuente propia: si necesitan una copia por rendimiento, va en `staging` con la fecha de extracción. Mientras esa base no exista, se cargan en `raw` del producto con su fuente (pendiente P-11).

Fuente: [REGLAS-TECNICAS.md · Bases de datos](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#bases-de-datos)

### BD-03 · DEBE {#bd-03}

Esquemas en cada base:
| Esquema | Contiene |
| --- | --- |
| `raw` | Datos tal como llegan de la fuente, con `fuente`, `fecha_carga`, `archivo_origen` |
| `staging` | Datos validados y normalizados |
| `core` | Entidades del producto (revisiones, escenarios, series, modelos) |
| `publicacion` | Vistas o tablas que alimentan portal y modo pantalla (solo lo publicable) |
| `auth` | Usuarios, roles y sesiones del módulo de autenticación |

Fuente: [REGLAS-TECNICAS.md · Bases de datos](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#bases-de-datos)

### BD-04 · DEBE {#bd-04}

Toda modificación de esquema se hace con una migración de Alembic versionada, nunca a mano.

Fuente: [REGLAS-TECNICAS.md · Bases de datos](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#bases-de-datos)

### BD-05 · DEBE {#bd-05}

Nombres en inglés y `snake_case` para tablas y columnas; comentarios (`COMMENT ON`) en español describiendo cada tabla y columna.

Fuente: [REGLAS-TECNICAS.md · Bases de datos](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#bases-de-datos)

### BD-06 · DEBE {#bd-06}

Toda tabla de `core` y `publicacion` registra procedencia: `source`, `cutoff_date`, `version` (o la llave de la revisión) y `created_at`.

Fuente: [REGLAS-TECNICAS.md · Bases de datos](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#bases-de-datos)

### BD-07 · DEBE {#bd-07}

Respaldos diarios y prueba de restauración trimestral (responsable por definir con TI, P-01).

Fuente: [REGLAS-TECNICAS.md · Bases de datos](https://github.com/UPME-SubDemanda/proyecciones-demanda/blob/develop/reglas/REGLAS-TECNICAS.md#bases-de-datos)

## PBD · Base de datos (PBD) {#pbd}

### PBD-01 · DEBE {#pbd-01}

Todo esquema, tabla, vista y columna de la base lleva un comentario en español (`COMMENT ON`) que dice qué es y para qué sirve. El comentario se escribe en la migración de Alembic que crea el objeto. Los nombres van en inglés y `snake_case` en todos los esquemas, incluido `raw` (BD-05).

Fuente: [reglas-proyecto.md · Base de datos (PBD)](reglas-proyecto.md#base-de-datos-pbd)

### PBD-02 · DEBE {#pbd-02}

Todo esquema y toda tabla o vista tiene su documentación en la sección [Base de datos](base-de-datos/index.md) de esta guía, con para qué existe, contexto, cómo se usa y ejemplos puntuales, en el mismo PR que lo crea o lo cambia (DOC-08).

Fuente: [reglas-proyecto.md · Base de datos (PBD)](reglas-proyecto.md#base-de-datos-pbd)

### PBD-03 · DEBE {#pbd-03}

El diccionario de tablas y columnas se genera desde los comentarios de la base, no se escribe a mano. La CI falla si falta un comentario, con un mensaje que nombra el objeto y cómo corregirlo. Ejemplo: «Falta el comentario de la columna `core.revision_values.value`. Agrégalo con `comment=` en la migración». Igual para esquemas, tablas y vistas.

Fuente: [reglas-proyecto.md · Base de datos (PBD)](reglas-proyecto.md#base-de-datos-pbd)

### PBD-04 · DEBE {#pbd-04}

La CI aplica las migraciones en una base PostgreSQL de prueba de la misma versión del proyecto, las revierte y, sobre esa base, verifica los comentarios (PBD-03) y que el diccionario esté al día. Ningún cambio de esquema entra sin pasar por ahí. Las pruebas del backend con SQLite no reemplazan esta verificación.

Fuente: [reglas-proyecto.md · Base de datos (PBD)](reglas-proyecto.md#base-de-datos-pbd)

### PBD-05 · DEBE {#pbd-05}

Los datos de fuentes externas nunca se sobrescriben:
- cada extracción queda registrada, y los valores se guardan solo si son nuevos o cambiaron frente a la última versión;
- cada valor guarda su `version` (1, 2, 3… por periodo, sin repetirse) y su fecha de carga (`loaded_at`), y la versión propia de la fuente si la trae;
- el valor vigente es la versión máxima aceptada de cada periodo, y el valor a una fecha es la versión máxima aceptada cargada hasta esa fecha;
- todo cambio detectado queda registrado con su fecha y sus valores anterior y nuevo.

Fuente: [reglas-proyecto.md · Base de datos (PBD)](reglas-proyecto.md#base-de-datos-pbd)

### PBD-06 · DEBE {#pbd-06}

Lo oficial nunca comparte tablas con lo experimental. Las salidas de modelos candidatos, sus pruebas y sus métricas (fase 2) viven en un esquema propio o en las herramientas de MLOps (MLflow, DVC). Solo una revisión aprobada y publicada entra a `core.revisions` y `core.revision_values`.

Fuente: [reglas-proyecto.md · Base de datos (PBD)](reglas-proyecto.md#base-de-datos-pbd)

### PBD-07 · DEBE {#pbd-07}

Además de los cinco esquemas de BD-03, la base tiene el esquema `operacion` para lo que describe cómo funciona el sistema: bitácora de cargas, mensajes de carga, extracciones, estado de las fuentes, notificaciones y auditoría. No guarda datos del producto ni depende de una fuente, así que sigue igual si cambia el origen de los datos (P-0004).

Fuente: [reglas-proyecto.md · Base de datos (PBD)](reglas-proyecto.md#base-de-datos-pbd)

### PBD-08 · DEBE {#pbd-08}

Lo que no cambia en una revisión publicada son sus **cifras**: valores, componentes, intervalos, escenarios y supuestos (P-0003, PRI-06). Una cifra equivocada se corrige con una revisión nueva (`2026-11.1`, X-09). Los **metadatos** de la revisión sí se pueden completar o corregir en la misma fila: enlace del informe, fecha de publicación, modelo, nombre y notas. Cada cambio deja registro: qué campo, valor anterior y nuevo, quién, cuándo y por qué. El registro va en la bitácora (`operacion`, PDA-05). Ejemplo: cuando se tenga el enlace del informe de la revisión 2026-07, se reemplaza `https://www.upme.gov.co` por el enlace exacto, sin crear una revisión nueva.

Fuente: [reglas-proyecto.md · Base de datos (PBD)](reglas-proyecto.md#base-de-datos-pbd)

## PDA · Datos y cargas (PDA) {#pda}

### PDA-01 · DEBE {#pda-01}

La arquitectura está desacoplada del origen de los datos:
- cada fuente externa tiene su lector y sus tablas `raw`;
- la transformación a `staging` entrega una forma fija por tipo de dato (el contrato);
- `core`, la API y las vistas nunca leen `raw` ni dependen de una fuente.

Fuente: [reglas-proyecto.md · Datos y cargas (PDA)](reglas-proyecto.md#datos-y-cargas-pda)

### PDA-02 · DEBE {#pda-02}

Toda carga aplica las reglas de detección de datos anómalos que documenta la ficha de la fuente. Un dato anómalo queda marcado, se reporta y no se usa en cálculos ni vistas. Solo una persona con el rol autorizado puede aceptarlo o rechazarlo, y queda registrado quién, cuándo y por qué. Si la fuente entrega después una versión que pasa las reglas, la anomalía se cierra y queda anotado.

Fuente: [reglas-proyecto.md · Datos y cargas (PDA)](reglas-proyecto.md#datos-y-cargas-pda)

### PDA-03 · DEBE {#pda-03}

La carga incremental de cada fuente se complementa con una carga completa periódica del histórico (conciliación). Toda diferencia se versiona (PBD-05) y se registra como cambio; lo que no cambió no se vuelve a guardar.

Fuente: [reglas-proyecto.md · Datos y cargas (PDA)](reglas-proyecto.md#datos-y-cargas-pda)

### PDA-04 · DEBE {#pda-04}

Si cambia o queda anómalo un dato que ya usó una revisión publicada o un modelo, se registra un aviso para el modelador o analista responsable, que decide qué hacer.

Fuente: [reglas-proyecto.md · Datos y cargas (PDA)](reglas-proyecto.md#datos-y-cargas-pda)

### PDA-05 · DEBE {#pda-05}

Toda ejecución de un flujo de carga deja una fila en la bitácora (`operacion.load_runs`), aunque no encuentre nada, con:
- rango consultado;
- periodos nuevos, cambiados y sin cambio;
- datos anómalos nuevos y errores;
- un mensaje legible.

Fuente: [reglas-proyecto.md · Datos y cargas (PDA)](reglas-proyecto.md#datos-y-cargas-pda)

### PDA-06 · DEBE {#pda-06}

Toda carga de un archivo publicado (por ejemplo, un anexo de una revisión) ubica los datos por los textos de los encabezados, no por posiciones fijas, y verifica las identidades internas del archivo antes de aceptarlo: sumas de componentes, total anual igual a la suma de los meses y límites del intervalo alrededor del valor medio. Si algo no cuadra, la carga falla con un mensaje que dice qué hoja, qué serie y qué periodo, y queda en la bitácora (PDA-05).

Fuente: [reglas-proyecto.md · Datos y cargas (PDA)](reglas-proyecto.md#datos-y-cargas-pda)

### PDA-07 · DEBE {#pda-07}

Cuando una fuente cambia de convención entre publicaciones (signo, nombres, unidades), todo el histórico se normaliza a la convención más reciente al cargarlo; no se guardan valores con convenciones distintas. La regla de normalización de cada versión queda en la ficha de la fuente y en su lector. Ejemplo: la generación distribuida (GD) se guarda siempre positiva y la resta la aplica `core.series_composition`.

Fuente: [reglas-proyecto.md · Datos y cargas (PDA)](reglas-proyecto.md#datos-y-cargas-pda)

## PFU · Fuentes de datos (PFU) {#pfu}

### PFU-01 · DEBE {#pfu-01}

Toda fuente externa tiene su ficha en el apartado [Fuentes de datos](base-de-datos/fuentes/index.md) antes de su primera carga, con la [plantilla de ficha](base-de-datos/fuentes/plantilla-ficha.md).

Fuente: [reglas-proyecto.md · Fuentes de datos (PFU)](reglas-proyecto.md#fuentes-de-datos-pfu)

### PFU-02 · DEBE {#pfu-02}

Toda entidad que entrega datos al proyecto tiene una guía de sus fuentes al nivel de la [guía de XM](base-de-datos/fuentes/xm/guia-api-xm.md): mapa de fuentes, endpoints, cómo descubrir una variable, definiciones, trampas, ejemplos y arquitectura recomendada. La guía se construye a medida que se analiza la fuente. `AGENTS.md` dice qué documento leer antes de trabajar con cada fuente.

Fuente: [reglas-proyecto.md · Fuentes de datos (PFU)](reglas-proyecto.md#fuentes-de-datos-pfu)

### PFU-03 · DEBE {#pfu-03}

Todo lo que se documente del modelo de una revisión, o de cualquier dato tomado de un informe publicado, cita el informe y la página donde se dice. Se usa la página impresa en el informe y, si el PDF numera distinto, también la del PDF. Aplica a la documentación de [Modelos](modelos/index.md) y a los metadatos de la base (`core.revisions.model`, `notes`). Lo que el informe no dice no se escribe como hecho: se anota como duda (X-23) o como dato por confirmar. Ejemplo: «el VEC lleva variables dummy de impulso o escalón (Rev. Julio 2026, p. 43, nota 38)».

Fuente: [reglas-proyecto.md · Fuentes de datos (PFU)](reglas-proyecto.md#fuentes-de-datos-pfu)

## PFL · Flujo de trabajo (PFL) {#pfl}

### PFL-01 · DEBE {#pfl-01}

Toda necesidad de aclarar o documentar que aparezca se vuelve regla de este documento y, a la vez, entra a un pendiente para llevarla a `upme-estandares`, con su contexto y un prompt listo para ejecutarlo completo. Siempre que una regla, script o paso de CI pueda servir a otros proyectos, entra a ese pendiente con todo lo necesario para copiarlo.

Fuente: [reglas-proyecto.md · Flujo de trabajo (PFL)](reglas-proyecto.md#flujo-de-trabajo-pfl)

### PFL-02 · DEBE {#pfl-02}

Al copiar una versión nueva de `reglas/` desde `upme-estandares` (FLU-09), el asistente o la persona que la copia:
1. revisa qué reglas de este documento ya están en el estándar y las reemplaza por la referencia a la regla del estándar;
2. verifica que ninguna regla de aquí contradiga una del estándar;
3. lo reporta en el PR de la actualización.

Fuente: [reglas-proyecto.md · Flujo de trabajo (PFL)](reglas-proyecto.md#flujo-de-trabajo-pfl)

## PER · Cálculo del error (PER) {#per}

### PER-01 · DEBE {#per-01}

Provisional hasta validarla con los datos cargados en este proyecto (T-26). El error de una revisión de energía eléctrica se calcula así:
- **Dato real:** `DemaSIN` de XM, agregada a meses completos.
- **Serie de comparación:** `SIN+GCE+ME+GD_UPME`.
- **Error:** proyectado − real, en GWh y en %. Un valor positivo significa que la UPME sobreestimó.
- **Meses parciales:** se descartan; no se escalan.
- **Horizonte:** se mide desde el primer mes proyectado de la revisión.
- **Las demás series:** solo muestran cuánto aporta cada componente (GCE, ME y GD); no se usan para medir el error.

Fuente: [reglas-proyecto.md · Cálculo del error (PER)](reglas-proyecto.md#calculo-del-error-per)

## T · Plan de trabajo {#t}

### T-01 · Hecho {#t-01}

Entorno local de desarrollo

Etapa: — · Depende de: — · Issue: #1 · PR: #3

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-02 · Hecho {#t-02}

Mockups aprobados (8 pantallas)

Etapa: — · Depende de: — · Issue: #2 · PR: #4

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-03 · Hecho {#t-03}

Guía del flujo de trabajo del equipo

Etapa: — · Depende de: — · Issue: #5 · PR: #6

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-04 · Hecho {#t-04}

Plan de trabajo y cambio de etapas (público pasa a 1.1)

Etapa: — · Depende de: — · Issue: #7 · PR: #10

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-20 · Hecho {#t-20}

Página de referencias: qué significa cada ID (reglas, pasos del plan, pendientes y decisiones), generada por script y buscable en MkDocs

Etapa: — · Depende de: T-04 · Issue: #9 · PR: #11

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-05 · Hecho {#t-05}

Estructura base del frontend: componentes base (tarjeta, indicador, contenedor de gráfico con el tema de ECharts, aviso «Cifras ilustrativas», selector de producto) y módulo de datos ilustrativos

Etapa: 1 y 1.1 · Depende de: T-04 · Issue: #8 · PR: #12

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-06 · Hecho {#t-06}

Portal público: inicio (escritorio y móvil)

Etapa: 1.1 · Depende de: T-05 · Issue: #13 · PR: #14

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-07 · Hecho {#t-07}

Modo pantalla: tableros de energía eléctrica, gas natural, comparar proyecciones y el sistema hoy, con acceso desde el portal

Etapa: 1.1 · Depende de: T-05 · Issue: #15 · PR: #16

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-21 · Bloqueado (X-06, sin mockup) {#t-21}

Modo pantalla: tablero de variables exógenas

Etapa: 1.1 · Depende de: T-07 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-08 · Hecho {#t-08}

App interna: encabezado, selector de producto y menú lateral (LAY-06, LAY-07), con acceso desde el portal

Etapa: 1 · Depende de: T-05 · Issue: #17 · PR: #18

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-09 · Hecho {#t-09}

Tablero ejecutivo

Etapa: 1 · Depende de: T-08 · Issue: #19 · PR: #20

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-10 · Hecho {#t-10}

Histórico de revisiones

Etapa: 1 · Depende de: T-08 · Issue: #21 · PR: #22

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-11 · Hecho {#t-11}

Monitor de variables exógenas

Etapa: 1 · Depende de: T-08 · Issue: #25 · PR: #26

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-12 · Bloqueado (X-06, sin mockup) {#t-12}

Proyección vs. real

Etapa: 1 · Depende de: T-08 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-13 · Bloqueado (X-06, sin mockup) {#t-13}

Comparar revisiones

Etapa: 1 · Depende de: T-08 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-14 · Bloqueado (X-06, sin mockup) {#t-14}

Usuarios y roles

Etapa: 1 · Depende de: T-08 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-15 · Hecho (insumos de EE y GN revisados; sigue X-02) {#t-15}

Reunir archivos de revisiones, series reales y exógenas, y decidir desde qué revisión cargar

Etapa: 1 · Depende de: — · Issue: #32 · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-16 · Reemplazado por T-22 y T-23 {#t-16}

Tablas `raw`/`staging` y ajustes al modelo de datos

Etapa: 1 · Depende de: T-15 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-17 · Reemplazado por T-27 a T-31 {#t-17}

Flujos de carga (Prefect)

Etapa: 1 · Depende de: T-16 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-18 · Reemplazado por T-33 y T-34 {#t-18}

Endpoints de la API y conexión de cada vista a datos reales; retirar las cifras ilustrativas

Etapa: 1 y 1.1 · Depende de: T-17 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-19 · Reemplazado por T-33 {#t-19}

Vistas `publicacion.*` para el portal y el modo pantalla

Etapa: 1.1 · Depende de: T-18 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-22 · Hecho {#t-22}

Documentar el modelo de datos v2, las reglas del proyecto (PBD, PDA, PFU, PFL, PER), la sección «Base de datos», las fuentes de XM y este plan

Etapa: 1 · Depende de: T-15 · Issue: #32 · PR: #33

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-23 · Hecho {#t-23}

Migración `0003` con el modelo v2 y todos los comentarios; script del diccionario con su verificación; base PostgreSQL de prueba en la CI (PBD-01 a PBD-04)

Etapa: 1 · Depende de: T-22 · Issue: #34 · PR: #35

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-24 · Hecho {#t-24}

Carga de prueba de las 5 revisiones de EE y de `DemaSIN`; las consultas que piden las vistas (abanico, comparar revisiones, error) y las vistas anchas de `core`

Etapa: 1 · Depende de: T-23 · Issue: #36 · PR: #37

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-25 · Bloqueado (X-02, X-23) {#t-25}

Revisiones anteriores a dic-2023 y versiones corregidas (la «v2» de jul-2024)

Etapa: 1 · Depende de: T-24 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-26 · Pendiente {#t-26}

Validar la variable real para el cálculo del error (hipótesis: `DemaSIN` frente a `SIN+GCE+ME+GD_UPME`, PER-01)

Etapa: 1 · Depende de: T-24 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-27 · Pendiente {#t-27}

Lector de anexos de la UPME (por encabezados, con verificación de sumas y normalización entre versiones) y flujo `load-published-revisions`

Etapa: 1 · Depende de: T-24 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-28 · En curso {#t-28}

Flujo de Prefect para la carga histórica de XM: las medidas que XM publica por día (`DemaSIN` y `DemaMaxPot`) desde 2010 (X-26)

Etapa: 1 · Depende de: T-23 · Issue: #38 · PR: #39

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-29 · Pendiente (X-24) {#t-29}

Carga diaria y conciliación semanal de XM, con cambios, anomalías y avisos (PDA-02 a PDA-04)

Etapa: 1 · Depende de: T-28 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-36 · Pendiente {#t-36}

Medidas horarias de XM: `DemaReal`, `DemaCome` y `ExpoEner`, que SINERGOX solo publica por hora (`/hourly`), en el flujo `ingest-observed-demand`, cargadas a demanda desde 2010 (su total diario y mensual sale de sumar las horas); migración que hace que `core.v_observed_wide` y `core.v_ee_revision_vs_real` usen lo diario cuando una medida tiene diario y horario en el mismo mes

Etapa: 1 · Depende de: T-28 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-30 · Pendiente {#t-30}

Bitácora y mensajes de carga, y cómo se consultan (PDA-05). Incluye cerrar como `failed` una carga que quedó `running` porque su ejecución se canceló o se cayó (pasó al cancelar una en T-28)

Etapa: 1 · Depende de: T-23 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-31 · Pendiente (servidores, en el estándar) {#t-31}

Tareas programadas de las cargas

Etapa: 1 · Depende de: T-29 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-32 · Pendiente (X-03, X-14, X-25) {#t-32}

Decisiones visuales: escenario medio e intervalos, serie y métricas de error que se muestran, umbrales, mockups de vistas nuevas (anomalías, bitácora, avisos)

Etapa: 1 · Depende de: T-24 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-33 · Pendiente (X-04, X-28) {#t-33}

Contrato de la API (pública e interna) y vistas `publicacion`

Etapa: 1 y 1.1 · Depende de: T-32 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-34 · Pendiente {#t-34}

Conectar las vistas de EE a la API y retirar las cifras ilustrativas de EE

Etapa: 1 y 1.1 · Depende de: T-33 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

### T-35 · Pendiente {#t-35}

Operación: cargas en un servidor, contraste con las cifras publicadas, inventario, capturas, CHANGELOG y diario

Etapa: 1 · Depende de: T-34 · Issue: — · PR: —

Fuente: [Plan de trabajo](../pendientes.md#plan-de-trabajo)

## X · Pendientes de decisión {#x}

### X-01 · Fuentes y formatos {#x-01}

Reunir archivos de revisiones pasadas, series reales y exógenas; definir tablas `raw`/`staging`. Hecho para EE (API de XM y 5 anexos de revisiones) y revisada la estructura de GN; las tablas están en el modelo v2 ([P-0004](../decisiones/0004-modelo-datos-v2.md)). Faltan las exógenas (DANE, IDEAM)

Responsable: Equipo · Estado: Parcial

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-02 · Histórico {#x-02}

Desde qué revisión cargar (EE y GN). Hay 5 revisiones de EE (dic-2023 a ago-2026); falta saber si hay anteriores con anexo (X-23, T-25)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-03 · Umbrales de error {#x-03}

Umbrales aceptables por producto y horizonte para alertas

Responsable: Subdirectora · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-04 · Publicación {#x-04}

Qué desagregaciones son públicas (regional, sectorial, horaria)

Responsable: Líder + jurídica · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-05 · Aprobación de revisiones {#x-05}

Quién aprueba formalmente y con qué acto administrativo. El mockup aprobado de ejecutar proyección asume doble aprobación (líder técnico y Subdirectora): confirmarlo o ajustar el mockup

Responsable: Subdirectora · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-06 · Aprobación de mockups {#x-06}

8 pantallas aprobadas el 2026-11-08 (`docs/tecnica/mockups/`). Faltan mockups de proyección vs. real, comparar revisiones, usuarios y roles, inicio de la app, ingresar, alertas y datos y documentación (FLU-03)

Responsable: Líder · Estado: Parcial

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-07 · Catálogo de notificaciones {#x-07}

Confirmar eventos y espacios de Google Chat para la etapa 1.2

Responsable: Líder · Estado: Planeado (1.2)

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-08 · Migración de modelos {#x-08}

Plan de migración de MATLAB a Python y modelos sin ruta definida

Responsable: Equipo de modelos · Estado: Planeado (fase 2)

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-09 · Corrección de revisiones {#x-09}

Agregar estado `superseded` y columna `supersedes_id` en `core.revisions` para enlazar una revisión corregida con la original (P-0003). Resuelto en el diseño del modelo v2 (P-0004); se crea en la migración `0003` (T-23). El mockup aprobado del histórico ya muestra «Crear corrección»: alinear el flujo con esta decisión

Responsable: Equipo · Estado: Hecho (migración `0003`, T-23)

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-10 · Vistas del menú sin inventario {#x-10}

Los mockups aprobados muestran en el menú **Alertas** y **Datos y documentación**, sin página en `docs/usuario/inventario/`; «Datos y documentación» tampoco está en el menú de `docs/tecnica/diseno-app.md`. Decidir si son vistas, crear su ficha (FLU-01) y su página (DOC-01)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-11 · Contenidos del portal {#x-11}

El mockup aprobado del portal tiene marcadores por completar: logo oficial desde el CDN de GOV.CO, dirección, teléfono y horario de atención, correo de notificaciones judiciales y redes sociales de la UPME. En el modo pantalla (tablero «El sistema hoy»): dirección pública del portal y su código QR

Responsable: Líder · Estado: Planeado (1.1)

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-12 · Documentación en Notion {#x-12}

Llevar la documentación y los pendientes a Notion. Las reglas (DOC, FLU-09) dicen que la documentación vive en el repositorio junto al código: decidir si Notion es un espejo de solo lectura o la fuente de algunos contenidos (pendientes, plan de trabajo); en el segundo caso, ADR en `upme-estandares`

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-13 · Componentes compartidos entre proyectos {#x-13}

Los componentes de React y su galería (`/dev/componentes`) viven solo en este proyecto; `upme-estandares` no entrega componentes. Evaluar cómo compartirlos (copia en `dist/`, paquete versionado o catálogo publicado) y proponer CMP-04. [Detalle](../pendientes/x-13-componentes-compartidos.md)

Responsable: Líder · Estado: Abierto (revisar al cerrar T-08)

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-14 · Datos del portal y del modo pantalla {#x-14}

Antes de conectar datos reales al portal y al modo pantalla (T-33, T-34): definir cómo se calcula el **acierto de las proyecciones** (hoy, ilustrativo: 100 % menos el error medio a 12 meses; ver X-03), qué año y escenario muestran las cifras principales, el **error medio de la revisión** (MAPE a 12 meses), el **crecimiento promedio** del horizonte, la **desviación mensual** real vs. proyectado (la proyección es anual: cómo se reparte por mes), la **demanda diaria** del tablero «El sistema hoy» (fuente y frecuencia de XM y del Gestor del Mercado de Gas, demanda máxima de potencia), el umbral que se muestra (X-03) y el texto de la licencia de los datos descargados (X-04)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-15 · Modo pantalla sin conexión {#x-15}

Hoy, si se pierde la conexión mientras corre, sigue mostrando los últimos datos (TV-07). Abrir `/pantalla` sin conexión desde cero requiere un service worker que guarde la aplicación: evaluar si se necesita en las pantallas de la UPME y cómo hacerlo sin tecnología nueva (TEC-05)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-16 · Acciones de los gráficos en el modo pantalla {#x-16}

GRA-08 pide en todo gráfico acciones (datos, imagen, tabla, pantalla completa). En el modo pantalla, como en el mockup aprobado, no se muestran: en un televisor nadie descarga datos. Sí hay tabla equivalente para lectores de pantalla (A11-04) y pantalla completa general. Decidir si se registra como excepción con un ADR del proyecto (y en `docs/tecnica/diseno-app.md`) o se propone en `upme-estandares` que GRA-08 no aplique al modo pantalla

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-17 · Íconos locales al estándar {#x-17}

El proyecto usa íconos que aún no están en `upme-estandares` (`frontend/src/iconos-locales/`): `fullScreen`, `chevron-lef` y `chevron-right`, tomados de la Librería de Iconos UPME, y `pause` y `play`, **creados en el proyecto** porque la librería no los tiene (excepción a UPME-ICO-01 aprobada por el líder, #15). Llevarlos al estándar con un PR a `upme-estandares` (MARCA-UPME, proceso para agregar un ícono) y pedir a Comunicaciones que revise `pause` y `play` o los reemplace por oficiales. [Detalle, insumos y prompt](../pendientes/x-17-iconos-al-estandar.md)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-18 · Revisión extraordinaria {#x-18}

El mockup del tablero ejecutivo tiene «Abrir revisión extraordinaria» y el plan completo dice que «una alerta grave puede abrir una revisión extraordinaria, que vuelve al paso 4» (experimentación). Falta definir: qué alertas la disparan (X-03), quién la abre, cómo se aprueba (X-05), cómo se nombra frente a las semestrales y en qué se diferencia de una corrección (X-09). Ejecutarla es fase 2; el botón queda fuera del tablero (T-09, #19)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-19 · Informe del tablero ejecutivo {#x-19}

«Descargar informe» está en el tablero ejecutivo, deshabilitado («En construcción»). Definir qué contiene (cifras, gráficos, alertas, periodo), formato (PDF, Excel), para quién es y si se genera en el navegador o en el servidor (posible tecnología nueva, TEC-05)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-20 · Ciclo de trabajo con asistentes en el estándar {#x-20}

El proyecto adoptó un ciclo para trabajar con asistentes de IA: el asistente redacta el issue con sus supuestos, la persona lo crea, el asistente desarrolla en la rama y entrega el texto del PR, y la persona revisa contra el mockup **antes** de abrir el PR (en `AGENTS.md` y en la guía del flujo de trabajo, #23). Proponerlo en `upme-estandares` como regla IA (las reglas no se editan aquí, FLU-09). [Detalle y prompt](../pendientes/x-20-ciclo-con-asistentes.md)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-21 · Llevar al estándar las prácticas del proyecto {#x-21}

README como puerta de entrada, mapa del repositorio verificado (`repo-map.toml`, `scripts/mapa.py`), páginas generadas con hook y CI, entorno de un comando (`dev-setup.sh`), usuario administrador local, guía del flujo, página por pendiente, verificación de MkDocs sin `-q` y capturas con sesión simulada: proponerlos en `upme-estandares`. Relacionado con X-13, X-17 y X-20. [Detalle, insumos y prompt](../pendientes/x-21-estandarizar-practicas.md)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-22 · Reglas del proyecto al estándar {#x-22}

Llevar a `upme-estandares` las reglas del proyecto que sirven a cualquier proyecto (comentarios y documentación de la base, CI con PostgreSQL, versionamiento y calidad de datos, bitácora, esquema `operacion`, fichas y guías de fuentes, protocolo regla local + pendiente, metadatos corregibles de lo publicado, citar la página del informe) y corregir BD-03 (columnas de `raw` en inglés). [Detalle, insumos y prompt](../pendientes/x-22-reglas-al-estandar.md)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-23 · Observaciones a los anexos de EE {#x-23}

Remitir al equipo de modelación las observaciones a los 5 anexos y al informe Rev. Julio 2026 (8 errores, 7 inconsistencias, 10 dudas y 7 sugerencias) y anotar sus respuestas. Entre ellas: las 5 áreas no suman la serie SIN; qué fue la «v2» de jul-2024; si hay revisiones anteriores a dic-2023; el salto de GD_PNUMA en 2039; el día exacto de publicación de cada revisión; equivalencias de nombres de GCE entre revisiones; si los primeros meses de cada hoja mensual son proyección. La carga de prueba (T-24) agregó E-8: la serie anual SIN+GCE+ME+GD_PNUMA no es la suma de sus partes en el primer año (el año mixto) de dic-2024, jul-2025 y 2026-07 (diferencias de 871, 877 y 2249 GWh; las mensuales sí cuadran). El enlace y el modelo de cada revisión pasaron a X-31 y X-32

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-24 · Calidad de los datos reales {#x-24}

Para las cargas de XM: reglas y umbrales para marcar un dato como anómalo (día incompleto, fuera de rango, salto frente a la versión anterior, incoherencia entre medidas); qué rol acepta o rechaza una anomalía y dónde (una vista nueva necesita diseño, FLU-03); cuántos días recarga la diaria y a qué hora; si la conciliación del domingo baja todo el histórico o un tramo; desde qué tamaño un cambio genera aviso y cómo llega mientras no haya Google Chat (PDA-02 a PDA-04). Además: `operacion.source_status` guarda un estado por fuente y no por variable, así que con `DemaMaxPot` (más de un mes de rezago) XM parece desactualizada aunque `DemaSIN` esté al día (visto en T-28); decidir si pasa a ser por variable

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-25 · Métricas de error que se muestran {#x-25}

La UPME publica APE, AAE y MSE (método de la IEA) por mes, valor e intervalo; el análisis previo usa MAPE y sesgo; los mockups muestran «MAPE a 12 meses». Decidir qué se calcula y se muestra, y si se cargan los errores que publica la UPME para contrastarlos. Relacionado con X-03 y X-14

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-26 · Alcance de la carga de XM {#x-26}

Qué medidas se cargan desde el inicio además de `DemaSIN` (propuesta: `DemaReal`, `DemaCome`, `ExpoEner`, `DemaMaxPot`), desde qué año, si el cliente es el REST con `httpx` (propuesto) o `pydataxm` (dependencia nueva, TEC-06), y si se usan las proyecciones UPME que publica XM (`EscDemUPME*`) para cruzar con las revisiones. **Decidido el 2026-11-10:** cliente REST con `httpx`; `DemaSIN` y `DemaMaxPot` diarias desde el 2010-01-01 (T-24 y T-28); `DemaReal`, `DemaCome` y `ExpoEner` solo existen por hora en SINERGOX y se cargan a demanda en T-36. Sigue abierto: si se usan las proyecciones `EscDemUPME*` de XM

Responsable: Líder · Estado: Abierto (en parte)

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-27 · Gas natural {#x-27}

Al trabajar GN: confirmar la unidad (el anexo no la dice; se asume GBTUD), qué hacer con el histórico que trae el anexo de la revisión y cuál es la fuente externa del dato real (Gestor del Mercado de Gas)

Responsable: Líder · Estado: Planeado

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-28 · API pública desde el inicio {#x-28}

La hoja de ruta (`docs/producto/index.md`) deja la API pública para la etapa 3. Diseñarla pública desde la fase 5 de datos pide definir separación pública e interna, solo datos publicables (`publicacion`, TV-06), licencia (X-04), contrato estable y si hace falta límite de consultas o caché (posible tecnología nueva, TEC-05). Si se decide, ADR del proyecto

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-29 · Base de datos común de la UPME {#x-29}

Habrá una base de datos común con los datos de otras entidades que usa toda la UPME (BD-02). Se tiene en cuenta en la arquitectura (PDA-01) pero no se documenta aún. Cuando exista: qué se sabe de ella, cómo se pasa cada fuente y qué hacer con el histórico cargado aquí si sus cifras difieren

Responsable: Líder · Estado: Planeado

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-30 · Responsables y archivos de origen {#x-30}

Quién mantiene cada carga y la da por buena; qué archivos de origen son confidenciales (define qué puede llegar al portal). Los archivos se guardan en la base (`raw.files`) hasta que TI defina un almacenamiento

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-31 · Enlace del informe de cada revisión {#x-31}

Las 5 revisiones de EE cargadas en T-24 apuntan a `https://www.upme.gov.co` porque falta el enlace exacto de cada informe (`document_url` en `pipelines/revisiones_ee.toml`). Los enlaces de los 5 **anexos** ya están (2026-11-10): `annex_url` y `annex_sha256` en `pipelines/revisiones_ee.toml`, comprobados contra los archivos cargados; T-27 los usa para cargar en el despliegue. Faltan los 5 enlaces de los **informes**, para corregirlos en la misma fila, sin crear revisiones nuevas, con registro del cambio (PBD-08). La primera corrección define cómo queda ese registro en `operacion` (hoy `load_runs.load_type` no tiene un tipo para correcciones: necesita migración)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-32 · Modelo de cada revisión {#x-32}

Solo 2026-07 tiene el modelo, tomado de su informe; las otras 4 revisiones de EE dicen «por confirmar». El líder entrega los informes de 2023-12, 2024-07, 2024-12 y 2025-07; de cada uno se toma el modelo (y, si lo dice, el día de publicación y el corte del dato real), se documenta en `docs/tecnica/modelos/ee.md` citando la página (PFU-03) y se corrige en la misma fila con registro (PBD-08). Igual que X-31

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

### X-33 · Conocer Prefect a fondo {#x-33}

El líder quiere conocer bien la herramienta antes de que las cargas corran solas (T-29, T-31). Revisar: conceptos (flujo, tarea, despliegue, ejecución, worker), la interfaz, horarios, reintentos, avisos, qué pasa si el worker o el servidor se caen, cómo se despliega en un servidor y alternativas, porque está en el stack como provisional. Punto de partida: la [ficha local de Prefect](../tecnica/herramientas/prefect.md)

Responsable: Líder · Estado: Abierto

Fuente: [Pendientes de decisión](../pendientes.md#pendientes-de-decision)

## P-0000 · Decisiones del proyecto (ADR) {#p-0000}

### P-0001 · Alcance de la etapa 1 sin modelos {#p-0001}

Estado: Aceptada

Fuente: [0001-alcance-etapa-1.md](../decisiones/0001-alcance-etapa-1.md)

### P-0002 · Modelo de datos de la etapa 1 {#p-0002}

Estado: Reemplazada por P-0004

Fuente: [0002-modelo-datos-etapa-1.md](../decisiones/0002-modelo-datos-etapa-1.md)

### P-0003 · Reglas de versionado del proyecto {#p-0003}

Estado: Aceptada

Fuente: [0003-reglas-versionado.md](../decisiones/0003-reglas-versionado.md)

### P-0004 · Modelo de datos v2 y esquema operacion {#p-0004}

Estado: Aceptada

Fuente: [0004-modelo-datos-v2.md](../decisiones/0004-modelo-datos-v2.md)

## Externos {#externos}

IDs citados en este repositorio que se definen en `upme-estandares` (por ejemplo, sus pendientes P-xx y sus ADR) o que no se encontraron en ninguna fuente. Si uno de estos debería existir aquí, es un error de la cita o de la fuente.

| ID | Contexto (primera cita) | Citado en |
| --- | --- | --- |
| ADR-0010 | …arte de una base de datos ya ordenada. DVC es obligatorio al iniciar la fase 2 (ADR-0010 del estándar). | `docs/decisiones/0001-alcance-etapa-1.md` |
| ADR-0015 | Almacenamiento de objetos  MinIO  —  Retirada (ADR-0015)  — | `reglas/REGLAS-TECNICAS.md` |
| ADR-0016 | Plantilla de proyectos  Copier  —  Retirada (ADR-0016): se usa un proyecto de referencia  copier | `reglas/REGLAS-TECNICAS.md` |
| CMP-04 | …cs/pendientes/) para evaluar componentes compartidos entre proyectos y proponer CMP-04 al estándar (issue #8, PR #12). | `CHANGELOG.md`, `docs/diario/2026/2026-11-08-estructura-base-frontend.md`, `docs/pendientes.md` y 2 más |
| IA-06 | 1. Una regla nueva en REGLAS-FLUJO.md, sección «Asistentes de IA». Se propone IA-06 (DEBERÍA), con el ciclo de seis pasos, los supuestos en el issue y la revisi… | `docs/pendientes/x-20-ciclo-con-asistentes.md`, `docs/pendientes/x-21-estandarizar-practicas.md` |
| P-01 | …os diarios y prueba de restauración trimestral (responsable por definir con TI, P-01). | `docs/tecnica/despliegue.md`, `reglas/REGLAS-TECNICAS.md` |
| P-02 | Identidad centralizada  Keycloak  —  En evaluación (piloto, P-02)  keycloak | `reglas/REGLAS-TECNICAS.md` |
| P-03 | Versionado de datos  DVC  —  Aplazada (P-03)  dvc | `reglas/REGLAS-TECNICAS.md` |
| P-04 | Orquestación de tareas  Prefect  3  Provisional (evaluar Dagster, P-04)  prefect | `reglas/REGLAS-TECNICAS.md` |
| P-05 | Notificaciones  Google Chat (webhooks)  —  Planeada (etapa 1.1, P-05)  google-chat | `docs/producto/index.md`, `reglas/REGLAS-TECNICAS.md` |
| P-06 | …ista de verificación, capturas). Aprobación por una segunda persona: pendiente (P-06); por ahora el autor puede unir con CI en verde. | `docs/diario/2026/2026-11-09-ciclo-con-asistentes.md`, `docs/pendientes/x-20-ciclo-con-asistentes.md`, `docs/tecnica/flujo-de-trabajo-equipo.md` y 1 más |
| P-07 | Estado: documentada, no programada todavía (pendiente P-07). | `reglas/REGLAS-FLUJO.md` |
| P-08 | Guía de usuario  Sí  mkdocs.usuario.yml (solo docs/usuario/)  Pendiente P-08. Con GitHub Free, GitHub Pages solo publica desde repositorios públicos. Opciones:… | `docs/tecnica/herramientas/mkdocs.md`, `reglas/REGLAS-FLUJO.md` |
| P-09 | …nica  No  mkdocs.tecnica.yml (técnica, diario, decisiones, producto)  Pendiente P-09. Mientras tanto se lee en GitHub (el Markdown se ve formateado) o con mkdoc… | `docs/tecnica/herramientas/mkdocs.md`, `reglas/REGLAS-FLUJO.md` |
| P-10 | Experimentos y modelos  MLflow  —  Planeada (fase 2, P-10)  mlflow | `reglas/REGLAS-TECNICAS.md` |
| P-11 | …tras esa base no exista, se cargan en raw del producto con su fuente (pendiente P-11). | `reglas/REGLAS-TECNICAS.md` |
| P-12 | Observabilidad  Grafana + Prometheus  —  Planeada (P-12)  grafana | `reglas/REGLAS-TECNICAS.md` |
| P-17 | …ivados esta regla se cumple por disciplina del equipo y la revisión automática (P-17). | `docs/tecnica/herramientas/github-actions.md`, `reglas/REGLAS-FLUJO.md` |
