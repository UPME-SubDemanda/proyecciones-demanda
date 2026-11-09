---
id: portal-inicio
titulo: Inicio del portal
zona: portal
ruta: /
roles: [publico]
estado: desarrollo
version_desde: 0.1.0
diseno: docs/tecnica/mockups/portal-inicio-escritorio.png y portal-inicio-movil.png (aprobado el 2026-11-08 por David Bedoya)
capturas: [../capturas/portal-inicio.png, ../capturas/portal-inicio-movil.png]
actualizado: 2026-11-08
---

# Inicio del portal

!!! warning "Cifras ilustrativas"
    Mientras se cargan los datos oficiales, todas las cifras de esta página son de ejemplo y lo dicen junto a cada número y gráfico.

![Inicio del portal en escritorio](../capturas/portal-inicio.png)

## Para qué sirve
Responde, sin necesidad de registrarse, **cuánta energía eléctrica y gas natural usará Colombia** según la proyección oficial vigente de la UPME, y qué tan acertadas han sido las proyecciones anteriores. Está pensada para la ciudadanía, empresas del sector, academia y otras entidades.

## Cómo llegar
Es la página principal del sitio: `/`. También se llega desde cualquier página con el logo de la UPME o con «Inicio» en el menú.

## Qué muestra
- **Pregunta principal** y una explicación corta de qué son las proyecciones.
- **Tres cifras clave:**
    - demanda proyectada de energía eléctrica para el próximo año, en GWh, y cuánto cambia frente al último año con dato real;
    - lo mismo para gas natural, en GBTUD;
    - el acierto de las proyecciones publicadas y su error medio.
- **Gráfico de la proyección vigente:** el dato real (línea sólida) y la proyección hasta 2040 en el escenario medio (línea discontinua), con la banda entre los escenarios bajo y alto. El título dice cuánto crecería la demanda.
- **Próximamente:** datos abiertos, simulador, metodología y API. Aún no están disponibles.
- **Acceso al modo pantalla** para televisores: «Ver en modo pantalla →» junto al gráfico (en computador) y en el pie de página.
- **Pie de página** con los datos de la entidad y los enlaces legales.

## Cómo se usa (paso a paso)
1. Lea las tres cifras clave: cada una dice de qué revisión sale.
2. En el gráfico, elija **Energía eléctrica** o **Gas natural**.
3. Pase el cursor (o toque) sobre el gráfico para ver el valor de cada año y la diferencia entre lo real y lo proyectado.
4. Use **Ver como tabla** para leer los mismos datos en una tabla, o **Descargar datos** para obtenerlos en CSV.

## Filtros y opciones
| Opción | Qué hace |
| --- | --- |
| Energía eléctrica / Gas natural | Cambia el producto del gráfico. Queda en la dirección de la página (`?producto=gn`), así que se puede compartir. |
| Descargar datos | Descarga un CSV con el dato real y los tres escenarios, con fuente, versión, fecha de corte y licencia. |
| Descargar imagen | Descarga el gráfico como imagen PNG. |
| Ver como tabla | Muestra los datos del gráfico en una tabla. |
| Pantalla completa | Amplía el gráfico; el mismo botón dice **Salir de pantalla completa** para volver (también con la tecla Esc). |
| Ver en modo pantalla → | Abre los tableros para televisores ([Modo pantalla](modo-pantalla.md)). Solo en pantallas de computador. |

En el teléfono, el menú se abre con el botón **Menú**.

![Inicio del portal en móvil](../capturas/portal-inicio-movil.png){ width="320" }

## Preguntas frecuentes
**¿Qué es un escenario?** Una proyección con supuestos distintos sobre la economía, la población y el clima. El medio es el más probable; el bajo y el alto marcan el rango razonable.

**¿Cada cuánto se actualiza?** Las proyecciones se publican cada seis meses y el dato real se actualiza cuando lo publican XM y el Gestor del Mercado de Gas.

**¿Por qué dice «Cifras ilustrativas»?** Porque la página todavía usa datos de ejemplo. Desaparecerá cuando se conecten las cifras oficiales.

## Historial
- 2026-11-08: primera versión con cifras ilustrativas (diario técnico: `2026-11-08-portal-inicio`).
- 2026-11-08: acceso al modo pantalla (diario técnico: `2026-11-08-modo-pantalla`).
