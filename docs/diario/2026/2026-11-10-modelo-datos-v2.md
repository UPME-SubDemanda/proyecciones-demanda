---
fecha: 2026-11-10
autor: David Bedoya
pr: ?
issue: 32
tipo: agrega
vistas: []
features: [modelo-datos-v2, reglas-proyecto, fuentes-datos, plan-datos]
version: sin publicar
---

## Qué cambió
Antes de cargar los datos reales de energía eléctrica se revisó el modelo de datos con los insumos reales:

- la API de XM;
- cinco anexos de revisiones de la proyección (dic-2023 a ago-2026) y el informe Rev. Julio 2026;
- un anexo de gas natural.

El modelo de la etapa 1 no alcanzaba, así que se diseñó un **modelo de datos v2**. Ahora está documentado, junto con las reglas y el plan que salieron de esa revisión:

- **Sección «Base de datos»** en la guía técnica: qué guarda cada esquema, cómo llega un dato desde XM o desde un anexo hasta la app, y ejemplos con cifras reales.
- **Reglas del proyecto**, 19 en cinco familias:
  - comentarios y documentación en toda la base;
  - versiones de los datos que la fuente corrige;
  - datos anómalos que una persona valida;
  - una bitácora de cada carga;
  - una ficha por fuente;
  - cómo se calcula el error.
- **Guía de las fuentes de XM** y la ficha de la demanda de SINERGOX.
- **Plan de datos en 7 fases**, de la migración del modelo a las vistas con datos reales, y nueve pendientes nuevos.

La base todavía no cambia: la migración del modelo es el siguiente paso (T-23).

## Por qué
Los datos reales traen cosas que el primer modelo no podía guardar:

- energía y potencia;
- series que se suman o restan entre sí (GCE, movilidad eléctrica, generación distribuida);
- intervalos de confianza en EE y escenarios en GN;
- datos que XM corrige días después;
- archivos que cambian de formato entre revisiones.

Además, la base y las fuentes no estaban documentadas al nivel que se necesita para que cualquier persona entienda de dónde sale cada cifra.

## Cómo se ve
Guía técnica → Base de datos, Reglas del proyecto y Fuentes de datos. `docs/pendientes.md` → Plan de trabajo → Datos reales.

## Notas técnicas
- La revisión se hizo en un registro de preguntas (unas 70 preguntas; todas las del modelo quedaron resueltas). Equivalencia de los IDs provisionales de esa sesión con los IDs definitivos de las reglas:

| Registro | Regla | Registro | Regla | Registro | Regla |
| --- | --- | --- | --- | --- | --- |
| R-01 | PBD-01 | R-08 | PFU-01 | R-14 | PDA-05 |
| R-02 | PBD-02 | R-09 | PBD-05 | R-15 | PER-01 |
| R-03 | PBD-03 | R-10 | PDA-02 | R-16 | PDA-06 |
| R-04 | PFL-01 | R-11 | PDA-03 | R-17 | PDA-07 |
| R-05 | PFL-02 | R-12 | PDA-04 | R-18 | PBD-06 |
| R-06 | PBD-04 | R-13 | PFU-02 | R-19 | PBD-07 |
| R-07 | PDA-01 | | | | |

- El issue proponía el prefijo `PDF` para las reglas de fuentes; se usó `PFU` para no confundirlo con los archivos PDF.
- `scripts/referencias.py` lee también `docs/tecnica/reglas-proyecto.md`; las reglas del proyecto aparecen en la página de referencias.
- La guía de XM se trajo de un análisis previo de la Subdirección: se quitaron las rutas y enlaces a archivos de ese análisis, se marcó el origen en cada documento y se conservó la fecha de verificación (abril a noviembre de 2026).
- Pasos T-22 a T-35; T-16 a T-19 reemplazados. Pendientes nuevos X-22 a X-30; X-01, X-02 y X-09 actualizados. ADR P-0004 reemplaza a P-0002.
- No entran al repositorio: los anexos y el informe de la UPME (irán a `raw.files`), el reporte del análisis previo sobre la variable real ni el documento de observaciones para el equipo de modelación (X-23).
- Los diagramas están en Mermaid: GitHub los dibuja, y el sitio técnico también, con la función de diagramas de Material activada en `mkdocs.tecnica.yml` (ficha de MkDocs).
