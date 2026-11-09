---
id: X-17
tema: Íconos locales al estándar
responsable: Líder
estado: Abierto
revisar: cuando haya espacio para trabajar en upme-estandares
creado: 2026-11-08
relacionado: [T-07, UPME-ICO-01, UPME-ICO-03, MAR-06, FLU-09, IA-05]
---

# X-17 · Íconos locales al estándar

**Qué hay que hacer:** llevar a `upme-estandares` los cinco íconos que este proyecto usa sin que estén en el estándar, para que cualquier proyecto los reciba con la copia de la marca (FLU-09) y este proyecto deje de tener íconos locales.

## Contexto

El modo pantalla (T-07, #15) necesitó controles con íconos: detener y reanudar la rotación, pantalla completa, y tablero anterior y siguiente. El estándar (versión 2.1.0) no trae esos íconos en `dist/upme/iconos/`.

- Tres existen en la **Librería de Iconos UPME** y se descargaron de ahí.
- **Pausa** y **reproducir** no existen en la librería. Se crearon en el proyecto con el estilo de la librería. Es una excepción a UPME-ICO-01 («solo la Librería de Iconos UPME»), aprobada por el líder el 2026-11-08 en #15.

Mientras tanto viven en `frontend/src/iconos-locales/` y se usan solo a través de `frontend/src/lib/icons.ts`.

## Insumos

| Ícono | Archivo en este proyecto | Origen | Uso | Concepto propuesto para UPME-ICO-03 |
| --- | --- | --- | --- | --- |
| `fullScreen` | `frontend/src/iconos-locales/fullScreen.svg` | https://docs.upme.gov.co/2026/07/fullScreen-Sin-Fondo-Negro.svg | Pantalla completa (modo pantalla y gráficos) | Pantalla completa |
| `chevron-lef` | `frontend/src/iconos-locales/chevron-lef.svg` | https://docs.upme.gov.co/2026/07/chevron-lef-Sin-Fondo-Negro.svg | Tablero anterior | Anterior |
| `chevron-right` | `frontend/src/iconos-locales/chevron-right.svg` | https://docs.upme.gov.co/2026/07/chevron-right-Sin-Fondo-Negro.svg | Tablero siguiente | Siguiente |
| `pause` | `frontend/src/iconos-locales/pause.svg` | **Creado en el proyecto** (no existe en la librería) | Detener la rotación | Pausa |
| `play` | `frontend/src/iconos-locales/play.svg` | **Creado en el proyecto** (no existe en la librería) | Reanudar la rotación | Reproducir |

Otros insumos:

- Carpeta completa en este repositorio: `frontend/src/iconos-locales/` (SVG, `iconos.json` con el origen y `LEEME.md`).
- En GitHub: https://github.com/UPME-SubDemanda/proyecciones-demanda/tree/develop/frontend/src/iconos-locales (cuando el PR de #15 esté unido).
- Los tres de la librería ya están normalizados: variante `Sin-Fondo-Negro`, con `#262626` cambiado por `currentColor`. En el estándar se pueden volver a descargar con `python scripts/icono_upme.py <nombre>`.
- `pause` y `play`: lienzo de 36 × 36, trazo de 1,5 px, esquinas redondeadas, `currentColor`.

## Decisión que toca tomar en el estándar

`pause` y `play` no vienen de la librería oficial. Opciones:

1. **Pedirlos a Comunicaciones** para que entren a la librería (recomendado) y, mientras llegan, publicar los del proyecto como provisionales.
2. Registrar en `MARCA-UPME.md` que los íconos de control de medios se pueden crear con el estilo de la librería cuando no existan, con un ADR.

## Pasos

- [ ] Pedir a Comunicaciones los íconos de pausa y reproducir para la Librería de Iconos UPME.
- [ ] Ejecutar el prompt de abajo en Claude Code abierto en `upme-estandares` y revisar el PR.
- [ ] Publicar la versión nueva del estándar (MENOR).
- [ ] En este proyecto: copiar la versión nueva (FLU-09, `chore: update standards to vX.Y.Z`), cambiar `frontend/src/lib/icons.ts` para tomar los íconos de `src/estandares/iconos/`, borrar `frontend/src/iconos-locales/` y cerrar este pendiente.

## Prompt para `upme-estandares`

Para ejecutar en Claude Code abierto en `upme-estandares` (IA-05). Antes, ten a mano la carpeta `frontend/src/iconos-locales/` de `proyecciones-demanda` (en el disco o en GitHub).

```
Propuesta desde proyecciones-demanda (pendiente X-17): agregar íconos a la marca UPME.

Contexto: el modo pantalla de proyecciones-demanda usa cinco íconos que no están en el estándar.
Están en proyecciones-demanda/frontend/src/iconos-locales/ (SVG + iconos.json con su origen + LEEME.md).

1. Sigue el proceso de MARCA-UPME.md, «Proceso para agregar un ícono»:
   - fullScreen, chevron-lef y chevron-right existen en la Librería de Iconos UPME. Descárgalos con
     `python scripts/icono_upme.py fullScreen`, `chevron-lef` y `chevron-right` (variante Sin-Fondo-Negro),
     revisa que no estén ya en marcas/upme/iconos.json con otro nombre y agrégalos al catálogo con su URL.
   - pause y play NO existen en la librería: los creó el proyecto con el estilo de la librería (36 × 36,
     trazo de 1,5 px, currentColor), con una excepción a UPME-ICO-01 aprobada por el líder. Cópialos de
     proyecciones-demanda/frontend/src/iconos-locales/ a marcas/upme/iconos/ y regístralos en
     marcas/upme/iconos.json con origen «creado en proyecciones-demanda, pendiente de Comunicaciones».
     No los presentes como parte de la librería oficial.
2. Agrega a la tabla UPME-ICO-03 de MARCA-UPME.md los conceptos: Pausa (pause), Reproducir (play),
   Pantalla completa (fullScreen), Anterior (chevron-lef) y Siguiente (chevron-right).
3. Si el estándar no permite íconos fuera de la librería, no inventes la regla: deja pause y play fuera
   del PR, explícalo en el resumen y propone un ADR con dos opciones: pedirlos a Comunicaciones, o permitir
   íconos de control de medios con el estilo de la librería cuando no existan.
4. Regenera dist/upme/ si los íconos se copian ahí, agrega la entrada al CHANGELOG (versión MENOR) y
   abre el PR. En el resumen cita los IDs (UPME-ICO-01, UPME-ICO-03, MAR-06) y la versión propuesta.
```

## Historial

- 2026-11-08: se crea al construir los controles del modo pantalla (T-07, #15).
