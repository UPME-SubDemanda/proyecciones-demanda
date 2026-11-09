# Íconos locales (pendientes de pasar al estándar)

Íconos que el proyecto necesitó y que todavía no están en `upme-estandares`. Se usan solo a través de `src/lib/icons.ts`; el origen de cada uno está en `iconos.json`. Cuando el estándar los incluya, se borran de aquí y se toman de `src/estandares/iconos/` cambiando solo `src/lib/icons.ts`. Pasarlos al estándar: pendiente X-17.

| Archivo | Uso | Origen |
| --- | --- | --- |
| `fullScreen.svg` | Pantalla completa (modo pantalla, gráficos) | Librería de Iconos UPME, `Sin-Fondo-Negro`, con `#262626` cambiado por `currentColor` |
| `chevron-lef.svg`, `chevron-right.svg` | Tablero anterior y siguiente (modo pantalla) | Librería de Iconos UPME, igual que el anterior |
| `pause.svg` | Detener la rotación (modo pantalla) | **Creado en el proyecto**: la librería no tiene «pausa» |
| `play.svg` | Reanudar la rotación (modo pantalla) | **Creado en el proyecto**: la librería no tiene «reproducir» |

`pause.svg` y `play.svg` siguen el estilo de la librería (lienzo de 36 × 36, trazo de 1,5 px, esquinas redondeadas, `currentColor`). Son una excepción a UPME-ICO-01 («solo la Librería de Iconos UPME»), aprobada por el líder del equipo el 2026-11-08 (#15): al llevarlos al estándar, Comunicaciones debe revisarlos o reemplazarlos por los oficiales.
