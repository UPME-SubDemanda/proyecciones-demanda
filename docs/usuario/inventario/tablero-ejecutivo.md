---
id: tablero-ejecutivo
titulo: Tablero ejecutivo
zona: app
ruta: /app
roles: [viewer, modeler, approver, admin]
estado: desarrollo
version_desde: 0.1.0
diseno: docs/tecnica/mockups/tablero-ejecutivo.png (aprobado el 2026-11-08 por David Bedoya)
capturas: [../capturas/tablero-ejecutivo.png, ../capturas/tablero-ejecutivo-tablet.png]
actualizado: 2026-11-10
---

# Tablero ejecutivo

!!! warning "Datos reales provisionales y cifras ilustrativas"
    **Energía eléctrica ya muestra datos reales** (desde T-37): las revisiones publicadas por la UPME (serie SIN+GCE+ME+GD_UPME) y la demanda del SIN de XM. Es una conexión **provisional**: los escenarios «bajo» y «alto» son los límites del intervalo de confianza del 68 % de la revisión, porque la UPME publica para energía eléctrica un escenario medio con intervalos y no escenarios bajo y alto. Los indicadores de error son provisionales y el umbral es ilustrativo (X-03, X-25).

    Gas natural y las alertas siguen con cifras de ejemplo, y lo dicen junto a cada uno.

![Tablero ejecutivo](../capturas/tablero-ejecutivo.png)

## Para qué sirve
Responde en un minuto si **la proyección vigente sigue siendo válida** para energía eléctrica y gas natural, y qué hay que revisar primero. Es la página de inicio de la app interna, pensada para la Subdirectora, el Director y el equipo de la Subdirección de Demanda.

## Cómo llegar
- Desde el portal público: **Ingresar**.
- En la app: **Inicio**, en el menú lateral, o `/app`.

## Qué muestra
- **Aviso rojo** (solo si hace falta): cuándo la proyección vigente de un producto se salió del umbral aceptado, cuánto va la demanda real por encima o por debajo y cuántas alertas altas hay.
- **Cuatro cifras:** la demanda proyectada del año para energía eléctrica y gas natural, y el **error del año corrido** de cada uno (en rojo si está fuera del umbral, en verde si está dentro). Cada cifra dice de qué revisión, modelo y fuente sale.
- **Gráfico** del producto elegido en el encabezado: el dato real (línea sólida), la proyección vigente (discontinua) con la banda entre los escenarios bajo y alto, las dos revisiones anteriores (líneas finas), la fecha de corte de los datos y un punto con lo que va del año corrido. El título dice el hallazgo.
- **Alertas abiertas:** cada una con su severidad (barra de color), lo que pasó con la cifra, el producto, el tipo y la fecha.

## Cómo se usa (paso a paso)
1. Mire el aviso rojo y las cuatro cifras: dicen si algo está fuera de lo esperado.
2. Elija **Energía eléctrica** o **Gas natural** en el encabezado para ver el gráfico de ese producto.
3. Cambie el rango del gráfico entre **5 años**, **10 años** y **Todo**.
4. Pase el cursor sobre el gráfico para ver el valor de cada año y la diferencia entre lo real y lo proyectado.
5. Revise las alertas abiertas, de la más grave a la menos grave.

## Filtros y opciones
| Opción | Qué hace |
| --- | --- |
| Energía eléctrica / Gas natural (encabezado) | Producto del gráfico; se mantiene en toda la app. |
| Revisión / 5 años / 10 años / Todo | Años que muestra el gráfico; queda en la dirección (`?rango=5`). «Revisión» va de un año antes de la publicación de la vigente a un año después del último dato real; es el rango por omisión en mensual (en anual, 10 años). |
| Anual / Mensual | Muestra el gráfico por mes (GWh/mes, por omisión) o por año (TWh/año). En mensual se ve la estacionalidad y el detalle real frente a proyectado mes a mes, y el gráfico abre alrededor de la revisión: desde un año antes de su publicación hasta un año después del último dato real (para la revisión jul-2026 con datos a oct-2026, de 2025 a 2027). Una línea vertical marca el mes de publicación («Publicado») y otra el corte del dato real. Solo energía eléctrica: gas natural siempre se ve anual. Queda en la dirección (`?resolucion=anual`). En mensual no se dibuja el punto del año corrido. |
| Descargar datos, Descargar imagen, Ver como tabla, Pantalla completa | Acciones del gráfico. |
| Descargar informe | **En construcción** (X-19). |
| Ver alertas, Ver todas y las acciones de cada alerta | **En construcción**: llevarán a las vistas de alertas, del monitor de variables y de desempeño cuando existan. |

## Preguntas frecuentes
**¿Qué es el «error del año corrido»?** Cuánto se ha alejado la demanda real de lo proyectado en lo que va del año, en porcentaje. Negativo: la demanda real va por debajo.

**¿Qué es el umbral?** El margen de error que se acepta antes de considerar que la proyección necesita revisión. Los valores definitivos están por definir; hoy son de ejemplo.

**¿Por qué los botones de las alertas no hacen nada?** Llevan a vistas que todavía se están construyendo. Al dejar el cursor encima dicen «en construcción».

## Historial
- 2026-11-09: primera versión con cifras ilustrativas (diario técnico: `2026-11-09-tablero-ejecutivo`).
- 2026-11-10: energía eléctrica con datos reales, de forma provisional, y gráfica anual o mensual (T-37, issue #40; diario técnico: `2026-11-10-datos-reales-ee`).
