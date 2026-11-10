---
fecha: 2026-11-10
autor: David Bedoya
pr: —
issue: 36
tipo: agrega
vistas: []
features: [carga-prueba-ee, vistas-anchas-core]
version: sin publicar
---

## Qué cambió
La base ya tiene **datos reales de energía eléctrica**:
- **Revisiones:** las 5 revisiones publicadas de la proyección (diciembre de 2023 a julio de 2026), con su escenario medio, sus intervalos de confianza y el detalle de grandes consumidores, movilidad eléctrica y generación distribuida.
- **Dato real:** la demanda diaria del SIN que publica XM (`DemaSIN`), día por día desde el 1 de enero de 2010.

Con esos datos se crearon cuatro **vistas** que responden a las preguntas de la app:
- cómo es el abanico de una revisión;
- cómo cambió la proyección de una revisión a otra;
- cuánto se equivocó cada revisión frente a lo que pasó;
- cómo se comparan las medidas reales de XM entre sí.

Por ejemplo, la revisión de diciembre de 2023 sobrestimó la demanda en promedio un 4 %. La de julio de 2025 la subestimó un 0,6 %. Son cifras de prueba: la variable real y las métricas oficiales del error todavía se están definiendo (T-26, X-25).

Es una carga de prueba, hecha a mano: las cargas automáticas (cuando se publique una revisión y todos los días para XM) son los pasos T-27 a T-29.

## Por qué
Antes de construir las cargas automáticas y conectar las vistas, había que comprobar con datos reales que el modelo de datos v2 responde lo que piden las vistas, sin huecos (fase 2 del plan de datos).

## Cómo se ve
Sin cambios en la app. En la base: `core.v_ee_revision_vs_real` y las demás vistas descritas en Guía técnica → Base de datos → Vistas.

## Notas técnicas
- **Código nuevo en `pipelines/`:**
  - `lib/upme_annex.py`: lector de anexos por encabezados;
  - `lib/xm_sinergox.py`: cliente de XM;
  - `lib/loads.py` y `lib/store.py`: cargas y bitácora;
  - `carga_prueba.py`: lo que se corre a mano;
  - `revisiones_ee.toml`: los datos de cada revisión que el anexo no trae.
- **Pruebas:** van en `pipelines/tests/` y corren en la CI.
- **Lo que mostró la carga:**
  - las series compuestas cuadran exactamente con sus componentes en los 5 anexos;
  - la única diferencia es la serie anual SIN+GCE+ME+GD_PNUMA en el primer año (el año mixto) de las tres revisiones que la traen; quedó anotada en X-23;
  - la GD venía en negativo hasta dic-2024 y se guarda positiva (PDA-07);
  - `DemaSIN` llegó completa desde 2010; solo faltaba el día anterior a la carga, que XM publica con rezago.
- **Datos que faltan de cada revisión:** fecha exacta de publicación, enlace del informe y modelo (salvo 2026-07). Quedaron marcados «por confirmar» y anotados en X-23.
- **Migración `0004`:** las 4 vistas, con comentarios. El diccionario se regeneró. Las pruebas de las vistas (`backend/tests/test_db_views.py`) corren en el job `base-de-datos`.
- **Pruebas del modelo:** las de T-23 ahora usan periodos de 2099, para no chocar con los datos reales al correrlas contra la base de desarrollo.
- **Librería nueva:** `openpyxl` (TEC-06), anotada en `docs/tecnica/dependencias.md`.
