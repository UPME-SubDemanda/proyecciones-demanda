# Marca UPME

Identidad visual de la UPME aplicada a las aplicaciones: colores, tipografía, logos, íconos, productos y tono. Cumple el contrato de marca de `REGLAS-DISENO.md`. Valores exactos en `marcas/upme/tokens.json`.

Versión del estándar: ver `reglas/VERSION`. Historial: `CHANGELOG.md`.

## Marca UPME

- **Manual de identidad:** Manual de Identidad Visual UPME 2024 (`marcas/upme/referencias/`, no incluido por tamaño: copiar el PDF oficial). Páginas 1–24 corresponden a la UPME; el resto, al Manual de Identidad Visual del Gobierno de Colombia. (MAR-01)
- **Responsable:** líder del equipo de la Subdirección de Demanda; las dudas de identidad se escalan a Comunicaciones.

### Logos (UPME-LOG)

**UPME-LOG-01 (DEBE)** Usar solo los archivos de `marcas/upme/logos/`, sin modificar. No recolorear, deformar, rotar, sombrear ni separar la franja tricolor.

| Archivo | Uso | Altura mínima |
| --- | --- | --- |
| `upme-horizontal-amarillo.svg` | **Principal**: encabezados y menú lateral sobre claro | 32 px (40 px en encabezados) |
| `upme-horizontal-blanco.svg` | Fondos oscuros: modo pantalla, tema oscuro | 32 px (64 px en modo pantalla) |
| `upme-horizontal-negro.svg` | Impresión a una tinta | — |
| `upme-cuadrado-amarillo.svg` · `upme-cuadrado-blanco.svg` | Ícono de app, cargas, portadas | 48 px |

**UPME-LOG-02 (DEBE)** Área de reserva libre alrededor del logo igual a la altura de la franja tricolor.

### Colores (UPME-COL)

**UPME-COL-01 (DEBE)** Roles de color:

| Token | Valor | Rol |
| --- | --- | --- |
| `brand` | #E4B33C amarillo UPME (sector Minas y Energía) | Identidad; además, producto Energía eléctrica |
| `primary` | #003189 azul de la bandera (presente en el logo) | Acciones, enlaces, foco |
| `on-brand` | #262626 | Texto sobre amarillo y verde, ambos temas |
| `ink` / `ink-muted` | #262626 / #5C5C5C | Texto (negro 85 % de la Librería de Iconos) |
| `surface` | #F7F7F5 | Fondo cálido |
| `flag-yellow` / `flag-red` | #FFC800 / #D80025 | Solo dentro de la franja tricolor |
| `warning` | #B54708 naranja | Distinto del amarillo de marca |

**UPME-COL-02 (DEBE)** El amarillo (#E4B33C, 1,9:1 sobre blanco) y el verde (#B8FF65, 1,2:1) son claros: se usan como **relleno** con `on-brand` encima. Para texto o líneas en tema claro se usan sus versiones oscurecidas (`ee-line` #8C6400, `gn-line` #3B7300). En tema oscuro, los tonos puros sirven también como texto y línea.

**UPME-COL-03 (DEBE)** Productos de la Subdirección de Demanda (MAR-04):

| Clave | Producto | `line` | `fill` | Ícono |
| --- | --- | --- | --- | --- |
| `ee` | Energía eléctrica | #8C6400 | #E4B33C | `Energia` |
| `gn` | Gas natural | #3B7300 | #B8FF65 | `gasNatural` |

Un producto nuevo (combustibles líquidos, GLP…) recibe colores con un ADR que actualice `marcas/upme/tokens.json` y esta tabla.

**UPME-COL-04 (DEBERÍA)** El amarillo no cubre áreas grandes en la app interna (solo acentos de LAY-04, etiquetas y gráficos). En portal y modo pantalla PUEDE usarse en bloques destacados.

### Tipografía (UPME-TIP)

**UPME-TIP-01 (DEBE)** **Nunito Sans** (Google Fonts, SIL OFL) en toda la interfaz: 900/800 cifras y títulos grandes, 700 títulos y etiquetas, 400 texto. **IBM Plex Mono** para versiones e identificadores. **Verdana** (complementaria del manual) solo en correos y documentos de oficina, nunca en interfaz.

**UPME-TIP-02 (DEBE)** Autoalojar las fuentes en el proyecto (`public/fonts/`) para que el modo pantalla funcione sin conexión.

### Íconos (UPME-ICO)

**UPME-ICO-01 (DEBE)** Solo la **Librería de Iconos UPME**, variante «Sin fondo negro», incrustada con `fill="currentColor"`. Proceso para buscar y agregar íconos: Íconos UPME.

**UPME-ICO-02 (DEBE)** Tamaños: 20 px navegación y botones; 24 px tarjetas; 40–60 px íconos de producto en círculo (variantes amarilla y verde de la librería).

**UPME-ICO-03 (DEBE)** Asignación fija concepto → ícono:

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

### Requisitos legales (UPME-LEG)

**UPME-LEG-01 (DEBE)** Portal público: barra superior GOV.CO de 48 px (`govco` #3366CC) en todas las páginas, con el logo oficial del CDN de GOV.CO enlazado a https://www.gov.co (Kit UI GOV.CO). App interna y modo pantalla no la llevan.

**UPME-LEG-02 (DEBE)** Pie de página del portal con datos de la entidad (dirección, horario, teléfonos, correo de notificaciones judiciales), enlaces a política de tratamiento de datos (Ley 1581 de 2012), términos de uso y accesibilidad, y barra inferior GOV.CO.

**UPME-LEG-03 (DEBE)** Portal conforme a la Resolución 1519 de 2020 (accesibilidad y publicación) y Ley 1712 de 2014 (transparencia).

### Tono y vocabulario (UPME-VOC)

**UPME-VOC-01** Nombre oficial: "Unidad de Planeación Minero Energética (UPME)"; después, "UPME". Productos: "Energía eléctrica", "Gas natural" (EE/GN solo en etiquetas compactas y archivos). Versiones publicadas: "Revisión mmm-aaaa".

## Íconos UPME: cómo buscarlos, descargarlos y usarlos

La **Librería de Iconos UPME** tiene más de 1.200 íconos en siete variantes de color. Los ya usados están en `marcas/upme/iconos/` y en el catálogo `marcas/upme/iconos.json`. Cuando se necesite uno nuevo, se sigue este proceso.

### Dónde están

- Galería: https://jzmanuel88-create.github.io/Libreria-Iconos/ (filtros por color, botones **Copiar** enlace y **Descargar**).
- Archivos: alojados en `https://docs.upme.gov.co/<año>/<mes>/<Nombre>-<Variante>.svg`.
- Índice completo: `https://jzmanuel88-create.github.io/Libreria-Iconos/iconos-data.js` (lista de todas las URL).

Variantes: `Verde`, `Amarillo`, `Negro`, `Blanco`, `Gris` (60 × 60, círculo de color con ícono #262626), `Sin-Fondo-Negro` y `Sin-Fondo-Blanco` (36 × 36, solo el trazo).

### Cuál variante usar

| Uso | Variante | Cómo |
| --- | --- | --- |
| Interfaz (menú, botones, tarjetas) | `Sin-Fondo-Negro` | Incrustada con `fill="currentColor"` para que tome el color del texto |
| Ícono de producto en círculo | `Amarillo` (EE) / `Verde` (GN) | Tal cual, o la variante sin fondo dentro de un `ProductIcon` |
| Sobre fondos oscuros | `Sin-Fondo-Negro` + `currentColor` | El color lo da el texto (no hace falta la blanca) |

### Proceso para agregar un ícono

1. **Buscar** en la galería por nombre o tema (los nombres mezclan español e inglés: `Energia`, `gasNatural`, `Dashboard`, `download`, `Notification`…). Si no existe un ícono adecuado, pedirlo a Comunicaciones; **no** dibujar uno propio ni usar otra librería.
2. **Revisar** que no exista ya en `marcas/upme/iconos.json` con otro nombre.
3. **Descargar y normalizar** con el script (desde un computador con internet):
   ```
   python scripts/icono_upme.py Dashboard            # variante Sin-Fondo-Negro
   python scripts/icono_upme.py Energia --variante Amarillo
   python scripts/icono_upme.py --buscar demanda     # lista nombres que contienen "demanda"
   ```
   El script descarga el SVG, reemplaza el color #262626 por `currentColor`, lo guarda en `marcas/upme/iconos/` y lo agrega al catálogo con su URL de origen.
   *Sin el script:* botón **Descargar** de la galería → reemplazar `fill="#262626"` por `fill="currentColor"` → guardar con el nombre exacto → agregar la entrada al catálogo a mano.
4. **Asignar** el concepto en la tabla UPME-ICO-03 si es un concepto recurrente.
5. **PR** a este repositorio con el ícono, el catálogo y, si aplica, la tabla. Versión MENOR del estándar.
6. Los proyectos lo reciben al actualizar la versión del estándar (FLU-09). Si un proyecto lo necesita ya, puede agregarlo localmente y abrir el PR aquí en paralelo.

### Uso en código (React)

```tsx
import EnergiaIcon from '@estandares/upme/iconos/Energia.svg?react'; // vite-plugin-svgr
<EnergiaIcon width={20} height={20} aria-hidden="true" />            // decorativo
<EnergiaIcon width={20} height={20} role="img" aria-label="Energía eléctrica" />
```

### Notas para asistentes de IA

Los entornos en la nube de algunos asistentes no pueden descargar de `docs.upme.gov.co`. En ese caso el asistente debe pedir que el ícono se descargue con el script en el computador del desarrollador, o usar un navegador con acceso. Nunca debe reemplazarlo por un ícono de otra librería.
