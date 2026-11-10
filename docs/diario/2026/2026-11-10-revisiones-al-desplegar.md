---
fecha: 2026-11-10
autor: David Bedoya
pr: null
issue: 42
tipo: agrega
vistas: []
features: [carga-revisiones-al-desplegar]
version: sin publicar
---

## Qué cambió
Las revisiones publicadas de energía eléctrica **se cargan solas al desplegar la app**. Al actualizar el servidor y reiniciar los contenedores, el proceso de Prefect que ejecuta las cargas hace dos cosas:

- revisa qué revisiones faltan en la base;
- descarga sus anexos del sitio de la UPME y las carga.

Las que ya están se omiten, sin descargarlas.

Antes, el dato de XM tenía su flujo, pero las revisiones solo se cargaban a mano, con los archivos en una carpeta del equipo. Por eso el servidor quedó sin revisiones.

## Por qué
Un servidor nuevo o actualizado debe quedar con los mismos datos sin que nadie copie archivos. Los enlaces de los anexos y su huella ya estaban en `pipelines/revisiones_ee.toml` (X-31).

Se descartó una migración de Alembic:

- las migraciones son para el esquema (BD-04);
- esta carga necesita internet;
- si una descarga fallara, la API no arrancaría;
- lo que hace una migración no queda en la bitácora de cargas (PDA-05).

## Cómo se ve
En la interfaz de Prefect aparece una ejecución de `load-published-revisions` cada vez que arranca el worker, y un despliegue nuevo, `revisiones-ee`, para correrlo a mano.

## Notas técnicas
- **Archivos:**
    - flujo: `pipelines/flows/upme_revisions.py`;
    - arranque: `pipelines/start.sh`, que es el `CMD` del `Dockerfile`;
    - descarga y huella: `pipelines/lib/loads.py`.
- **Si el archivo del sitio cambia de huella**, no se carga y queda `annex_hash_mismatch` en la bitácora (P-0003).
- **Si falla la descarga**, el worker arranca igual.
- **Comprobado con una base nueva:** cargó las 5 revisiones, con cifras idénticas a las de T-24. La segunda vez no descargó nada.
- **Corrección:** `carga_prueba.py` fallaba desde que el TOML tiene `annex_url` y `annex_sha256`; ya funciona.
- **Documentación:** [Flujos de datos](../../tecnica/flujos.md), [Despliegue](../../tecnica/despliegue.md) y la ficha de Prefect.
- **Falta de T-27:** la normalización entre versiones de anexo.
