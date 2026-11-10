# Plantilla de ficha de fuente

Toda fuente externa tiene una ficha con estas 12 secciones antes de su primera carga (PFU-01). Se copia este archivo a la carpeta de la entidad (`fuentes/<entidad>/ficha-<fuente>.md`) y se llena. La plantilla se mejora a medida que se cargan otras fuentes. Ejemplo lleno: [ficha de XM SINERGOX](xm/ficha-sinergox.md).

```markdown
# Ficha: <Entidad> <Fuente>

## 1. Qué es y definición oficial
Qué entrega la fuente y la definición oficial de cada dato, con enlace a la entidad.

## 2. Variables que se cargan
Tabla: variable de la fuente → código en `core.variables`, unidad, frecuencia, desde cuándo.
Cuál es la oficial para el cálculo del error, si aplica.

## 3. Cómo se extrae
Endpoint o archivo, parámetros, límites (por petición, por día), reintentos, autenticación.

## 4. Frecuencia y rezago
Cada cuánto publica la fuente, con cuánto rezago, y si corrige datos ya publicados.

## 5. Versionamiento
`snapshot` (cada consulta puede cambiar) o `source_version` (la fuente numera sus versiones).
Carga incremental y conciliación periódica (PBD-05, PDA-03).

## 6. Modelo de datos
Tablas de `raw`, `staging` y `core` que toca, y sus columnas principales.

## 7. Transformaciones
Unidades, formatos, nombres, y normalizaciones entre versiones de la fuente (PDA-07).

## 8. Validaciones y anomalías
Reglas que se aplican y sus umbrales (PDA-02, PDA-06).

## 9. Problemas conocidos
Huecos, trampas, datos que no cuadran.

## 10. Licencia y uso
Si los datos son públicos y qué texto de licencia acompaña las descargas (X-04).

## 11. Contacto y responsable
Quién mantiene la carga en la UPME y a quién se pregunta en la entidad.

## 12. Historial
Tabla: fecha · cambio (de la fuente o de la carga) · PR.
```
