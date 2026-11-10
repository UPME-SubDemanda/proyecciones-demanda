# API

API de FastAPI en `/api/v1` (TEC-08). Documentación interactiva, generada por FastAPI, en http://localhost:8000/docs; contrato OpenAPI en `/openapi.json`. Los tipos de TypeScript del frontend se generan desde ese contrato con `pnpm gen:api` (`frontend/src/api/schema.d.ts`).

## Recursos

| Ruta | Qué devuelve | Ingreso |
| --- | --- | --- |
| `GET /health` | Estado de la API | No |
| `/auth/...` | Ingreso local y con Google, sesión, usuarios y roles ([ficha](herramientas/autenticacion.md)) | Según la ruta |
| `GET /ee/observed` | Dato real anual de energía eléctrica | No |
| `GET /ee/revisions` | Revisiones publicadas de energía eléctrica | No |
| `GET /ee/revisions/{id}/values` | Valores anuales de una revisión, por escenario | No |
| `GET /ee/revisions/{id}/performance` | Desempeño de una revisión frente al dato real | No |
| `GET /ee/system-today` | Demanda diaria reciente del SIN («El sistema hoy») | No |

## Datos de energía eléctrica (`/ee`, provisional)

Se crearon en T-37 (issue #40) para ver datos reales en las vistas ya construidas. **No son todavía el contrato público** (T-33, X-28). Son de solo lectura y leen las vistas de `core` ([Vistas para revisar y analizar](base-de-datos/vistas.md)); el código está en `backend/app/api/v1/ee.py`.

No piden ingreso porque son datos publicables, revisiones publicadas por la UPME y datos de XM, y los usan el portal y el modo pantalla, que son públicos.

**Decisiones provisionales del issue #40:**

| Tema | Decisión | Se revisa en |
| --- | --- | --- |
| Serie | Solo la marcada como comparable en `core.series` (SIN+GCE+ME+GD_UPME), energía, SIN | T-32 |
| Escenarios | `low` y `high` son los límites inferior y superior del intervalo de confianza del 68 %; `mid` es el escenario medio. La UPME publica intervalos, no escenarios bajo y alto | T-32 |
| Dato real | La variable marcada como oficial para el error en `core.variables` (`DemaSIN`, PER-01) | T-26 |
| Indicadores | Los que ya usaban las vistas (abajo); umbral de ±1,5 %, ilustrativo | X-25, X-03 |
| Modelo | Nombre corto (lo que va antes de «:» o «(»; «Modelo por confirmar» si no se tiene). El texto completo está en `core.revisions.model` y en [Modelos de proyección](modelos/index.md) | T-33 |

### `GET /ee/observed`

Dato real anual de `DemaSIN`: la suma de los meses de `core.observed_monthly`, **solo años completos**. El año en curso no se muestra como un año entero. `cutoff` es el último mes completo.

```json
{"product": "ee", "frequency": "A", "region": "SIN", "unit": "GWh", "source": "XM", "cutoff": "2026-10",
 "points": [{"period": "2010", "value": 56147.6}, "…", {"period": "2025", "value": 84049.1}]}
```

### `GET /ee/revisions`

Revisiones `published` o `superseded`, de la más antigua a la más reciente. `isCurrent` es la última publicada. `cutoff` es el mes del corte del dato real de la revisión.

### `GET /ee/revisions/{id}/values`

Valores anuales de la serie comparable, desde el primer año de la revisión (el primero es mixto: suma meses reales y proyectados) hasta el horizonte. Responde 404 si la revisión no existe o no está publicada.

```json
{"revisionId": 5, "frequency": "A", "region": "SIN", "unit": "GWh",
 "scenarios": {"low": [{"period": "2026", "value": 89598.1}, "…"],
               "mid": [{"period": "2026", "value": 90805.5}, "…"],
               "high": [{"period": "2026", "value": 92017.0}, "…"]}}
```

### `GET /ee/revisions/{id}/performance`

Sale de `core.v_ee_revision_vs_real`, solo con meses reales completos.

| Campo | Cálculo | Signo |
| --- | --- | --- |
| `monthlyDeviation` | Por mes, (real − proyectado) / proyectado, en %. Últimos 12 meses | Negativo: la demanda real va por debajo |
| `yearToDate` | Lo mismo, con la suma de los meses del último año con dato real | Igual |
| `mape12` | Promedio del valor absoluto del error de PER-01, (proyectado − real) / real, en los primeros 12 meses proyectados. Si aún no hay 12, usa los que haya | — |
| `error12` | Promedio del error de PER-01 en los primeros 12 meses proyectados; nulo si aún no hay 12 | Positivo: sobreestimó |
| `threshold` | 1,5 %, ilustrativo hasta X-03 | — |

Los dos signos son distintos a propósito, porque así los usaban las vistas: la desviación dice dónde está la demanda real y el error de PER-01 dice cuánto se equivocó la proyección. Se unifican al decidir las métricas (X-25).

### `GET /ee/system-today`

Últimos 30 días de `DemaSIN` y, para cada uno, el mismo día de la semana del año anterior (364 días antes).

- **Último día:** XM publica el último día a medias y lo completa después. Por ejemplo, el 2026-11-10 entregó 0,6 GWh para el 2026-11-08. Mientras no existan las reglas de dato anómalo (T-29, X-24), la API omite al final los días que estén por debajo de la mitad de la mediana de los 7 anteriores.
- **Lo que no devuelve:** la demanda máxima de potencia y el gas. El frontend los completa con cifras ilustrativas, marcadas como tales.

## Cómo se prueba

`backend/tests/test_api_ee.py`, contra PostgreSQL, con revisiones y datos de 2098 y 2099 que se revierten al final. Corre en el job `base-de-datos` de la CI ([ficha de GitHub Actions](herramientas/github-actions.md)).
