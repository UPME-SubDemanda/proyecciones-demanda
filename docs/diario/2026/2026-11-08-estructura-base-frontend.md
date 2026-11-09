---
fecha: 2026-11-08
autor: David Bedoya
pr: 12
issue: 8
tipo: agrega
vistas: []
features: [estructura-base-frontend]
version: sin publicar
---

## Qué cambió
El frontend ya tiene las piezas con las que se van a construir el portal, el modo pantalla y la app interna:
- botones, etiquetas de estado, íconos de producto, tarjetas de indicadores, el contenedor de gráficos con sus descargas, el selector de opciones y los estados de carga, vacío y error;
- el gráfico de «real frente a proyección», con la banda de escenarios y la línea de corte;
- cifras ilustrativas de energía eléctrica, gas natural y variables exógenas, marcadas como tales.

Todavía no hay vistas nuevas: los componentes se ven por primera vez en el portal (T-06). Mientras tanto se pueden revisar en una galería que solo existe en desarrollo.

## Por qué
Es la base común de todas las vistas (T-05). Construirla primero evita repetir componentes y permite cambiar las cifras ilustrativas por los datos reales en un solo lugar (T-18).

## Cómo se ve
`pnpm dev` y abrir `/dev/componentes` (tema claro u oscuro, energía eléctrica o gas natural).

## Notas técnicas
- Componentes en `frontend/src/components/`, uno por carpeta con su prueba (CMP-01); solo tokens, `lint_design.py` sin problemas (TOK-02).
- Acceso a datos: `src/data/queries.ts` (hooks) → `src/data/source.ts` → `src/demo/fixtures.ts`. Detalle en `docs/tecnica/frontend.md`.
- Producto activo en la URL (`?producto=`, LAY-07).
- Fuentes Nunito Sans e IBM Plex Mono autoalojadas en `frontend/public/fonts/` (UPME-TIP-02).
- Galería `/dev/componentes` cargada aparte: no entra al build de producción ni al inventario.
- Pruebas con `react-dom/server`, sin librerías nuevas (55 pruebas).
- La licencia de los datos descargados queda «por definir» hasta resolver X-04.
- Convención del proyecto: todo componente nuevo se agrega a la galería en el mismo PR (`docs/tecnica/frontend.md`, `AGENTS.md`).
- Nuevo pendiente X-13, con página de detalle `docs/pendientes/x-13-componentes-compartidos.md`: evaluar cómo compartir componentes y galería entre proyectos de la UPME y proponer la regla CMP-04 a `upme-estandares`. Desde ahora, un pendiente que necesita contexto tiene su página en `docs/pendientes/`.
- Pendiente conocido: ECharts se importa completo (≈ 1 MB); reducirlo cuando las vistas lo usen.
