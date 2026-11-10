# Esquema `publicacion`

**Para qué existe:** separar **lo que se puede mostrar en público** de todo lo interno (BD-03, TV-06). El portal, el modo pantalla y la API pública leen solo de aquí.

**Qué contiene:** vistas sobre `core`, sin copiar datos. Se diseñan en la etapa de la API (T-33); hoy el esquema existe y está vacío.

## Qué entra y qué no

| Entra | No entra |
| --- | --- |
| Revisiones en estado `published`, y las `superseded` marcadas como reemplazadas | Borradores, revisiones en revisión o aprobadas sin publicar |
| Las series, medidas y geografías que se decida publicar (X-04) | Desagregaciones no públicas |
| El dato real vigente **aceptado** | Datos provisionales sin marca, anomalías, cambios y avisos |
| La procedencia de cada cifra: revisión, corte, fuente (PRI-02, CON-06) | Bitácora de cargas, usuarios y roles |

## Por qué vistas y no tablas

Las vistas muestran siempre lo vigente de `core` y no hay que sincronizar nada. Si una se vuelve lenta, se convierte en vista materializada que se refresca después de cada carga, sin tecnología nueva.

## Pendiente

Qué se publica (regional, sectorial, horario) lo decide X-04, y si la API se diseña pública desde el inicio, X-28.
