---
fecha: 2026-11-10
autor: David Bedoya
pr: 39
issue: 38
tipo: agrega
vistas: []
features: [flujo-xm-historico]
version: sin publicar
---

## Qué cambió
La carga de los datos reales de XM ya es un **flujo de Prefect**: se ejecuta desde la interfaz de Prefect (o con un comando), con el rango de fechas que se quiera, y deja su bitácora. Antes era un script que solo se corría a mano.

- Carga las dos medidas que XM publica por día:
    - `DemaSIN`, la demanda del SIN con la que se calcula el error de las revisiones;
    - `DemaMaxPot`, la potencia máxima diaria.
- Ambas van desde el 1 de enero de 2010.
- Repetir una carga es seguro: solo se guarda lo que es nuevo o lo que XM cambió.

Las otras tres medidas que se querían (`DemaReal`, `DemaCome` y `ExpoEner`) XM solo las publica **por hora**. Quedaron para el paso T-36, que también ajusta las vistas para que no mezclen datos diarios y horarios.

**Primera ejecución:**
- `DemaSIN` volvió a pasar completa, los 6156 días, sin crear ninguna versión nueva. Confirma que repetir la carga es seguro.
- `DemaMaxPot` cargó 6117 días en 31 segundos. Le faltan octubre y lo que va de noviembre de 2026, porque XM la publica con más de un mes de rezago.

## Por qué
Es el primer paso de la fase 3 del plan de datos: que las cargas corran con un orquestador, dejen bitácora y se puedan repetir. Sobre este flujo, T-29 agrega la carga diaria automática, la conciliación y las anomalías.

## Cómo se ve
Sin cambios en la app. En Prefect (http://localhost:4200), despliegue `xm-historico-diario`.

## Notas técnicas
- **Flujo:**
    - `pipelines/flows/xm_observed.py` (`ingest-observed-demand`): una tarea por variable;
    - despliegue sin horario en `pipelines/deployments.py`;
    - se retiró el flujo de ejemplo y el comando `xm` de `carga_prueba.py`.
- **Lo que mostró la primera ejecución:**
    - `DemaReal` / `Sistema` en `/daily` responde 400 en todos los meses, porque XM solo la publica por hora. La ficha de SINERGOX ya lo decía y el supuesto del issue estaba mal.
    - Por eso el flujo ahora consulta el listado de métricas de XM antes de cargar y rechaza de entrada lo que no se publica por día.
    - El cliente ya no reintenta los errores 4xx, salvo el 429: cada consulta fallida perdía 7 s en reintentos.
- **Carga cancelada:** cancelar una ejecución dejó su carga «en curso» en la bitácora; se cerró a mano como fallida y quedó en T-30.
- **Pruebas:**
    - del flujo y del cliente, sin base ni internet;
    - de la carga contra PostgreSQL con XM simulado (`pipelines/tests/test_xm_load_db.py`), en el job `base-de-datos` de la CI.
- **Anexos:** los enlaces de los 5 anexos y su huella quedaron en `pipelines/revisiones_ee.toml` para cargarlos en el despliegue (T-27, X-31).
- **Prefect:** la [ficha local](../../tecnica/herramientas/prefect.md) explica flujo, tarea, despliegue, ejecución y worker; X-33 es conocer la herramienta a fondo.
