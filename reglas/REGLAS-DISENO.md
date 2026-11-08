# Reglas de diseño

Cómo deben verse y comportarse todas las aplicaciones web de datos. Aplica a cualquier marca; la piel de cada marca está en su archivo de marca (para la UPME, `MARCA-UPME.md`).

Versión del estándar: ver `reglas/VERSION`. Historial: `CHANGELOG.md`.

## Estándar de diseño

El estándar de diseño está organizado en **capas**. Cada capa se apoya en la anterior y ninguna repite lo de otra:

| Capa | Qué contiene | Dónde | Cambia cuando… |
| --- | --- | --- | --- |
| **Base** | Reglas de diseño de cualquier aplicación web de datos: principios, tokens semánticos, layout, componentes, gráficos, patrones, contenido, accesibilidad, revisión de diseño | Este archivo · `tokens/base.json` | Se mejora la forma de diseñar apps en general |
| **Contrato de marca** | Lo que una marca **debe** entregar para conectarse a la base, y cómo se valida | Este archivo, sección Contrato de marca | Se necesita un nuevo tipo de elemento de marca |
| **Marca** | El contrato lleno para una marca concreta (hoy: UPME) | `reglas/MARCA-<MARCA>.md` · `marcas/<marca>/` | Cambia la identidad de la entidad |
| **Aplicación** | Lo propio de cada app: menú, vistas, productos que muestra, excepciones aprobadas | Repositorio de cada proyecto (`docs/tecnica/diseno-app.md`) | Cambia la app |

Para una aplicación **que no sea de la UPME**: se usa la misma base y se crea una nueva carpeta de marca que cumpla el contrato. Las reglas y componentes no cambian; cambia la piel.

### Identificadores y niveles

Cada regla tiene un identificador único con prefijo de su archivo (`GRA-03`, `MAR-05`, `UPME-COL-02`) y un nivel:

- **DEBE**: obligatoria. Un PR que la incumpla no se une.
- **DEBERÍA**: por defecto. Se puede romper con una razón escrita en el PR.
- **PUEDE**: opción permitida.

Se citan por su identificador en fichas, PR, commits y revisiones. Un identificador **nunca se reutiliza**: si una regla se retira, queda el texto "Retirada en vX, ver ADR-NNNN".

### Precedencia

Si dos fuentes se contradicen, gana la primera:

1. Normativa vigente (para la UPME: Resolución 1519 de 2020 de MinTIC, lineamientos GOV.CO, Ley 1712 de 2014, Ley 1581 de 2012, NTC 5854 / WCAG 2.1 AA).
2. Manual de identidad de la marca.
3. Decisiones aceptadas (ADR) de este repositorio.
4. Capa de marca.
5. Capa base.
6. Excepciones de la aplicación, aprobadas por ADR del proyecto.
7. Mockups. Si un mockup contradice el estándar, se corrige el mockup.

### Índice de la capa base

| Sección | Prefijo |
| --- | --- |
| Principios | PRI |
| Tokens | TOK |
| Layout y navegación | LAY |
| Componentes | CMP |
| Gráficos | GRA |
| Patrones de experiencia | UX |
| Modo pantalla | TV |
| Contenido y lenguaje | CON |
| Accesibilidad | A11 |
| Revisión de diseño | REV |

## Principios (PRI)

Cuando un caso no está cubierto por ninguna regla, se decide con estos principios, en este orden.

**PRI-01 · La cifra primero, la explicación al lado.** Cada vista abre con la respuesta (el número, el semáforo, el hallazgo) y deja el detalle a un clic.

**PRI-02 · Todo número dice de dónde viene.** Junto a cada cifra o gráfico va su procedencia: versión del dato o de la publicación, fecha de corte y fuente.

**PRI-03 · Lo observado y lo estimado nunca se confunden.** Dato real, proyección, simulación y escenario tienen codificación visual fija en todas las vistas (GRA-01).

**PRI-04 · Una alerta es una tarea.** Nada se señala como problema sin severidad, responsable, estado y una acción que lleve a la causa.

**PRI-05 · Mismo dato, distinto nivel de detalle.** Técnico para especialistas, ejecutivo para directivos, ciudadano para el público. Nunca jerga sin explicar en vistas públicas.

**PRI-06 · Lo publicado es inmutable y trazable.** Un resultado publicado no se edita: se corrige con una nueva versión. Toda descarga y gráfico se puede reconstruir.

**PRI-07 · Diseño antes que código.** Ninguna vista se desarrolla sin un diseño aprobado (ver flujo de trabajo, FLU-03).

## Tokens (TOK)

Los tokens son los nombres de todos los valores visuales. Las reglas y el código hablan de **nombres**, nunca de valores.

**TOK-01 (DEBE)** Fuentes de verdad: `tokens/base.json` (lo común a cualquier marca: espaciado, radios, escala tipográfica, sombras, estados por defecto, parámetros de gráficos) y `marcas/<marca>/tokens.json` (todo lo que define la marca, ver contrato MAR). El script `scripts/build_tokens.py --marca <marca>` los combina y genera `dist/<marca>/tokens.css`, `tailwind.preset.js` y `echarts-theme.js`. Los archivos generados **no se editan a mano**.

**TOK-02 (DEBE)** En el código solo se usan nombres: CSS `var(--surface-raised)`, Tailwind `bg-surface-raised`, ECharts `roles.real`. Prohibidos hexadecimales, `rgb()`, tamaños de fuente, radios o familias tipográficas sueltos en componentes. Lo verifica `scripts/lint_design.py`.

**TOK-03 (DEBE)** Todo token lleva `usage` (dónde se usa y sobre qué fondos es legible) y valor para tema claro y oscuro.

**TOK-04 (DEBE)** Tema oscuro con `data-theme="dark"` en `<html>`. Obligatorio en el modo pantalla; opcional por usuario en las demás zonas.

**TOK-05 (DEBE)** Los proyectos no copian valores: instalan una **versión** del paquete de tokens de su marca (`dist/<marca>/`, versión anotada en `reglas/VERSION`) y la actualizan con el proceso de FLU-09.

### Nombres semánticos

| Familia | Tokens | Origen |
| --- | --- | --- |
| Superficies | `surface`, `surface-raised`, `surface-sunken`, `line`, `line-strong` | Base (la marca puede sobrescribir) |
| Texto | `ink`, `ink-muted`, `on-brand`, `on-primary` | Base / marca |
| Marca | `brand`, `brand-soft`, `primary`, `primary-soft`, `focus` | **Marca (obligatorio)** |
| Productos | `<producto>-line`, `<producto>-fill`, `<producto>-soft`, `<producto>-band` | **Marca**, uno por producto declarado |
| Gráficos | `revision-past`, paleta `chart.series` | Base / marca |
| Estados | `success`, `warning`, `critical`, `info` y sus `-soft` | Base (la marca puede sobrescribir) |
| Espaciado | `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-6` 24 · `space-8` 32 · `space-12` 48 | Base |
| Radios | `radius-sm` 4 · `radius-md` 8 · `radius-lg` 12 · `radius-pill` 999 | Base |
| Tipografía | `font-sans`, `font-mono`; estilos `display`, `h1`, `h2`, `h3`, `body`, `small`, `label`, `kpi` | Familias: marca. Escala: base |
| Sombra | `shadow-overlay` | Base |

## Layout y navegación (LAY)

### Zonas

Una aplicación puede tener hasta tres zonas. Cada vista pertenece a una sola.

| Zona | Ruta sugerida | Público | Navegación | Tema |
| --- | --- | --- | --- | --- |
| App interna | `/app/*` | Usuarios autenticados | Barra lateral 240 px | Claro (oscuro opcional) |
| Portal público | `/` | Cualquiera | Encabezado + menú superior (+ barras legales de la marca) | Claro |
| Modo pantalla | `/pantalla` | Televisores y monitores | Puntos, flechas, arrastre | Oscuro |

**LAY-01 (DEBE)** Toda vista nueva declara su zona y usa el esqueleto de esa zona. No se mezclan navegaciones.

**LAY-02 (DEBE)** Retícula de 12 columnas, ancho máximo de contenido 1.280 px (1.200 en portal), márgenes `space-6`, separación entre tarjetas `space-4`. Base de 4 px; componentes en múltiplos de 8.

**LAY-03 (DEBE)** Superficies: página `surface`; tarjetas `surface-raised` + borde 1 px `line` + `radius-md`; filtros, barra lateral y encabezados de tabla en `surface-sunken`. Sin sombras en tarjetas; `shadow-overlay` solo en capas flotantes.

**LAY-04 (DEBE)** Acento de marca: franja de 4 px `brand` bajo el encabezado; barra de 3 px `brand` a la izquierda del ítem activo del menú lateral; subrayado de 3 px `brand` en el ítem activo del menú superior.

**LAY-05 (DEBE)** Estructura de una vista interna, de arriba abajo:
1. Encabezado: `h1` + subtítulo con procedencia (PRI-02) + acciones a la derecha (máximo 1 botón primario).
2. Banner, solo si una alerta alta afecta lo que se ve.
3. Fila de 2 a 4 KPIs.
4. Gráfico principal (~2/3 del ancho) y hasta 2 secundarios apilados; luego tablas.

**LAY-06 (DEBE)** El menú lateral de cada app se documenta en el repositorio de la app (`docs/tecnica/diseno-app.md`) con grupos y orden fijos. Agregar un grupo requiere actualizar ese documento en el mismo PR.

**LAY-07 (DEBE)** Si la app maneja varios productos o contextos (por ejemplo, energía eléctrica y gas natural), hay un **selector global de contexto** en el encabezado que persiste entre vistas y en la URL.

**LAY-08 (DEBE)** Responsivo. Portal: móvil primero, quiebres 640 / 1024 / 1280 px, objetivos táctiles ≥ 44 px. App interna: optimizada ≥ 1280 px, usable en tablet; en móvil solo las vistas marcadas como móviles en el inventario. Modo pantalla: 1920 × 1080 escalado a otras resoluciones 16:9.

## Componentes (CMP)

**CMP-01 (DEBE)** Antes de crear un componente, buscarlo en este inventario y en el código del proyecto. Si existe, se reutiliza o se extiende con una variante. Si no, se agrega a este inventario (en un PR a este repositorio) y al del proyecto.

**CMP-02 (DEBE)** Los componentes leen solo tokens, aceptan `className` para layout y no fijan márgenes externos.

**CMP-03 (DEBE)** Elementos nativos accesibles: `<button>`, `<a href>`, `<input>` + `<label>`, `<select>`. Nunca `onClick` en un `div`.

| Componente | Propósito | Reglas |
| --- | --- | --- |
| **Button** | Acciones | `primary` (relleno `primary`, máximo 1 por vista) · `secondary` (borde `line-strong`) · `ghost` (texto `primary`) · `danger` (`critical`). 40 px; `sm` 32 px en tablas y barras de gráfico. Texto verbo + objeto. Deshabilitado con explicación. |
| **Badge** | Estado o producto en 1–2 palabras | `success`, `info`, `warning`, `critical`, `neutral`, y uno por producto (relleno `<producto>-fill`, texto `on-brand`). Siempre con texto. |
| **ProductIcon** | Ícono de producto en círculo | 40 px, relleno `<producto>-fill`, ícono `on-brand`. |
| **KpiCard** | Cifra clave | Etiqueta · valor + unidad · variación con signo · procedencia. Color de tono solo si subir/bajar es bueno o malo. 2–4 por fila. |
| **ChartCard** | Contenedor de gráfico | Título = hallazgo · subtítulo con unidad y versión · leyenda · acciones (datos, imagen, tabla, pantalla completa) · fuente. |
| **AlertItem** | Fila de alerta | Barra de severidad · título con cifra · contexto, tipo, fecha, responsable, estado · acción a la causa. |
| **Banner** | Aviso de alerta alta | Máximo 1 por vista. |
| **SegmentedControl** | 2–5 opciones excluyentes | `aria-pressed`. |
| **Chip** | Filtros combinables | Activo: fondo `brand-soft`, borde `brand`. |
| **VersionSelect** | Elegir versión publicada (revisión, edición, corte) | Por defecto la vigente, marcada "(vigente)". |
| **RangeSlider** | Rango de fechas | Dos manijas con valores visibles. |
| **DataTable** | Tablas | Encabezado `surface-sunken`, cifras a la derecha tabulares, fila vigente `primary-soft`, orden, paginación de 25, descarga. |
| **Stepper** | Asistentes | Paso hecho `success`, actual `primary`. |
| **SideNav** | Menú de app interna | Ícono 20 px + texto; activo según LAY-04; contadores en `critical`. |
| **PublicHeader** | Encabezado del portal | Barras legales de la marca + logo + menú + franja `brand`. |
| **EmptyState / Skeleton / ErrorState / NoAccess** | Estados de vista | UX-06. |
| **KioskShell** | Contenedor del modo pantalla | TV-01 a TV-08. |

## Gráficos (GRA)

**GRA-00 (DEBE)** Todos los gráficos con Apache ECharts y el tema generado de la marca (`echarts-theme.js`: `<marca>Light`, `<marca>Dark`, `roles`). No se mezclan librerías de gráficos.

**GRA-01 (DEBE)** Codificación fija:

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

**GRA-02 (DEBE)** El título dice el hallazgo con su cifra ("La demanda real va 1,8 % bajo la proyección"), no el tema. El subtítulo dice unidad, alcance y versión.

**GRA-03 (DEBE)** Tipo de gráfico según la pregunta:

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

**GRA-04 (DEBE)** Etiqueta al final de cada línea (`endLabel`) con hasta 4 series; leyenda superior con más.

**GRA-05 (DEBE)** Tooltip con fecha, observado, estimado, diferencia en % y versión, en formato de CON-04.

**GRA-06 (DEBE)** Para comparar versiones se usa la paleta `chart.series` de la marca, en orden; la vigente siempre discontinua y más gruesa.

**GRA-07 (DEBE)** Unidad en el nombre del eje Y. Barras desde cero; líneas ajustadas al rango visible.

**GRA-08 (DEBE)** Cada gráfico: acciones (datos CSV/Excel, imagen PNG, ver como tabla, pantalla completa), nota de fuente y tabla accesible equivalente.

**GRA-09 (DEBE)** Rango de fechas con `dataZoom` sincronizado con el RangeSlider y reflejado en la URL.

**GRA-10 (DEBERÍA)** Máximo 6 series visibles; con más, el usuario elige con chips.

**GRA-11 (DEBE)** Animaciones ≤ 500 ms y desactivadas con `prefers-reduced-motion`.

## Patrones de experiencia (UX)

**UX-01 (DEBE)** Filtros estándar, en este orden: contexto global (LAY-07) · versión publicada (por defecto la vigente) · rango de fechas · escenarios o categorías (chips). Todos se reflejan en la URL.

**UX-02 (DEBE)** Cambiar un filtro actualiza la vista sin recargar ni mover el scroll; KPIs y gráficos usan los mismos filtros.

**UX-03 (DEBE)** Estados de una publicación: Borrador → En revisión → Aprobada → Publicada (inmutable). Estados de un modelo o método: Candidato → Validado → Oficial → Retirado. Siempre con Badge. Lo publicado muestra "Crear corrección", nunca "Editar".

**UX-04 (DEBE)** Procesos largos (ejecuciones, simulaciones, cargas) se lanzan con un asistente por pasos, corren en segundo plano, muestran avance y notifican al terminar.

**UX-05 (DEBE)** Alertas: severidad alta = banner en la vista afectada + notificación + contador `critical` en el menú; media = contador y lista; baja = lista. Cada alerta enlaza a su causa; cerrarla exige comentario. Las alertas internas nunca se muestran en portal ni modo pantalla.

**UX-06 (DEBE)** Toda vista define: carga (esqueletos, nunca spinner a pantalla completa), vacío (por qué y qué hacer), error (qué pasó y cómo seguir; detalle técnico plegado) y sin permiso (qué rol se necesita y a quién pedirlo).

**UX-07 (DEBE)** Todo gráfico y tabla se descarga. Nombre: `{contexto}_{version}_{contenido}.{ext}`. El archivo incluye encabezado con fuente, versión, fecha de corte y licencia de uso.

**UX-08 (DEBE)** Cada perfil tiene su página de inicio; lo que un perfil no puede usar no se muestra.

**UX-09 (DEBE)** Las notificaciones externas (correo, Google Chat) siguen FLU-14: se definen en el inventario de la app con evento, destinatario y canal.

## Modo pantalla (TV)

Vista de tableros rotativos para televisores y monitores dentro de la entidad.

**TV-01 (DEBE)** Tema oscuro, diseñado a 1920 × 1080, escala tipográfica de pantalla (ver tabla de TIP en la marca: títulos 36 px, KPI 56 px, texto ≥ 18 px).

**TV-02 (DEBE)** Rotación automática con intervalo configurable 10 / 20 / 30 / 60 s (por defecto 20 s) y barra de progreso de 6 px en `brand`.

**TV-03 (DEBE)** Navegación manual: arrastre con dedo o mouse (umbral 80 px), flechas laterales sutiles, puntos inferiores, botón de pausa y de pantalla completa. Sin atajos de teclado globales.

**TV-04 (DEBE)** Cualquier interacción pausa la rotación 30 s y muestra "Pausa por interacción · continúa en N s". Tras 5 minutos sin interacción, los filtros vuelven a sus valores por defecto.

**TV-05 (DEBE)** Estructura fija de cada tablero: encabezado (logo para fondo oscuro, ícono de contexto, título, hora y fecha) · filtros · 4 KPIs · gráfico principal + 2 secundarios · pie con fuente, puntos y estado.

**TV-06 (DEBE)** Solo datos públicos. Nunca alertas internas, borradores ni experimentos.

**TV-07 (DEBE)** Funciona sin conexión mostrando los últimos datos con "Actualizado hace N horas".

**TV-08 (DEBE)** Configuración por URL: `/pantalla?tableros=a,b,c&intervalo=30`.

## Contenido y lenguaje (CON)

**CON-01 (DEBE)** Lenguaje claro (guía del DAFP): frases de menos de 25 palabras, voz activa, siglas explicadas en la primera mención en vistas públicas.

**CON-02 (DEBE)** Botones y enlaces: verbo en infinitivo + objeto, mayúscula inicial ("Descargar CSV"). Nunca "Clic aquí".

**CON-03 (DEBE)** Interfaz en español de Colombia. Código, nombres técnicos y mensajes de commit en inglés (FLU-06).

**CON-04 (DEBE)** Números con `Intl.NumberFormat('es-CO')`: punto de miles, coma decimal, espacio antes de `%` y unidades (`78.452 GWh`, `3,2 %`), signo menos tipográfico `−`. Unidades siempre visibles.

**CON-05 (DEBE)** Fechas: `15 oct 2026` en texto; `2026-10-15` en archivos y API; horas en 24 h. Versiones publicadas por mes: "Revisión jul-2026".

**CON-06 (DEBE)** Procedencia con formato `<Versión> · <modelo o método> · datos a <corte> · Fuente: <fuente>`.

**CON-07 (DEBE)** Datos de ejemplo marcados "Cifras ilustrativas" hasta conectar datos reales.

**CON-08 (DEBERÍA)** Glosario visible en portales públicos.

## Accesibilidad (A11)

Objetivo: WCAG 2.1 AA (y NTC 5854 para la UPME) en todas las zonas.

**A11-01 (DEBE)** Contraste: texto ≥ 4,5:1 (≥ 3:1 desde 24 px o 18,7 px en negrita); bordes de controles, íconos informativos y líneas de gráfico ≥ 3:1. En ambos temas. `build_tokens.py --check` lo verifica para los pares de tokens.

**A11-02 (DEBE)** Todo se opera con teclado; foco visible (2 px `focus` con 2 px de separación); orden de tabulación = orden visual.

**A11-03 (DEBE)** Nombre accesible en todo control: `<label>`, `aria-label` en botones de solo ícono, `aria-pressed` en chips, `aria-current` en navegación.

**A11-04 (DEBE)** Gráficos con `aria-label` (su título), `aria.enabled` de ECharts y tabla equivalente.

**A11-05 (DEBE)** Nunca transmitir información solo con color: estados con texto e ícono; series distinguidas también por trazo o etiqueta.

**A11-06 (DEBE)** Respetar `prefers-reduced-motion`.

**A11-07 (DEBE)** Objetivos táctiles ≥ 44 × 44 px en portal y modo pantalla.

**A11-08 (DEBE)** `lang` declarado, título único por vista, un solo `h1`, encabezados en orden.

## Contrato de marca (MAR)

El contrato define **qué debe entregar una marca** para conectarse a la capa base. Con él se puede aplicar este estándar a la UPME, a otra entidad o a un proyecto de terceros sin cambiar reglas ni componentes.

Una marca es una carpeta `marcas/<marca>/` (archivos) más `reglas/MARCA-<MARCA>.md` (documentación). `scripts/check_brand.py <marca>` valida el contrato y `scripts/build_tokens.py --marca <marca> --check` valida los contrastes.

### Lo que la marca DEBE entregar

**MAR-01 · Manual de identidad.** Referencia al manual oficial (PDF o enlace) y versión. Es la fuente de verdad de la marca (precedencia 2).

**MAR-02 · Logos.** En `marcas/<marca>/logos/`, en SVG vectorial sin modificar:
- versión principal para fondo claro;
- versión para fondo oscuro (negativo);
- versión a una tinta;
- versión compacta o cuadrada (ícono de app, cargas, portadas).

La documentación indica altura mínima en pantalla, área de reserva y usos prohibidos.

**MAR-03 · Colores obligatorios** en `marcas/<marca>/tokens.json`, tema claro y oscuro:

| Token | Rol | Requisito |
| --- | --- | --- |
| `brand` | Color de identidad: acentos, menú activo, bloques | Si su contraste con `surface` es < 3:1, solo como relleno |
| `brand-soft` | Fondo suave de marca | `ink` ≥ 4,5:1 encima |
| `on-brand` | Texto sobre `brand` y rellenos de producto | ≥ 4,5:1 sobre `brand` en ambos temas |
| `primary` | Acciones: botón principal, enlaces, foco | ≥ 4,5:1 sobre `surface` y `surface-raised` |
| `primary-soft`, `on-primary`, `focus` | Complementos de acción | `on-primary` ≥ 4,5:1 sobre `primary` |

Puede sobrescribir superficies, texto y estados de la base, cumpliendo los mismos contrastes.

**MAR-04 · Productos o contextos** (si la app los tiene). Lista `products` en `tokens.json`; cada uno con `key`, `name` y cuatro colores: `line` (texto y líneas, ≥ 4,5:1 sobre `surface`), `fill` (relleno, con `on-brand` ≥ 4,5:1), `soft` (fondo de etiqueta) y `band` (banda translúcida). Los productos deben distinguirse entre sí también por claridad, no solo por tono.

**MAR-05 · Tipografía.** Familia principal (`font-sans`) y monoespaciada (`font-mono`), con licencia que permita su uso web, y los pesos disponibles. La escala de tamaños es de la base; la marca solo puede ajustar pesos.

**MAR-06 · Librería de íconos.** Origen, licencia o autorización, variante a usar en interfaz, proceso para buscar y agregar íconos, y la tabla de asignación concepto → ícono (inicio, alertas, descargar, buscar, filtrar, usuario y cada producto).

**MAR-07 · Paleta de series** (`chart.series`): 6 colores para comparar versiones en gráficos, el primero el de identidad, todos ≥ 3:1 sobre `surface-raised` del tema oscuro y claro donde se usen.

**MAR-08 · Requisitos legales y de canal.** Barras, pies de página, avisos o sellos obligatorios (por ejemplo GOV.CO para entidades públicas colombianas), con medidas y enlaces.

**MAR-09 · Tono y vocabulario.** Nombre oficial de la entidad, abreviaturas permitidas, términos propios (por ejemplo "Revisión jul-2026").

### Conectar una marca nueva

1. Copiar `marcas/_plantilla/` a `marcas/<marca>/` y `marcas/_plantilla/MARCA-PLANTILLA.md` a `reglas/MARCA-<MARCA>.md`.
2. Completar logos, `tokens.json` e íconos con el manual de la marca.
3. Ejecutar `python scripts/check_brand.py <marca>` y `python scripts/build_tokens.py --marca <marca> --check` hasta que pasen.
4. Registrar la marca con un ADR y en el CHANGELOG (versión MENOR).
5. Los proyectos de esa marca copian `reglas/` con su archivo de marca y `dist/<marca>/` (FLU-09).

## Revisión de diseño (REV)

Sirve para aprobar un **mockup** (antes de desarrollar) y para revisar una **vista construida** (antes de unir el PR). La puede hacer una persona o cualquier IA (Claude, Cursor, Codex, Gemini) con el prompt de abajo.

**REV-01 (DEBE)** Ningún desarrollo de vista empieza sin un diseño aprobado por el líder del equipo (o quien delegue), registrado en la ficha de la feature con enlace y fecha (FLU-03).

**REV-02 (DEBE)** La herramienta de diseño es libre (Claude, Figma, Cursor, Codex, Gemini, HTML). Lo obligatorio es: enlace o captura del diseño, y que pase esta lista.

**REV-03 (DEBE)** Toda vista construida pasa esta lista antes del PR; el resultado va en la descripción del PR.

### Lista de verificación

- [ ] Responde su pregunta en la primera pantalla (PRI-01).
- [ ] Zona declarada y esqueleto correcto (LAY-01, LAY-05).
- [ ] Procedencia visible en cifras y gráficos (PRI-02, CON-06).
- [ ] Codificación observado/estimado/escenarios (GRA-01) y título con hallazgo (GRA-02).
- [ ] Solo componentes del inventario o nuevos documentados (CMP-01).
- [ ] Solo tokens; `lint_design.py` sin problemas (TOK-02).
- [ ] Identidad de la marca respetada: logo, colores, tipografía, íconos (MAR-*, capa de marca).
- [ ] Estados de carga, vacío, error y sin permiso (UX-06).
- [ ] Contraste y teclado en tema claro y oscuro (A11-01, A11-02).
- [ ] Cada gráfico con acciones, fuente y tabla (GRA-08).
- [ ] Probada a 1280 px (y 390 px si es portal) (LAY-08).
- [ ] Nada interno en portal o modo pantalla (UX-05, TV-06).
- [ ] Textos en lenguaje claro y formatos es-CO (CON-01, CON-04).

### Prompt de revisión para cualquier IA

```
Actúa como revisor de diseño. Estándar: REGLAS-DISENO.md y MARCA-UPME.md (versión <X.Y.Z>).
Revisa el diseño, la captura o la vista adjunta contra la sección Revisión de diseño (REV).
Para cada punto responde: Cumple / No cumple / No aplica, con el ID de la regla y la evidencia.
Lista al final los cambios necesarios en orden de importancia. No inventes reglas: si algo
no está cubierto, márcalo como "Sin regla — proponer ADR". Si se pide, propone un
rediseño (mockup) que corrija los incumplimientos.
```
