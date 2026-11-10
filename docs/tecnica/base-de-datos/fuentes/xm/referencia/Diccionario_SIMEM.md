# Diccionario de SIMEM (`pydataxm.pydatasimem`)

Referencia para consultar el **Sistema de Información del Mercado de Energía Mayorista (SIMEM)** con la misma librería `pydataxm` que usamos para SINERGOX, qué contiene y en qué se diferencia de SINERGOX.

> **Origen de este documento.** Viene de un análisis previo de la Subdirección de Demanda sobre el SIN (abril a noviembre de 2026). Los nombres de scripts, tablas intermedias («bronze», «silver», «gold») y páginas de tablero que aparecen aquí pertenecían a esa herramienta y **no existen en este repositorio**: se conservan solo como referencia de cómo se procesó cada fuente. En este proyecto los datos siguen el recorrido `raw` → `staging` → `core` (ver [Base de datos](../../../index.md)).

> Catálogo consultado el **2026-10-20**: **399 datasets** (361 públicos, 38 reservados). El catálogo cambia: para refrescarlo, consultar `CatalogSIMEM("Datasets").get_data()` (sección 1).

---

## 1. Uso básico

```python
from pydataxm.pydatasimem import ReadSIMEM, CatalogSIMEM

# Catálogo de datasets (id, nombre, fechas, público/reservado)
cat = CatalogSIMEM("Datasets").get_data()

# Consultar un dataset por ID y rango de fechas
r = ReadSIMEM("EC6945", "2026-01-01", "2026-01-31")   # Precio de bolsa horario
df = r.main()                 # DataFrame
r.get_metadata()              # descripción, periodicidad, granularidad, próxima actualización
r.get_columns()               # diccionario de columnas del dataset
```

En el análisis previo se usó un envoltorio propio que silenciaba la salida de la librería, reintentaba y resolvía las versiones de liquidación (sección 2.1). Este proyecto todavía no carga SIMEM; cuando lo haga, esa lógica irá en su lector y en su ficha de fuente.

- Endpoint: `https://www.simem.co/backend-files/api/PublicData?datasetId=...&startDate=...&endDate=...`. No requiere autenticación.
- **Peticiones de más de un mes en datasets diarios u horarios pueden quedarse colgadas.** Conviene descargar por bloques mensuales, en paralelo y con un timeout de socket de 180 s.
- El campo de fecha usado en el filtro depende del dataset (`Fecha`, `FechaHora`, `FechaInicio`, `FechaProyectada`...). En los datasets de proyecciones, el filtro de fechas aplica sobre la **fecha proyectada**, no sobre la fecha de publicación.


---

## 2. SIMEM frente a SINERGOX

| | SINERGOX (`ReadDB`) | SIMEM (`ReadSIMEM`) |
|---|---|---|
| Unidad de consulta | Métrica + entidad (`DemaReal`, `Sistema`) | Dataset con esquema propio |
| Tamaño | 93 métricas / 193 combinaciones | 399 datasets |
| Enfoque | Operación física del SIN y bolsa | Transparencia del mercado mayorista: contratos, liquidación, planeamiento, calidad |
| Formato | Uniforme (`Values_Hour01..24`, `Value`) | Formato largo; columnas distintas por dataset |
| Horizonte | Solo histórico | Histórico **y proyecciones** (hasta 2028–2031) |
| Historia | Muchas series desde 2000–2010 | Muchas series desde 2021 (algunas desde 2013) |
| Versiones de liquidación | Una sola cifra | Varias por periodo (TX1, TX2, TX3, TXR, TXF) |

**Cuándo usar cada una**
- **SINERGOX**: series históricas largas y uniformes de demanda, generación, precios e hidrología. Sigue siendo la fuente base del pipeline.
- **SIMEM**: pronósticos, planeamiento, contratos, cobertura, usuarios no regulados, eventos y maestros (retiros, heat rate). También sirve para el detalle de demanda por OR, mercado y CIIU en una sola tabla.

### 2.1 Versiones de liquidación

Muchos datasets publican el mismo periodo varias veces, una por cada versión de liquidación:

| Versión | Significado (orden de madurez) |
|---|---|
| `TX1`, `TX2`, ... `TX8` | Liquidaciones sucesivas del mes (el precio de bolsa `EC6945` llega hasta TX8) |
| `TXR` | Reliquidación / revisión |
| `TXF` | Versión final |

`resolve_versions()` deja una fila por clave usando el orden **TXF > TXR > TXn (mayor n primero) > ... > TX1**. **Si no se resuelven las versiones, las sumas quedan duplicadas** (×3 o ×4).

---

## 3. ¿Tiene SIMEM más detalle de la demanda?

**Respuesta corta:** tiene más detalle **territorial** y **contractual** que SINERGOX, pero **no** separa la demanda en residencial, comercial e industrial, ni por estrato.

| Dimensión | ¿Está en SIMEM? | Dataset | Nota |
|---|---|---|---|
| **Sector económico (CIIU)** | Parcial | `9b0967` | 21 secciones CIIU (industria, minería, comercio...). **Solo para el mercado no regulado.** El regulado (~69 % de la demanda, 2019–2026) llega como `SIN CLASIFICAR` |
| **Residencial / comercial / estrato** | **No** | — | Esa información está en el SUI (Superservicios), no en el mercado mayorista. **Cómo se cruzó en el análisis previo: ver [3.1](#31-desagregación-del-regulado-con-el-sui-superservicios)** |
| **Regulado / no regulado** | Sí | `9b0967`, `14fabb`, `d55202` | Horario (14fabb/d55202) y diario por mercado (9b0967) |
| **Mercado de comercialización** (~29, aprox. departamentos) | Sí | `9b0967`, `f73ff2` | Demanda real, pérdidas y fronteras UNR por mercado |
| **Operador de Red** (27 OR) | Sí | `9b0967` | Código SIC del OR |
| **Comercializador** (agente) | Sí | `14fabb`, `d55202`, `22e6e3` | Horario por agente y tipo de mercado |
| **Sistema de Transmisión Regional** (STR01 / STR02) | Sí | `38FF5B` | Horario por agente, mercado y STR |
| **Área / subárea operativa** | Solo pronósticos y eventos | `d91840`, `63d90d`, `3C77AF` | La demanda **real** no se publica por área en SIMEM |
| **Mercado de comercialización operativo** (45 MC, incluye grandes consumidores como Drummond, Cerromatoso, Rubiales) | Pronóstico y atendida | `9e9ee7`, `6f94cf` | Horario: pronóstico y demanda atendida |
| **Usuarios no regulados por tamaño y tensión** | Sí (conteos) | `fad372`, `f73ff2` | Número de fronteras, no energía |
| **Municipio / departamento exacto** | No | — | El "mercado de comercialización" es lo más cercano |

**Ejemplo (1–3 ago 2026, 9b0967):** 714 GWh de demanda real. El regulado suma 513 GWh y está 100 % sin clasificar. El no regulado suma 201 GWh: Industria manufacturera 73 GWh, Minas y canteras 66, Comercio 11, Agro 8, Agua y saneamiento 8, Administración pública 6.5...

**Para separar residencial y comercial:** cruzar con el SUI (consumo facturado por uso y estrato, por empresa) usando el mercado de comercialización u OR como llave común.

### 3.1 Desagregación del regulado con el SUI (Superservicios)

**Fuente.** Reporte `ele_com_096` "Consolidado Energía por Empresa, Departamento y Municipio" de la fábrica de reportes del SUI: `http://reportes.sui.gov.co/fabricaReportes/frameSet.jsp?idreporte=ele_com_096`.
- **Contenido:** por mes × departamento × municipio × empresa (comercializador), consumo facturado [kWh] y suscriptores en **Estrato 1–6, Industrial, Comercial, Oficial y Otros** (alumbrado, provisional, especiales, áreas comunes). Hay más variables en el mismo reporte (valor facturado, tarifa media, factura promedio).
- **Cobertura:** 2003 → presente, mensual. El análisis previo descargó desde 2019 (igual que `9b0967`). Rezago ~1–2 meses; el último mes suele estar incompleto.
- **Descarga:** el portal nuevo `sui.superservicios.gov.co` tiene un CAPTCHA (Imperva), pero el motor de reportes heredado acepta un GET directo a `/fabricaReportes/reporte` con `formatting_chosenformat=CSV` y los parámetros `ele_com_096.agno`, `.periodo` (1–12), `.ubic=4` (total), `.valor` (1 = suscriptores, 2 = consumo). El CSV viene en latin-1 y **no entrecomilla** nombres con coma ("BOGOTÁ, D.C."); el parser los reconstruye.
- **Incluye regulados y no regulados:** el reporte no tiene filtro de tipo de mercado. El reporte que sí lo tiene por mercado (`ele_com_106`) solo llega a 2010. Los datos abiertos de Superservicios en datos.gov.co (`gw2d-7n7y`, `ebby-cjha`, `iirc-i7tb`, `bnkp-xdb7`) son microdatos por factura con cobertura parcial; no sirven para totales.

**Procesamiento en el análisis previo** (no existe en este repositorio): un archivo por año y dos capas de tablas:

| Capa | Tabla | Contenido |
|---|---|---|
| Silver | `sui_mapeo_mercado` | año × departamento × municipio → OR incumbente → mercado de comercialización SIMEM, con la regla usada |
| Silver | `sui_consumo_uso_mensual` | mes × municipio × empresa × uso: `consumo_kwh`, `suscriptores`, `mercado`, `grupo` (Residencial/No residencial), `mes_completo` |
| Gold | `sui_regulado_uso_mercado` | mes × mercado × uso: `sui_gwh`, `nr_simem_gwh` (no regulado de `9b0967` asignado al uso), `regulado_est_gwh`, `suscriptores` |
| Gold | `sui_vs_simem_mercado` | mes × mercado: totales SUI (residencial, no residencial, regulado estimado) frente a la demanda real regulada y no regulada de SIMEM |

**Mapeo al mercado de SIMEM.** El SUI no trae el mercado de comercialización. Cada municipio se asigna al mercado del **OR incumbente**: el comercializador integrado con un OR que más consumo residencial factura allí. Las reglas empresa → mercado están en `OR_MERCADO` (p. ej. Air-e → CARIBE SOL, Caribemar → CARIBE MAR, Electricaribe → COSTA CARIBE hasta 2020, Celsia → TOLIMA o VALLE DEL CAUCA según el departamento, EEP → PEREIRA o CARTAGO). El residencial de los OR pequeños que comparten municipio (Ruitoque, Cartago, Tuluá, Puracé, Sibundoy, Bajo Putumayo) va a su propio mercado. Si en un año el OR no reportó (Arauca 2026), se usa el mercado habitual del departamento.

**Regulado estimado.** Residencial completo (no hay residenciales no regulados) + no residencial del SUI menos el no regulado de SIMEM del mismo mercado y mes, con este mapeo CIIU → uso: minas, manufactura, agro, construcción, electricidad/gas y agua/saneamiento → Industrial; administración pública → Oficial; el resto → Comercial. El resultado se recorta en cero.

**Control: totales SUI vs SIMEM** (meses con reporte SUI completo; 2022 sin junio, 2026 ene–ago)

| Año | SUI residencial | SUI no residencial | Regulado estimado | Regulado SIMEM | SIMEM − SUI | SUI total / SIMEM total |
|---|---|---|---|---|---|---|
| 2019 | 23.586 GWh | 32.433 | 36.980 | 48.405 | 23,6 % | 79 % |
| 2022 | 24.646 | 33.057 | 38.769 | 46.410 | 16,5 % | 84 % |
| 2023 | 27.968 | 39.957 | 45.603 | 53.198 | 14,3 % | 87 % |
| 2024 | 26.503 | 41.241 | 45.976 | 55.751 | 17,5 % | 84 % |
| 2025 | 26.683 | 39.392 | 43.709 | 56.635 | 22,8 % | 80 % |

- La brecha de 14–23 % es esperable: SIMEM mide en la frontera del mercado e **incluye las pérdidas de distribución**, y el SUI es consumo facturado al usuario. Por mercado: Bogotá-Cundinamarca y Cali ~12 %, Antioquia ~15 %, Caribe Mar ~33 %, Caribe Sol ~46 % (2025). Esto concuerda con el nivel de pérdidas conocido de cada región.
- **Composición del regulado 2025 (SIN):** residencial 61 % (estrato 1: 18,7 %, estrato 2: 19,3 %, estrato 3: 12,8 %, estratos 4–6: 10,3 %), comercial 22,6 %, industrial 8,0 %, oficial 5,0 %, otros 3,3 %.

**Advertencias**
- El **industrial regulado** es un residuo (SUI industrial ≈ no regulado industrial de SIMEM). Es la cifra menos estable: 13 % en 2024 y 8 % en 2025. En Meta y Arauca queda inflado, porque parte del consumo petrolero que el SUI factura en esos municipios aparece en SIMEM en otro mercado. En Boyacá ocurre lo contrario: SIMEM registra más no regulado que el no residencial del SUI.
- Huecos de reporte al SUI: Afinia (Caribe Mar) 2026 reporta poco consumo residencial; Arauca y Valle de Sibundoy no reportaron en 2026; CHEC (Caldas) tiene un salto residencial en 2020–2021. Los meses marcados `mes_completo = False` (suscriptores < 95 % de la mediana de los 6 meses previos) se excluyen de las tablas gold.
- El SUI usa el **periodo de facturación**, no el mes calendario. Las comparaciones mensuales tienen ruido; las anuales son más confiables.
- Puerto Colombia (Guainía) aparece con consumo de Enel (~3 GWh/año) sin mercado asignado. Probablemente es un error de código DANE (Puerto Colombia, Atlántico).


---

## 4. Categorías del catálogo

| Categoría | # datasets | Lo más relevante |
|---|---|---|
| Demanda y pronósticos | 33 | Demanda por OR/MC/CIIU, pronósticos oficiales y del CND por área/subárea/MC, pérdidas, DNA, fronteras UNR |
| Planeamiento energético (MP/LP) | 29 | Corridas del CND: demanda, generación, aportes, costo marginal, déficit, reservas, vertimientos, importaciones, VERE/VEREC (hasta 2028/2031) |
| Contratos y mercado bilateral | 91 | Precios y cantidades por comprador/vendedor, SICEP, UNR, precios futuros, cobertura frente a la demanda UPME, subastas MME, Derivex |
| Generación, disponibilidad y despacho | 77 | Generación real/ideal/programada, disponibilidad, AGC, banderas de arranque y parada, heat rate, listado y retiro de unidades |
| Precios y bolsa | 37 | Precio de bolsa (nacional, internacional, TIE), costos marginales, precios de oferta, TRM |
| Liquidación, garantías y cargos | 38 | Restricciones, reconciliaciones, garantías, FAZNI, FAER, FOES, PRONE, cargos ASIC/CND |
| Programa de ahorro de consumo (2026) | 26 | Metas, consumo excedente, usuarios con ahorro (todos **reservados**) |
| Red, transmisión y calidad | 22 | Eventos en líneas y activos, frecuencia, tensión, cargos STN/SDL, Estatuto de Riesgo de Desabastecimiento |
| Cargo por confiabilidad | 21 | OEF, energía firme, precios de escasez, subastas de reconfiguración, pruebas de disponibilidad |
| Hidrología y embalses | 21 | Aportes y reservas por embalse y región, vertimientos, meteorología en plantas solares y eólicas |
| Otros | 4 | Administración de SIMEM |

El listado completo está en el [Anexo A](#anexo-a-catálogo-completo-por-categoría).

---

## 5. Datasets trabajados en el análisis previo

En el análisis previo cada dataset se descargó a un archivo y se procesó a tablas intermedias y finales. Los nombres de esas tablas se conservan como referencia; no existen en este repositorio.

### 5.1 Exclusivos de SIMEM

| Tema | ID | Dataset | Tabla en el análisis previo | Columnas clave |
|---|---|---|---|---|
| Demanda detallada | `9b0967` | Demanda real y pérdidas por OR, MC, tipo de mercado y CIIU (diario, desde 2019) | `simem_demanda_ciiu_mensual` | `Fecha, CodigoSICAgente, TipoMercado, MercadoComercializacion, ClasificacionIndustrial, CodigoVariable (DdaReal/PerdidasEnergia), Valor [kWh]` |
| Pronósticos | `9e9ee7` | Pronóstico y demanda atendida por MC operativo (horario, desde oct-2023) | `simem_pronostico_diario` | `Fecha, Periodo, MercadoComercializacionOperativo, DemandaAtendida, PronDem [kWh]` |
| Calidad del suministro | `3C77AF` | Eventos de demanda no atendida | `simem_eventos_dna` | `IdentificadorSuceso, FechaHoraInicio/Fin, OrigenEvento, EnergiaNoAtendida [kWh], DescripcionEvento, CodigoSubAreaOperativa` |
| | `a859bf` | Eventos de frecuencia | `simem_eventos_frecuencia` | `TipoEventoFrecuencia (Lento/Transitorio), ValorFrecuencia` |
| | `ebc2d1` | Condición del sistema según el Estatuto de Riesgo de Desabastecimiento | `simem_condicion_erd` | `Fecha, ResultadoEvaluacionEstatuto` |
| Usuarios no regulados | `fad372` | Fronteras UNR por nivel de consumo (mensual) | `simem_fronteras_unr_consumo` | `NivelConsumo, CantidadFronterasUNR` |
| | `f73ff2` | Fronteras UNR por nivel de tensión y mercado | `simem_fronteras_unr_tension` | `MercadoComercializacion, NivelTension, CantidadFronterasUNR` |
| | `5f8082` | Precios promedio de contratos con UNR (SIN) | `simem_contratos_unr` | `Componente (G, C, C+G), PPP, PPS` |
| Planeamiento CND | `682a0b` | Demanda energética largo plazo (mensual, por área, por vintage) | `simem_planeamiento_demanda` | `FechaPublicacion, FechaInicio, Caso (Coordinado/Autonomo), CodigoAreaOperativa, DemandaSIN [kWh/día promedio]` |
| | `596c1c` | Demanda energética mediano plazo (semanal) | `simem_planeamiento_demanda` | `FechaPublicacion, FechaInicio, CodigoAreaOperativa, DemandaSIN [kWh/día promedio]` |
| | `ef0522` | Costo marginal largo plazo (promedio, P5, P95) | `simem_planeamiento_cmg` | `Caso, NombreCaso, CostoMarginal [USD/kWh]` |
| Contratos | `bb4a0a` | Precios y estadísticas mensuales de contratos entre agentes | `simem_contratos_precios` | `PrecioMinimo, Percentil5, PPP, PPS, Mediana, Percentil95, PrecioMaximo, TotalContratos` |
| | `178428` | Precios futuros de contratos entre agentes | `simem_contratos_futuros` | `FechaPublicacion, FechaProyectada, PPP...` |
| | `90b78a` / `9a387a` | Cobertura contractual estimada (entre agentes / SICEP regulado) **frente a la demanda UPME** | `simem_contratos_cobertura` | `FechaPublicacionCttos, FechaProyectada, Energia contratada, DemandaUPME [GWh], Prcj cobertura` |
| Oferta | `1c91c4` + `670221` | Fechas de retiro y listado de unidades | `simem_unidades_retiro` | `CodigoUnidadGeneracion, FechaRetiro, EsTemporal, NombreUnidad, TipoGeneracion` |
| | `8ae7da` | Combustible y heat rate declarado de térmicas | `simem_heat_rate` | `CodigoPlanta, TipoCombustible, CapEfectivaNeta [kW], HeatRate` |
| (catálogos) | `10F2C9` / `841808` | Listados de subáreas y áreas operativas | — | `CodigoSubAreaOperativa → NombreSubareaOperativa` |

### 5.2 Comunes con SINERGOX

Tabla de comparación en el análisis previo: `simem_vs_sinergox_diario` (`fecha, variable, simem, sinergox, diferencia, diferencia_pct`).

| Variable | SIMEM | SINERGOX | Cómo se compara |
|---|---|---|---|
| Demanda real | `14fabb` (horario por agente) | `DemaReal/Sistema` | Suma diaria [GWh] |
| Demanda comercial | `d55202` (horario por agente) | `DemaCome/Sistema` | Suma diaria [GWh] |
| Generación real | `055A4D` (horario por planta) | `Gene/Sistema` | Suma diaria [GWh] |
| Precio de bolsa nacional | `EC6945` (`PB_Nal`) | `PrecBolsNaci/Sistema` | Promedio simple de 24 h [COP/kWh] |
| Precio de escasez ponderado | `43D616` | `PrecEscaPon/Sistema` | Valor diario [COP/kWh] |
| Aportes hídricos | `BA1C55` (`AGREGADO_SIN`) | `AporEner/Sistema` | Diario [GWh] |
| Reservas (volumen útil) | `B0E933` (`AGREGADO_SIN`) | `VoluUtilDiarEner/Sistema` | Diario [GWh] |
| Capacidad efectiva neta | `FADED0` (por planta, `ExplotacionComercial = SI`) | `CapEfecNeta/Recurso` (suma) | Total diario [MW] |

Los datasets horarios por agente o planta (`14fabb`, `d55202`, `055A4D`, `FADED0`) se guardaron **ya agregados al total del sistema** y con la versión resuelta, porque crudos ocupan decenas de millones de filas.

### 5.3 Resultados de la comparación (corrida del 2026-10-20)

| Variable | Periodo | Días | Dif. media | Días con \|dif\| ≤ 0,1 % | Veredicto | Explicación |
|---|---|---|---|---|---|---|
| Generación real | jul-2025 → sep-2026 | 442 | 0,00 % | 99,3 % | **Coinciden** | — |
| Reservas hídricas (vol. útil) | 2020 → sep-2026 | 2.452 | -0,04 % | 97,1 % | **Coinciden** | — |
| Precio de escasez ponderado | 2021 → sep-2026 | 2.099 | -0,15 % | 97,9 % | Diferencias menores | Comparar con `PrecEscaPon`. `PrecEsca` (precio de escasez original) es otro concepto, ~25 % menor |
| Precio de bolsa nacional | 2020 → sep-2026 | 2.450 | +0,06 % | 72,9 % | Diferencias menores | Algunos días con reliquidaciones de precio (máximo 190 %) |
| Capacidad efectiva neta | 2024 → sep-2026 | 990 | -0,32 % | 12,8 % | Diferencias menores | Solo con `ExplotacionComercial = SI`; sumando todas las plantas, SIMEM queda ~4 % arriba. La brecha crece en 2026 (-1 %) |
| Aportes hídricos SIN | 2020 → sep-2026 | 2.452 | -1,32 % | 45,9 % | Difieren (2020–2022) | Coinciden desde 2023. En 2020–2022 SIMEM queda 2–5 % por debajo |
| Demanda real | 2024 → sep-2026 | 987 | -1,47 % (mediana -0,65 %) | 0 % | **Difieren** | Diferencia de definición, ver abajo |
| Demanda comercial | 2024 → sep-2026 | 987 | -1,46 % | 0 % | **Difieren** | Igual que la demanda real |

**Demanda: SIMEM ≠ SINERGOX por definición**
- `14fabb` (SIMEM) = generación real − pérdidas del STN, por agente. `DemaReal` (SINERGOX) = demanda de usuarios regulados y no regulados medida en fronteras, sin alumbrado público.
- La generación sí coincide entre fuentes. Además, `9b0967` y `14fabb` dan exactamente el mismo total mensual. La brecha no es un error de descarga.
- SIMEM queda ~0,65 % por debajo (mediana). La brecha es mayor al mediodía (~1 % entre 9 y 12 h) y llega a -3 / -6 % en días de baja demanda, en especial en 2024 y en dic-2025/ene-2026.
- Hipótesis, no verificada: SINERGOX incluye consumo cubierto con energía que no se registra como generación real del SIN (autogeneración / GD).
- `DemaSIN` (SINERGOX) queda ~2 % por encima de `14fabb`.
- **Implicación:** para series de demanda del SIN se sigue usando SINERGOX (`DemaReal`/`DemaCome`). SIMEM se usa para las participaciones y desagregaciones (OR, mercado, CIIU, regulado/no regulado), no para el nivel absoluto.


### 5.4 Notas de procesamiento

- **`9b0967`:** las pérdidas (`PerdidasEnergia`) son las del **STN asignadas a la demanda** (~1,6 %, casi uniforme por mercado), no las pérdidas de distribución. Se publica con ~40 días de rezago.
- **Pronósticos `9e9ee7`:** un `PronDem = 0` con demanda > 0 significa que no hubo pronóstico publicado. Esas horas se excluyen. `MC-SIN` solo tiene pronóstico desde jul-2026, así que el SIN se reconstruye como suma horaria de los mercados. Resultado: WAPE horario del SIN de **1,75 %** y sesgo de **+0,6 %** (sobre-pronóstico) entre oct-2023 y sep-2026.
- **Planeamiento `682a0b` / `596c1c`:** `DemandaSIN` es la **demanda diaria promedio de la etapa [kWh/día]**, no la energía de la etapa. La energía mensual o semanal se obtiene multiplicando por los días. El área `Are0010` ("Area SIN") es el total del sistema. Hay una vintage por publicación: 39 de largo plazo y 155 de mediano plazo entre 2023 y 2026.
- **Costo marginal `ef0522`:** viene en **USD/kWh** (se convierte a USD/MWh). P5 ≈ 0. El P95 llega a ~1.900 USD/MWh, frente a un promedio de ~42 USD/MWh.
- **Heat rate `8ae7da`:** hay valores de 0 o 0,0001; los menores de 3 MBTU/MWh se tratan como no válidos.
- **Generación `055A4D`:** ~1,8 millones de filas por mes. Se descarga en bloques **semanales**, porque los mensuales fallan.

---

## 6. Otros datasets de interés no integrados aún

| ID | Dataset | Para qué |
|---|---|---|
| `4d0f92`, `63d90d`, `d91840` | Pronóstico oficial por MC, subárea y área | Pronóstico desagregado territorialmente |
| `68300e`, `de5ea2`, `a016ba` | Pronóstico del CND por MC, subárea y área | Comparar pronóstico CND frente al oficial |
| `6f94cf` | Estadísticas de pronóstico y atendida por periodo horario y MC | Error de pronóstico por hora del día |
| `38FF5B` | Demandas agrupadas por STR | Demanda por STR y comercializador |
| `22e6e3`, `208b88` | Pérdidas de energía | Pérdidas horarias por agente |
| `8750f9`, `75f675`, `270ba7`, `760616` | Generación, aportes, reservas y déficit de largo plazo | Escenarios de suficiencia del CND |
| `06b8bc`, `8d3ccd`, `f62164` | Proyección de corto plazo de balance, embalse y reserva caliente | Seguimiento coyuntural |
| `f776db`, `58d1c7`, `8d10e6` | Proyecciones de cantidades y precios de contratos por comprador/vendedor | Posición contractual futura |
| `7e704d`, `42f98c` | Meteorología local en plantas solares y eólicas | Recurso renovable |
| `da2a88` | Cobertura de la demanda de UNR | Exposición a bolsa de los no regulados |

---

## Anexo A. Catálogo completo por categoría

Clasificación automática por palabras clave del nombre (`tipoPublicacion = Reservado` normalmente no se puede descargar).

### Programa de ahorro de consumo (2026) (26)

| ID | Dataset | Datos desde | Hasta | Acceso |
|---|---|---|---|---|
| `c5cac9` | Ciclo No facturado dentro del periodo de reporte | 2026-09-30 | 2026-10-07 | **Reservado** |
| `54b256` | Cobro adicional facturado | 2026-09-25 | 2026-10-16 | **Reservado** |
| `aa4751` | Cobro efectivamente recaudado en el periodo | 2026-09-25 | 2026-10-16 | **Reservado** |
| `7cdb67` | Consumo Ahorrado Reconocido Promedio Diario | 2026-09-25 | 2026-10-16 | **Reservado** |
| `bcda88` | Consumo Ahorrado Reconocido Total | 2026-09-25 | 2026-10-16 | **Reservado** |
| `397191` | Consumo Facturado Agregado | 2026-09-25 | 2026-10-16 | **Reservado** |
| `a817f9` | Consumo Facturado Promedio | 2026-09-25 | 2026-10-16 | **Reservado** |
| `af7aaf` | Consumo Promedio Diario de Usuarios con ahorro reconocido | 2026-09-25 | 2026-10-16 | **Reservado** |
| `f0d4be` | Consumo Promedio de Usuarios con consumo dentro de la banda neutral | 2026-09-25 | 2026-10-16 | **Reservado** |
| `908b23` | Consumo Promedio de Usuarios con consumo excedente objeto de cobro | 2026-09-25 | 2026-10-16 | **Reservado** |
| `e17a7b` | Consumo Total de Usuarios con ahorro reconocido | 2026-09-25 | 2026-10-16 | **Reservado** |
| `a7f0b7` | Consumo Total de Usuarios con consumo dentro de la banda neutral | 2026-09-25 | 2026-10-16 | **Reservado** |
| `6cd475` | Consumo Total de Usuarios con consumo excedente objeto de cobro | 2026-09-25 | 2026-10-16 | **Reservado** |
| `35d2ac` | Consumo excedente objeto de cobro Promedio Diario | 2026-09-25 | 2026-10-16 | **Reservado** |
| `06d09c` | Consumo excedente objeto de cobro total | 2026-09-25 | 2026-10-16 | **Reservado** |
| `c06d46` | Meta Agregada de Consumo | 2026-09-25 | 2026-10-16 | **Reservado** |
| `307a23` | Meta Agregada de Consumo Promedio | 2026-09-25 | 2026-10-16 | **Reservado** |
| `78185d` | Meta Diaria de Consumo Agregada Inicial | 2026-09-29 | 2026-10-07 | **Reservado** |
| `59d2ef` | Número de Usuarios Incluidos en el programa | 2026-09-25 | 2026-10-16 | **Reservado** |
| `6988b9` | Número de Usuarios No Incluidos en el programa | 2026-09-25 | 2026-10-16 | **Reservado** |
| `28ad09` | Número de Usuarios Oficiales en el reporte | 2026-09-25 | 2026-10-16 | **Reservado** |
| `0da92e` | Número de Usuarios con ahorro reconocido | 2026-09-25 | 2026-10-16 | **Reservado** |
| `c6a888` | Número de Usuarios con consumo dentro de la banda neutral | 2026-09-25 | 2026-10-16 | **Reservado** |
| `ff7320` | Número de Usuarios con consumo excedente objeto de cobro | 2026-09-25 | 2026-10-16 | **Reservado** |
| `915ce2` | Número de Usuarios no Incluidos en el programa por efecto del sismo ocurrido el 10 de agosto de 2026 | 2026-09-25 | 2026-10-16 | **Reservado** |
| `48eb33` | Valor acumulado bolsa de recursos a la fecha | 2026-09-25 | 2026-10-16 | **Reservado** |

### Planeamiento energético (MP/LP) (29)

| ID | Dataset | Datos desde | Hasta | Acceso |
|---|---|---|---|---|
| `75f675` | Aportes Energético Largo Plazo | 2022-01-01 | 2031-09-01 | Público |
| `1eee63` | Aportes Energético Mediano Plazo | 2022-01-03 | 2028-10-09 | Público |
| `0bf1d9` | Consumo de Combustible Energético Largo Plazo | 2022-01-01 | 2031-09-01 | Público |
| `0837f0` | Consumo de Combustible Energético Mediano Plazo | 2022-01-03 | 2028-10-09 | Público |
| `ef0522` | Costos Marginales Energético Largo Plazo | 2022-01-01 | 2031-09-01 | Público |
| `82ae92` | Costos Marginales Energético Mediano Plazo | 2022-01-03 | 2028-10-09 | Público |
| `682a0b` | Demanda Energético Largo Plazo | 2022-01-01 | 2031-09-01 | Público |
| `596c1c` | Demanda Energético Mediano Plazo | 2022-01-03 | 2028-10-09 | Público |
| `760616` | Déficit Energético Largo Plazo | 2022-01-01 | 2031-09-01 | Público |
| `f63b8b` | Déficit Energético Mediano Plazo | 2022-01-03 | 2028-10-09 | Público |
| `8750f9` | Generación Energético Largo Plazo | 2022-01-01 | 2031-09-01 | Público |
| `6781a0` | Generación Energético Mediano Plazo | 2022-01-03 | 2028-10-09 | Público |
| `d4049a` | Importaciones Netas Energético Largo Plazo | 2022-01-01 | 2031-09-01 | Público |
| `1088a6` | Importaciones Netas Energético Mediano Plazo | 2022-01-03 | 2028-10-09 | Público |
| `09a70a` | Indices VERE y VEREC Energético Largo Plazo | 2022-01-01 | 2031-09-01 | Público |
| `7a2e85` | Indices VERE y VEREC Energético Mediano Plazo | 2022-01-03 | 2028-09-25 | Público |
| `245775` | Informe de planeamiento operativo eléctrico de mediano y largo plazo (IPOEL) | 2026-01-01 | 2026-07-01 | Público |
| `51407A` | Informe semestral de planeamiento operativo eléctrico de largo plazo (IPOELP) | 2022-01-01 | 2025-07-01 | Público |
| `caeff0` | Informe trimestral de planeamiento operativo eléctrico de mediano plazo (IPOEMP) | 2022-01-01 | 2025-10-01 | Público |
| `06b8bc` | Proyección de balance energético de corto plazo | 2024-08-26 | 2026-10-25 | Público |
| `8d3ccd` | Proyección de embalse agregado de corto plazo | 2024-08-26 | 2026-10-25 | Público |
| `f62164` | Proyección de reserva caliente de corto plazo | 2024-08-26 | 2026-10-25 | Público |
| `270ba7` | Reservas de Energía Energético Largo Plazo | 2022-01-31 | 2031-09-30 | Público |
| `eb6857` | Reservas de Energía Energético Mediano Plazo | 2022-01-09 | 2028-10-15 | Público |
| `561aa8` | Reservas en Porcentaje Energético Largo Plazo | 2022-01-31 | 2031-08-31 | Público |
| `509acf` | Reservas en Porcentaje Energético Mediano Plazo | 2022-01-09 | 2028-10-15 | Público |
| `11298b` | Senda de referencia | 2026-01-01 | 2026-11-30 | Público |
| `6a7864` | Vertimientos Energético Largo Plazo | 2022-01-01 | 2031-09-01 | Público |
| `e2f117` | Vertimientos Energético Mediano Plazo | 2022-01-03 | 2028-10-09 | Público |

### Demanda y pronósticos (33)

| ID | Dataset | Datos desde | Hasta | Acceso |
|---|---|---|---|---|
| `81fd6b` | Actuación del Esquema de Deslastre Automático de Carga (EDAC) | 2013-05-31 | 2023-11-25 | Público |
| `2C6C29` | Acumulado anual de los calce u operaciones de las órdenes de demanda en Convocatorias | 2023-08-01 | 2026-08-01 | Público |
| `DE416B` | Calce u operaciones de las órdenes de demanda en Convocatorias de Participación en Subasta de Cierre | 2023-07-01 | 2026-09-01 | Público |
| `fad372` | Cantidad de fronteras de UNR por nivel de consumo | 2013-01-01 | 2026-09-01 | Público |
| `f73ff2` | Cantidad de fronteras de UNR por nivel de tensión | 2013-01-01 | 2026-09-01 | Público |
| `da2a88` | Cobertura de la demanda de UNR | 2023-08-01 | 2031-09-01 | Público |
| `c10ec7` | Cobertura de la demanda de contratos realizados fuera del SICEP | 2023-09-01 | 2031-09-01 | Público |
| `0fa2ac` | Datos soporte del proceso de Demandas por Recurso, versión y horaria | 2013-01-01 | 2026-02-27 | Público |
| `9b0967` | Demanda Real y Perdidas por Operador de Red, Mercado de comercialización, Tipo de mercado y CIIU | 2019-01-01 | 2026-10-14 | Público |
| `31E0AF` | Demanda comercial internacional | 2021-01-01 | 2026-10-16 | Público |
| `d55202` | Demanda comercial nacional | 2021-01-01 | 2026-10-14 | Público |
| `14fabb` | Demanda real nacional | 2021-01-01 | 2026-10-14 | Público |
| `38FF5B` | Demandas agrupadas por Sistema de Transmisión Regional | 2021-01-01 | 2026-10-16 | Público |
| `c0e18d` | Estado de cobertura contractual de las fronteras del MNR durante los períodos de representación de los agentes | 2026-07-30 | 2026-10-19 | **Reservado** |
| `F3A83B` | Estadísticas de contratos de Demanda Desconectable Voluntaria (DDV) | 2022-12-01 | 2026-11-01 | Público |
| `6f94cf` | Estadísticas de los pronósticos de energía horaria y demanda de energía atendida horaria por periodo y por mercado de comercialización | 2021-01-01 | 2026-09-01 | Público |
| `fe1a54` | Estudio Esquema de Desconexión Automático de Carga EDAC | 2022-01-01 | 2026-01-01 | Público |
| `3C77AF` | Eventos de Demanda No Atendida | 2013-01-02 | 2026-10-16 | Público |
| `8d3f47` | Generación ideal flexible para demanda no domestica Venezuela | 2021-01-01 | 2026-10-16 | Público |
| `b94b3c` | Limitación de suministro en bolsa según la Res. CREG 001 de 2003 | 2013-02-15 | 2026-09-11 | Público |
| `315976` | Limitación de suministros a usuarios finales según la Res. CREG 116 de 1998 | 2013-01-17 | 2026-09-11 | Público |
| `9e9ee7` | Pronóstico de demanda de energía y demanda atendida por mercado de comercialización | 2021-01-01 | 2026-09-30 | Público |
| `68300e` | Pronóstico del CND de demanda por mercado de comercialización | 2013-01-01 | 2026-09-30 | Público |
| `de5ea2` | Pronóstico del CND de demanda por subárea operativa | 2020-11-01 | 2026-09-30 | Público |
| `a016ba` | Pronóstico del CND de demanda por Área operativa | 2020-11-01 | 2026-09-30 | Público |
| `4d0f92` | Pronóstico oficial de demanda por mercado de comercialización | 2022-01-01 | 2026-09-30 | Público |
| `63d90d` | Pronóstico oficial de demanda por subárea operativa | 2019-01-01 | 2026-09-30 | Público |
| `d91840` | Pronóstico oficial de demanda por Área operativa | 2019-01-01 | 2026-09-30 | Público |
| `d0d746` | Pérdidas Energía Asignadas Agente | 2013-01-01 | 2026-09-01 | Público |
| `208b88` | Pérdidas Totales | 2026-01-01 | 2026-10-14 | Público |
| `22e6e3` | Pérdidas de energía | 2021-01-01 | 2026-10-14 | Público |
| `BC6689` | Respuesta de la demanda verificada del sistema | 2016-03-21 | 2017-02-01 | Público |
| `00C31F` | Restricciones a cargo de la demanda | 2021-01-01 | 2026-10-14 | Público |

### Hidrología y embalses (21)

| ID | Dataset | Datos desde | Hasta | Acceso |
|---|---|---|---|---|
| `02B289` | Aportes Hídricos en Caudal | 2013-01-01 | 2026-10-18 | Público |
| `f138b6` | Aportes Hídricos en Caudal del Informe Diario | 2013-01-01 | 2026-10-18 | Público |
| `BA1C55` | Aportes Hídricos en Energía | 2013-01-01 | 2026-10-18 | Público |
| `2bff14` | Aportes Hídricos en Energía del Informe Diario de Operación | 2013-01-01 | 2026-10-18 | Público |
| `34FFDA` | Aportes Hídricos en Porcentaje | 2013-01-01 | 2026-10-18 | Público |
| `ec8596` | Aportes Hídricos en Porcentaje del Informe Diario | 2013-01-01 | 2026-10-18 | Público |
| `A0CF2A` | Listado de Embalses que sirven al Sistema Interconectado Nacional | 2023-11-06 | 2026-10-18 | Público |
| `cc59b1` | Listado de series hidrológicas | 2024-06-27 | 2026-10-18 | Público |
| `42f98c` | Meteorología local en Plantas Eólicas | 2023-06-15 | 2026-01-07 | Público |
| `7e704d` | Meteorología local en Plantas Solares | 2022-01-02 | 2026-10-18 | Público |
| `658DAE` | Nivel de Probabilidad de Vertimiento | 2021-01-01 | 2026-10-15 | Público |
| `BD26DC` | Nivel de embalse declarado por el agente diariamente | 2021-01-01 | 2026-10-15 | Público |
| `7AEE6F` | Nivel embalse reportado menos compromisos EVE embalsados por planta | 2021-01-01 | 2026-10-15 | Público |
| `c51127` | Reservas Hidráulicas Energía del Informe Diario de Operación | 2013-01-01 | 2026-10-18 | Público |
| `B0E933` | Reservas Hidráulicas en Energía | 2013-01-01 | 2026-10-18 | Público |
| `138ED1` | Reservas Hidráulicas en Masa | 2013-01-01 | 2026-10-18 | Público |
| `9605b0` | Reservas Hidráulicas en Masa del Informe Diario de Operación | 2013-01-01 | 2026-10-18 | Público |
| `843497` | Reservas Hidráulicas en Porcentaje | 2013-01-01 | 2026-10-18 | Público |
| `1d3ef8` | Reservas Hidráulicas en Porcentaje del Informe Diario de Operación | 2013-01-01 | 2026-10-18 | Público |
| `AECA28` | Vertimientos hídricos | 2013-01-01 | 2026-10-18 | Público |
| `1445AC` | Volumen Descargado por tipo de Descarga | 2013-01-01 | 2026-10-18 | Público |

### Contratos y mercado bilateral (91)

| ID | Dataset | Datos desde | Hasta | Acceso |
|---|---|---|---|---|
| `6A36D0` | Acumulado anual de los calce u operaciones de las órdenes de oferta en Convocatorias | 2023-08-01 | 2026-09-01 | Público |
| `a38a5c` | Agentes MEM inscritos en el mecanismo Derivex | 2023-08-31 | 2026-09-30 | Público |
| `11093A` | Calce u operaciones de las órdenes de oferta en Convocatorias de Participación en Subasta de Cierre | 2023-07-01 | 2026-09-01 | Público |
| `C8381F` | Cantidad de compra despachada en contratos de largo plazo en kWh | 2021-01-01 | 2026-10-14 | Público |
| `EEDA4A` | Cantidad ventas en contratos del SICEP | 2021-01-01 | 2026-10-14 | Público |
| `42d664` | Cantidades de energía por comercializador de contratos adjudicados en subastas del Ministerio (MME) | 2022-01-01 | 2026-09-01 | Público |
| `f21bd1` | Cantidades horarias de energía por comercializador de contratos adjudicados en subastas del Ministerio (MME) | 2022-01-01 | 2026-09-01 | Público |
| `A8F4C0` | Costo promedio ponderado en contratos de largo plazo MC | 2021-01-01 | 2026-09-01 | Público |
| `965765` | Costo unitario SIMEM y SICEP | 2023-01-01 | 2025-01-01 | Público |
| `0810d0` | Cumplimiento de reporte de contratos entre agentes y usuarios del mercado no regulado | 2026-06-26 | 2026-10-19 | **Reservado** |
| `8b732d` | Duración promedio de los contratos entre agentes | 2023-09-01 | 2031-09-01 | Público |
| `860bc8` | Duración promedio de los contratos producto de convocatorias del SICEP para el mercado regulado | 2023-09-01 | 2031-09-01 | Público |
| `305a36` | Energía promedio de los contratos de convocatorias del SICEP con destino al mercado regulado del Sistema Interconectado Nacional | 2020-06-01 | 2026-09-01 | Público |
| `1e543e` | Energía promedio de los contratos del SICEP para el mercado regulado por comercializador | 2020-06-01 | 2026-09-01 | Público |
| `086d86` | Energía promedio de los contratos entre agentes del Sistema Interconectado Nacional | 2013-01-01 | 2026-09-01 | Público |
| `06bb49` | Energía promedio mensual de contratos con UNR para el total del SIN | 2022-11-01 | 2026-09-01 | Público |
| `b73e3c` | Energía promedio mensual de contratos con UNR por mercado de comercialización | 2023-01-01 | 2031-09-01 | Público |
| `710e77` | Estadísticas anuales de las convocatorias del SICEP para el mercado regulado | 2020-01-01 | 2025-01-01 | Público |
| `8DECCA` | Estadísticas de contratos del mercado secundario | 2013-01-01 | 2028-07-01 | Público |
| `68a95b` | Estadísticas de precios de los contratos adjudicados en subastas del Ministerio (MME) | 2022-01-01 | 2026-09-01 | Público |
| `da2c83` | Estadísticas de precios por comercializador de los contratos adjudicados en subastas del Ministerio (MME) | 2022-01-01 | 2026-09-01 | Público |
| `40d2d3` | Estadísticas horarias de precios de los contratos adjudicados en subastas del Ministerio (MME) | 2022-01-01 | 2026-09-01 | Público |
| `705468` | Estadísticas horarias de precios por comercializador de los contratos adjudicados en subastas del Ministerio (MME) | 2022-01-01 | 2026-09-01 | Público |
| `2cf281` | Evolución histórica anual de las estadísticas generales de las convocatorias SICEP con destino al mercado regulado | 2020-01-01 | 2025-01-01 | Público |
| `3207d8` | Excedentes Negativos por Comercializador | 2026-03-14 | 2026-09-28 | Público |
| `bf41fe` | Histórico Posición abierta por contrato II Open interest II | 2023-08-31 | 2026-09-30 | Público |
| `629B6D` | Oportunidad en la entrega de información por parte de los agentes de contratos largo plazo | 2023-01-01 | 2025-01-01 | Público |
| `7580FA` | Participación en Convocatorias de Participación en Subasta de Cierre de agentes registrados | 2023-07-01 | 2026-09-01 | Público |
| `90b78a` | Porcentaje Estimado de cobertura con contratos entre agentes | 2023-11-01 | 2031-09-01 | Público |
| `9a387a` | Porcentaje estimado de cobertura con contratos de convocatorias del SICEP para el mercado regulado | 2023-11-01 | 2031-09-01 | Público |
| `d31647` | Precios en contratos de energía del Mercado Mayorista por comprador | 2022-01-01 | 2026-09-01 | Público |
| `ac9492` | Precios futuros horarios mensuales de contratos con UNR para el total del SIN | 2023-09-01 | 2031-09-01 | Público |
| `05f977` | Precios futuros horarios mensuales de contratos con UNR por mercado de comercialización | 2023-09-01 | 2031-09-01 | Público |
| `30a827` | Precios futuros mensuales de contratos con UNR para el total del SIN | 2023-09-01 | 2031-09-01 | Público |
| `a6dcc1` | Precios futuros mensuales de contratos con UNR por mercado de comercialización | 2023-09-01 | 2031-09-01 | Público |
| `48e773` | Precios futuros y estadísticas de los contratos de convocatorias del SICEP para el mercado regulado | 2023-09-01 | 2031-09-01 | Público |
| `dac3c5` | Precios futuros y estadísticas de los contratos de convocatorias del SICEP para el mercado regulado por comercializador | 2023-09-01 | 2031-09-01 | Público |
| `178428` | Precios futuros y estadísticas de los contratos entre agentes | 2023-09-01 | 2031-09-01 | Público |
| `60fed4` | Precios futuros y estadísticas de los contratos entre agentes por comercializador y generador | 2023-09-26 | 2031-09-01 | Público |
| `3cf0d1` | Precios horarios futuros y estadísticas de los contratos de convocatorias del SICEP para el mercado regulado | 2023-09-01 | 2031-09-01 | Público |
| `560280` | Precios horarios futuros y estadísticas de los contratos de convocatorias del SICEP para el mercado regulado por comercializador | 2023-09-01 | 2031-09-01 | Público |
| `4f9fe7` | Precios horarios futuros y estadísticas de los contratos entre agentes | 2023-09-01 | 2031-09-01 | Público |
| `f9d42a` | Precios horarios futuros y estadísticas de los contratos entre agentes por comercializador y generador | 2023-09-01 | 2031-09-01 | Público |
| `e5be73` | Precios horarios y estadísticas de los contratos de convocatorias del SICEP para el mercado regulado | 2020-06-01 | 2026-09-01 | Público |
| `d528cb` | Precios horarios y estadísticas de los contratos de convocatorias del SICEP para el mercado regulado por comercializador | 2020-06-01 | 2026-09-01 | Público |
| `5f246a` | Precios horarios y estadísticas de los contratos entre agentes | 2013-01-01 | 2026-09-01 | Público |
| `9e2844` | Precios horarios y estadísticas de los contratos entre agentes por comercializador | 2013-01-01 | 2026-09-01 | Público |
| `61ccc8` | Precios horarios y estadísticas de los contratos entre agentes por generador | 2013-01-01 | 2026-09-01 | Público |
| `7b756b` | Precios promedios horarios mensuales de contratos con UNR para el total del SIN | 2023-01-01 | 2026-08-01 | Público |
| `d66c25` | Precios promedios horarios mensuales de contratos con UNR por mercado de comercialización | 2023-01-01 | 2026-08-01 | Público |
| `5f4e97` | Precios promedios horarios mensuales por comercializador de contratos con UNR para el total del SIN | 2023-01-01 | 2026-08-01 | Público |
| `e5437f` | Precios promedios horarios mensuales por comercializador y mercado de comercialización de contratos con UNR | 2023-01-01 | 2026-08-01 | Público |
| `5f8082` | Precios promedios mensuales de contratos con UNR para el total del SIN | 2023-01-01 | 2026-08-01 | Público |
| `b1ccc4` | Precios promedios mensuales de contratos con UNR por mercado de comercialización | 2023-01-01 | 2026-08-01 | Público |
| `52341b` | Precios y Energía de los contratos no realizados a través del SICEP con destino al mercado regulado | 2013-01-01 | 2026-09-30 | Público |
| `1be05d` | Precios y Energía de los contratos no realizados a través del SICEP que atienden el mercado de usuarios regulados | 2013-01-01 | 2026-09-30 | Público |
| `0c5948` | Precios y estadísticas de los contratos de convocatorias del SICEP entre agentes integrados verticalmente para el mercado regulado | 2020-10-01 | 2026-09-01 | Público |
| `2106b8` | Precios y estadísticas de los contratos de convocatorias del SICEP entre agentes integrados verticalmente para el mercado regulado por comercializador | 2020-10-01 | 2026-09-01 | Público |
| `69736c` | Precios y estadísticas de los contratos de convocatorias del SICEP para el mercado regulado, por año de suscripción | 2020-06-01 | 2026-09-01 | Público |
| `331979` | Precios y estadísticas de los contratos de convocatorias del SICEP para el mercado regulado, por año de suscripción y por comercializador | 2020-06-01 | 2026-09-01 | Público |
| `6bac48` | Precios y estadísticas de los contratos entre agentes integrados verticalmente para el mercado no regulado | 2013-01-01 | 2026-09-01 | Público |
| `781422` | Precios y estadísticas de los contratos entre agentes integrados verticalmente por comercializador | 2013-01-01 | 2026-09-01 | Público |
| `1cdd5f` | Precios y estadísticas de los contratos entre agentes integrados verticalmente por generador | 2015-01-01 | 2026-09-01 | Público |
| `ea45fe` | Precios y estadísticas de los contratos entre agentes, agrupados por año de suscripción | 2013-01-01 | 2026-09-01 | Público |
| `d760bb` | Precios y estadísticas de los contratos entre agentes, por año de suscripción y por comercializador | 2013-01-01 | 2026-09-01 | Público |
| `38a251` | Precios y estadísticas de los contratos entre agentes, por año de suscripción y por generador | 2013-01-01 | 2026-09-01 | Público |
| `f0be2a` | Precios y estadísticas mensuales de contratos de convocatorias del SICEP para el mercado regulado por comercializador | 2020-06-01 | 2026-09-01 | Público |
| `bb4a0a` | Precios y estadísticas mensuales de contratos entre agentes | 2013-01-01 | 2026-09-01 | Público |
| `fbfafd` | Precios y estadísticas mensuales de contratos entre agentes por comercializador | 2013-01-01 | 2026-09-01 | Público |
| `013220` | Precios y estadísticas mensuales de contratos entre agentes por generador | 2013-01-01 | 2026-09-01 | Público |
| `cebe60` | Precios y estadísticas mensuales de los contratos de convocatorias del SICEP para el mercado regulado | 2020-06-01 | 2026-09-01 | Público |
| `0E4A36` | Promedio aritmético anual acumulado de la representatividad de la energía transada | 2023-08-05 | 2026-09-30 | Público |
| `58E055` | Promedio aritmético anual acumulado de la representatividad de participantes del MEM | 2023-08-05 | 2026-09-30 | Público |
| `AE2DD3` | Promedio aritmético anual de la participación en Convocatorias de agentes registrados | 2023-08-05 | 2026-09-30 | Público |
| `15df39` | Proyecciones de energía de los contratos no realizados a través del SICEP con destino al mercado regulado por comercializador | 2023-09-01 | 2031-09-01 | Público |
| `86d298` | Proyecciones de energía de los contratos no realizados a través del SICEP con destino al mercado regulado por comercializador y contrato | 2023-09-01 | 2031-09-01 | Público |
| `f776db` | Proyecciones de las cantidades en contratos de energía del Mercado Mayorista por comprador | 2026-04-01 | 2031-09-01 | Público |
| `58d1c7` | Proyecciones de las cantidades en contratos de energía del Mercado Mayorista por vendedor | 2026-04-01 | 2031-09-01 | Público |
| `8d10e6` | Proyecciones de las cantidades y precios en contratos de energía del Mercado Mayorista por comercializador | 2024-12-01 | 2031-09-01 | Público |
| `51201b` | Proyecciones de los precios en contratos de energía del Mercado Mayorista por comprador | 2026-04-01 | 2031-09-01 | Público |
| `110a9e` | Proyecciones de los precios en contratos de energía del Mercado Mayorista por vendedor | 2026-04-01 | 2031-09-01 | Público |
| `d943d5` | Proyecciones de precios de los contratos no realizados a través del SICEP con destino al mercado regulado por comercializador | 2023-09-01 | 2031-09-01 | Público |
| `6d9c07` | Proyecciones de precios de los contratos no realizados a través del SICEP con destino al mercado regulado por comercializador y contrato | 2023-09-01 | 2031-09-01 | Público |
| `230a9d` | Registro de contratos de largo plazo entre agentes | 2023-01-01 | 2026-09-01 | **Reservado** |
| `b08986` | Registro de contratos de usuarios no regulados y reporte de facturación | 2023-09-01 | 2026-09-01 | **Reservado** |
| `EDBDA0` | Representatividad de la energía transada | 2023-07-01 | 2026-09-01 | Público |
| `055232` | Representatividad de participantes del MEM | 2023-07-01 | 2026-09-01 | Público |
| `5e8c28` | Transacciones realizadas en el mecanismo Derivex | 2023-08-11 | 2026-09-29 | Público |
| `FB23CF` | Valor contratos convocatorias públicas SICEP | 2021-01-01 | 2026-10-14 | Público |
| `dd0d22` | Valoración Horaria de Excedentes por Comercializador | 2026-01-01 | 2026-08-09 | Público |
| `E60CE2` | Venta en contratos bilaterales de largo plazo por vendedor en energía | 2021-01-01 | 2026-10-14 | Público |

### Cargo por confiabilidad (21)

| ID | Dataset | Datos desde | Hasta | Acceso |
|---|---|---|---|---|
| `51fea2` | Bandera de pruebas de disponibilidad programadas en la operación por el Centro Nacional de Despacho | 2023-11-21 | 2026-08-05 | Público |
| `D387AB` | Bandera para pruebas de disponibilidad | 2020-01-01 | 2026-10-16 | Público |
| `7E9CBB` | Capacidad de respaldo para operaciones en el Mercado Mayorista de Energía | 2013-12-01 | 2031-07-01 | Público |
| `5106B9` | Declaración de respaldo horaria para cada planta y/o unidad | 2021-01-01 | 2026-10-14 | Público |
| `693AC9` | Desviación diaria de obligación de energía firme negativa | 2014-04-24 | 2024-12-23 | Público |
| `85B998` | Desviación diaria de obligación de energía firme positiva | 2014-04-24 | 2025-01-31 | Público |
| `126C20` | Disponibilidad horaria de respaldo de OEF ajustada | 2021-01-01 | 2026-10-14 | Público |
| `9CBA0C` | Disponibilidad horaria declarada total que respalda las OEF | 2021-01-01 | 2026-10-14 | Público |
| `b38efc` | Energía Firme del Cargo por Confiabilidad verificada por el Centro Nacional de Despacho | 2018-12-01 | 2026-10-18 | Público |
| `d808d4` | Energía de Referencia para el Mercado Secundario | 2018-12-01 | 2050-11-30 | Público |
| `AB052F` | Número de intentos para cumplir pruebas de disponiblidad | 2023-11-21 | 2026-08-05 | Público |
| `564F53` | Obligación Energía Firme Diaria en kWh | 2021-01-01 | 2026-10-14 | Público |
| `BE51B1` | Obligación de energía firme (OEF) por submercado | 2021-01-01 | 2026-10-14 | Público |
| `26AFFD` | Precio de cierre de los mecanismos de asignación de OEF | 2006-11-01 | 2026-05-01 | Público |
| `43D616` | Precio de escasez ponderado | 2021-01-01 | 2026-10-16 | Público |
| `ae3f23` | Precios de escasez del Cargo por Confiabilidad | 2013-01-01 | 2026-10-01 | Público |
| `48C79B` | Precios de escasez promedio ponderado por agente | 2021-01-01 | 2026-10-16 | Público |
| `21a98c` | Pruebas de Disponibilidad para Cargo por Confiabilidad | 2013-02-04 | 2026-05-07 | Público |
| `385613` | Resultados de las Subastas de Reconfiguración | 2012-12-01 | 2027-12-01 | Público |
| `3b7031` | Seguimiento a la Obligación de Energía Firme (OEF) anual | 2006-11-01 | 2026-10-17 | Público |
| `135c10` | Valores del Cargo por Confiabilidad | 2006-12-01 | 2028-12-01 | Público |

### Precios y bolsa (37)

| ID | Dataset | Datos desde | Hasta | Acceso |
|---|---|---|---|---|
| `7E5EA7` | Ajuste Transacciones TIE | 2022-01-01 | 2026-09-30 | Público |
| `1E0AC7` | Compras en bolsa TIE en moneda | 2021-01-01 | 2026-10-14 | Público |
| `4295B4` | Compras en bolsa internacional en moneda | 2021-01-01 | 2026-10-14 | Público |
| `B1009C` | Compras en bolsa nacional en moneda | 2021-01-01 | 2026-10-14 | Público |
| `f2ba18` | Costo Marginal Promedio del Redespacho del Informe Diario de Operación | 2013-01-01 | 2026-10-18 | Público |
| `03e35f` | Costo Marginal Redespacho | 2013-01-01 | 2026-10-18 | Público |
| `300D5C` | Costo de operación y mantenimiento para el precio de escasez | 2021-01-01 | 2026-09-01 | Público |
| `29f060` | Costo marginal del Despacho Económico | 2013-01-01 | 2026-10-18 | Público |
| `30D865` | Histórico anual de los precios de referencia para el traslado al Mercado Regulado --Deprecated-- | 2022-10-19 | 2025-11-27 | Público |
| `b9f2ec` | Información de Transferencias Internacionales | 2013-01-01 | 2026-10-18 | Público |
| `7f16cb` | Información de Transferencias Internacionales | 2013-01-01 | 2026-10-18 | Público |
| `531ba3` | Informe anual de auditoría de costos de combustible para el cálculo del precio marginal de escasez | 2021-12-01 | 2024-12-01 | Público |
| `9a1b87` | Insumos para el Precio Marginal de Escasez | 2017-12-01 | 2026-10-14 | Público |
| `FEC25B` | Magnitud compras transacciones en bolsa en energía | 2021-01-01 | 2026-10-16 | Público |
| `E93F85` | Magnitud energía en bolsa internacional a cargo | 2021-01-01 | 2026-10-14 | Público |
| `42EDC9` | Magnitud energía en bolsa nacional a cargo | 2021-01-01 | 2026-10-14 | Público |
| `11364C` | Magnitud ventas en bolsa internacional en energía | 2021-01-01 | 2026-10-14 | Público |
| `E14D70` | Magnitud ventas en bolsa nacional en energía | 2021-01-01 | 2026-10-14 | Público |
| `30E8EC` | Magnitud ventas transacciones en bolsa en energía | 2021-01-01 | 2026-10-16 | Público |
| `03ba47` | Máximo precio ofertado | 2021-01-01 | 2026-10-16 | Público |
| `8FCD6C` | Precio de Bolsa promedio ponderado mensual | 2021-01-01 | 2026-09-01 | Público |
| `3451bf` | Precio de Oferta Declarado | 2025-04-01 | 2026-09-30 | Público |
| `909809` | Precio de Oferta de Arranque y Parada por recurso USD | 2015-04-01 | 2026-12-01 | Público |
| `709b84` | Precio de Transacciones en Bolsa | 2024-09-01 | 2026-10-14 | Público |
| `EC6945` | Precio de bolsa horario | 2013-01-01 | 2026-10-16 | Público |
| `96D56E` | Precio de bolsa ponderado | 2013-01-01 | 2026-10-16 | Público |
| `b1189f` | Precio de oferta de la planta en el proceso del despacho ideal, en COP/kWh | 2013-01-01 | 2026-09-30 | Público |
| `b18005` | Precio de oferta de la planta para cada configuración ofertada en el proceso del despacho ideal, en COP/kWh | 2023-04-24 | 2026-09-30 | Público |
| `C35A63` | Precio de oferta en el nodo frontera para exportación | 2013-01-01 | 2026-10-16 | Público |
| `e427a2` | Precio oferta arranque y parada por unidad para el combustible | 2023-02-20 | 2026-09-30 | Público |
| `96DDFE` | Relación índice platts US gulf coast residual fuel | 2013-01-01 | 2026-10-14 | Público |
| `74DE8E` | Tasa de cambio representativa del mercado | 2013-01-01 | 2026-10-16 | Público |
| `81D183` | Valor compras transacciones bolsa en moneda | 2021-01-01 | 2026-10-16 | Público |
| `95C913` | Valor ventas transacciones bolsa en moneda | 2021-01-01 | 2026-10-16 | Público |
| `A88E47` | Ventas en bolsa TIE en moneda | 2021-01-01 | 2026-10-14 | Público |
| `6D6E23` | Ventas en bolsa internacional en moneda | 2021-01-01 | 2026-10-14 | Público |
| `F387F3` | Ventas en bolsa nacional en moneda | 2021-01-01 | 2026-10-14 | Público |

### Generación, disponibilidad y despacho (77)

| ID | Dataset | Datos desde | Hasta | Acceso |
|---|---|---|---|---|
| `926542` | AGC Planta oferta nacional | 2026-04-17 | 2026-10-19 | Público |
| `91bb75` | AGC Unidad oferta nacional | 2026-04-17 | 2026-10-19 | Público |
| `F3A9B1` | Bandera de Disponibilidad Real | 2021-01-01 | 2026-10-16 | Público |
| `379022` | Bandera de arranque Planta térmica para el Despacho Ideal | 2021-01-01 | 2026-10-14 | Público |
| `1237df` | Bandera de arranque de plantas | 2021-01-01 | 2026-10-16 | Público |
| `B4D9FE` | Bandera de autorización a desvío del programa de generación | 2020-01-01 | 2026-10-16 | Público |
| `39726d` | Bandera de parada de plantas | 2021-01-01 | 2026-10-16 | Público |
| `FE2899` | Banderas de pruebas por unidad | 2021-01-01 | 2026-10-16 | Público |
| `FADED0` | Capacidad efectiva neta por planta en potencia | 2021-01-01 | 2026-10-16 | Público |
| `94F4A5` | Causas Generación Seguridad | 2021-01-01 | 2026-10-16 | Público |
| `8ae7da` | Combustibles y Heat Rate de plantas térmicas del SIN | 2013-01-01 | 2026-10-18 | Público |
| `4f2075` | Coordinación de mantenimientos generadores | 2021-01-04 | 2026-10-19 | Público |
| `7BC5F5` | Costo unitario responsabilidad comercial de AGC | 2015-12-01 | 2026-10-14 | Público |
| `5ac645` | Códigos de pruebas oferta nacional | 2026-03-19 | 2026-10-19 | Público |
| `2a301d` | Datos soporte del proceso de Despacho Ideal por Recurso, versión y horaria | 2013-01-01 | 2025-09-30 | Público |
| `5fc353` | Datos soporte del proceso de liquidación por Recurso, Tipo combustible, versión y mensual | 2017-12-01 | 2026-04-01 | Público |
| `029125` | Delta de generación programada | 2021-01-01 | 2026-10-16 | Público |
| `252E2F` | Deltas holgura arriba y abajo horarias | 2021-01-09 | 2026-10-16 | Público |
| `70E9A6` | Deltas incremento nacional e internacional | 2021-01-01 | 2026-10-16 | Público |
| `ff027b` | Despacho programado recursos de generación | 2013-01-01 | 2026-10-19 | Público |
| `64eb3f` | Disponibilidad Real de las Unidades de Generación del Sistema | 2013-01-01 | 2026-10-18 | Público |
| `39db4e` | Disponibilidad asociada con arranque utilizando tecnología térmica a gas ciclo carbón | 2021-01-04 | 2026-10-03 | Público |
| `ff15e5` | Disponibilidad asociada con arranque utilizando tecnología térmica a gas ciclo sting | 2021-01-01 | 2026-10-12 | Público |
| `244B98` | Disponibilidad asociada con arranque utilizando tecnología térmica a gas de ciclo abierto | 2021-01-01 | 2026-10-16 | Público |
| `b84962` | Disponibilidad asociada con arranque utilizando tecnología térmica gas vapor | 2021-01-01 | 2026-10-16 | Público |
| `24F4EC` | Disponibilidad comercial por planta | 2021-01-01 | 2026-10-16 | Público |
| `5d0d0e` | Disponibilidad declarada en el despacho | 2021-01-01 | 2026-10-16 | Público |
| `19383f` | Disponibilidad oferta nacional por unidad | 2026-01-01 | 2026-10-19 | Público |
| `234D49` | Disponibilidad programada | 2021-01-01 | 2026-10-16 | Público |
| `9E77E5` | Disponibilidad real por planta | 2021-01-01 | 2026-10-16 | Público |
| `990c50` | Disponibilidad real por unidad | 2025-06-01 | 2026-10-18 | Público |
| `f96857` | Energía horaria de los contadores | 2023-01-01 | 2026-10-16 | Público |
| `7DACE2` | Estadísticas de Horas de indisponibilidad de las líneas de transmisión nacional y regional del SIN | 2020-06-01 | 2026-09-01 | Público |
| `7E4EE4` | Estadísticas de monto de indisponibilidad de las líneas de transmisión nacional y regional del SIN | 2023-10-01 | 2026-09-01 | Público |
| `7a07ac` | Eventos en unidades de Generación | 2013-01-01 | 2026-10-14 | Público |
| `1c91c4` | Fecha de retiro de unidades de generación | 2013-01-01 | 2026-10-18 | Público |
| `861936` | Generaciones candidatas a ser inflexibles | 2021-01-01 | 2026-10-16 | Público |
| `AB7D7F` | Generación Ideal por planta | 2021-01-01 | 2026-10-16 | Público |
| `12c7fd` | Generación Programada Redespacho por Planta | 2013-01-01 | 2026-10-18 | Público |
| `a51857` | Generación Real por Agente Comercializador | 2026-01-01 | 2026-10-14 | Público |
| `E17D25` | Generación Real y Programada en las Plantas de Generación | 2013-01-01 | 2026-10-18 | Público |
| `CDD16E` | Generación ideal internacional Ecuador por planta | 2021-01-01 | 2026-10-16 | Público |
| `6B9E0C` | Generación ideal internacional Venezuela por recurso planta | 2022-05-01 | 2026-10-16 | Público |
| `8E7F3C` | Generación ideal nacional por planta | 2021-01-01 | 2026-10-16 | Público |
| `E055B4` | Generación programada en el despacho | 2021-01-01 | 2026-10-16 | Público |
| `18F0B8` | Generación programada en el redespacho | 2021-01-01 | 2026-10-16 | Público |
| `562E3A` | Generación programada incluyendo autorización a desvío | 2021-01-01 | 2026-10-16 | Público |
| `055A4D` | Generación real | 2013-01-01 | 2026-10-16 | Público |
| `F28855` | Histórico de eventos en Unidades de Generación | 2013-01-01 | 2026-10-18 | Público |
| `16ff58` | Holgura AGC Programado horario por unidad | 2026-01-01 | 2026-10-19 | Público |
| `897043` | Holgura horaria superior e inferior | 2021-01-01 | 2026-10-16 | Público |
| `58a1b8` | Horas de indisponibilidad de las líneas de transmisión nacional y regional del SIN | 2020-06-01 | 2026-09-01 | Público |
| `FE1E73` | Inflexibilidad asignada en el proceso comercial | 2021-01-01 | 2026-10-16 | Público |
| `8FFA6D` | Inflexibilidades no asociadas con generación de seguridad | 2021-01-01 | 2026-10-16 | Público |
| `cdfe1b` | Informe de reevaluación de parámetros de regulación secundaria de frecuencia AGC | 2022-01-01 | 2025-01-01 | Público |
| `D0B4E3` | Informe de resultados del despacho económico | 2022-01-01 | 2026-10-20 | Público |
| `77395a` | Informe trimestral de auditoría de costos de combustible reportados para la operación | 2022-09-01 | 2026-05-01 | Público |
| `2a6a76` | Inversores disponibles oferta nacional | 2026-03-17 | 2026-10-19 | Público |
| `0a0ec5` | Listado de mantenimientos | 2025-12-18 | 2026-10-18 | Público |
| `7F18B1` | Listado de plantas de generación en pruebas | 2013-04-03 | 2026-10-18 | Público |
| `670221` | Listado de unidades de generación | 2013-01-01 | 2026-10-19 | Público |
| `A1DBD9` | Magnitud de reconciliación positiva arranque | 2021-01-01 | 2026-10-16 | Público |
| `8DA3D8` | Magnitud de reconciliación positiva para plantas que no realizan AGC | 2021-01-01 | 2026-10-16 | Público |
| `F37316` | Magnitud de reconciliación positiva para plantas que prestan servicio de AGC | 2021-01-10 | 2026-10-13 | Público |
| `767A48` | Magnitud responsabilidad comercial AGC | 2021-01-01 | 2026-10-16 | Público |
| `53c5f4` | Montos por indisponibilidad de las líneas de transmisión nacional y regional del SIN en COP | 2022-01-01 | 2026-09-01 | Público |
| `b6d5d0` | Mínimo obligatorios oferta nacional | 2026-03-23 | 2026-10-01 | Público |
| `0bfc9d` | Parámetros técnicos de las plantas de generación | 2021-01-01 | 2026-10-19 | Público |
| `ECA1CC` | Potencia asociada con la holgura | 2021-01-01 | 2026-10-16 | Público |
| `F577E2` | Pruebas de generación corto plazo | 2021-01-11 | 2026-10-05 | Público |
| `62649f` | Recomendaciones Eléctricas consideradas en el Despacho Económico | 2022-01-01 | 2026-10-19 | Público |
| `B53464` | Reconciliación negativa para planta que realiza AGC | 2021-01-01 | 2026-10-16 | Público |
| `8F2AFC` | Reconciliación negativa para plantas que no realizan AGC | 2021-01-01 | 2026-10-16 | Público |
| `ea1c85` | Reserva asignada como Control Automático de Generación | 2013-01-01 | 2026-10-18 | Público |
| `520A3F` | Responsabilidad comercial de AGC | 2021-01-01 | 2026-10-14 | Público |
| `b461cf` | Tipo de Combustible con el que arrancó la planta | 2021-01-01 | 2026-10-16 | Público |
| `490BDB` | Tipo de combustible utilizado para calculo de costos | 2021-01-01 | 2026-10-16 | Público |

### Red, transmisión y calidad (22)

| ID | Dataset | Datos desde | Hasta | Acceso |
|---|---|---|---|---|
| `13FC3A` | Calculo Frecuencia Interrupción Servidores | 2023-01-01 | 2026-01-01 | Público |
| `054b23` | Cargo de nivel de tensión 4 | 2021-01-01 | 2026-08-01 | Público |
| `3a76fa` | Cargos por uso bruto | 2025-07-01 | 2026-09-01 | **Reservado** |
| `43d851` | Cargos por uso del STN | 2013-01-01 | 2026-09-01 | Público |
| `d6cf36` | Cargos por uso en el SDL | 2021-01-01 | 2026-08-01 | Público |
| `2926f9` | Cargos por uso únicos por nivel de tensión (DtUN) | 2021-01-01 | 2026-07-01 | Público |
| `ebc2d1` | Condición del sistema según lo establecido en el Estatuto de Riesgo de Desabastecimiento | 2016-02-11 | 2026-10-18 | Público |
| `99c2e8` | Costo del uso de los activos de transmisión | 2025-07-01 | 2026-10-01 | Público |
| `CD2034` | Energía de referencia para el Sistema de Transmisión Nacional | 2021-01-01 | 2026-10-16 | Público |
| `860c86` | Estudio Interconexión Colombia Ecuador | 2022-01-01 | 2025-01-01 | Público |
| `a859bf` | Eventos de Frecuencia | 2013-01-01 | 2026-10-14 | Público |
| `a3db98` | Eventos de Tensión fuera de Rango | 2018-02-11 | 2026-10-13 | Público |
| `97c8ec` | Histórico de eventos en Activos de Transmisión del Sistema de Transmisión Nacional | 2013-01-22 | 2026-10-08 | Público |
| `A2919B` | Histórico de eventos en Líneas de Transmisión del Sistema de Transmisión Nacional | 2013-02-12 | 2026-10-05 | Público |
| `568929` | Listado de Operadores de activos del Sistema Interconectado Nacional | 2023-11-04 | 2026-10-18 | Público |
| `F99E13` | Listado de Subestaciones del STN y el STR | 2022-01-07 | 2026-10-18 | Público |
| `10F2C9` | Listado de Subáreas Operativas del Sistema de Interconectado Nacional | 2021-01-01 | 2026-10-18 | Público |
| `841808` | Listado de Áreas Operativas del Sistema de Interconectado Nacional | 2021-01-01 | 2026-10-18 | Público |
| `7538fd` | Parámetros técnicos de las líneas de transmisión | 2020-06-01 | 2026-10-19 | Público |
| `44c3e3` | Recomendaciones Eléctricas consideradas en Tiempo Real | 2022-01-01 | 2026-10-18 | Público |
| `6e0197` | Recomendaciones Eléctricas de Corto Plazo | 2022-01-03 | 2026-10-25 | Público |
| `9FDD00` | Valor a pagar por la no prestación del servicio de regulación primaria de frecuencia | 2013-01-01 | 2026-10-16 | Público |

### Liquidación, garantías y cargos (38)

| ID | Dataset | Datos desde | Hasta | Acceso |
|---|---|---|---|---|
| `f09333` | --- Deprecated --- Datos soporte del proceso de liquidación por Código sic agente, Recurso, Unidad, versión y horaria | 2022-01-01 | 2026-05-28 | Público |
| `82a4d5` | Cargo en pesos por KWh por concepto del plan reducción de perdidas. (CPROG) | 2021-01-01 | 2026-07-01 | **Reservado** |
| `35d7ef` | Conceptos adicionados a través de restricciones | 2020-01-01 | 2026-09-30 | Público |
| `aecac4` | Costo Equivalente Real de Energía (CERE) | 2021-01-01 | 2026-09-01 | Público |
| `0d5da1` | Costo Equivalente de Energía (CEE) | 2013-01-01 | 2026-10-01 | Público |
| `cf0167` | Costo Restricciones Asignadas al Agente | 2013-01-01 | 2026-09-01 | Público |
| `E4CE10` | Costo Servicios ASIC y CND | 2021-01-01 | 2026-09-01 | Público |
| `b15ed2` | Costo unitario promedio diario de reconciliación positiva | 2015-01-01 | 2026-09-30 | Público |
| `CB2410` | Costos de operación, mantenimiento y otros costos variables de generadores térmicos | 2013-01-01 | 2026-10-16 | Público |
| `969fbb` | Cumplimiento de reporte de facturación entre agentes y usuarios del mercado no regulado | 2026-05-22 | 2026-10-19 | **Reservado** |
| `2d5afe` | Datos soporte del proceso de liquidación por Recurso, versión y horaria | 2013-01-01 | 2025-09-30 | Público |
| `842296` | Energía calculada para plantas hidráulicas por reconciliación positiva asociada a la exportación hacia Ecuador | 2021-09-06 | 2026-10-16 | Público |
| `6827d9` | Estadísticas del Costo Unitario de Reconciliación Positiva | 2015-01-01 | 2026-09-01 | Público |
| `384850` | Fondo de Apoyo Financiero para la Energización de las Zonas Rurales Interconectadas (FAER) | 2021-01-01 | 2026-08-01 | Público |
| `32C229` | Fondo de apoyo a zonas no interconectadas (FAZNI) | 2021-01-01 | 2026-09-01 | Público |
| `547a91` | Fondo de energía social (FOES) | 2021-01-01 | 2026-09-01 | Público |
| `43cd59` | Garantía de reserva de capacidad de transporte | 2022-04-12 | 2026-10-16 | Público |
| `9c7ac5` | Informe Anual de Operadores de Red | 2022-01-01 | 2025-01-01 | Público |
| `972263` | Listado de agentes registrados | 2013-01-01 | 2026-10-19 | Público |
| `88997D` | Magnitud de desviación | 2021-01-01 | 2026-10-16 | Público |
| `4A17B1` | Magnitud de generación de seguridad del país importador | 2021-09-06 | 2026-10-16 | Público |
| `521384` | Montos de garantías para cubrir las transacciones en el mercado de energía mayorista | 2014-12-26 | 2026-10-09 | Público |
| `86d025` | Montos de garantías para cubrir las transacciones en el mercado de energía mayorista agregados | 2015-01-01 | 2026-10-09 | Público |
| `e71658` | Montos de garantías y mecanismos alternativos para cubrir las transacciones en el mercado de energía mayorista | 2022-01-01 | 2026-09-01 | Público |
| `054d02` | Montos de garantías y mecanismos alternativos para cubrir las transacciones en el mercado de energía mayorista agregados | 2022-01-01 | 2026-09-01 | Público |
| `1F06A2` | Otros costos variables asociados al SIN | 2013-01-01 | 2026-10-14 | Público |
| `C8172F` | Otros costos variables hidráulicos y térmicos | 2017-12-01 | 2026-10-14 | Público |
| `c6f395` | Procedimiento de retiro de agentes según la Res. CREG 156 de 2011 | 2013-02-15 | 2026-09-09 | Público |
| `497f97` | Programa de normalización de redes eléctricas (PRONE) | 2021-01-01 | 2026-08-01 | Público |
| `d44fe9` | Renta de congestión con destinación al FOES | 2021-01-11 | 2026-10-14 | Público |
| `82a4e5` | Restricciones aliviadas mensuales | 2021-01-01 | 2026-09-01 | Público |
| `1ff257` | Servicios LAC Moneda | 2025-07-01 | 2026-08-01 | **Reservado** |
| `B8EDC1` | Tarifa de aportes ley 99 de 1993 para plantas térmicas e hidráulicas | 2013-01-01 | 2026-01-01 | Público |
| `475ae5` | Umbral X | 2025-01-06 | 2026-09-07 | Público |
| `9407AC` | Valor de consumo principal proporcional a la reconciliación positiva | 2015-04-01 | 2026-10-16 | Público |
| `86d9c6` | Variables de Ajuste por Energía Vendida Embalsada (EVE) | 2024-09-30 | 2025-04-02 | Público |
| `7a30a3` | Versiones de factura para la liquidación diaria | 2025-01-01 | 2026-10-18 | Público |
| `24914F` | Versiones de factura para la liquidación mensual | 2013-01-01 | 2026-09-01 | Público |

### Otros / administración SIMEM (4)

| ID | Dataset | Datos desde | Hasta | Acceso |
|---|---|---|---|---|
| `BAE067` | Auditoria Ejecución Conjuntos de SIMEM | 2025-04-08 | 2026-10-12 | **Reservado** |
| `135D65` | Estadísticas SIMEM | 2025-04-22 | 2026-10-14 | **Reservado** |
| `923030` | Oportunidad en el reporte de información por parte de XM, el Administrador del SIMEM y otros | 2023-10-04 | 2026-08-31 | **Reservado** |
| `97C342` | VersionConfiguracionTablaSIMEM | 2025-04-08 | 2026-10-11 | **Reservado** |
