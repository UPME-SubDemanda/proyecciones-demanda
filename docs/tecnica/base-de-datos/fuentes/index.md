# Fuentes de datos

De dónde vienen los datos del proyecto y cómo se usa cada fuente. Cada fuente se documenta en dos niveles:

| Documento | Qué es | Para qué | Regla |
| --- | --- | --- | --- |
| **Guía de la entidad** | Lo que hay que saber de las fuentes de una entidad: mapa de fuentes, endpoints, cómo descubrir una variable, definiciones, trampas, ejemplos | Entender la fuente a fondo antes de usarla | PFU-02 |
| **Ficha de la fuente** | Una página corta con estructura fija por cada fuente que **se carga** | Saber exactamente cómo la usamos aquí: qué variables, cómo se extraen, qué tablas toca, qué se valida | PFU-01 |

La guía se construye a medida que se analiza la fuente; la ficha existe antes de la primera carga y se actualiza con cada cambio. `AGENTS.md` dice qué documento leer antes de trabajar con cada fuente.

## Fuentes

| Entidad | Fuente | Qué aporta | Estado | Guía | Ficha |
| --- | --- | --- | --- | --- | --- |
| XM | API SINERGOX | Demanda real de energía eléctrica (`DemaSIN`, `DemaReal`, `DemaCome`…), exportaciones, potencia máxima | Por cargar (etapa 3) | [Guía de XM](xm/guia-api-xm.md) | [Ficha de SINERGOX](xm/ficha-sinergox.md) |
| XM | API SIMEM | Desagregaciones de la demanda, pronósticos, contratos | Sin cargar | [Guía de XM](xm/guia-api-xm.md) · [Diccionario de SIMEM](xm/referencia/Diccionario_SIMEM.md) | — |
| UPME | Anexos de las revisiones de la proyección | Proyecciones publicadas de EE y GN | Por cargar (etapa 2) | — | Pendiente |
| DANE | PIB, población | Variables exógenas | Sin cargar | — | — |
| IDEAM | Temperatura media por área | Variable exógena | Sin cargar | — | — |

Plantilla para una ficha nueva: [plantilla de ficha de fuente](plantilla-ficha.md).
