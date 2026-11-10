# Guía de las fuentes de datos de XM (API SINERGOX, SIMEM y fuentes relacionadas)

Resume lo aprendido sobre las APIs de XM en un análisis previo de la Subdirección de Demanda sobre el SIN. Sirve para que una persona o un asistente trabaje con estas fuentes sin redescubrir sus trampas. `AGENTS.md` indica leerla antes de trabajar con datos de XM (PFU-02).

Cómo se usa aquí qué fuente de XM, con qué tablas y validaciones, está en la [ficha de XM SINERGOX](ficha-sinergox.md) (PFU-01).

**Diccionarios completos** (en `referencia/`):
- [Diccionario de la API SINERGOX](referencia/Diccionario_pydataxm.md): 93 métricas, estructuras, catálogos y clasificación de recursos.
- [Diccionario de SIMEM](referencia/Diccionario_SIMEM.md): 399 datasets, versiones de liquidación y catálogo por categoría.
- [Otras fuentes de XM](referencia/Fuentes_XM_Paratec_Sinergox_web.md): PARATEC, IDO, portal de archivos, Sinergox web y cubos.

Los nombres de scripts o tablas del análisis previo que aparecen en los diccionarios no existen en este repositorio; el contenido técnico sí aplica.

> Hechos verificados entre abril y noviembre de 2026 (`pydataxm` 0.3.16). Las APIs cambian: ante una duda, **consultar el inventario en vivo** (sección 3) antes de afirmar algo.

---

## 1. Mapa de fuentes

| Fuente | Qué trae | Acceso | Cuándo usarla |
|---|---|---|---|
| **API SINERGOX** (`servapibi.xm.com.co`) | ~93 métricas / 193 combinaciones métrica × entidad: demanda, generación, precios, hidrología, intercambios, disponibilidad, comercialización | REST público, sin autenticación. Python: `pydataxm.ReadDB` | Series históricas largas y uniformes (muchas desde 2000). **Fuente base para niveles.** |
| **API SIMEM** (`www.simem.co/backend-files/api/PublicData`) | 399 datasets (361 públicos): contratos, liquidación, planeamiento, pronósticos, demanda por OR/mercado/CIIU, maestros | REST público. Python: `pydataxm.pydatasimem.ReadSIMEM` | Desagregaciones, pronósticos, proyecciones, contratos. **No para el nivel absoluto de demanda.** |
| **PARATEC** (`paratecbackend.xm.com.co`) | Ficha técnica vigente de plantas, unidades, líneas, subestaciones (heat rate, mínimos técnicos, rampas, lat/lon) | REST JSON público (GET) | Atributos técnicos. Es una foto actual, sin histórico. |
| **IDO** (`ido.xm.com.co`) | Informe diario de operación, 19 secciones, desde ~2013 | JSON público por día y sección | Detalle operativo diario del CND |
| **Portal de archivos** (`api-portalxm.xm.com.co/administracion-archivos`) | Despacho/redespacho, ofertas, pronósticos por barra/UCP, planeación (antes FTP), desde 2007 | API pública | Insumos operativos |
| **SUI** (Superservicios) | Consumo y suscriptores por estrato/uso, municipio y empresa | `http://reportes.sui.gov.co/fabricaReportes/reporte?...&formatting_chosenformat=CSV` (GET) | Residencial/comercial/estrato: XM no lo tiene |

Endpoints y detalles: `referencia/Fuentes_XM_Paratec_Sinergox_web.md`.

---

## 2. API SINERGOX: cómo funciona por dentro

`pydataxm` es un envoltorio delgado sobre un REST que acepta POST con JSON. Si la app nueva no es Python, se puede llamar directamente.

### 2.1 Endpoints

| Tipo (`Type`) | URL | Máx. días por petición | Clave del JSON de respuesta |
|---|---|---|---|
| `HourlyEntities` | `https://servapibi.xm.com.co/hourly` | 31 | `Items[].HourlyEntities[]` |
| `DailyEntities` | `https://servapibi.xm.com.co/daily` | 31 | `Items[].DailyEntities[]` |
| `MonthlyEntities` | `https://servapibi.xm.com.co/monthly` | 731 | `Items[].MonthlyEntities[]` |
| `ListsEntities` | `https://servapibi.xm.com.co/lists` | sin fechas | `Items[].ListEntities[]` |

Inventario vivo (nov-2026): 115 combinaciones horarias, 57 diarias, 14 mensuales y 7 listados.

### 2.2 Petición

```http
POST https://servapibi.xm.com.co/hourly
Content-Type: application/json

{"MetricId": "DemaReal", "Entity": "Sistema",
 "StartDate": "2026-10-01", "EndDate": "2026-10-31", "Filter": []}
```

Para listados solo van `MetricId` y `Entity`.

### 2.3 Respuesta (horaria, real)

```json
{"Metric": {"Id": "DemaReal", "Name": "Demanda Real por Sistema", "StartDate": "...", "EndDate": "..."},
 "Items": [{"Date": "2026-10-01",
            "HourlyEntities": [{"Id": "Sistema",
                                "Values": {"code": "Sistema", "Hour01": "9453595.59000", "...": "...", "Hour24": "..."}}]}]}
```

- **Los valores vienen como texto** (`"9453595.59000"`): hay que convertirlos a número.
- `pydataxm` aplana con `json_normalize(Items, '<Tipo>', 'Date', sep='_')`. De ahí salen nombres como `Values_code`, `Values_Hour01`. Una app que llame al REST verá `Values.code`, `Values.Hour01`.
- `Hour01` es la hora que termina a la 01:00 (00:00–01:00), hora de Colombia (UTC−5, sin horario de verano). `Hour24` es 23:00–24:00.
- Las fechas de los rangos son inclusivas.

### 2.4 Uso con `pydataxm` (Python)

```python
from pydataxm import pydataxm
import datetime as dt

api = pydataxm.ReadDB()            # al instanciar descarga el inventario (ListadoMetricas)
api.get_collections()              # inventario completo
api.get_collections("Gene")        # combinaciones de una métrica

df = api.request_data("Gene", "Recurso",
                      start_date=dt.date(2026, 1, 1), end_date=dt.date(2026, 3, 31),
                      filtros=["CHVR"])   # filtros opcionales: lista de códigos
```

- `request_data` parte el rango en meses y los pide en paralelo con `aiohttp`. Dentro de Jupyter o de un servidor con event loop activo puede fallar `run_until_complete`; en ese caso usar `nest_asyncio` o llamar al REST con `requests`/`httpx`.
- Si la métrica o la entidad no existen, **no lanza error**: imprime "No existe la métrica…" y devuelve un DataFrame vacío. Validar siempre que no venga vacío.
- Ojo: valida la entidad contra *todas* las entidades del inventario, no contra las de esa métrica. Una combinación inválida puede pasar la validación y fallar después.
- Instalar en un entorno propio (`pip install pydataxm`). El análisis previo fijó `pandas>=2.1,<2.3`. Este proyecto no usa `pydataxm`: la carga llama al REST con `httpx` (ver la ficha).

---

## 3. Cómo descubrir y entender una variable

No adivinar `MetricId` ni unidades. Procedimiento:

1. **Inventario vivo**: `POST /lists {"MetricId":"ListadoMetricas","Entity":"Sistema"}`. Cada fila trae:
   `MetricId, MetricName, Entity, MaxDays, Type, Url, Filter, MetricUnits, MetricDescription`.
   Ejemplo: `DemaReal / Sistema / HourlyEntities / kWh / "Demanda de usuarios regulados y no regulados ... (no incluye Alumbrado Público)"`.
2. **Buscar por concepto** en `MetricName` y `MetricDescription` (texto en español), no solo por `MetricId`.
3. **Revisar `referencia/Diccionario_pydataxm.md`** (secciones 4 y 9) para el significado y las diferencias entre variables parecidas.
4. **Probar con un día** antes de bajar años: confirmar columnas, unidades y orden de magnitud.
5. **Revisar el campo `Filter`**: dice qué código acepta el filtro (`Codigo Submercado Generación`, `Codigo Comercializador`, `Nombre Embalse`...), o "No aplica".
6. **Contrastar** con un valor publicado conocido (por ejemplo, demanda anual del SIN ≈ 80–85 TWh en 2024–2026; un día típico ≈ 220–260 GWh).

En SIMEM el equivalente es `CatalogSIMEM("Datasets").get_data()` más `ReadSIMEM(id, ini, fin).get_metadata()` y `.get_columns()` (sección 7).

---

## 4. Estructuras y uniones (SINERGOX)

| Tipo / entidad | Columnas tras `pydataxm` | Columna de código |
|---|---|---|
| Hourly (cualquier entidad) | `Id, Values_code, Values_Hour01..Values_Hour24, Date` | `Values_code` |
| Daily / Sistema | `Id, Value, Date` | — |
| Daily / Recurso | `Id, Code, Value, Date` | `Code` |
| Daily / Embalse, Rio | `Id, Name, Value, Date` | `Name` |
| Monthly | `Id, Value, Date` | — |
| Lists / Sistema | `Values_Code, Values_Name, ...` | `Values_Code` |
| ListadoRecursos / Agente | `Values_code1` (agente), `Values_code2` (recurso), `Values_Value` (nombre) | — |

**El mismo código se llama distinto según la tabla.** Normalizar a una sola columna (`code`) al ingerir.

Uniones típicas:
- `Gene/Recurso.Values_code` ↔ `ListadoRecursos/Sistema.Values_Code`
- `CapEfecNeta/Recurso.Code` ↔ `ListadoRecursos.Values_Code`
- `ListadoRecursos.Values_CompanyCode` ↔ `ListadoAgentes.Values_Code`
- `AporEner/Rio.Name` ↔ `ListadoRios.Values_Name`; `VoluUtilDiarEner/Embalse.Name` ↔ `ListadoEmbalses.Values_Name`

Pasar lo horario a formato largo:

```python
hours = [f"Values_Hour{h:02d}" for h in range(1, 25)]
long = df.melt(id_vars=["Values_code", "Date"], value_vars=hours, var_name="h", value_name="valor")
long["hora"] = long["h"].str[-2:].astype(int)          # 1..24
long["fecha_hora"] = pd.to_datetime(long["Date"]) + pd.to_timedelta(long["hora"] - 1, unit="h")
```

### 4.1 Clasificación de recursos (ListadoRecursos)

La tecnología sale de tres campos: `Values_Type`, `Values_Disp`, `Values_RecType` (y `Values_EnerSource` para el combustible).

- **Hidráulica de embalse** = `HIDRAULICA` + `NORMAL` + `DESPACHADO CENTRALMENTE` (21 recursos).
- **Filo de agua** = cualquier otra `HIDRAULICA` (140). Hay 8 `FILO DE AGUA` despachados centralmente (p. ej. Porce II): siguen siendo filo de agua.
- Térmicas por combustible: `Values_EnerSource` (GAS, CARBON, ACPM, COMBUSTOLEO, JET-A1, GLP, BAGAZO, BIOMASA, BIOGAS).
- Solar: ~1.340 recursos, la mayoría `AUTOG PEQ. ESCALA` (< 1 MW).

Código de referencia en `referencia/Diccionario_pydataxm.md` §6.4.

---

## 5. Variables más usadas y qué significan de verdad

| Necesidad | Usar | No confundir con |
|---|---|---|
| Demanda nacional (nivel, crecimiento) | **`DemaSIN` / Sistema** (diaria, kWh) | `DemaReal` y `DemaCome` **incluyen exportaciones** |
| Demanda horaria nacional | `DemaReal` / Sistema − `ExpoEner` / Sistema (horarios) | — |
| Demanda por comercializador | `DemaReal` / Agente o `DemaCome` / Agente | `DemaOR` (por operador de red, sin referir al STN) |
| Regulado / no regulado | `DemaRealReg`, `DemaRealNoReg` | — |
| Demanda máxima | `DemaMaxPot` (diaria, kW) | — |
| Generación | `Gene` (real), `GeneIdea` (ideal, red inexistente), `GeneProgDesp` (programada) | — |
| Precio de bolsa | `PrecBolsNaci` (horario, COP/kWh); `PPPrecBolsNaci` (ponderado diario) | `PrecBolsNaciTX1` (versión TX1) |
| Precio de escasez (Res. CREG 140/2017) | `PrecEscaAct` (activación); `PrecEscaPon` (ponderado) | `PrecEsca` (escasez original, ~25 % menor) |
| Capacidad instalada | `CapEfecNeta` / Recurso (diaria, kW) | `DispoReal`, `DispoCome`, `DispoDeclarada` (disponibilidad horaria) |
| Hidrología | `AporEner`, `AporEnerMediHist`, `PorcApor` (% de la media) | — |
| Embalse | `VoluUtilDiarEner`, `CapaUtilDiarEner`, `PorcVoluUtilDiar` | — |
| Intercambios | `ExpoEner`, `ImpoEner` (por `Enlace`) | — |
| Confiabilidad | `ENFICC`, `ObligEnerFirme` | — |

Definiciones de demanda:
- **`DemaReal`**: demanda de usuarios regulados y no regulados medida en frontera. Sin alumbrado público. **Con exportaciones.**
- **`DemaCome`**: `DemaReal` + pérdidas del STN asignadas + consumos propios. **Con exportaciones.**
- **`DemaSIN`**: calculada desde la generación neta. Serie nacional limpia. `DemaSIN ≈ 1,016 × (DemaReal − exportaciones)`; la brecha frente a las exportaciones tiene r = 0,996. Lo que parece un error de `DemaSIN` en sep–oct 2011 son exportaciones reales.

**Unidades**: casi todo en **kWh** (energía), **kW** (potencia/capacidad) o **COP/kWh**. Convertir explícitamente (÷1e6 para GWh, ÷1e3 para MW) y rotular siempre la unidad. Leer `MetricUnits` del inventario en lugar de suponerla.

---

## 6. Trampas conocidas de SINERGOX

1. **Últimos días truncados.** XM publica días incompletos (pocas horas o valores parciales) y los corrige después. Al refrescar un caché, **volver a bajar siempre los últimos ~10 días contados desde el último dato guardado**, no desde hoy (si no, los días truncados quedan fijos cuando la app lleva tiempo sin actualizarse).
2. **Huecos.** A `DemaReal` / Sistema le faltan del 2022-08-08 al 2022-08-27. Revisar continuidad de fechas antes de sumar años y marcar los años incompletos.
3. **Límite de 31 días** en horarias y diarias. Partir por meses calendario.
4. **Fallos intermitentes y peticiones lentas.** Reintentar con backoff exponencial (3 intentos, 1-2-4 s) y poner timeout. Si la API no responde, servir el caché con aviso.
5. **Respuesta vacía no es error.** Una combinación inválida o un periodo sin datos devuelve 0 filas. Distinguir "vacío" de "falló".
6. **Columna de código inconsistente** (`Values_code`, `Code`, `Values_Code`, `Name`). Normalizar al ingerir.
7. **Valores como texto** en el JSON crudo.
8. **Exportaciones dentro de la demanda** (sección 5).
9. **Duplicados al combinar caché y descarga nueva**: deduplicar por (`Date`, código), quedándose con lo más reciente.

---

## 7. API SIMEM

```python
from pydataxm.pydatasimem import ReadSIMEM, CatalogSIMEM

cat = CatalogSIMEM("Datasets").get_data()          # id, nombre, fechas, público/reservado
r = ReadSIMEM("EC6945", "2026-01-01", "2026-01-31") # precio de bolsa horario
df = r.main(); r.get_metadata(); r.get_columns()
```

- REST: `https://www.simem.co/backend-files/api/PublicData?datasetId=...&startDate=...&endDate=...`. Sin autenticación.
- **Cada dataset tiene su propio esquema** (formato largo). Leer `get_columns()` y `get_metadata()` (periodicidad, granularidad, próxima actualización).
- La librería imprime mucho en stdout: silenciarla (`contextlib.redirect_stdout`).
- SIMEM a veces entrega `""` en lugar de nulo: convertir con `pd.to_numeric(..., errors="coerce")`.

Trampas:
1. **Versiones de liquidación.** El mismo periodo aparece varias veces: `TX1`..`TX8`, `TXR` (reliquidación), `TXF` (final). **Sin resolverlas, las sumas salen ×3 o ×4.** Quedarse con una fila por clave en el orden `TXF > TXR > TXn (n mayor primero)`.
   ```python
   def rank(v):
       v = str(v).upper()
       return 1000 if v == "TXF" else 900 if v == "TXR" else int(v[2:]) if v[2:].isdigit() else 0
   df = df.assign(_r=df["Version"].map(rank)).sort_values("_r").drop_duplicates(keys, keep="last")
   ```
2. **Peticiones de más de un mes en datasets diarios u horarios se cuelgan sin timeout.** Bajar por bloques mensuales (semanales para `055A4D`, generación por planta, ~1,8 M filas/mes), con `socket.setdefaulttimeout(180)` y en paralelo moderado.
3. **El campo de fecha del filtro cambia por dataset** (`Fecha`, `FechaHora`, `FechaInicio`, `FechaProyectada`). En proyecciones, el filtro aplica sobre la **fecha proyectada**, no sobre la de publicación.
4. **Demanda SIMEM ≠ SINERGOX.** `14fabb` / `9b0967` = generación − pérdidas STN; queda ~0,65 % (mediana) por debajo de `DemaReal`, hasta −6 % algunos días. La generación (`055A4D` vs `Gene`) sí coincide. **Usar SINERGOX para niveles y SIMEM para participaciones.**
5. **CIIU solo para el no regulado.** En `9b0967` el regulado (~69 % de la demanda) llega como `SIN CLASIFICAR`. SIMEM no tiene residencial/comercial/estrato: eso está en el SUI.
6. **Planeamiento `682a0b` (largo plazo) / `596c1c` (mediano)**: `DemandaSIN` es **kWh/día promedio de la etapa**, no la energía de la etapa (multiplicar por los días). `Are0010` = total SIN. Hay muchas publicaciones repetidas sin cambios: deduplicar antes de contar versiones. El largo plazo del CND copia la proyección UPME (`SIN+GCE+ME+GD`, escenario medio) con rezago.
7. **Precio de escasez `43D616`** se compara con `PrecEscaPon`, no con `PrecEsca`.
8. **Costo marginal `ef0522`** viene en USD/kWh.
9. **Heat rate `8ae7da`**: valores de 0 o 0,0001 no son válidos (descartar < 3 MBTU/MWh).
10. **Pronósticos `9e9ee7`**: `PronDem = 0` con demanda > 0 = no hubo pronóstico; excluir. Los lotes se publican el día 1 del mes siguiente.
11. `90b78a` / `9a387a` traen la `DemandaUPME` usada en la cobertura contractual.

Datasets útiles y catálogo completo por categoría: `referencia/Diccionario_SIMEM.md` §4–§6 y Anexo A.

---

## 8. SUI (consumo por estrato/uso)

- Reporte `ele_com_096`: mes × departamento × municipio × empresa, consumo [kWh] y suscriptores por estrato 1–6, industrial, comercial, oficial y otros. Desde 2003, incluye regulado y no regulado. Rezago de 1–2 meses; el último mes suele estar incompleto.
- GET directo a `http://reportes.sui.gov.co/fabricaReportes/reporte` con `formatting_chosenformat=CSV` y los parámetros `ele_com_096.agno`, `.periodo` (1–12), `.ubic=4`, `.valor` (1 = suscriptores, 2 = consumo).
- **No automatizar** el portal nuevo `sui.superservicios.gov.co`: tiene CAPTCHA.
- CSV en latin-1 y **sin comillas** en nombres con coma ("BOGOTÁ, D.C."): reconstruir esos campos al parsear.
- El SUI no trae mercado de comercialización: se asigna por el OR incumbente del municipio. SIMEM regulado queda 14–23 % por encima del SUI (pérdidas de distribución); en el Caribe, 33–46 %.

---

## 9. Arquitectura recomendada para una app

Patrón que funcionó en el análisis previo. En este proyecto se aplica con el recorrido `raw` (crudo) → `staging` (normalizado) → `core` (para la app) de la [sección Base de datos](../../index.md):

```
conector (HTTP + reintentos + partición mensual)
   → caché crudo por (fuente, métrica, entidad) en parquet   [bronze]
   → normalización: columna code, formato largo, unidades     [silver]
   → agregados para la app (diario, mensual, por tecnología)  [gold]
```

Función de acceso única, `get_data(metric_id, entity, start, end, filters, force_refresh, refresh_recent=10)`:
1. Si hay caché: leerlo; bajar solo lo anterior al mínimo cacheado y desde `min(fin, max_cache) − refresh_recent` hasta el fin.
2. Concatenar, deduplicar por (`Date`, código) con `keep="last"`, guardar.
3. Si la API falla, devolver el caché con advertencia. Si no hay caché ni API, lanzar error claro.
4. Filtrar al rango pedido.

Para una app web:
- **No llamar a XM desde el navegador**: la API es lenta e inestable. Consultar desde un backend o un job programado que alimente una base o archivos.
- Un job diario basta: XM publica el día anterior con rezago y corrige los días recientes.
- `ListadoRecursos`, `ListadoAgentes`, `ListadoEmbalses` y `ListadoRios` cambian poco: refrescarlos semanalmente y guardar la fecha de la foto.
- Para SIMEM, guardar ya resuelta la versión de liquidación y, si es un dataset por agente o planta, ya agregado (los crudos son decenas de millones de filas).

Ejemplo mínimo en TypeScript (REST directo):

```ts
type XMType = "hourly" | "daily" | "monthly";

async function xm(type: XMType, metricId: string, entity: string,
                  start: string, end: string, filter: string[] = []) {
  const res = await fetch(`https://servapibi.xm.com.co/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ MetricId: metricId, Entity: entity,
                           StartDate: start, EndDate: end, Filter: filter }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) throw new Error(`XM ${res.status}`);
  const json = await res.json();
  const key = { hourly: "HourlyEntities", daily: "DailyEntities", monthly: "MonthlyEntities" }[type];
  return json.Items.flatMap((it: any) =>
    it[key].map((e: any) => ({ date: it.Date, id: e.Id, ...e.Values })));
  // valores como string: convertir con Number(); partir rangos > 31 días por mes
}
```

---

## 10. Convenciones de análisis

- **Régimen hidrológico** por aportes (% de la media histórica): seco < 75 %, normal 75–110 %, húmedo > 110 %. Además de los promedios por grupo, mostrar la serie continua.
- **Proyecciones de demanda UPME**: guardar siempre con su versión (la UPME publica ≥ 2 revisiones al año; p. ej. vintage `2026-07` = "Julio–Agosto 2026"). La serie UPME `SIN+GCE+ME+GD` es más amplia que `DemaCome` y queda por encima.
- Documentar cada variable nueva que se integre: `MetricId`, entidad, tipo, unidad, desde cuándo hay datos, trampas encontradas.
- Antes de concluir algo sobre datos, verificar con una consulta real y decir qué periodo y qué fuente se usó.
