# Frontend

React + TypeScript + Vite, Tailwind con el preset de la marca y ECharts con su tema (TOK-02, GRA-00). Esta página explica cómo está organizado `frontend/src/` y cómo se agrega algo nuevo.

## Estructura

```
frontend/
  public/fonts/        Nunito Sans e IBM Plex Mono autoalojadas (UPME-TIP-02)
  src/
    components/        componentes del inventario de diseño, uno por carpeta con su prueba (CMP-01)
      charts/          EChart (envoltorio único) y opciones de gráficos reutilizables
    data/              tipos de datos y hooks con los que las vistas leen datos
    demo/              cifras ilustrativas (se elimina en T-34)
    dev/               herramientas solo de desarrollo (galería de componentes)
    lib/               formatos es-CO, descargas, íconos, producto activo
    estandares/        copia de upme-estandares (no editar, FLU-09)
    zones/             vistas por zona: app, portal, pantalla (LAY-01)
```

## Componentes base (T-05)

| Componente | Reglas | Notas |
| --- | --- | --- |
| `Button` | CMP, CON-02, CMP-03, A11-07 | `primary` (máx. 1 por vista), `secondary`, `ghost`, `danger`; `sm` de 32 px, `touch` de 44 px para portal y modo pantalla; `href` lo vuelve enlace; `disabledReason` lo deshabilita con explicación |
| `Badge`, `IllustrativeBadge` | CMP, A11-05, CON-07 | Estados y productos; `IllustrativeBadge` marca las cifras de ejemplo |
| `ProductIcon` | CMP, UPME-ICO-02 | Círculo con el relleno del producto; `decorative` si el nombre ya está al lado |
| `KpiCard` | CMP, PRI-02, CON-04 | Etiqueta, cifra con unidad (o `valueText` para una cifra en texto, como «ene-2026», con `valueTone`), variación con tono (`good`/`bad` solo si subir o bajar es bueno o malo; `warning` para lo que está en vigilancia), procedencia y «Cifras ilustrativas» |
| `ChartCard` | CMP, GRA-02, GRA-08, UX-07 | Título con hallazgo, subtítulo, controles, acciones (datos CSV, imagen PNG, tabla, pantalla completa) y fuente; la tabla equivalente siempre está para lectores de pantalla |
| `SegmentedControl` | CMP, A11-03, A11-07 | `aria-pressed`; `size="touch"` (44 px) en portal y modo pantalla |
| `PublicHeader`, `GovcoBar` | CMP, UPME-LEG-01, LAY-04 | Barra GOV.CO de 48 px, logo, menú superior (solo vistas que existen) y franja `brand`; en móvil, botón «Menú». El logo oficial de GOV.CO está pendiente (X-11) |
| `Chip` | CMP, A11-03 | Filtros combinables; activo con `brand-soft` y borde `brand`; `size="touch"` |
| `VersionSelect` | CMP, CMP-03 | `<select>` nativo con etiqueta; la vigente lleva «(vigente)» |
| `RangeSlider` | CMP, CMP-03 | Dos `<input type="range">` con sus valores visibles; «desde» nunca supera «hasta» |
| `KioskShell` | CMP, TV-01 a TV-08 | Escenario de 1920 × 1080 escalado, tema oscuro, rotación con barra de progreso, flechas, puntos, arrastre de 80 px, pausa por interacción de 30 s, reinicio de filtros a los 5 min, reloj, intervalo, pantalla completa (entrar y salir) y «Volver al inicio» (`exitHref`). La lógica está en `rotation.ts`, sin React, con pruebas: el tiempo se acumula solo mientras corre, así que en una pausa la barra de progreso se congela (atenuada) y al reanudar continúa. Controles de solo ícono de 44 px con nombre accesible |
| `SideNav` | CMP, LAY-04, LAY-06, A11-03 | Menú de la app: logo, grupos, ícono de 20 px + texto, ítem activo con barra de 3 px `brand` y `aria-current`, contadores en `critical`; conserva `?producto=` al navegar |
| `AppShell` | LAY-01, LAY-03, LAY-04, LAY-08 | Esqueleto de la app: `SideNav` de 240 px en `surface-sunken`, encabezado con ubicación y controles y franja `brand` de 4 px; bajo 1024 px el menú se abre con «Menú» como panel (Esc o tocar fuera lo cierra) |
| `Banner` | CMP, UX-05, A11-05 | Aviso de alerta alta: ícono + título con cifra + detalle + acción; máximo uno por vista; `role="alert"` |
| `AlertItem` | CMP, PRI-04, A11-05 | Fila de alerta: barra de severidad (alta `critical`, media `warning`, baja `info`) con la severidad también en texto, título con cifra, producto, tipo y fecha, acción hacia la causa |
| `DataTable` | CMP, CON-04 | Encabezado `surface-sunken`, cifras a la derecha tabulares, fila vigente `primary-soft`, fila elegida enmarcada, orden por columna (`aria-sort`, vacíos al final), paginación de 25; columnas con `render`, `sortValue`, `numeric` y `rowHeader` |
| `Sparkline` | CMP, GRA-00, GRA-01, A11-04 | Tendencia en una celda de tabla con ECharts: observado sólido (`roles.real`) frente a una referencia punteada (`roles.scenario`), sin ejes ni tooltip; nombre accesible con las cifras. Se usa en el monitor de exógenas |
| `UserMenu` | A11-03 | Nombre, correo y roles; «Ir al portal público» y «Cerrar sesión»; `aria-expanded`, se cierra con Esc o al tocar fuera |
| `PublicFooter` | UPME-LEG-02 | Datos de la entidad, enlaces legales y barra inferior GOV.CO; lo que falta se muestra entre corchetes (X-11) |
| `EmptyState`, `ErrorState`, `Skeleton` | UX-06 | Vacío con qué hacer, error con detalle técnico plegado, carga sin spinner |

Gráficos reutilizables en `components/charts/`:

- `EChart`: único envoltorio de ECharts. Importa solo los módulos que se usan (`echarts/core`: líneas, barras, ejes, tooltip, leyenda, marcas, zoom, aria); si un gráfico necesita otro, se agrega ahí. Registra el tema claro y oscuro, se redimensiona, lleva `aria-label` y desactiva la animación con `prefers-reduced-motion` (GRA-11).
- `projectionChart.ts`: real + proyección vigente + banda bajo–alto + revisiones anteriores + línea de corte, con la codificación fija de GRA-01, etiquetas al final (GRA-04), unidad en el eje (GRA-07) y tooltip con diferencia en % (GRA-05). `projectionTable` da la tabla equivalente y la base del CSV. `ytdPoint` marca el año corrido con su cifra (marca hueca sobre la línea real). Las claves de tamaño del modo pantalla se agregan solo con `kiosk`: pasar `axisLabel: undefined` borra las etiquetas que pone el tema. Con `compact` reduce márgenes en teléfonos; con `kiosk`, líneas de 3,5 px y textos grandes. `scenarios` elige los escenarios visibles (bajo y alto juntos = banda; uno solo = línea punteada fina) y `range` recorta los años.
- `kioskCharts.ts`: desviación mensual en barras con signo (GRA-03); abanico de revisiones con la paleta `chart.series` y la vigente discontinua y más gruesa (GRA-06); demanda diaria frente al año anterior; barras diarias de un producto desde cero (GRA-07).

Falta del inventario: `Stepper` (asistentes, fase 2).

## Datos: un solo punto de acceso

```
vista ──> data/queries.ts (hooks React Query) ──> data/source.ts ──> demo/fixtures.ts   (hoy)
                                                                └──> /api/v1/...        (T-34)
```

- Las vistas **solo** usan los hooks de `data/queries.ts`: `useObservedSeries`, `useRevisions`, `useRevisionValues`, `useExogenous`.
- Cada hook devuelve `{ data, illustrative }`. Si `illustrative` es `true`, la vista muestra «Cifras ilustrativas» (CON-07).
- `data/source.ts` decide de dónde salen los datos. Para conectar la API (T-34) se cambia ese archivo, `ILLUSTRATIVE` pasa a `false` y se borra `demo/`.
- `data/types.ts` sigue el modelo de datos de la etapa 1. Si una vista necesita un campo que no existe, se agrega aquí y se anota en el PR; esos campos alimentaron el modelo de datos v2 (T-22).

Las cifras de `demo/fixtures.ts` se generan con fórmulas simples y deterministas, con magnitudes parecidas a las de los mockups. No son datos oficiales.

## Utilidades

| Archivo | Para qué |
| --- | --- |
| `lib/format.ts` | `formatNumber`, `formatValue`, `formatPercent`, `formatDate`, `formatMonth`, `revisionLabel`, `formatProvenance` (CON-04 a CON-06) |
| `lib/download.ts` | Nombre de archivo `{contexto}_{version}_{contenido}`, CSV con encabezado de fuente, versión, corte y licencia (UX-07). La licencia queda «por definir» hasta X-04 |
| `lib/icons.ts` | Íconos de la marca por concepto (UPME-ICO-03) |
| `lib/product.ts` | Producto activo en la URL (`?producto=ee`, LAY-07) con `useProduct()` |
| `lib/useFullscreen.ts` | Entrar y salir de pantalla completa con el mismo botón («Pantalla completa» / «Salir de pantalla completa»); `exitFullscreen()` antes de navegar |
| `lib/useMediaQuery.ts` | Media queries en React (`PHONE`, quiebres de LAY-08) |

## App interna (T-08)

- `zones/app/AppLayout.tsx` envuelve todas las rutas `/app/*` (ruta con hijos en `routes.config.tsx`): arma el `AppShell` con el menú visible para el usuario, el selector de producto y el `UserMenu`. Cada vista se dibuja en el `<Outlet />`.
- `zones/app/navigation.ts`: el menú (LAY-06) con todos los ítems planeados; `visibleNavigation()` deja solo los construidos y permitidos al rol.
- `zones/app/AppPage.tsx`: estructura de una vista interna (LAY-05): `h1`, subtítulo con procedencia y acciones; pone el título del documento.
- **Ingreso:** `RequireRole` manda a `/ingresar?siguiente=<ruta>` y `LoginPage` vuelve ahí al ingresar con usuario local. El ingreso con Google siempre regresa a `/app` (backend), así que el destino se guarda antes en `sessionStorage` y `AppLayout` lo usa al cargar (`auth/returnTo.ts`). Solo se aceptan destinos `/app…`, para que un enlace no lleve a otro sitio.
- **Pruebas de recorrido:** `e2e/app-shell.spec.ts` (Playwright) con la sesión simulada: el portal lleva a la app, sin sesión pasa por ingresar y vuelve, el producto queda en la URL, el menú del usuario y el menú plegable en tablet. `pnpm exec playwright test e2e/app-shell.spec.ts`.
- **Capturas de la app:** `screenshots.spec.ts` responde `/api/v1/auth/me` con un usuario de ejemplo; no usa credenciales reales.

## Tablero ejecutivo (T-09)

- `zones/app/ExecutiveDashboard.tsx` es el inicio de la app (`/app`, ruta índice dentro de `AppLayout`). Los cálculos propios están en `zones/app/dashboardData.ts` (rango de años `?rango=5|10|todo`, estimado del año corrido) y los compartidos con el modo pantalla en `lib/insights.ts` (título con hallazgo, crecimiento promedio, desde qué mes está fuera de umbral).
- Datos: `useObservedSeries`, `useRevisions`, `useRevisionValues` (vigente y dos anteriores), `useRevisionPerformance` y `useAlerts` (alertas de ejemplo; reglas pendientes, X-03 y X-10).
- Acciones sin destino todavía (informe, alertas, desempeño): `Button` con `disabledReason`, que se muestra al pasar el cursor.

## Histórico de revisiones (T-10)

- `zones/app/RevisionHistory.tsx` en `/app/proyecciones/historico` (ruta hija de `/app`). Escenario (`?escenario=`) y revisión resaltada (`?revision=`) en la URL.
- `components/charts/historyChart.ts`: abanico de revisiones con la vigente discontinua, la seleccionada en `primary` y las demás finas; tooltip con proyectado, real y error con signo; `historyTitle()` arma el hallazgo con el error a 12 meses de cada revisión.
- `lib/cssVar.ts` lee un token CSS (p. ej. `--primary`) para los colores que el tema de ECharts no trae, sin escribir valores en el código (TOK-02).
- El encabezado muestra «Grupo / Vista» (`activeLocation()` en `navigation.ts`).
- Datos: `useRevisionsValues` y `useRevisionsPerformance` (error a 12 meses `error12` y MAPE por revisión).

## Monitor de variables exógenas (T-11)

- `zones/app/ExogenousMonitor.tsx` en `/app/variables/exogenas`. Escenario (`?escenario=`) y variable del gráfico (`?variable=`) en la URL.
- `zones/app/exogenousData.ts`: desvío frente al supuesto, estado según los umbrales (ilustrativos, X-03), cifras de los indicadores, variable por defecto y títulos con hallazgo (`monitorTitle()`, `correlationTitle()`). No calcula impactos ni correlaciones: llegan con los datos (etapa 1).
- `components/charts/exogenousCharts.ts`: tendencia de la tabla (`Sparkline`), correlación móvil con banda del intervalo (`roles.products.<producto>.band`) y quiebre como `markArea` en `surface-sunken`, e importancia en barras horizontales ordenadas desde cero.
- Datos: `useExogenousMonitor(product)` → `ExogenousMonitor` (tipos en `data/types.ts`). Campos que pidió la vista (insumo del modelo v2, T-22): supuesto por escenario, observado del año corrido, impacto por escenario, correlación del periodo de estimación, umbrales de vigilancia y fuera de rango, tendencia, correlación móvil con intervalo, mes del quiebre e importancia SHAP del modelo.
- Las unidades largas van en la línea de la fuente (`unitInCell()`), para que la tabla quepa a 1280 px.
- Las acciones de las alertas del tablero ejecutivo se habilitan cuando su vista existe (`isBuilt()` en `navigation.ts`) y llevan el producto de la alerta.

## Íconos locales

`src/iconos-locales/` guarda íconos que el proyecto necesitó antes de que estén en el estándar: pantalla completa y chevrones (de la Librería de Iconos UPME) y pausa y reproducir (**creados en el proyecto**, con el estilo de la librería, porque no existen en ella; excepción a UPME-ICO-01 aprobada por el líder en #15). Se usan solo a través de `lib/icons.ts`; el detalle está en `src/iconos-locales/LEEME.md` y el origen en `iconos.json`. Llevarlos al estándar: X-17.

## Salir de cada vista

Toda vista ofrece una salida clara: el modo pantalla tiene «Volver al inicio» (que también sale de la pantalla completa), y todo botón de pantalla completa cambia a «Salir de pantalla completa» mientras está activa. La tecla Esc del navegador también sale.

## Galería de componentes (solo desarrollo)

Con `pnpm dev`, la ruta `/dev/componentes` muestra todos los componentes base con cifras ilustrativas, en energía eléctrica o gas natural y en tema claro u oscuro. Se carga aparte y **no entra al build de producción**, por eso no tiene página en el inventario.

!!! note "Convención del proyecto"
    **Todo componente nuevo se agrega a la galería en el mismo PR que lo crea**, con sus variantes y en ambos temas. Antes de crear un componente, se revisa en la galería si ya existe (CMP-01).

    Es una convención de este proyecto, no una regla del estándar. Se propondrá a `upme-estandares` junto con la evaluación de un paquete de componentes compartido entre proyectos: ver [X-13](../pendientes/x-13-componentes-compartidos.md).

## Pruebas

Las pruebas de componentes renderizan a HTML con `react-dom/server` (sin librerías adicionales) y verifican estructura, tokens, accesibilidad y formatos. La interacción se revisa en la galería y, más adelante, con Playwright.

## Capturas (DOC-03)

`e2e/screenshots.spec.ts` captura cada vista del inventario en `docs/usuario/capturas/<id>.png`; las del portal también en móvil (`<id>-movil.png`, 390 px). La primera vez hay que instalar el navegador: `pnpm exec playwright install chromium`.

```bash
cd frontend && pnpm screenshots                                  # contra http://localhost:5173
BASE_URL=http://localhost:5174 pnpm screenshots                  # contra otro servidor de desarrollo
```

El contenedor `web` (5173) sirve el código actual (carpeta montada), así que las capturas pueden ir contra él: `pnpm screenshots` sin `BASE_URL`. `BASE_URL` sigue sirviendo para capturar contra otro servidor.
