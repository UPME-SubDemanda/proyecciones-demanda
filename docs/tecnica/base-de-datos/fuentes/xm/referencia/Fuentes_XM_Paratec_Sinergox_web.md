# Fuentes de información de XM: PARATEC, Sinergox web, IDO, portal de archivos y cubos

Qué información hay en **PARATEC** (https://paratec.xm.com.co), **Sinergox web** (https://sinergox.xm.com.co), el **IDO** (https://ido.xm.com.co), el **portal de archivos públicos de XM** (que reemplazó al antiguo FTP) y los **cubos de análisis multidimensional**, cómo se accede a cada una y cómo se relacionan con las dos APIs de XM: **API SINERGOX** (`pydataxm.ReadDB`, ver [Diccionario_pydataxm.md](Diccionario_pydataxm.md)) y **API SIMEM** (`pydatasimem`, ver [Diccionario_SIMEM.md](Diccionario_SIMEM.md)).

> **Origen de este documento.** Viene de un análisis previo de la Subdirección de Demanda sobre el SIN (abril a noviembre de 2026). Los nombres de scripts, tablas intermedias («bronze», «silver», «gold») y páginas de tablero que aparecen aquí pertenecían a esa herramienta y **no existen en este repositorio**: se conservan solo como referencia de cómo se procesó cada fuente. En este proyecto los datos siguen el recorrido `raw` → `staging` → `core` (ver [Base de datos](../../../index.md)).

> Revisión hecha el **2026-10-20** navegando ambos sitios y consultando sus servicios de datos. Las URL `http://` no funcionan (PARATEC devuelve un error de Azure Front Door): usar `https://`.

---

## 1. Resumen

| Fuente | Qué es | Tipo de información | Histórico | Acceso automatizable |
|---|---|---|---|---|
| **API SINERGOX** | API de series del SIN y del mercado | ~93 métricas (≈190 combinaciones métrica-entidad) | Sí, desde 2000 en muchas series | Sí (`pydataxm`) |
| **API SIMEM** | API del Sistema de Información del Mercado Mayorista | 399 datasets: contratos, planeamiento, pronósticos, liquidación, maestros | Sí, 2013–2021 en adelante y proyecciones hasta 2031 | Sí (`pydatasimem`) |
| **Sinergox web** | Portal de XM con tableros, archivos históricos e informes | ~75 tableros Power BI, ~2.000 archivos Excel históricos (~100 series), informes y herramientas | Sí, archivos desde 1995–2000 | Parcial: los tableros Power BI **no**; los **históricos sí**, mediante una API de blobs pública |
| **PARATEC** | Parámetros técnicos de los activos del SIN | Ficha técnica de plantas, unidades, líneas, subestaciones, transformadores, compensación, baterías, embalses y series hidrológicas | **No**: es una foto vigente con "Fecha del reporte" | **Sí**: backend JSON público (`paratecbackend.xm.com.co`), sin autenticación |
| **IDO** (Informe Diario de Operación) | Resultado de la operación del día anterior, publicado antes de las 6:30 a. m. | 19 secciones: generación por tipo, intercambios, disponibilidad, DNA, tensión, frecuencia, desconexión de carga, costos, AGC, hidrología, eventos de generación, despacho, meteorología | Sí, **desde ~2013–2014** (día a día) | **Sí**: endpoint JSON público por día y sección |
| **Portal de archivos de XM** (antes FTP) | Archivos operativos y de planeación publicados por XM | Despacho y redespacho diario (txt), ofertas, **pronósticos de demanda por barra, UCP y área**, disponibilidad real, planeación (MPODE, IPOEL, senda de referencia), ahorro voluntario | Sí, **desde 2007–2008** | **Sí**: API pública `api-portalxm.xm.com.co/administracion-archivos` |
| **Cubos de análisis multidimensional** | Herramienta OLAP de Sinergox | 5 cubos (Demanda, Hidrología, Oferta, Transacciones, Intercambios) con ~280 métricas y dimensiones cruzables | Sí | **No**: requieren usuario registrado en Sinergox |

**Para qué sirve cada una:**
- **Series de tiempo de operación y mercado:** API SINERGOX (base) y SIMEM (detalle de mercado).
- **Archivos históricos largos y tableros de consulta:** Sinergox web.
- **Características técnicas de cada activo** (qué es, dónde está, cómo opera): PARATEC.
- **Operación del día a día** con el detalle que publica el CND: IDO.
- **Insumos operativos y de planeación del CND** (despacho, ofertas, pronósticos nodales, bases de datos de planeamiento): portal de archivos.
- **Cruces ad hoc entre métricas y dimensiones** (por ejemplo, demanda por mercado × CIIU × hora): cubos, pero solo con usuario registrado.

---

## 2. PARATEC: Parámetros Técnicos del SIN

### 2.1 Qué contiene

El portal tiene un **mapa interactivo** con pestañas de generación, transmisión e hidrología. Se puede filtrar por subárea, operador, modo de operación (despachada centralmente o no), estado y capacidad efectiva neta. Además ofrece **33 reportes** en "Informes y reportes", con filtros, exportación a Excel y adjuntos por activo.

| Grupo | Reportes |
|---|---|
| **Generación** | AGPE (autogeneradores a pequeña escala); plantas menores; capacidad efectiva neta por tipo de generación; planta y unidad térmica; planta y unidad hidráulica; planta y unidad equivalente solar; planta y unidad equivalente eólica; cadenas hidráulicas |
| **Transmisión** | Subestaciones y activos asociados; secciones de barra; bahías; activos por operador; líneas; líneas por operador; capacidad de intercambios internacionales |
| **Transformación y compensación** | Transformadores de potencia y de reserva; capacidad de transformación por operador; reactores; condensadores; FACTS (STATCOM/SVC); baterías SAEB y unidades equivalentes UAE |
| **Hidrología** | Sistema hidrológico del SIN (región, río, estación, embalse y planta); series hidrológicas; embalses |
| **Gráficos** | Diagramas unifilares por subárea y diagramas de cadenas hidráulicas (documentos) |

### 2.2 Acceso programático

Las tablas del portal se cargan desde un **backend REST público**, que responde JSON a un simple `GET`:

```
https://paratecbackend.xm.com.co/{servicio}/api/{Recurso}/{metodo}
   servicio ∈ reportegeneracion | reportetransmision | reportetransformacion | reportehidrologia
```

```python
import requests
r = requests.get("https://paratecbackend.xm.com.co/reportegeneracion/api/ThermalPlant/getAllFuel", timeout=60)
df = pd.DataFrame(r.json()["data"])
```

Endpoints verificados el 2026-10-20 (la lista completa con campos se guardó en el análisis previo y no se incluye aquí):

| Endpoint | Registros | Campos clave |
|---|---|---|
| `reportegeneracion/ThermalPlant/getAll` | 84 plantas térmicas | operador, estado, FPO, tipo de ciclo, modo de operación, tiempos de arranque frío/tibio/caliente, unidades, departamento, municipio, subárea |
| `reportegeneracion/ThermalPlant/getAllFuel` | 107 (planta × combustible) | combustible, CEN, **heat rate**, carga de sincronización, tiempos de calentamiento, MTCE, zonas prohibidas |
| `reportegeneracion/ThermalPlant/GetConfigurations` | 159 configuraciones | número y detalle de configuración, disponibilidad máxima, **mínimo técnico**, curva de acople, transiciones factibles (ciclos combinados) |
| `reportegeneracion/ThermalUnit/ThermalUnitInfo` | 130 unidades | 61 parámetros eléctricos: tensiones, potencia nominal, reactancias síncronas, transitorias y subtransitorias, constante de inercia H, gobernador |
| `reportegeneracion/ThermalUnit/ThermalFuelUnitInfo` | 130 | mínimo técnico por unidad, arranques programados por día, tiempos mínimos en línea/fuera, **rampas** de subida y bajada |
| `reportegeneracion/HydraulicPlant/HydraulicPlantInfo` | 164 plantas hidráulicas | CEN, factor de conversión, clasificación, mínimo obligatorio, arranque autónomo, **lat/lon/altitud**, municipio, rampas |
| `reportegeneracion/HydraulicUnit/HydraulicUnitInfo` | 284 unidades | 69 parámetros eléctricos y de turbina |
| `reportegeneracion/SolarPlant/getAll` | 377 plantas solares | potencia nominal y máxima, mínimo técnico, CEN, estatismo, banda muerta, tiempos de respuesta, **lat/lon**, municipio |
| `reportegeneracion/SolarEquivalentUnit/getAll` | 375 | número de inversores, modelo, eficiencia, corrientes de cortocircuito |
| `reportegeneracion/WindPlant/WindPlantInfo` y `WindEquivalentUnit/...` | 3 (despachadas centralmente) | ídem eólica: altura de buje, fabricante, modelo de aerogenerador |
| `reportegeneracion/SmallAutoGenerator/getAll` | **1.936 AGPE** | operador, tipo de agente, estado, FPO, tipo de generación, CEN, capacidad instalada, departamento, municipio |
| `reportegeneracion/NetEffectiveCapacities/getNetEffectiveCapacity` | resumen | CEN por tipo de generación y despacho |
| `reportetransmision/Substation/SubstationInfo` | 509 subestaciones | operadores, lat/lon, nivel de tensión, barras, bahías, líneas, transformadores, compensación |
| `reportetransmision/Line/getAll` | 929 líneas | tensión, corriente nominal, **límites térmico y de emergencia**, longitud, subestaciones |
| `reportetransmision/Bay/getAll`, `BarSections/getAll` | 3.876 / 1.000* | bahías y secciones de barra (*1.000 puede ser un límite de página) |
| `reportetransmision/Transmission/GetAll` | 8.648 activos | activos por operador y conexión origen-destino |
| `reportetransmision/InternationalLink/GetAll` | 1 | capacidad de importación y exportación por enlace (Ecuador, Venezuela) |
| `reportetransformacion/PowerTransformer/PowerTransformerInfo` | 1.075 transformadores | impedancias, pérdidas en el cobre y en el hierro, taps |
| `reportetransmision/Reactor/getAll`, `reportegeneracion/Capacitor/getAll`, `reportetransmision/StatcomSvc/getAll` | 81 / 63 / 26 | compensación reactiva y FACTS |
| `reportetransformacion/Battery/BatterySAEBInfo` | 0 | baterías SAEB (todavía sin registros) |
| `reportehidrologia/Hydrology/ReservoirInfo` | 29 embalses | niveles mínimo y máximo físico/técnico, volumen muerto, útil y total (también en GWh), factor de conversión, **curva operativa**, niveles probabilísticos |
| `reportehidrologia/Hydrology/HydrolgyInfo` | 29 | topología región → río → estación → embalse → planta |
| `reportehidrologia/Hydrology/HydrologySeriesInfo` | 6 regiones | media y 95 % PSS por región y serie hidrológica |

### 2.3 Qué aporta frente a las APIs

| Información | API SINERGOX | API SIMEM | PARATEC |
|---|---|---|---|
| Código, nombre, tipo, combustible, FPO y estado del recurso | `ListadoRecursos` | `0bfc9d`, `670221` | Sí, con más detalle |
| Capacidad efectiva neta | `CapEfecNeta` (serie diaria) | `FADED0`, `0bfc9d` | Solo valor vigente |
| Heat rate declarado | No | `8ae7da` (diario) | Sí (vigente) |
| **Ubicación geográfica** (municipio, departamento, lat/lon) | No | No (solo área/subárea) | **Sí** |
| **Parámetros de operación**: arranques, rampas, mínimo técnico, configuraciones de ciclo combinado | No | No | **Sí** |
| **Parámetros eléctricos** de unidades e inversores | No | No | **Sí** |
| **AGPE individuales** (1.936, con municipio) | Agregado (`ListadoRecursos` AGPE en web) | No | **Sí** |
| Líneas: tensión, longitud y operador | No | `7538fd` | Sí, más **límites térmicos y de emergencia** |
| Subestaciones | No | `F99E13` (código y nombre) | Sí: ubicación, tensión y equipos |
| Transformadores, reactores, condensadores, FACTS, baterías | No | No | **Sí** |
| Embalses: volúmenes técnicos, curva operativa | Series de volumen útil | Series de reservas | **Sí** (parámetros fijos) |
| Topología hidráulica (río → embalse → planta) | `ListadoRios`, `ListadoEmbalses` | `cc59b1` | Sí, completa |
| Series en el tiempo | Sí | Sí | **No** (foto actual) |

**Usos posibles:**
- **Panel de térmicas a carbón:** tiempos de arranque, rampas, mínimos técnicos y configuraciones, para evaluar la flexibilidad del parque.
- **Análisis regional:** municipio y coordenadas de cada planta, más el AGPE por municipio. Puede reemplazar el Excel manual `recursos_con_departamento`.
- **Transmisión:** límites térmicos de líneas y capacidad de intercambio internacional.

**Limitación:** como PARATEC no guarda historia, para seguir cambios hay que tomar fotos periódicas (por ejemplo, una descarga mensual guardada con su fecha).

---

## 3. Sinergox web

### 3.1 Estructura (sitio renovado, publicado el 28-sep-2026)

**A. Tableros por dominio (~75, todos en Power BI incrustado):**

| Dominio | Tableros |
|---|---|
| **Demandas y fronteras** (19) | Demanda comercial, real y pérdidas; evolución de la demanda comercial por región; demanda comercial por región y su variación; regulada vs no regulada; usuarios conectados al STN; demanda comercial por CIIU (más perfil horario y horaria); demanda del SIN y DNA; variación de la demanda del SIN; % de DNA; **demanda del SIN y PIB**; **escenarios de demanda de la UPME**; DNA por subárea; **demanda en tiempo real**; **demanda real por departamento de los UNR**; evolución de fronteras comerciales; **fallas o hurtos de fronteras** |
| **Hidrología** (9) | Mapa e hidrología del SIN; reservas (SIN, detalle, por región); aportes (detalle, por región); vertimientos (total y detalle) |
| **Oferta y generación** (14) | Generación real del SIN; generación térmica despachada centralmente; **AGPE**; CEN por fuente y despacho; CEN por área geográfica; consumo de combustible; disponibilidad real; **frecuencia en tiempo real**; variaciones y eventos de frecuencia; variaciones lentas y transitorias; tensión fuera de rango; eventos de tensión |
| **Transacciones y precios** (20) | Precio promedio ponderado de bolsa (diario y horario); precio de bolsa nacional; precio de oferta por combustible; oferta y disponibilidad; **cargos por uso**; patrón de velas y volatilidad del precio; delta incremento; **IPP e IPC**; precio de transacción en bolsa; **exposición y cobertura de los agentes**; **proyección de demanda y cobertura en contratos**; proyección de precios SICEP; participación en contratos registrados; precios de contratos por tipo de mercado; cargo por confiabilidad; montos liquidados; **índice de liquidez** |
| **Intercambios internacionales** (3) | Transacciones internacionales en energía y en moneda; precio de liquidación TIE |
| **Restricciones** (10) | Servicio de AGC; generación de seguridad fuera de mérito; generación en y fuera de mérito; % en reconciliación; precio de reconciliación positiva por área; reconciliaciones en energía y en moneda; balance, conceptos adicionados, costo y restricciones a cargo de la demanda |

**B. Archivos históricos:** unos 2.019 archivos Excel en ~100 series, por dominio y por año. El listado completo se guardó en el análisis previo y no se incluye aquí. Las series más relevantes:

| Dominio | Series (años disponibles) |
|---|---|
| Demanda | `Demanda_Energia_SIN` (2000–2026); **`Demanda_por_OR` (2000–2026)**; **`Perdidas_De_Energia_Por_Comercializador` (2000–2026)**; **`Demanda_Comercial_Por_Comercializador` (2000–2026, semestral)**; **`Demanda_Comercial_No_Regulada_Por_CIIU` (2000–2026, trimestral)**; **`Demanda_Maxima_De_Potencia` (2000–2026)**; demanda con cargo de generación excedentaria (2019–2026); exportación e importación con Ecuador y Venezuela (2000–2026) |
| Hidrología | Aportes diario y mensual; reservas diario y mensual; reservas diario SIN; vertimientos diario (2000–2026) |
| Oferta y generación | `Generacion_(kWh)` (1995–2026); generación ideal, programada y de seguridad; **generación distribuida (2021–2026)**; **excedentes AGPE (mensual, 2021–2026)**; compras de energía AGPE; CEN; disponibilidad comercial, declarada, real y ofertada AGC; consumo de combustible (2005–2026); **emisiones CO₂, CH₄ y N₂O** y factor de emisión (2019–2026); **generación real y CEN por departamento, municipio y agente** (2018–2026); desviaciones de generación variable |
| Transacciones y precios | Precio de bolsa nacional (1995–2026), internacional y TIE; precio ponderado; precio de oferta; precios mensuales; costo marginal del despacho programado; compras y ventas en bolsa y contratos; reconciliaciones; desviaciones; OEF, ENFICC y energía disponible adicional (CMS/VMS); DDV contratada; costo de suministro de combustible; resúmenes SICEP |
| Intercambios | Importaciones y exportaciones en kWh y $; precios de liquidación y de oferta; rentas de congestión (Colombia, Ecuador, FOES, restricciones) |
| Restricciones | Restricciones aliviadas ($) desde 2003; servicio AGC en kWh y $ |

**Acceso programático a los históricos** (API de blobs pública, la misma que usa el sitio):
```
GET https://sinergox.xm.com.co/historicos/api/blob/historicos/list?carpeta=<carpeta>          -> {"folders": [...], "files": [{name, modificado, path}]}
GET https://sinergox.xm.com.co/historicos/api/blob/historicos/file?path=<path>&download=true   -> archivo .xlsx
```

**C. Informes:** informes mensuales de análisis del mercado (desde abril de 2026, un solo informe consolidado), seguimiento a cogeneradores, operadores de red, Res. CREG 135/1997, rendición de cuentas ASIC-LAC, estadísticas de contratos, contratos de agentes intervenidos (Res. CREG 101 082/2025), boletín energético, tableros del SICEP y de contratación con FNCER, programa de incentivos al uso eficiente de energía.

**D. Herramientas:** diccionario de términos, **inventario de métricas** (Excel), cruce métricas-tema, listados de agentes, recursos de generación, recursos AGPE y suscripciones, y enlace a la API (GitHub de pydataxm).

### 3.2 El inventario oficial de métricas

El inventario oficial de métricas de Sinergox (archivo Excel descargado el 2026-10-20, no incluido aquí) es el mapa oficial de XM sobre qué métrica se publica y en qué canal. Tiene 808 filas, 309 métricas y 699 variables.

| Canal | Filas | Comentario |
|---|---|---|
| Análisis multidimensional (cubos) | 282 | Sin enlace público en el inventario |
| **API XM** | 187 | Corresponde a la API SINERGOX que ya usamos |
| Reportes Power BI | 179 | Tableros de la web |
| Archivos históricos | 124 | Excel descargables |
| Chatbot | 36 | Asistente "BIX" del sitio |

Clasificación: 765 públicas y 43 reservadas. Granularidad: sobre todo horaria (285) y diaria (357).

**Métricas de la web (Power BI, históricos o cubos) sin equivalente en la API XM:** son 180 de 298. La mayoría son **agregaciones derivables** de series que ya tenemos (acumulados, promedios, "últimos 12 meses", participaciones). Las que sí aportan información nueva frente a la API SINERGOX:

- **Demanda:** demanda en tiempo real; pronóstico de demanda; demanda de potencia proyectada por la UPME (escenarios alto, medio y bajo); PIB; causa de la DNA; fronteras comerciales y fallas/hurtos; demanda por OR y pérdidas por comercializador (en archivos históricos); demanda máxima de potencia.
- **Generación y oferta:** generación distribuida; excedentes AGPE; generación por departamento y municipio; emisiones; variables meteorológicas de plantas eólicas y solares (temperatura, humedad, presión, velocidad del viento); frecuencia y tensión; costos de O&M, suministro (CSC) y transporte (CTC) de combustible; precio de arranque y parada; indicadores de mérito ("veces que el recurso margina").
- **Mercado:** cargos por uso (DtUN, STR, monomio T'); FAZNI y FOES; IPC, IPP y TRM; índice de liquidez; exposición en bolsa por agente; número de contratos vigentes; precio de bolsa por tipo de usuario (UR y UNR).
- **Intercambios:** rentas de congestión y precios de oferta del país importador y exportador.

Varias de estas ya están en **SIMEM**: pronósticos (`9e9ee7`), meteorología (`7e704d`, `42f98c`), cargos STN/SDL (`43d851`, `d6cf36`), FAZNI/FOES/FAER/PRONE, TRM (`74DE8E`), eventos de frecuencia y tensión (`a859bf`, `a3db98`) y fronteras UNR (`fad372`, `f73ff2`).

---

## 4. IDO: Informe Diario de Operación

### 4.1 Qué contiene

El IDO publica cada mañana, antes de las 6:30 a. m., el resultado de la operación del SIN del día anterior. La dirección que aparece en los metadatos de SIMEM (`ido.xm.com.co/ido/SitePages/Default.aspx`) **ya no existe** (responde 404). El sitio vigente es https://ido.xm.com.co/Views/Ido/Default.

| Sección | Contenido |
|---|---|
| Generación | Generación programada en despacho y redespacho, y real, por tipo: hidráulica, térmica, solar, menores por tecnología, autogeneración, cogeneración, generación distribuida |
| Intercambios internacionales | Importaciones y exportaciones programadas y reales |
| Disponibilidad | Disponibilidad real por tecnología (MW y % de la CEN) |
| Sucesos | DNA (área, hora, MWh, descripción, subestación, municipio), tensión fuera de rango, variaciones de frecuencia, desconexión automática de carga |
| Costos | Costo marginal promedio del redespacho |
| AGC programado | MW horarios por planta |
| Hidrología | Aportes por región (GWh, %, media histórica, 95 % PSS); reservas totales y parciales por región (incluye NEP, MOS y MOI); vertimientos por embalse |
| Eventos de generación | Eventos por agente o unidad: capacidad, combustible, disponibilidad, estado, tipo y descripción |
| Despacho por recurso/unidad | Despacho programado por recurso |
| Meteorología de fuentes renovables | Variables meteorológicas de plantas solares y eólicas |

### 4.2 Acceso programático

Cada sección se carga desde un endpoint JSON público:

```
GET https://ido.xm.com.co/ArchivoIdo/ObtenerArchivosPorDia?fecha=AAAA-MM-DD&carpeta=<carpeta>&archivo=<archivo>
```

Ejemplos de `carpeta` / `archivo`: `Ido_Costos`/`costos`, `Ido_Hidrologia_Aportes`/`hidrologiaaportes`, `Ido_Hidrologia_Reservas`/`hidrologiareservas`, `Ido_AGC_Programado`/`agcprogramado`, `Ido_Eventos_Generadores`/`eventosgeneradores`, `Ido_Meteorologia_Solares`/`meteorologiasolares`. Las 19 carpetas son: `Ido_Completo, Ido_Generacion, Ido_Intercambios, Ido_Disponibilidad, Ido_Demanda_No_Atendida, Ido_Tension_Fuera_Rango, Ido_Variaciones_Frecuencia, Ido_Desconexion_Carga, Ido_Aspectos_Operacion, Ido_Costos, Ido_AGC_Programado, Ido_Hidrologia_Reservas, Ido_Hidrologia_Reservas_Parciales, Ido_Hidrologia_Aportes, Ido_Hidrologia_Vertimientos, Ido_Eventos_Generadores, Ido_Meteorologia_Solares, Ido_Meteorologia_Eolicas, Ido_Anteriores`.

- La respuesta trae `versiones` (V0, V1…) y el archivo `elegido`, porque el IDO también se corrige después de publicado.
- **Historia:** se verificó que hay datos para 2014–2026. Para 2013 la respuesta es `ok` pero sin versiones, y 2010–2012 no tienen datos.

### 4.3 Qué aporta frente a las APIs

- SIMEM ya trae varios datasets "del Informe Diario de Operación": aportes, reservas y vertimientos (`f138b6`, `2bff14`, `ec8596`, `c51127`, `9605b0`, `1d3ef8`) y costo marginal del redespacho (`f2ba18`).
- **Lo que solo está en el IDO** (o es más fácil de obtener ahí): el resumen diario de generación por tipo (programada frente a real, incluidas menores, autogeneración y GD), la descripción de los eventos de DNA con subestación y municipio, los eventos de generación del día y las reservas parciales.
- Es la fuente **más temprana** (D+1). Sirve para seguimiento coyuntural antes de que SIMEM o la API consoliden versiones.

---

## 5. Portal de archivos públicos de XM (reemplazo del FTP)

### 5.1 El FTP ya no existe

Las páginas de redespacho de xm.com.co todavía enlazan `ftp://sv01.xm.com.co/Redespacho/`, pero ese servidor **no existe** (el DNS responde NXDOMAIN). XM migró los archivos a:

- **Bibliotecas de archivos del portal**, que se listan y descargan con una API pública:
  ```
  GET https://api-portalxm.xm.com.co/administracion-archivos/ficheros?ruta=<ruta>&contenedor=storageportalxm&ordenarPor=nombre&orden=DESC&pagina=1&resultadosPorPagina=500&nombre=
  GET https://api-portalxm.xm.com.co/administracion-archivos/ficheros/descarga-archivo?ruta=<ruta/archivo>&nombreBlobContainer=storageportalxm
  ```
  La ruta raíz pública es `/M:/InformacionAgentes/Usuarios/Publico`. Se probó la descarga de `DESPACHO/2026-09/dDEM0901.txt`: responde sin autenticación.
- **Un servicio FTPS** (ruta `/INFORMACION_XM/Publico/`), según el texto del portal. Tiene instructivo propio y no se probó.

### 5.2 Qué contiene (`/Publico`)

El inventario de carpetas se guardó en el análisis previo y no se incluye aquí.

| Carpeta | Desde | Contenido |
|---|---|---|
| `DESPACHO/AAAA-MM` | 2008-01 | Archivos diarios del despacho programado (~17 por día): `dDEM` (**demanda horaria prevista por subárea**, MW), `dDEC` (despacho por recurso), `dAGC*` (AGC por recurso y unidad), `dCondIni*` (condiciones iniciales), `dConFig` (configuraciones), `dAConx`, `dDIN`, `dDDVPruebas`… |
| `Redespacho/AAAA-MM` | 2017 / 2019-12 | Ídem para el redespacho (`rDEM`, `rDEC`, `rAGC*`, `rCONFIG`, `rCambiosLis`) y autorizaciones (`AUT`, `AUTDESPACHO`) |
| `PredespachoIdeal/AAAA-MM` | 2018-01 | Predespacho ideal nacional (`PrId*_NAL`) e `iMAR` |
| `DespachoPreliminar`, `PredespachoProgramado` | 2007-01 a 2009-07 | Series antiguas |
| `INFODESPACHO/AAAA-MM` | 2007-01 | Informe diario del despacho en PDF, más archivos de barras |
| `OFERTAS/INICIAL/AAAA-MM` | ~2008 | **Ofertas diarias de precio y disponibilidad** (`OFEI*.txt`) |
| `OFERTAS/DDV`, `RD`, `InfoHidro`, `EVE`, `CAOferta`, `Compromiso`, `desempate` | varios | Demanda desconectable voluntaria, respuesta de la demanda (2016), información hidrológica (2010), energía vendida embalsada |
| **`DEMANDAS/Pronostico Oficial/AAAA-MM`** | **2007-01** | Pronóstico oficial de demanda: `PRON_BARRA*` (**por barra**, 25 archivos por mes), `PRON_UCP*` (por unidad de control de pronóstico), `PRON_AREAS*`, `PRON_SIN*`, `PRONUCP*`, `PRONSIN*` |
| `DEMANDAS/Propuesta CND/AAAA-MM` | 2010 / 2013 | Propuesta de pronóstico del CND (mismas desagregaciones) e informes de ENS |
| `DEMANDAS/indicadores/AAAA-MM` | 2011 (y anteriores a 2007) | Indicadores de desempeño de los pronósticos oficiales |
| `DEMANDAS/Seguimiento Demanda Diaria/AAAA-MM` | 2020-04 | Seguimiento de cargas críticas (Excel) |
| `PlaneacionOperacion/LargoPlazo` | — | **MPODE** (resultados y bases de datos), IPOELP y su base de datos, CEE, mínimos operativos, análisis trimestral de restricciones, bases PowerFactory, cargo por confiabilidad |
| `PlaneacionOperacion/MedianoPlazo`, `MedianoyLargoPlazo`, `CortoPlazo`, `Flexibilidad` | 2018– | IPOEMP, IPOEL, estudios EDAC y de Ecuador, estudios trimestrales, información energética |
| `PlaneacionOperacion/Senda de Referencia/AAAA` | 2021 | Supuestos y resultados de la senda de referencia de embalses |
| `INFORMAC/Iopf/Dispreal/AAAA-MM` | ~2010 | Disponibilidad real diaria (CSV) |
| `SIC/COMERCIA/Ahorro_Voluntario_de_Energia` | 2026 | Archivos del programa de ahorro voluntario de energía (Excel, con versiones) |
| `Genminimas/Mantenimientos`, `VerPC` | varios | Mantenimientos, pruebas de generación, recomendaciones eléctricas; verificación de parámetros (2007) |

### 5.3 Qué aporta frente a las APIs

- **Pronósticos de demanda por barra y por UCP desde 2007.** SIMEM solo publica pronósticos por mercado, área y subárea, y desde 2019–2023. Es la fuente con más detalle territorial de demanda que publica XM: nodal, en las barras del STN y del STR.
- **Demanda horaria prevista por subárea** en cada despacho (`dDEM`), desde 2008.
- **Ofertas diarias de precio y disponibilidad por recurso** (`OFEI`) y despacho por recurso, base para estudios de formación de precios.
- **Bases de datos de planeamiento (MPODE, IPOEL)**: los insumos del CND, no solo los resultados que publica SIMEM.
- **Programa de ahorro voluntario de energía** (2026), cuyos datasets están reservados en SIMEM.

---

## 6. Cubos de análisis multidimensional

### 6.1 Qué son y cómo se accede

Son la herramienta **OLAP** de Sinergox: permite armar tablas cruzando métricas con dimensiones (tiempo, geografía, agente, mercado, CIIU, recurso, combustible, versión de liquidación…). Según las preguntas frecuentes de Sinergox, el análisis multidimensional está disponible para **usuarios registrados** ("Inicio de sesión" en Sinergox). No tiene API pública y el inventario de métricas no trae enlace para estas filas.

Lo que sí es público es el **catálogo de cruces permitidos**, en la herramienta "Cruce Métricas Tema" (archivo descargado el 2026-10-20, no incluido aquí).

| Cubo | Métricas | Dimensiones |
|---|---|---|
| **Demanda** | 48 | Mes, día, hora · país, área, subárea · agente distribuidor (OR) y comercializador · mercado y submercado de consumo · CIIU y subactividad (solo no regulado) · causa de DNA · versión |
| **Hidrología** | 34 | Día · región hidrológica · agente generador · río · embalse · versión |
| **Oferta** | 59 | Año, mes, día, hora · área, subárea, **departamento, municipio** · causa de generación de seguridad · recurso, tipo de despacho, tipo de generación, unidad · agente · combustible · versión |
| **Transacciones** | 128 | Tiempo · país, área, subárea, departamento, municipio, **ADD, STR** · causa de restricciones · recurso · agentes generador, transmisor, distribuidor y comercializador · mercado · combustible · nivel de tensión · **contrato** (comprador, vendedor, tipo, tarifa, fechas de registro, inicio y fin) · enlace · versión |
| **Intercambios** | 14 | Hora · país · agente comercializador · enlace · versión |

Del inventario: 239 de las 282 filas de cubos son públicas y 43 están reservadas.

### 6.2 Qué aporta frente a las APIs

- **Cruces que ninguna API publica ya armados.** Por ejemplo: demanda real horaria × comercializador × submercado de consumo × subactividad CIIU; pérdidas × mercado; generación × municipio × combustible; transacciones en contratos × comprador × vendedor × tipo de contrato.
- **Dimensión "versión"** en todas las métricas, lo que permite consultar explícitamente versiones de liquidación.
- **Limitación:** requiere usuario registrado y no es automatizable. Conviene usarlo **solo para validar o para consultas puntuales**. Buena parte de esos cruces se puede reconstruir con SIMEM (`9b0967`, `14fabb`, contratos) y la API.

---

## 7. Matriz comparativa por tema

Leyenda: ✅ disponible · ◐ parcial o agregado · ❌ no disponible · 📄 solo archivo Excel · 📊 solo tablero (sin descarga directa) · 🔒 requiere usuario registrado

| Tema | API SINERGOX | API SIMEM | Sinergox web | PARATEC | IDO | Portal archivos | Cubos 🔒 |
|---|---|---|---|---|---|---|---|
| Demanda real y comercial del SIN (horaria) | ✅ | ✅ (por agente) | 📊 + 📄 | ❌ | ❌ | ◐ (prevista, `dDEM`) | ✅ |
| Demanda por mercado de comercialización / OR | ◐ (`DemaCome` por MC) | ✅ (`9b0967` OR×MC×CIIU) | 📄 `Demanda_por_OR` desde 2000 | ❌ | ❌ | ❌ | ✅ (OR, mercado, submercado) |
| **Demanda por área / subárea eléctrica** | ❌ (solo DNA) | ◐ (solo pronósticos) | ❌ (DNA por subárea) | ❌ | ❌ (DNA por área) | ✅ **horaria por subárea (`dDEM`/`rDEM`, desde 2008) y pronóstico por área, UCP y barra (desde 2007)** | ❌ (solo DNA y generación) |
| Demanda por CIIU (no regulado) | ✅ | ✅ | 📄 trimestral desde 2000 | ❌ | ❌ | ❌ | ✅ (incluye subactividad) |
| Demanda por comercializador | ✅ (`DemaCome/Agente`) | ✅ (`d55202`) | 📄 desde 2000 | ❌ | ❌ | ❌ | ✅ |
| Pérdidas por comercializador | ◐ (`PerdidasEner`) | ✅ (`22e6e3`) | 📄 desde 2000 | ❌ | ❌ | ❌ | ✅ |
| Demanda máxima de potencia | ❌ | ❌ | 📄 desde 2000 | ❌ | ❌ | ❌ | ✅ |
| Demanda en tiempo real | ❌ | ❌ | 📊 | ❌ | ❌ | ❌ | ❌ |
| Pronóstico de demanda | ❌ | ✅ (oficial y CND) | 📊 | ❌ | ❌ | ✅ **por barra, UCP, área y SIN desde 2007** | ❌ |
| Escenarios de demanda UPME | ❌ | ◐ (`DemandaUPME` en `90b78a`) | 📊 (incluye potencia alta/media/baja) | ❌ | ❌ | ❌ | ✅ (energía y potencia) |
| DNA (eventos y causa) | ◐ (por área) | ✅ (`3C77AF`) | 📊 | ❌ | ✅ (con subestación y municipio) | ◐ (informes ENS) | ✅ (causa) |
| Fronteras comerciales / UNR | ❌ | ✅ (conteos) | 📊 (incluye fallas y hurtos) | ❌ | ❌ | ❌ | ◐ |
| Generación por recurso | ✅ | ✅ | 📄 desde 1995 | ❌ | ◐ (por tipo, diario) | ✅ (despacho y redespacho programados) | ✅ |
| Generación por departamento / municipio | ❌ | ❌ | 📄 desde 2018 | ◐ (ubicación de cada planta) | ❌ | ❌ | ✅ |
| Generación distribuida y excedentes AGPE | ❌ | ◐ | 📄 desde 2021 | ✅ (1.936 AGPE, ficha) | ◐ (GD diaria) | ❌ | ◐ |
| Capacidad efectiva neta | ✅ (serie) | ✅ (serie) | 📄 | ✅ (vigente, con detalle) | ❌ | ❌ | ✅ |
| Parámetros técnicos (arranques, rampas, mínimos, configuraciones) | ❌ | ❌ | ❌ | ✅ | ❌ | ◐ (configuraciones del despacho) | ❌ |
| Heat rate | ◐ (consumo de combustible) | ✅ (declarado) | 📊 | ✅ | ❌ | ❌ | ◐ (consumo de combustible) |
| Ubicación (municipio, lat/lon) | ❌ | ❌ | ◐ | ✅ | ◐ (municipio de eventos DNA) | ❌ | ✅ (dimensión municipio) |
| Emisiones de CO₂ | ◐ (`ConsCombAprox`) | ❌ | 📄 desde 2019 | ❌ | ❌ | ❌ | ✅ |
| Hidrología: aportes, reservas, vertimientos | ✅ | ✅ | 📄 desde 2000 | ◐ (parámetros de embalse) | ✅ (D+1) | ◐ (InfoHidro 2010) | ✅ |
| Parámetros de embalses y curva operativa | ❌ | ❌ | ❌ | ✅ | ◐ (MOS, MOI, NEP) | ◐ (senda de referencia) | ◐ (mínimos operativos) |
| Precio de bolsa, oferta, escasez | ✅ | ✅ | 📄 desde 1995 | ❌ | ◐ (costo marginal del redespacho) | ✅ (ofertas `OFEI` desde ~2008) | ✅ |
| Contratos: precios y cobertura | ◐ (promedios) | ✅ (detalle y futuros) | 📊 | ❌ | ❌ | ❌ | ✅ (por contrato, comprador, vendedor) |
| Cargos por uso (STN, STR, DtUN) | ❌ | ✅ | 📊 | ❌ | ❌ | ❌ | ✅ |
| Restricciones, reconciliaciones, AGC | ✅ | ✅ | 📄 | ❌ | ◐ (AGC programado) | ✅ (AGC del despacho) | ✅ |
| Intercambios internacionales y rentas de congestión | ◐ | ✅ | 📄 desde 2000–2003 | ✅ (capacidad de enlaces) | ✅ (diario) | ◐ | ✅ |
| Red de transmisión (líneas, subestaciones, transformadores) | ❌ | ◐ (líneas, listado de subestaciones) | ❌ | ✅ | ❌ | ◐ (barras, bases PowerFactory) | ❌ |
| Frecuencia y tensión | ❌ | ✅ (eventos) | 📊 (incluye tiempo real) | ❌ | ✅ (sucesos diarios) | ❌ | ❌ |
| Macro: PIB, IPC, IPP, TRM | ❌ | ◐ (TRM) | 📊 | ❌ | ❌ | ❌ | ❌ |

---

## 8. Recomendaciones para la comparación siguiente

1. **Históricos de Sinergox vs API SINERGOX.** Es la comparación más directa: mismas variables, distinto canal. Con la API de blobs se pueden bajar, por ejemplo, `Demanda_Energia_SIN`, `Generacion_(kWh)` y `Precio_Bolsa_Nacional` y contrastarlos con `DemaSIN`, `Gene` y `PrecBolsNaci`. Además, los históricos permiten extender series anteriores al año 2000.
2. **Series que solo están en archivos históricos.** `Demanda_por_OR`, `Perdidas_De_Energia_Por_Comercializador`, `Demanda_Maxima_De_Potencia`, generación por municipio, emisiones y excedentes AGPE no existen en ninguna API y son útiles para el análisis de demanda regional. Conviene cargarlas como fuente propia cuando se necesiten (con su ficha).
3. **PARATEC como maestro técnico.** Descargarlo periódicamente (guardando la fecha de cada foto) y cruzarlo por nombre o código de planta con `ListadoRecursos` (SINERGOX) y `0bfc9d`/`670221` (SIMEM). La llave de cruce hay que construirla: PARATEC usa nombres y MRID, no siempre el código SIC.
4. **Tableros Power BI.** Se usan solo para validación visual. Sus datos no se exponen por API; lo que se puede reproducir está en los históricos, en SIMEM o en la API.
5. **Pronósticos de demanda por barra y UCP (portal de archivos).** Es la fuente de mayor detalle territorial y la más larga (desde 2007). Conviene integrarla para comparar con los pronósticos de SIMEM y con la demanda real por subárea o mercado.
6. **IDO para seguimiento D+1.** Útil para un tablero coyuntural (generación por tipo, DNA, hidrología del día anterior) y para comparar sus primeras versiones con las cifras consolidadas.
7. **Cubos solo para validación.** Si UPME tiene usuario registrado en Sinergox, se pueden usar para verificar cruces puntuales (por ejemplo, demanda × submercado × subactividad CIIU). No se recomienda basar el pipeline en ellos.
8. **Versiones de liquidación.** Al comparar históricos o API con SIMEM, tener en cuenta que SINERGOX publica la versión vigente en el momento de la consulta. Con el precio de bolsa se verificó que la última versión es la TXn más alta, en el orden **TX1 < TX2 < TXR < TXF < TX3 < … < TXn**: así coincide con SINERGOX el 100 % de las horas de 2020–2024. **Pendiente:** el código (`resolve_versions`) y [Diccionario_SIMEM.md](Diccionario_SIMEM.md) §2.1 todavía priorizan TXF.

---

## 9. Conclusión: la información de XM no está centralizada

**No existe una fuente única y completa de XM.** Cada canal publica una parte de la información, con distinta desagregación, historia, definición y forma de acceso. Para responder una pregunta concreta hay que saber de antemano dónde está cada dato. El caso de la **demanda por área eléctrica** lo ilustra bien:

| Fuente | ¿Tiene demanda por área / subárea? |
|---|---|
| API SINERGOX | No. Solo la demanda **no atendida** por área y subárea |
| Sinergox web (tableros e históricos) | No. Demanda por región comercial, OR y CIIU; DNA por subárea |
| Cubos de Sinergox | No. Las dimensiones área y subárea solo se cruzan con DNA y generación |
| PARATEC | No. No tiene demanda; solo dice a qué subárea pertenece cada activo |
| IDO | No. Solo eventos de DNA por área |
| API SIMEM | Solo **pronósticos** por área y subárea (oficial, CND, planeamiento) |
| **Portal de archivos (ex FTP)** | **Sí**: demanda horaria por subárea en cada despacho (`dDEM`) y redespacho (`rDEM`) desde 2008, y pronóstico oficial por área, UCP y barra (`PRON_AREAS`, `PRON_UCP`, `PRON_BARRA`) desde 2007 |

Es decir, el dato está en la fuente menos visible y menos documentada: archivos `.txt` en una biblioteca que el propio portal todavía enlaza como un FTP que ya no existe. Ojo con un matiz: `dDEM`/`rDEM` es la demanda **considerada en el despacho y redespacho** (la que usa la operación), no la demanda medida y liquidada. Para un valor liquidado por área hay que agregar la demanda por mercado de comercialización (SIMEM `9b0967`) con una tabla de correspondencia mercado → subárea, que XM tampoco publica.

### 9.1 Argumentos

1. **Cada fuente tiene contenido exclusivo.** Ninguna es un subconjunto de otra:
   - **API SINERGOX:** series largas y uniformes del SIN.
   - **SIMEM:** contratos, pronósticos, planeamiento, cargos, fronteras UNR.
   - **Históricos de Sinergox web:** demanda por OR, pérdidas por comercializador, potencia máxima, generación por municipio, emisiones; algunas series desde 1995.
   - **PARATEC:** parámetros técnicos, ubicación, red.
   - **IDO:** detalle diario D+1.
   - **Portal de archivos:** despacho, ofertas, pronósticos nodales, bases de planeamiento.
   - **Cubos:** cruces multidimensionales.
2. **El propio inventario oficial de XM lo confirma.** Clasifica sus 808 métricas en **cinco canales distintos** (API, Power BI, archivos históricos, cubos, chatbot). De las 298 métricas web únicas, **180 no tienen equivalente en la API**. Además, el inventario no incluye SIMEM, PARATEC, el IDO ni el portal de archivos: no es un catálogo completo ni siquiera de lo que publica XM.
3. **La misma variable no da el mismo número en todas las fuentes.** Comparación hecha en el análisis previo (ver [Diccionario_SIMEM.md](Diccionario_SIMEM.md) §5.3):
   - La demanda real de SIMEM queda ~0,65 % por debajo de `DemaReal` de SINERGOX, y hasta 6 % algunos días, por diferencia de definición.
   - Los aportes difieren 2–5 % entre fuentes en 2020–2022.
   - La capacidad efectiva solo coincide si se filtran las plantas por explotación comercial.
   - El precio de escasez solo coincide comparando el concepto correcto (`PrecEscaPon`, no `PrecEsca`).
4. **Versiones de liquidación.** SIMEM publica hasta once versiones por periodo (TX1…TX8, TXR, TXF); el IDO tiene sus propias versiones (V0, V1…); SINERGOX publica la versión vigente al consultar. Sin una regla explícita de versión, dos extracciones "de la misma fuente" en fechas distintas dan valores distintos.
5. **Identificadores no homogéneos.** El mismo activo aparece como código SIC (API), `CodigoPlanta`/`CodigoUnidadGeneracion` (SIMEM), nombre y MRID (PARATEC) o nombre libre (IDO). Las subáreas aparecen como `Are0015` (SIMEM), "SubArea Antioquia" (portal) o "SubAntioquia" (pronósticos). Cruzar fuentes exige construir tablas de equivalencia propias.
6. **Granularidad y cobertura temporal distintas.** El mismo tema puede ser horario en una fuente, diario en otra y mensual en una tercera. La historia empieza en años distintos: 1995 (históricos web), 2000 (API), 2007–2008 (portal), 2013–2014 (IDO, SIMEM) o 2021 (muchos datasets SIMEM). PARATEC no tiene historia.
7. **Tecnologías de acceso heterogéneas:** dos APIs con librería (`pydataxm`), APIs JSON sin documentar (PARATEC, IDO, blobs de Sinergox, portal de archivos), tableros Power BI sin exportación programática, cubos OLAP con usuario y un servicio FTPS. Cada una requiere su propio conector.
8. **Inestabilidad de enlaces y canales.** Durante esta revisión:
   - el enlace al IDO que publica SIMEM devolvió 404;
   - el FTP enlazado en el portal no existe;
   - las URL `http://` de PARATEC y Sinergox fallan;
   - Sinergox fue rediseñado en sep-2026;
   - una biblioteca del portal respondió con error.

   Las rutas cambian sin aviso.
9. **Duplicación sin trazabilidad.** Varios datos aparecen en dos o tres canales (por ejemplo, aportes y reservas en la API, en SIMEM "normal", en SIMEM "del IDO", en el IDO y en los históricos), sin que se indique cuál es la fuente primaria ni cómo se relacionan sus versiones.

### 9.2 Implicaciones para un proyecto de datos

- **Mantener un catálogo propio de variables** que diga, para cada variable, en qué fuentes está, con qué definición, granularidad e historia, y cuál se adopta como **fuente de referencia**. Este documento, [Diccionario_SIMEM.md](Diccionario_SIMEM.md) y [Diccionario_pydataxm.md](Diccionario_pydataxm.md) son la base.
- **Fuente de referencia por tipo de uso:**

  | Necesidad | Fuente de referencia sugerida |
  |---|---|
  | Niveles de demanda, generación y precio del SIN | API SINERGOX |
  | Desagregaciones de demanda (OR, mercado, CIIU, regulado/no regulado) | SIMEM `9b0967` |
  | Demanda y pronóstico por área, subárea, UCP o barra | Portal de archivos (ex FTP) |
  | Pronósticos y planeamiento del CND | SIMEM + bases de planeamiento del portal |
  | Contratos y cobertura | SIMEM |
  | Parámetros técnicos y ubicación de activos | PARATEC |
  | Seguimiento diario (D+1) | IDO |
  | Series anteriores al 2000 o variables solo históricas | Históricos de Sinergox web |
  | Validación de cruces puntuales | Cubos (si hay usuario) |

- **Tablas maestras de equivalencias:** agentes, recursos y unidades (SIC ↔ SIMEM ↔ PARATEC), y mercados ↔ subáreas ↔ áreas.
- **Regla explícita de versión de liquidación** en cada extracción, guardando la versión y la fecha de descarga.
- **Monitoreo de endpoints:** una verificación periódica de que las URL y APIs siguen respondiendo, porque cambian sin aviso.
