# Diccionario de la API de XM (`pydataxm`)

Referencia completa para consultar datos del mercado eléctrico colombiano mediante la librería `pydataxm`, que se conecta a la API pública de XM (operador del SIN).

---

## 1. Uso Básico

```python
from pydataxm import pydataxm
import datetime as dt

objetoAPI = pydataxm.ReadDB()

# Consultar una variable
df = objetoAPI.request_data(
    'Gene',              # MetricId (variable)
    'Recurso',           # Entity (métrica/dimensión)
    start_date=dt.date(2024, 1, 1),
    end_date=dt.date(2024, 12, 31)
)

# Ver todas las variables disponibles
objetoAPI.get_collections()          # DataFrame completo
objetoAPI.get_collections('Gene')    # Info de una variable específica
```

> **Importante:** La API tiene un límite de 31 días por request para datos horarios/diarios. La librería los particiona automáticamente en requests mensuales.

---

## 2. Conceptos Clave

### 2.1 MetricId (Variable)
Identificador de la variable a consultar (ej: `Gene`, `DemaReal`, `PrecBolsNaci`). Hay **93 MetricIds únicos** que generan **193 combinaciones** con sus entidades.

### 2.2 Entity (Métrica / Dimensión)
La granularidad o agrupación con que se devuelven los datos. **Una misma variable puede consultarse con diferentes entidades y retorna estructuras de tabla distintas.**

| Entity | Descripcion | Ejemplo de `Values_code` |
|--------|-------------|--------------------------|
| `Sistema` | Agregado nacional (1 fila por fecha) | `Sistema` |
| `Recurso` | Por planta de generación | `2QBW`, `CHVR` |
| `Agente` | Por agente comercial | `EPMC`, `ISGG` |
| `Embalse` | Por embalse | `AGREGADO BOGOTA` |
| `Rio` | Por río | `BOGOTA N.R.` |
| `Enlace` | Por enlace internacional | - |
| `Area` | Por área operativa | - |
| `SubArea` / `Subarea` | Por subárea operativa | - |
| `Combustible` | Por tipo de combustible | - |
| `RecursoComb` | Recurso-combustible (emisiones) | - |
| `CIIU` | Por código CIIU (actividad económica) | - |
| `MercadoComercializacion` | Por mercado de comercialización | - |

### 2.3 Type (Temporalidad)
Define la frecuencia de los datos y la estructura de la tabla retornada:

| Type | Frecuencia | Max días/request | Estructura de salida |
|------|-----------|-------------------|---------------------|
| `HourlyEntities` | Horaria | 31 | 27 cols: `Values_Hour01`...`Values_Hour24` + `Values_code` + `Date` |
| `DailyEntities` | Diaria | 31 | 3-4 cols: `Value` (o `Code`+`Value`) + `Date` |
| `MonthlyEntities` | Mensual | 731 | 3 cols: `Value` + `Date` |
| `ListsEntities` | Catálogo | 731 | Variable (atributos del listado) |

---

## 3. Estructuras de Tabla por Tipo

### 3.1 HourlyEntities (Datos horarios)
La mayoría de variables operativas. Retorna **una fila por recurso/agente por día** con 24 columnas de hora.

```
| Id      | Values_code | Values_Hour01 | Values_Hour02 | ... | Values_Hour24 | Date       |
|---------|-------------|---------------|---------------|-----|---------------|------------|
| Recurso | 2QBW        | 10584.24      | 10583.15      | ... | 19974.20      | 2024-01-01 |
| Recurso | CHVR        | 145678.00     | 143200.50     | ... | 150200.30     | 2024-01-01 |
```

- Cuando Entity=`Sistema`: `Values_code` = `"Sistema"`, **1 fila por día**
- Cuando Entity=`Recurso`: `Values_code` = código del recurso, **N filas por día**
- Cuando Entity=`Agente`: `Values_code` = código del agente, **N filas por día**

**Variables con esta estructura:** `Gene`, `GeneIdea`, `DemaReal`, `DemaCome`, `PrecBolsNaci`, `PrecOferDesp`, `DispoReal`, `DispoCome`, `DispoDeclarada`, `GeneSeguridad`, `GeneFueraMerito`, `GeneProgDesp`, `GeneProgRedesp`, `RecoPosEner`, `RecoNegEner`, `DesvEner`, `CompBolsNaciEner`, `CompContEner`, `VentContEner`, `VentBolsNaciEner`, `ExpoEner`, `ImpoEner`, `PerdidasEner`, `DemaRealReg`, `DemaRealNoReg`, `DemaComeReg`, `DemaComeNoReg`, `RestAliv`, `RestSinAliv`, entre otras.

### 3.2 DailyEntities (Datos diarios)

**Formato cuando Entity=`Sistema`** (sin desagregación):
```
| Id      | Value           | Date       |
|---------|-----------------|------------|
| Sistema | 176268815.03    | 2024-01-01 |
| Sistema | 178500320.10    | 2024-01-02 |
```

**Formato cuando Entity=`Recurso`** (con código):
```
| Id      | Code | Value    | Date       |
|---------|------|----------|------------|
| Recurso | 2QBW | 19900.0  | 2024-01-01 |
| Recurso | CHVR | 600000.0 | 2024-01-01 |
```

**Formato cuando Entity=`Embalse` o `Rio`** (con nombre):
```
| Id      | Name             | Value          | Date       |
|---------|------------------|----------------|------------|
| Embalse | AGREGADO BOGOTA  | 2533878200.0   | 2024-01-01 |
| Rio     | A. SAN LORENZO   | 3843500.0      | 2024-01-01 |
```

> **Nota:** En DailyEntities la columna de identificación cambia: `Code` para recursos, `Name` para embalses/ríos. En HourlyEntities siempre es `Values_code`.

### 3.3 MonthlyEntities (Datos mensuales)
Solo disponibles a nivel Sistema. Estructura igual a DailyEntities/Sistema.

### 3.4 ListsEntities (Catálogos)
Cada listado tiene su propia estructura de columnas. Ver Sección 5.

---

## 4. Variables Principales

### 4.1 Generación

| MetricId | Nombre | Entidades | Type | Unidad | Descripción |
|----------|--------|-----------|------|--------|-------------|
| `Gene` | Generación Real | Sistema, Recurso | Hourly | kWh | Generación neta en puntos de frontera |
| `GeneIdea` | Generación Ideal | Sistema, Recurso | Hourly | kWh | Despacho ideal (red inexistente) |
| `GeneProgDesp` | Gen. Programada Despacho | Recurso | Hourly | kWh | Despacho programado con red real |
| `GeneProgRedesp` | Gen. Programada Redespacho | Recurso | Hourly | kWh | Generación del redespacho |
| `GeneSeguridad` | Gen. de Seguridad | Recurso | Hourly | kWh | Generación para seguridad del SIN |
| `GeneFueraMerito` | Gen. Fuera de Mérito | Recurso | Hourly | kWh | Generación forzada (precio > bolsa) |

### 4.2 Demanda

| MetricId | Nombre | Entidades | Type | Unidad | Descripción |
|----------|--------|-----------|------|--------|-------------|
| `DemaReal` | Demanda Real | Sistema, Agente | Hourly | kWh | Demanda regulada + no regulada (sin AP) |
| `DemaCome` | Demanda Comercial | Sistema, Agente, CIIU, MercadoComercializacion | Hourly | kWh | Demanda + pérdidas STN + consumos propios |
| `DemaSIN` | Demanda Energía SIN | Sistema | Daily | kWh | Basada en generación neta (incluye todo) |
| `DemaOR` | Demanda por OR | Agente | Hourly | kWh | Demanda real del OR sin referir al STN |
| `DemaRealReg` | Demanda Real Regulada | Sistema, Agente | Hourly | kWh | Solo mercado regulado |
| `DemaRealNoReg` | Demanda Real No Regulada | Sistema, Agente | Hourly | kWh | Solo mercado no regulado |
| `DemaComeReg` | Demanda Comercial Regulada | Sistema, Agente | Hourly | kWh | Comercial regulada |
| `DemaComeNoReg` | Demanda Comercial No Regulada | Sistema, Agente, CIIU | Hourly | kWh | Comercial no regulada |
| `DemaMaxPot` | Demanda Máxima Potencia | Sistema | Daily | kW | Pico de demanda diario (MW) |
| `DemaNoAtenProg` | Demanda No Atendida Programada | Area, Subarea | Daily | kWh | Desconexiones programadas |
| `DemaNoAtenNoProg` | Demanda No Atendida No Programada | Area, Subarea | Daily | kWh | Desconexiones forzadas |

**Diferencia clave `DemaReal` vs `DemaCome` vs `DemaSIN`:**
- **DemaReal**: Lectura en frontera. No incluye Alumbrado Público.
- **DemaCome**: DemaReal + participación en pérdidas del STN + consumos propios de generadores.
- **DemaSIN**: Calculada desde la generación neta. Incluye hidráulicas, térmicas, menores, cogeneradores, solares, eólicas, demanda no atendida, limitación de oferta, importaciones y exportaciones.

### 4.3 Precios

| MetricId | Nombre | Entidades | Type | Unidad | Descripción |
|----------|--------|-----------|------|--------|-------------|
| `PrecBolsNaci` | Precio Bolsa Nacional | Sistema | Hourly | COP/kWh | Precio de última planta flexible + delta |
| `PrecBolsNaciTX1` | Precio Bolsa TX1 | Sistema | Hourly | COP/kWh | Promedio aritmético versión TX1 |
| `PPPrecBolsNaci` | Precio Bolsa Ponderado | Sistema | Daily | COP/kWh | Ponderado por generación |
| `PrecTransBolsa` | Precio Transacción Bolsa | Sistema | Hourly | COP/kWh | Precio de transacciones en bolsa |
| `PrecOferDesp` | Precio Oferta Despacho | Recurso | Hourly | COP/kWh | Precio ofertado por recurso (incluye CEE) |
| `PrecOferIdeal` | Precio Oferta Ideal | Recurso | Daily | COP/kWh | Precio ofertado (incluye CERE en vez de CEE) |
| `MaxPrecOferNal` | Máximo Precio Oferta Nacional | Sistema | Hourly | COP/kWh | Máximo precio ofertado en el sistema |
| `CostMargDesp` | Costo Marginal Despacho | Sistema | Hourly | COP/kWh | Incremento costo por unidad adicional de demanda |
| `PrecPromCont` | Precio Promedio Contratos | Sistema | Daily | COP/kWh | Ponderado por energía de contratos |
| `PrecPromContRegu` | Precio Prom. Contratos Regulados | Sistema | Hourly | COP/kWh | Solo mercado regulado |
| `PrecPromContNoRegu` | Precio Prom. Contratos No Regulados | Sistema | Hourly | COP/kWh | Solo mercado no regulado |
| `MC` | MC (Máximo Costo) | Sistema | Monthly | COP/kWh | Costo promedio ponderado de contratos bilaterales regulados |

### 4.4 Precio de Escasez

| MetricId | Nombre | Type | Unidad | Descripción |
|----------|--------|------|--------|-------------|
| `PrecEsca` | Precio Escasez | Daily | COP/kWh | Establecido por CREG, actualizado mensualmente |
| `PrecEscaAct` | Precio Escasez Activación | Daily | COP/kWh | Umbral de activación (Res. CREG 140/2017) |
| `PrecEscaMarg` | Precio Marginal Escasez | Daily | COP/kWh | Marginal de escasez |
| `PrecEscaSup` | Precio Escasez Superior | Daily | COP/kWh | Banda superior |
| `PrecEscaInf` | Precio Escasez Inferior | Daily | COP/kWh | Banda inferior |
| `PrecEscaPon` | Precio Escasez Ponderado | Daily | COP/kWh | Ponderado del sistema |

### 4.5 Capacidad y Disponibilidad

| MetricId | Nombre | Entidades | Type | Unidad | Descripción |
|----------|--------|-----------|------|--------|-------------|
| `CapEfecNeta` | Capacidad Efectiva Neta | Recurso | Daily | kW | Máxima potencia neta en condiciones normales |
| `DispoReal` | Disponibilidad Real | Recurso | Hourly | kW | Disponibilidad promedio real |
| `DispoCome` | Disponibilidad Comercial | Recurso | Hourly | kW | Declaración modificada por operación real |
| `DispoDeclarada` | Disponibilidad Declarada | Recurso | Hourly | kWh | Máxima potencia reportada en oferta |
| `ENFICC` | Energía Firme (CxC) | Recurso, Sistema | Daily | kWh | Máxima energía en baja hidrología |
| `ObligEnerFirme` | Obligación Energía Firme | Recurso | Daily | kWh | OEF por recurso |

> **CapEfecNeta** usa formato Daily con columnas `Code` + `Value` (no `Values_code` + `Values_HourXX`). Incluye menores y cogeneradores.

### 4.6 Aportes Hídricos

| MetricId | Nombre | Entidades | Type | Unidad | Descripción |
|----------|--------|-----------|------|--------|-------------|
| `AporEner` | Aportes Energía | Sistema, Rio | Daily | kWh | Caudales en energía de ríos al SIN |
| `AporEnerMediHist` | Aportes Media Histórica Energía | Sistema, Rio | Daily | kWh | Promedio histórico mensual |
| `AporCaudal` | Aportes Caudal | Rio | Daily | m3/s | Caudales en m3/s |
| `AporCaudalMediHist` | Aportes Media Histórica Caudal | Rio | Daily | m3/s | Promedio histórico |
| `PorcApor` | Aportes % | Sistema, Rio | Daily | % | [Aportes / Media Histórica] x 100 |

### 4.7 Embalses

| MetricId | Nombre | Entidades | Type | Unidad | Descripción |
|----------|--------|-----------|------|--------|-------------|
| `VoluUtilDiarEner` | Volumen Útil Diario Energía | Sistema, Embalse | Daily | kWh | Volumen sobre mínimo técnico |
| `VoluUtilDiarMasa` | Volumen Útil Diario Masa | Embalse | Daily | m3 | Idem en m3 |
| `PorcVoluUtilDiar` | Volumen Útil % | Sistema, Embalse | Daily | % | VoluUtil / CapacidadUtil |
| `CapaUtilDiarEner` | Capacidad Útil Energía | Sistema, Embalse | Daily | kWh | Volumen entre mín. técnico y máx. físico |
| `CapaUtilDiarMasa` | Capacidad Útil Masa | Sistema, Embalse | Daily | m3 | Idem en m3 |
| `VertEner` | Vertimientos Energía | Embalse, Sistema | Daily | kWh | Agua evacuada por exceder capacidad |
| `VertMasa` | Vertimientos Masa | Embalse | Daily | m3 | Idem en m3 |
| `DescMasa` | Descargas Masa | Embalse | Daily | m3 | Agua descargada por compuertas |
| `VolTurbMasa` | Volumen Turbinado | Embalse, Sistema | Daily | m3 | Agua turbinada (incluye caudal ambiental) |

### 4.8 Comercialización y Bolsa

| MetricId | Nombre | Entidades | Type | Unidad |
|----------|--------|-----------|------|--------|
| `CompBolsNaciEner` | Compras Bolsa Nacional Energía | Sistema, Agente | Hourly | kWh |
| `VentBolsNaciEner` | Ventas Bolsa Nacional Energía | Sistema, Agente | Hourly | kWh |
| `CompContEner` | Compras Contrato Energía | Sistema, Agente | Hourly | kWh |
| `VentContEner` | Ventas Contrato Energía | Sistema, Agente | Hourly | kWh |
| `CompBolsaTIEEner` | Compras Bolsa TIE Energía | Sistema, Agente | Hourly | kWh |
| `VentBolsaTIEEner` | Ventas Bolsa TIE Energía | Sistema, Agente | Hourly | kWh |
| `CompBolsaIntEner` | Compras Bolsa Internacional | Sistema, Agente | Hourly | kWh |
| `VentBolsaIntEner` | Ventas Bolsa Internacional | Sistema, Agente | Hourly | kWh |
| `CompContEnerSICEP` | Compras Contrato SICEP | Sistema, Agente | Hourly | kWh |
| `VentContEnerSICEP` | Ventas Contrato SICEP | Sistema, Agente | Hourly | kWh |

Para cada variable de energía existe su equivalente en moneda (`CompBolsNacMoneda`, `VentaBolsNaciMoneda`, `CompContMoneda`, etc.)

### 4.9 Intercambios Internacionales

| MetricId | Nombre | Entidades | Type | Unidad |
|----------|--------|-----------|------|--------|
| `ExpoEner` | Exportaciones Energía | Sistema, Enlace | Hourly | kWh |
| `ImpoEner` | Importaciones Energía | Sistema, Enlace | Hourly | kWh |
| `ExpoMoneda` | Exportaciones Moneda | Sistema, Enlace | Hourly | COP |
| `ImpoMoneda` | Importaciones Moneda | Sistema, Enlace | Hourly | COP |
| `ExportMonedaUSD` | Exportaciones USD | Sistema | Hourly | COP |
| `ImportMonedaCOP` | Importaciones COP | Sistema | Hourly | COP |
| `ImportMonedaUSD` | Importaciones USD | Sistema | Hourly | COP |
| `DeltaInt` | Delta Internacional | Sistema | Daily | COP/kWh |
| `DeltaNal` | Delta Nacional | Sistema | Daily | COP/kWh |

### 4.10 Reconciliaciones y Desviaciones

| MetricId | Nombre | Entidades | Type | Unidad |
|----------|--------|-----------|------|--------|
| `RecoPosEner` | Reconciliación Positiva Energía | Recurso | Hourly | kWh |
| `RecoNegEner` | Reconciliación Negativa Energía | Recurso | Hourly | kWh |
| `RecoPosMoneda` | Reconciliación Positiva Moneda | Recurso | Hourly | COP |
| `RecoNegMoneda` | Reconciliación Negativa Moneda | Recurso | Hourly | COP |
| `CostRecPos` | Costo Unit. Reconc. Positiva | Area, SubArea | Hourly | COP/kWh |
| `CostRecNeg` | Costo Unit. Reconc. Negativa | Area, SubArea | Hourly | COP/kWh |
| `DesvEner` | Desviaciones Energía | Recurso, Sistema | Hourly | kWh |
| `DesvMoneda` | Desviaciones Moneda | Recurso, Sistema | Hourly | COP |
| `DesvGenVariableDesp` | Desviación Gen. Variable Despacho | Recurso | Hourly | kWh |
| `DesvGenVariableRedesp` | Desviación Gen. Variable Redespacho | Recurso | Hourly | kWh |

### 4.11 Emisiones

| MetricId | Nombre | Entidades | Type | Unidad |
|----------|--------|-----------|------|--------|
| `EmisionesCO2` | Emisiones CO2 | RecursoComb | Hourly | TonCO2 |
| `EmisionesCH4` | Emisiones CH4 | RecursoComb | Hourly | TonCH4 |
| `EmisionesN2O` | Emisiones N2O | RecursoComb | Hourly | TonN2O |
| `EmisionesCO2Eq` | Emisiones CO2 Equivalente | Recurso | Hourly | gCO2e/kWh |
| `factorEmisionCO2e` | Factor Emisión CO2e/kWh | Sistema | Hourly | gCO2e/kWh |
| `ConsCombustibleMBTU` | Consumo Combustible MBTU | Recurso, Combustible | Hourly | MBTU |
| `ConsCombAprox` | Consumo Combustible Aproximado | RecursoComb | Hourly | MBTU |

### 4.12 Variables Solares y Meteorológicas

| MetricId | Nombre | Type | Unidad |
|----------|--------|------|--------|
| `IrrPanel` | Irradiación Panel | Daily | W/m2 |
| `IrrGlobal` | Irradiación Global Horizontal | Daily | W/m2 |
| `TempPanel` | Temperatura Panel | Daily | - |
| `TempAmbSolar` | Temperatura Ambiente Solar | Daily | C |

Todas con Entity=`Recurso`. Solo aplican a plantas solares.

### 4.13 Cargos y Fondos (Mensuales)

| MetricId | Nombre | Unidad | Descripción |
|----------|--------|--------|-------------|
| `CEE` | Costo Equivalente Energía | COP/kWh | Cargo por capacidad para cotización en bolsa |
| `CERE` | Costo Equivalente Real Energía | COP/kWh | Señal de referencia para generadores |
| `CargoUsoSTN` | Cargo Uso STN | COP | Pago a transmisor por uso del STN |
| `CargoUsoSTR` | Cargo Uso STR | COP | Distribución de cargos por uso STR |
| `CargMaxTPrima` | Cargo Máximo T' | COP/kWh | Metodología cargos uso STN |
| `CargMedTPrima` | Cargo Medio T' | COP/kWh | Idem |
| `CargMinTPrima` | Cargo Mínimo T' | COP/kWh | Idem |
| `FAER` | FAER Moneda | COP | Fondo apoyo energización zonas rurales |
| `FAZNI` | FAZNI Moneda | COP | Fondo apoyo zonas no interconectadas |
| `PrecFAZNI` | FAZNI Precio | COP/kWh | Precio FAZNI |
| `PRONE` | PRONE | COP | Programa normalización redes eléctricas |

### 4.14 Proyecciones UPME (Mensuales)

| MetricId | Nombre |
|----------|--------|
| `EscDemUPMEAlto` | Proyección demanda escenario alto |
| `EscDemUPMEMedio` | Proyección demanda escenario medio |
| `EscDemUPMEBajo` | Proyección demanda escenario bajo |

---

## 5. Catálogos (Listados)

### 5.1 ListadoRecursos / Sistema

El catálogo principal de plantas de generación. Retorna **todos los recursos en operación y pruebas** conectados al SIN.

```python
df = objetoAPI.request_data('ListadoRecursos', 'Sistema',
                            start_date=dt.date(2024,1,1),
                            end_date=dt.date(2024,12,31))
```

| Columna | Descripción | Valores ejemplo |
|---------|-------------|-----------------|
| `Values_Code` | Código único del recurso (4 caracteres) | `2QBW`, `CHVR`, `GUAV` |
| `Values_Name` | Nombre de la planta | `CHIVOR`, `GUAVIO` |
| `Values_Type` | Tipo de tecnología | Ver tabla abajo |
| `Values_Disp` | Tipo de despacho | Ver tabla abajo |
| `Values_RecType` | Categoría regulatoria | Ver tabla abajo |
| `Values_CompanyCode` | Código del agente propietario | `ISGG`, `EPMC` |
| `Values_EnerSource` | Fuente de energía primaria | Ver tabla abajo |
| `Values_OperStartdate` | Fecha de inicio de operación | `2014-03-31` |
| `Values_State` | Estado actual | `OPERACION`, `PRUEBAS` |

**Valores únicos por campo de clasificación (a 2024):**

**`Values_Type` (5 valores):**
| Valor | Cantidad | Descripción |
|-------|----------|-------------|
| `SOLAR` | 1341 | Plantas fotovoltaicas |
| `HIDRAULICA` | 161 | Todas las hidroeléctricas |
| `TERMICA` | 77 | Plantas térmicas |
| `COGENERADOR` | 12 | Cogeneradores |
| `EOLICA` | 7 | Parques eólicos |

**`Values_Disp` (2 valores):**
| Valor | Cantidad | Descripción |
|-------|----------|-------------|
| `NO DESPACHADO CENTRALMENTE` | 1508 | No participa en despacho centralizado |
| `DESPACHADO CENTRALMENTE` | 90 | Participa en despacho del CND |

**`Values_RecType` (8 valores):**
| Valor | Cantidad | Descripción |
|-------|----------|-------------|
| `AUTOG PEQ. ESCALA` | 1063 | Autogenerador a pequeña escala (<1 MW) |
| `NORMAL` | 278 | Recurso de generación estándar |
| `GEN. DISTRIBUIDA` | 167 | Generación distribuida |
| `AUTOGENERADOR` | 56 | Autogenerador (>1 MW) |
| `FILO DE AGUA` | 13 | Hidroeléctrica filo de agua (categoría explícita) |
| `COGENERADOR` | 12 | Cogenerador |
| `CICLO COMBINADO` | 8 | Planta térmica ciclo combinado |
| `FILO AGUA ESPECIAL` | 1 | Filo de agua con tratamiento especial |

**`Values_EnerSource` (12 valores):**
| Valor | Cantidad | Descripción |
|-------|----------|-------------|
| `RAD SOLAR` | 1341 | Radiación solar |
| `AGUA` | 161 | Recurso hídrico |
| `GAS` | 41 | Gas natural |
| `CARBON` | 18 | Carbón |
| `BAGAZO` | 14 | Bagazo de caña |
| `VIENTO` | 7 | Viento |
| `BIOGAS` | 5 | Biogás |
| `COMBUSTOLEO` | 4 | Combustóleo |
| `ACPM` | 3 | ACPM/Diésel |
| `BIOMASA` | 2 | Biomasa |
| `GLP` | 1 | Gas licuado |
| `JET-A1` | 1 | Combustible de aviación |

### 5.2 ListadoRecursos / Agente

Estructura diferente: mapea Agente -> Recurso -> Nombre.

```
| Id     | Values_code1 | Values_code2 | Values_Value    | Date       |
|--------|--------------|--------------|-----------------|------------|
| Agente | ABAG         | 2UX3         | AURES BAJO 1    | 2026-04-14 |
| Agente | ISGG         | CHVR         | CHIVOR          | 2026-04-14 |
```

- `Values_code1`: Código del agente
- `Values_code2`: Código del recurso
- `Values_Value`: Nombre del recurso

> Un agente puede tener múltiples recursos (filas).

### 5.3 ListadoAgentes / Sistema

```
| Columna | Descripción |
|---------|-------------|
| Values_Code | Código del agente |
| Values_Name | Nombre del agente |
| Values_Activity | Actividad (ver abajo) |
| Values_OperStartdate | Fecha de inicio |
| Values_State | OPERACION o PRUEBAS |
```

**Activities (5):** `COMERCIALIZACION` (348), `GENERACION` (233), `DISTRIBUCION` (86), `TRANSPORTE` (20), `CENTRO RECOLECCION` (3)

### 5.4 ListadoEmbalses / Sistema

```
| Columna | Descripción |
|---------|-------------|
| Values_Code | Código del embalse |
| Values_Name | Nombre del embalse |
| Values_HydroRegion | Región hidrológica |
| Values_Status | ACTIVO |
```

**25 embalses** en 7 regiones hidrológicas: ANTIOQUIA (10), CENTRO (9), VALLE (4), ORIENTE (4), CALDAS (1), CARIBE (1), RIOS ESTIMADOS (1).

### 5.5 ListadoRios / Sistema

Misma estructura que embalses. **44 ríos** en las mismas 7 regiones hidrológicas.

### 5.6 ListadoAGPE / Agente

Autogeneradores a Pequeña Escala. **25,769 registros**.

```
| Columna | Descripción |
|---------|-------------|
| Values_AgpeID | Identificador AGPE |
| Values_Name | Nombre |
| Values_CompanyCode | Código del comercializador |
| Values_ComZone | Zona comercial |
| Values_VoltageLevel | Nivel de tensión (1, 2, 3) |
| Values_EnerSource | Fuente de energía |
| Values_InstalledCapacity | Capacidad instalada (kW) |
```

**Fuentes AGPE:** RAD SOLAR (24,306), BIOMASA (1,454), GAS (9), AGUA (1), BIOGAS (1), BAGAZO (1).

---

## 6. Clasificación de Recursos de Generación

### 6.1 Diagrama de Clasificación

La clasificación de un recurso se determina por la combinación de **tres campos**: `Values_Type`, `Values_Disp` y `Values_RecType`.

```
Values_Type
  |
  +-- SOLAR ........................ Todas son solares fotovoltaicas
  |     +-- AUTOG PEQ. ESCALA (1058) .. < 1 MW, mayoritariamente NDC
  |     +-- GEN. DISTRIBUIDA (149) .... Generación distribuida
  |     +-- NORMAL (104) .............. Plantas solares estándar
  |     +-- AUTOGENERADOR (30) ........ Autogeneradores > 1 MW
  |
  +-- HIDRAULICA ................... Todas usan AGUA como EnerSource
  |     +-- NORMAL + DC (21) .......... EMBALSE (grandes hidroeléctricas)
  |     +-- NORMAL + NDC (102) ........ FILO DE AGUA (< 20 MW o sin embalse)
  |     +-- FILO DE AGUA (13) ......... Filo de agua (categoría explícita)
  |     +-- FILO AGUA ESPECIAL (1) .... Filo de agua con tratamiento especial
  |     +-- GEN. DISTRIBUIDA (18) ..... Mini/micro hidro distribuida
  |     +-- AUTOGENERADOR (6) ......... Autogeneradores hídricos
  |
  +-- TERMICA ...................... Combustibles fósiles y biomasa
  |     +-- NORMAL (44) ............... Térmicas estándar
  |     +-- CICLO COMBINADO (8) ....... Gas en ciclo combinado
  |     +-- AUTOGENERADOR (20) ........ Autogeneradores térmicos
  |     +-- AUTOG PEQ. ESCALA (5) ..... Pequeña escala térmica
  |
  +-- EOLICA ....................... Todas usan VIENTO como EnerSource
  |     +-- NORMAL (7) ................ Parques eólicos estándar
  |
  +-- COGENERADOR .................. Producción simultánea calor+electricidad
        +-- COGENERADOR (12) .......... Todos usan BAGAZO (11) o BIOMASA (1)
```

### 6.2 Regla de Clasificación: Embalse vs Filo de Agua

La distinción entre plantas de **embalse** y **filo de agua** no es trivial. La regla operativa es:

```
Si Values_Type == "HIDRAULICA":
    Si Values_RecType == "FILO DE AGUA" o "FILO AGUA ESPECIAL":
        -> FILO DE AGUA (categoría explícita)
    Si Values_RecType == "NORMAL":
        Si Values_Disp == "DESPACHADO CENTRALMENTE":
            -> EMBALSE (21 recursos)
        Si Values_Disp == "NO DESPACHADO CENTRALMENTE":
            -> FILO DE AGUA (102 recursos)
    Si Values_RecType == "GEN. DISTRIBUIDA":
        -> FILO DE AGUA (micro/mini hidro, 18 recursos, todos NDC)
    Si Values_RecType == "AUTOGENERADOR":
        -> FILO DE AGUA (6 recursos, todos NDC)
```

**Resumen numérico:**
| Clasificación | Cantidad | Criterio |
|--------------|----------|----------|
| **Embalse** | **21** | HIDRAULICA + NORMAL + DESPACHADO CENTRALMENTE |
| **Filo de Agua** | **140** | Todos los demás HIDRAULICA |

> **Nota:** Los 21 recursos de embalse son las grandes centrales (Chivor, Guavio, San Carlos, Guatapé, etc.) que el CND despacha centralmente. Los 102 recursos NORMAL+NDC son típicamente plantas < 20 MW o plantas que, aunque hidráulicas, no tienen capacidad de almacenamiento significativa.

> **Nota:** Hay 8 recursos clasificados como `FILO DE AGUA` que son `DESPACHADO CENTRALMENTE`. Esto puede parecer contradictorio, pero corresponde a plantas filo de agua lo suficientemente grandes para participar en el despacho (como Porce II con ~405 MW).

### 6.3 Relación entre Campos

```
Values_Type     1 --> N  Values_EnerSource   (HIDRAULICA siempre es AGUA, pero
                                               TERMICA puede ser GAS, CARBON, etc.)

Values_RecType  N --> 1  Values_Disp         (AUTOG PEQ. ESCALA siempre es NDC,
                                               NORMAL puede ser DC o NDC)

Values_CompanyCode  N --> 1  Agente           (Un agente puede tener múltiples recursos,
                                               usar ListadoRecursos/Agente para el mapeo)
```

### 6.4 Clasificación Práctica para Análisis

Para análisis por tecnología, se recomienda esta clasificación:

```python
def clasificar_recurso(row):
    t = row['Values_Type']
    d = row['Values_Disp']
    r = row['Values_RecType']
    
    if t == 'SOLAR':
        return 'Solar'
    elif t == 'EOLICA':
        return 'Eolica'
    elif t == 'HIDRAULICA':
        if r in ('FILO DE AGUA', 'FILO AGUA ESPECIAL', 'GEN. DISTRIBUIDA', 'AUTOGENERADOR'):
            return 'Hidrica Filo de Agua'
        elif r == 'NORMAL' and d == 'DESPACHADO CENTRALMENTE':
            return 'Hidrica Embalse'
        else:  # NORMAL + NDC
            return 'Hidrica Filo de Agua'
    elif t == 'TERMICA':
        return 'Termica'
    elif t == 'COGENERADOR':
        return 'Cogenerador'
    return 'Otro'
```

---

## 7. Relación entre Variables y Columnas de Enlace

### 7.1 Clave de Enlace entre Tablas

| Tabla origen | Columna de enlace | Tabla destino | Columna destino |
|-------------|-------------------|---------------|-----------------|
| `Gene` (Hourly/Recurso) | `Values_code` | `ListadoRecursos` (Sistema) | `Values_Code` |
| `CapEfecNeta` (Daily/Recurso) | `Code` | `ListadoRecursos` (Sistema) | `Values_Code` |
| `ListadoRecursos` (Sistema) | `Values_CompanyCode` | `ListadoAgentes` (Sistema) | `Values_Code` |
| `ListadoRecursos` (Agente) | `Values_code1` | `ListadoAgentes` (Sistema) | `Values_Code` |
| `ListadoRecursos` (Agente) | `Values_code2` | `ListadoRecursos` (Sistema) | `Values_Code` |
| `AporEner` (Daily/Rio) | `Name` | `ListadoRios` (Sistema) | `Values_Name` |
| `VoluUtilDiarEner` (Daily/Embalse) | `Name` | `ListadoEmbalses` (Sistema) | `Values_Name` |

> **Cuidado:** La columna de código del recurso se llama diferente según la variable:
> - En HourlyEntities: `Values_code`
> - En DailyEntities (Recurso): `Code`
> - En Listados: `Values_Code`

### 7.2 Variables que Representan lo Mismo con Diferente Nombre

| Concepto | En diferentes tablas |
|----------|---------------------|
| Código de recurso | `Values_code` (Hourly), `Code` (Daily), `Values_Code` (Listados), `Values_code2` (ListadoRecursos/Agente) |
| Código de agente | `Values_code` (Hourly/Agente), `Values_CompanyCode` (ListadoRecursos), `Values_Code` (ListadoAgentes), `Values_code1` (ListadoRecursos/Agente) |
| Nombre de embalse | `Name` (Daily/Embalse), `Values_Name` (ListadoEmbalses) |
| Nombre de río | `Name` (Daily/Rio), `Values_Name` (ListadoRios) |
| Fecha | `Date` (siempre, pero formato datetime en datos, string en listados) |

---

## 8. Filtros

Algunas variables aceptan un parámetro `filtros` (lista) para filtrar los resultados:

| Filtro | Variables que lo usan | Ejemplo |
|--------|----------------------|---------|
| `Codigo Submercado Generación` | Gene, GeneIdea, CapEfecNeta, PrecOferDesp, DispoReal, etc. | `filtros=['CHVR']` |
| `Codigo Comercializador` | DemaReal, DemaCome, DemaOR por Agente | `filtros=['EPMC']` |
| `Codigo Agente` | CompContEner, VentContEner, CompBolsNaciEner por Agente | `filtros=['ISGG']` |
| `Codigo Distribuidor` | DemaOR por Agente | - |
| `Nombre Embalse` | VoluUtilDiarEner, CapaUtilDiarEner por Embalse | `filtros=['CHIVOR']` |
| `Nombre Río` | AporEner, AporCaudal por Rio | `filtros=['BOGOTA N.R.']` |

```python
# Ejemplo: generación solo de Chivor
df = objetoAPI.request_data('Gene', 'Recurso',
                            start_date=dt.date(2024,1,1),
                            end_date=dt.date(2024,1,31),
                            filtros=['CHVR'])
```

---

## 9. Resumen de las 93 Variables (MetricId)

| # | MetricId | Nombre Corto | Tipo | Entidades disponibles |
|---|----------|-------------|------|----------------------|
| 1 | `AporCaudal` | Aportes Caudal | Daily | Rio |
| 2 | `AporCaudalMediHist` | Aportes Media Hist. Caudal | Daily | Rio |
| 3 | `AporEner` | Aportes Energía | Daily | Sistema, Rio |
| 4 | `AporEnerMediHist` | Aportes Media Hist. Energía | Daily | Sistema, Rio |
| 5 | `CapEfecNeta` | Capacidad Efectiva Neta | Daily | Recurso |
| 6 | `CapaUtilDiarEner` | Capacidad Útil Energía | Daily | Sistema, Embalse |
| 7 | `CapaUtilDiarMasa` | Capacidad Útil Masa | Daily | Sistema, Embalse |
| 8 | `CargoUsoSTN` | Cargo Uso STN | Monthly | Sistema |
| 9 | `CargoUsoSTR` | Cargo Uso STR | Monthly | Sistema |
| 10 | `CargMaxTPrima` | Cargo Máximo T' | Monthly | Sistema |
| 11 | `CargMedTPrima` | Cargo Medio T' | Monthly | Sistema |
| 12 | `CargMinTPrima` | Cargo Mínimo T' | Monthly | Sistema |
| 13 | `CEE` | CEE | Monthly | Sistema |
| 14 | `CERE` | CERE | Monthly | Sistema |
| 15 | `ComContRespEner` | Compras Contrato Respaldo | Daily | Recurso, Sistema |
| 16 | `CompBolsaIntEner` | Compras Bolsa Internacional Energía | Hourly | Sistema, Agente |
| 17 | `CompBolsaIntMoneda` | Compras Bolsa Internacional Moneda | Hourly | Sistema, Agente |
| 18 | `CompBolsNaciEner` | Compras Bolsa Nacional Energía | Hourly | Sistema, Agente |
| 19 | `CompBolsaNacMoneda` | Compras Bolsa Nacional Moneda | Hourly | Sistema |
| 20 | `CompBolsaTIEEner` | Compras Bolsa TIE Energía | Hourly | Sistema, Agente |
| 21 | `CompBolsaTIEMoneda` | Compras Bolsa TIE Moneda | Hourly | Sistema, Agente |
| 22 | `CompContEner` | Compras Contrato Energía | Hourly | Sistema, Agente |
| 23 | `CompContEnerNoReg` | Compras Contrato Energía No Reg. | Hourly | Sistema, Agente |
| 24 | `CompContEnerReg` | Compras Contrato Energía Reg. | Hourly | Sistema, Agente |
| 25 | `CompContEnerSICEP` | Compras Contrato SICEP | Hourly | Sistema, Agente |
| 26 | `CompContMoneda` | Compras Contrato Moneda | Hourly | Sistema |
| 27 | `CompNetArranPara` | Compras Netas Arranque/Parada | Daily | Sistema |
| 28 | `ConsCombAprox` | Consumo Combustible Aproximado | Hourly | RecursoComb |
| 29 | `ConsCombustibleMBTU` | Consumo Combustible MBTU | Hourly | Recurso, Combustible |
| 30 | `CostMargDesp` | Costo Marginal Despacho | Hourly | Sistema |
| 31 | `CostRecNeg` | Costo Unit. Reconc. Negativa | Hourly | Area, SubArea |
| 32 | `CostRecPos` | Costo Unit. Reconc. Positiva | Hourly | Area, SubArea |
| 33 | `DDVContratada` | DDV Contratada | Daily | Recurso |
| 34 | `DeltaInt` | Delta Internacional | Daily | Sistema |
| 35 | `DeltaNal` | Delta Nacional | Daily | Sistema |
| 36 | `DemaCome` | Demanda Comercial | Hourly | Sistema, Agente, CIIU, MercadoComercializacion |
| 37 | `DemaComeNoReg` | Demanda Comercial No Regulada | Hourly | Sistema, Agente, CIIU |
| 38 | `DemaComeReg` | Demanda Comercial Regulada | Hourly | Sistema, Agente |
| 39 | `DemaMaxPot` | Demanda Máxima Potencia | Daily | Sistema |
| 40 | `DemaNoAtenNoProg` | Demanda No Atendida No Prog. | Daily | Area, Subarea |
| 41 | `DemaNoAtenProg` | Demanda No Atendida Prog. | Daily | Area, Subarea |
| 42 | `DemaOR` | Demanda por OR | Hourly | Agente |
| 43 | `DemaReal` | Demanda Real | Hourly | Sistema, Agente |
| 44 | `DemaRealNoReg` | Demanda Real No Regulada | Hourly | Sistema, Agente |
| 45 | `DemaRealReg` | Demanda Real Regulada | Hourly | Sistema, Agente |
| 46 | `DemaSIN` | Demanda SIN | Daily | Sistema |
| 47 | `DescMasa` | Descargas Masa | Daily | Embalse |
| 48 | `DesvEner` | Desviaciones Energía | Hourly | Recurso, Sistema |
| 49 | `DesvGenVariableDesp` | Desviación Gen. Variable Despacho | Hourly | Recurso |
| 50 | `DesvGenVariableRedesp` | Desviación Gen. Variable Redespacho | Hourly | Recurso |
| 51 | `DesvMoneda` | Desviaciones Moneda | Hourly | Recurso, Sistema |
| 52 | `DispoCome` | Disponibilidad Comercial | Hourly | Recurso |
| 53 | `DispoDeclarada` | Disponibilidad Declarada | Hourly | Recurso |
| 54 | `DispoReal` | Disponibilidad Real | Hourly | Recurso |
| 55 | `EjecGarantRestr` | Ejecución Garantías | Hourly | Sistema |
| 56 | `EmisionesCH4` | Emisiones CH4 | Hourly | RecursoComb |
| 57 | `EmisionesCO2` | Emisiones CO2 | Hourly | RecursoComb |
| 58 | `EmisionesCO2Eq` | Emisiones CO2 Eq | Hourly | Recurso |
| 59 | `EmisionesN2O` | Emisiones N2O | Hourly | RecursoComb |
| 60 | `ENFICC` | Energía Firme CxC | Daily | Recurso, Sistema |
| 61 | `EscDemUPMEAlto` | Proyección UPME Alto | Monthly | Sistema |
| 62 | `EscDemUPMEBajo` | Proyección UPME Bajo | Monthly | Sistema |
| 63 | `EscDemUPMEMedio` | Proyección UPME Medio | Monthly | Sistema |
| 64 | `ExcedenteAGPE` | Excedentes AGPE | Hourly | Agente |
| 65 | `ExpoEner` | Exportaciones Energía | Hourly | Sistema, Enlace |
| 66 | `ExpoMoneda` | Exportaciones Moneda | Hourly | Sistema, Enlace |
| 67 | `ExportMonedaUSD` | Exportaciones USD | Hourly | Sistema |
| 68 | `factorEmisionCO2e` | Factor Emisión CO2e | Hourly | Sistema |
| 69 | `FAER` | FAER | Monthly | Sistema |
| 70 | `FAZNI` | FAZNI | Daily | Sistema |
| 71 | `Gene` | Generación Real | Hourly | Sistema, Recurso |
| 72 | `GeneFueraMerito` | Gen. Fuera de Mérito | Hourly | Recurso |
| 73 | `GeneIdea` | Generación Ideal | Hourly | Sistema, Recurso |
| 74 | `GeneProgDesp` | Gen. Programada Despacho | Hourly | Recurso |
| 75 | `GeneProgRedesp` | Gen. Programada Redespacho | Hourly | Recurso |
| 76 | `GeneSeguridad` | Gen. de Seguridad | Hourly | Recurso |
| 77 | `ImpoEner` | Importaciones Energía | Hourly | Sistema, Enlace |
| 78 | `ImpoMoneda` | Importaciones Moneda | Hourly | Enlace |
| 79 | `ImportMonedaCOP` | Importaciones COP | Hourly | Sistema |
| 80 | `ImportMonedaUSD` | Importaciones USD | Hourly | Sistema |
| 81 | `IndRecMargina` | Indicador Recurso Margina | Hourly | Recurso |
| 82 | `IrrGlobal` | Irradiación Global | Daily | Recurso |
| 83 | `IrrPanel` | Irradiación Panel | Daily | Recurso |
| 84 | `ListadoAGPE` | Listado AGPE | Lists | Agente |
| 85 | `ListadoAgentes` | Listado Agentes | Lists | Sistema |
| 86 | `ListadoEmbalses` | Listado Embalses | Lists | Sistema |
| 87 | `ListadoMetricas` | Listado Métricas | Lists | Sistema |
| 88 | `ListadoRecursos` | Listado Recursos | Lists | Sistema, Agente |
| 89 | `ListadoRios` | Listado Ríos | Lists | Sistema |
| 90 | `MaxPrecOferNal` | Máximo Precio Oferta Nacional | Hourly | Sistema |
| 91 | `MC` | MC | Monthly | Sistema |
| 92 | `ObligEnerFirme` | Obligación Energía Firme | Daily | Recurso |
| 93 | `PerdidasEner` | Pérdidas Energía | Hourly | Sistema, Agente |
| 94 | `PerdidasEnerNoReg` | Pérdidas Energía No Reg. | Hourly | Sistema, Agente |
| 95 | `PerdidasEnerReg` | Pérdidas Energía Reg. | Hourly | Sistema, Agente |
| 96 | `PorcApor` | Aportes % | Daily | Sistema, Rio |
| 97 | `PorcVoluUtilDiar` | Volumen Útil % | Daily | Sistema, Embalse |
| 98 | `PPPrecBolsNaci` | Precio Bolsa Ponderado | Daily | Sistema |
| 99 | `PrecBolsNaci` | Precio Bolsa Nacional | Hourly | Sistema |
| 100 | `PrecBolsNaciTX1` | Precio Bolsa TX1 | Hourly | Sistema |
| 101 | `PrecCargConf` | Precio Cargo Confiabilidad | Daily | Recurso |
| 102 | `PrecEsca` | Precio Escasez | Daily | Sistema |
| 103 | `PrecEscaAct` | Precio Escasez Activación | Daily | Sistema |
| 104 | `PrecEscaInf` | Precio Escasez Inferior | Daily | Sistema |
| 105 | `PrecEscaMarg` | Precio Escasez Marginal | Daily | Sistema |
| 106 | `PrecEscaPon` | Precio Escasez Ponderado | Daily | Sistema |
| 107 | `PrecEscaSup` | Precio Escasez Superior | Daily | Sistema |
| 108 | `PrecFAZNI` | Precio FAZNI | Monthly | Sistema |
| 109 | `PrecOferDesp` | Precio Oferta Despacho | Hourly | Recurso |
| 110 | `PrecOferIdeal` | Precio Oferta Ideal | Daily | Recurso |
| 111 | `PrecPromCont` | Precio Promedio Contratos | Daily | Sistema |
| 112 | `PrecPromContNoRegu` | Precio Prom. Contratos No Reg. | Hourly | Sistema |
| 113 | `PrecPromContRegu` | Precio Prom. Contratos Reg. | Hourly | Sistema |
| 114 | `PrecTransBolsa` | Precio Transacción Bolsa | Hourly | Sistema |
| 115 | `PRONE` | PRONE | Monthly | Sistema |
| 116 | `RecoNegEner` | Reconc. Negativa Energía | Hourly | Recurso |
| 117 | `RecoNegMoneda` | Reconc. Negativa Moneda | Hourly | Recurso |
| 118 | `RecoPosEner` | Reconc. Positiva Energía | Hourly | Recurso |
| 119 | `RecoPosMoneda` | Reconc. Positiva Moneda | Hourly | Recurso |
| 120 | `RemuRealIndiv` | Remuneración Real Individual | Daily | Sistema |
| 121 | `RentasCongestRestr` | Rentas Congestión Restricciones | Hourly | Sistema |
| 122 | `RespComerAGC` | Responsabilidad Comercial AGC | Hourly | Sistema |
| 123 | `RestAliv` | Restricciones Aliviadas | Hourly | Sistema |
| 124 | `RestSinAliv` | Restricciones sin Alivios | Hourly | Sistema |
| 125 | `SnTIEFueraMerito` | Saldo Neto TIE Fuera Mérito | Hourly | Sistema |
| 126 | `SnTIEMerito` | Saldo Neto TIE Mérito | Hourly | Sistema |
| 127 | `TempAmbSolar` | Temperatura Ambiente Solar | Daily | Recurso |
| 128 | `TempPanel` | Temperatura Panel | Daily | Recurso |
| 129 | `VentaBolsNaciMoneda` | Ventas Bolsa Nacional Moneda | Hourly | Sistema |
| 130 | `VentBolsaIntEner` | Ventas Bolsa Internacional Energía | Hourly | Sistema, Agente |
| 131 | `VentBolsaIntMoneda` | Ventas Bolsa Internacional Moneda | Hourly | Sistema, Agente |
| 132 | `VentBolsaTIEEner` | Ventas Bolsa TIE Energía | Hourly | Sistema, Agente |
| 133 | `VentBolsaTIEMoneda` | Ventas Bolsa TIE Moneda | Hourly | Sistema, Agente |
| 134 | `VentBolsNaciEner` | Ventas Bolsa Nacional Energía | Hourly | Sistema, Agente |
| 135 | `VentContEner` | Ventas Contrato Energía | Hourly | Sistema, Agente |
| 136 | `VentContEnerSICEP` | Ventas Contrato SICEP | Hourly | Sistema, Agente |
| 137 | `VentContRespEner` | Ventas Contrato Respaldo | Daily | Recurso, Sistema |
| 138 | `VertEner` | Vertimientos Energía | Daily | Embalse, Sistema |
| 139 | `VertMasa` | Vertimientos Masa | Daily | Embalse |
| 140 | `VolTurbMasa` | Volumen Turbinado | Daily | Embalse, Sistema |
| 141 | `VoluUtilDiarEner` | Volumen Útil Energía | Daily | Sistema, Embalse |
| 142 | `VoluUtilDiarMasa` | Volumen Útil Masa | Daily | Embalse, Sistema |
| 143 | `ExcedenteAGPE` | Excedentes AGPE | Hourly | Agente |

---

## 10. Errores Comunes y Tips

### Errores frecuentes

1. **"No existe la métrica"**: El `MetricId` no existe. Verificar con `get_collections()`.
2. **"No existe la entidad"**: La `Entity` no es válida para esa variable. No toda variable admite todas las entidades.
3. **Timeout en consultas largas**: La API limita a 31 días para Hourly/Daily. La librería particiona pero consultas de varios años toman tiempo significativo.
4. **Nombres de columnas inconsistentes**: `Values_code` vs `Code` vs `Values_Code` (ver Sección 7.2).

### Tips de uso

```python
# 1. Cache con pickle para evitar re-consultar
import pickle
cache_file = 'gene_2024.pkl'
try:
    df = pd.read_pickle(cache_file)
except FileNotFoundError:
    df = objetoAPI.request_data('Gene', 'Recurso', ...)
    df.to_pickle(cache_file)

# 2. Convertir datos horarios a formato largo
hour_cols = [f'Values_Hour{h:02d}' for h in range(1, 25)]
df_long = df.melt(
    id_vars=['Values_code', 'Date'],
    value_vars=hour_cols,
    var_name='Hora_str',
    value_name='Valor'
)
df_long['Hora'] = df_long['Hora_str'].str.extract(r'(\d+)').astype(int)

# 3. Unir generación con tipo de recurso
recursos = objetoAPI.request_data('ListadoRecursos', 'Sistema', ...)
gene = objetoAPI.request_data('Gene', 'Recurso', ...)
df = gene.merge(
    recursos[['Values_Code', 'Values_Type', 'Values_Disp', 'Values_RecType']],
    left_on='Values_code', right_on='Values_Code', how='left'
)

# 4. Factor de planta
cap = objetoAPI.request_data('CapEfecNeta', 'Recurso', ...)
# Unir por código (ojo: en CapEfecNeta la columna se llama 'Code', no 'Values_code')
```
