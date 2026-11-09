---
fecha: 2026-11-08
autor: David Bedoya
pr: ?
issue: 15
tipo: agrega
vistas: [modo-pantalla, portal-inicio]
features: [modo-pantalla]
version: sin publicar
---

## Qué cambió
Existe el **modo pantalla** (`/pantalla`), pensado para los televisores de la UPME. Muestra dos tableros, energía eléctrica y gas natural, que se turnan solos. Cada uno tiene la proyección vigente frente al dato real, cuatro cifras clave, la desviación de los últimos 12 meses y la demanda de 2030 por escenario.

Se puede tocar, arrastrar o pausar. Al tocar, la rotación espera 30 segundos; si nadie lo usa en 5 minutos, los filtros vuelven a su valor inicial. Si se cae internet, sigue mostrando los últimos datos y lo avisa.

Desde el inicio del portal se llega con un enlace discreto junto al gráfico («Ver en modo pantalla →», solo en computador) y desde el pie de página.

Todas las cifras son ilustrativas.

## Por qué
El modo pantalla es, con el portal, la cara visible del proyecto (etapa 1.1). Permite mostrar las proyecciones oficiales en espacios de la entidad sin que nadie las opere.

## Cómo se ve
![Modo pantalla](../../usuario/capturas/modo-pantalla.png)

## Notas técnicas
- Vista `frontend/src/zones/pantalla/` (`KioskPage`, `KioskProductBoard`, cálculos en `kioskData.ts` con pruebas). Ruta `/pantalla` con `?tableros=` e `?intervalo=` (TV-08).
- `KioskShell`: escenario de 1920 × 1080 escalado, tema oscuro (`data-theme="dark"`, `data-zone="pantalla"`), rotación, barra de progreso, flechas, puntos, arrastre, pausa, reloj e intervalo. Lógica pura en `rotation.ts`, probada con tiempos simulados.
- Componentes nuevos del inventario: `KioskShell`, `VersionSelect`, `RangeSlider` y `Chip`, en la galería (convención del proyecto).
- Datos: nuevo `useRevisionPerformance` (desviación mensual, año corrido, umbral y MAPE), ilustrativo. Se refresca cada 15 min; si falla, React Query conserva los últimos datos (TV-07).
- Gráficos: `projectionChart` acepta escenarios visibles y rango de años; `kioskCharts.ts` con la desviación mensual (barras con signo).
- Iconos: los controles de la pantalla son de texto, porque la librería de íconos de la UPME no trae íconos de pausa ni de pantalla completa (UPME-ICO-01).
- Plan y pendientes: T-06 pasa a Hecho (PR #14); T-07 en curso; nuevo T-21 para los tableros sin mockup; X-14 incluye las cifras del modo pantalla; nuevos X-15 (abrir sin conexión) y X-16 (acciones de gráficos en el modo pantalla frente a GRA-08).
