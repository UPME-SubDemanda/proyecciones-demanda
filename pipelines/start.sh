#!/bin/sh
# Arranque del contenedor prefect-worker (Dockerfile). Primero carga las revisiones publicadas de EE que falten
# (flujo load-published-revisions, issue #42): así, al desplegar o actualizar el servidor, la base queda con todas
# las revisiones de revisiones_ee.toml. Si la carga falla, el worker arranca igual: el motivo queda en Prefect y en
# operacion.load_runs. Después sirve los despliegues (deployments.py). Documentación: docs/tecnica/flujos.md.

echo "Cargando las revisiones publicadas que falten (load-published-revisions)…"
python -m flows.upme_revisions --esperar-base 300 \
  || echo "La carga de revisiones no terminó bien; el worker arranca igual. Detalle en Prefect y en operacion.load_runs."

exec python deployments.py
