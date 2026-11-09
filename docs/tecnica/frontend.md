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
    demo/              cifras ilustrativas (se elimina en T-18)
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
| `KpiCard` | CMP, PRI-02, CON-04 | Etiqueta, cifra con unidad, variación con tono (`good`/`bad` solo si subir o bajar es bueno o malo), procedencia y «Cifras ilustrativas» |
| `ChartCard` | CMP, GRA-02, GRA-08, UX-07 | Título con hallazgo, subtítulo, controles, acciones (datos CSV, imagen PNG, tabla, pantalla completa) y fuente; la tabla equivalente siempre está para lectores de pantalla |
| `SegmentedControl` | CMP, A11-03, A11-07 | `aria-pressed`; `size="touch"` (44 px) en portal y modo pantalla |
| `PublicHeader`, `GovcoBar` | CMP, UPME-LEG-01, LAY-04 | Barra GOV.CO de 48 px, logo, menú superior (solo vistas que existen) y franja `brand`; en móvil, botón «Menú». El logo oficial de GOV.CO está pendiente (X-11) |
| `Chip` | CMP, A11-03 | Filtros combinables; activo con `brand-soft` y borde `brand`; `size="touch"` |
| `VersionSelect` | CMP, CMP-03 | `<select>` nativo con etiqueta; la vigente lleva «(vigente)» |
| `RangeSlider` | CMP, CMP-03 | Dos `<input type="range">` con sus valores visibles; «desde» nunca supera «hasta» |
| `KioskShell` | CMP, TV-01 a TV-08 | Escenario de 1920 × 1080 escalado, tema oscuro, rotación con barra de progreso, flechas, puntos, arrastre de 80 px, pausa por interacción de 30 s, reinicio de filtros a los 5 min, reloj, intervalo, pantalla completa (entrar y salir) y «Volver al inicio» (`exitHref`). La lógica está en `rotation.ts`, sin React, con pruebas |
| `PublicFooter` | UPME-LEG-02 | Datos de la entidad, enlaces legales y barra inferior GOV.CO; lo que falta se muestra entre corchetes (X-11) |
| `EmptyState`, `ErrorState`, `Skeleton` | UX-06 | Vacío con qué hacer, error con detalle técnico plegado, carga sin spinner |

Gráficos reutilizables en `components/charts/`:

- `EChart`: único envoltorio de ECharts. Importa solo los módulos que se usan (`echarts/core`: líneas, barras, ejes, tooltip, leyenda, marcas, zoom, aria); si un gráfico necesita otro, se agrega ahí. Registra el tema claro y oscuro, se redimensiona, lleva `aria-label` y desactiva la animación con `prefers-reduced-motion` (GRA-11).
- `projectionChart.ts`: real + proyección vigente + banda bajo–alto + revisiones anteriores + línea de corte, con la codificación fija de GRA-01, etiquetas al final (GRA-04), unidad en el eje (GRA-07) y tooltip con diferencia en % (GRA-05). `projectionTable` da la tabla equivalente y la base del CSV. Con `compact` reduce márgenes en teléfonos; con `kiosk`, líneas de 3,5 px y textos grandes. `scenarios` elige los escenarios visibles (bajo y alto juntos = banda; uno solo = línea punteada fina) y `range` recorta los años.
- `kioskCharts.ts`: desviación mensual en barras con signo, en el color negativo las que salen del umbral, con líneas de umbral (GRA-03).

Faltan componentes del inventario que llegan con su vista: `SideNav` (T-08), `DataTable`, `AlertItem`, `Banner` y `Stepper`.

## Datos: un solo punto de acceso

```
vista ──> data/queries.ts (hooks React Query) ──> data/source.ts ──> demo/fixtures.ts   (hoy)
                                                                └──> /api/v1/...        (T-18)
```

- Las vistas **solo** usan los hooks de `data/queries.ts`: `useObservedSeries`, `useRevisions`, `useRevisionValues`, `useExogenous`.
- Cada hook devuelve `{ data, illustrative }`. Si `illustrative` es `true`, la vista muestra «Cifras ilustrativas» (CON-07).
- `data/source.ts` decide de dónde salen los datos. Para conectar la API (T-18) se cambia ese archivo, `ILLUSTRATIVE` pasa a `false` y se borra `demo/`.
- `data/types.ts` sigue el modelo de datos de la etapa 1. Si una vista necesita un campo que no existe, se agrega aquí y se anota en el PR para T-16.

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

El contenedor `web` de Docker (5173) corre la imagen construida; si el código cambió, reconstruirlo (`docker compose up -d --build web`) o capturar contra `pnpm dev` en otro puerto.
