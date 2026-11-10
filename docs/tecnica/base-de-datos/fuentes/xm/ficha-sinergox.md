# Ficha: XM SINERGOX

Fuente del dato real de demanda de energía eléctrica. Contexto completo en la [guía de XM](guia-api-xm.md). Esta ficha dice cómo se usa aquí (PFU-01); la carga se construye en la etapa 3 (T-28, T-29), y lo marcado «por confirmar» está en X-24 y X-26.

## 1. Qué es y definición oficial

API pública de XM, operador del Sistema Interconectado Nacional (SIN): `https://servapibi.xm.com.co`, POST con JSON y sin autenticación. Para el nivel de la demanda del SIN se usa SINERGOX y no SIMEM: SIMEM calcula la demanda de otra forma y queda alrededor de un 0,65 % por debajo.

- **`DemaSIN`:** demanda del SIN calculada desde la generación neta. Serie nacional limpia, sin la energía exportada.
- **`DemaReal`:** demanda de usuarios regulados y no regulados medida en frontera, sin alumbrado público. Incluye exportaciones.
- **`DemaCome`:** `DemaReal` más las pérdidas del STN asignadas y los consumos propios. Incluye exportaciones.

La UPME usa como histórico de sus proyecciones la serie «Sinergox: Históricos – Demanda_Energia_SIN», que corresponde a `DemaSIN` (informe Rev. Julio 2026).

## 2. Variables que se cargan

| Métrica / entidad | Código en `core.variables` | Unidad en XM → en la base | Frecuencia | Uso |
| --- | --- | --- | --- | --- |
| `DemaSIN` / `Sistema` | `xm_demasin` | kWh → GWh | Diaria | **Oficial para el error** (PER-01, provisional hasta T-26) |
| `DemaReal` / `Sistema` | `xm_demareal` | kWh → GWh | Horaria | Comparación y modelos horarios |
| `DemaCome` / `Sistema` | `xm_demacome` | kWh → GWh | Horaria | Comparación |
| `ExpoEner` / `Sistema` | `xm_expoener` | kWh → GWh | Horaria | Restar exportaciones si se compara con `DemaReal` o `DemaCome` |
| `DemaMaxPot` / `Sistema` | `xm_demamaxpot` | kW → MW | Diaria | Potencia máxima («El sistema hoy») |

**Cargado (T-24, 2026-11-10):** `DemaSIN` diaria desde el 2010-01-01, por decisión del líder. Llegaron todos los días hasta el anterior a la carga, sin huecos. Las demás variables y si se carga desde el inicio de la serie siguen en X-26. Muchas métricas existen desde el año 2000.

## 3. Cómo se extrae

- **Cliente:** llamada directa al REST con `httpx`, que ya está en `pipelines/`: `pipelines/lib/xm_sinergox.py` (T-24). `pydataxm` sería una dependencia nueva (TEC-06) y no se usa.
- **Peticiones:** `POST /daily` o `/hourly` con `{"MetricId", "Entity", "StartDate", "EndDate", "Filter"}`. Como máximo 31 días por petición, así que se parte por meses calendario.
- **Reintentos:** 3 intentos con espera creciente (1, 2 y 4 s) y tiempo límite. Si XM no responde, la app sigue con lo último cargado y la bitácora lo registra.
- **Registro:** cada petición queda en `operacion.extractions`, con la huella del contenido.

## 4. Frecuencia y rezago

XM publica el día anterior con rezago. Los últimos días llegan incompletos y se corrigen después.

## 5. Versionamiento

- **Estrategia `snapshot`:** XM no numera versiones, y el mismo día puede cambiar entre consultas.
- **Carga diaria:** los últimos días, contados desde el último dato guardado y no desde hoy. La guía de XM sugiere 10; el número se confirma en X-24.
- **Conciliación los domingos:** se consulta el histórico completo o un tramo, por confirmar en X-24 (PDA-03).
- **Solo se guarda lo que cambió** (PBD-05). Cada carga deja su fila en la bitácora (PDA-05).

## 6. Modelo de datos

| Esquema | Tabla | Qué guarda de esta fuente |
| --- | --- | --- |
| `operacion` | `extractions`, `load_runs`, `load_messages` | Consultas, bitácora y mensajes |
| `raw` | `xm_sinergox_values` | Valores como llegan (texto, kWh); las horarias, una fila por hora |
| `staging` | `observed_values` | Valores normalizados con los códigos del catálogo |
| `core` | `observed_values` | Valores versionados, con estado de calidad |

## 7. Transformaciones

- Valores en texto → número.
- kWh ÷ 10⁶ → GWh; kW ÷ 10³ → MW.
- Horarias: de 24 columnas (`Hour01` … `Hour24`) a una fila por hora. `Hour01` es la hora que termina a la 01:00 (00:00–01:00) en hora de Colombia.
- La columna de código cambia de nombre según la tabla (`Values_code`, `Code`, `Name`); se unifica.

## 8. Validaciones y anomalías

Propuestas para la demanda; los umbrales se fijan en X-24 (PDA-02):

- **Día incompleto:** menos de 24 horas.
- **Fuera de rango** frente al mismo día de la semana de años anteriores o a una media móvil. Un día típico ronda 220 a 260 GWh.
- **Salto fuerte** frente a la versión anterior del mismo día.
- **Incoherencia entre medidas:** `DemaSIN` ≈ 1,016 × (`DemaReal` − `ExpoEner`).
- **Respuesta vacía:** no es error. Se distingue «vacío» de «falló».

## 9. Problemas conocidos

- A `DemaReal` / `Sistema` le faltan los días del 2022-08-08 al 2022-08-27.
- Los últimos días llegan truncados y se corrigen después. En la carga del 2026-11-10 el día anterior todavía no estaba publicado: la carga lo informa como día faltante.
- Fallos intermitentes y peticiones lentas.
- `DemaReal` y `DemaCome` incluyen las exportaciones a Ecuador, que subieron en 2023–2024.

## 10. Licencia y uso

Datos públicos de XM. El texto de licencia que acompaña las descargas de la app está pendiente (X-04).

## 11. Contacto y responsable

- **Responsable de la carga en la UPME:** por definir.
- **Contacto en XM:** canales públicos de atención de XM.

## 12. Historial

| Fecha | Cambio | PR |
| --- | --- | --- |
| 2026-11-10 | Ficha creada con la guía de XM y las decisiones de la revisión del modelo de datos | issue #32 |
