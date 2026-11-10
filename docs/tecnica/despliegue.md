# Despliegue

Los servidores están pendientes de definir con TI (P-01 de upme-estandares). Mientras tanto, esta página dice qué pasa con los datos cuando se despliega o se actualiza la app con `docker-compose.yml`.

## Actualizar el servidor

```bash
git pull
docker compose up -d --build
```

`--build` es necesario: el worker de Prefect copia el código de `pipelines/` al construir su imagen.

## Qué datos se cargan solos

| Datos | Cómo llegan | Qué hay que hacer |
| --- | --- | --- |
| Esquema de la base | La API aplica las migraciones al arrancar (`backend/dev-start.sh`) | Nada |
| Revisiones publicadas de EE | El worker corre `load-published-revisions` al arrancar (`pipelines/start.sh`): descarga del sitio de la UPME los anexos de `pipelines/revisiones_ee.toml` que falten, verifica su huella y los carga ([Flujos de datos](flujos.md#revisiones-publicadas-t-27-issue-42)) | Nada. El servidor necesita salida a internet hacia `docs.upme.gov.co` |
| Dato real de XM | Flujo `ingest-observed-demand`, despliegue `xm-historico-diario` | Por ahora, ejecutarlo una vez desde la interfaz de Prefect (http://<servidor>:4200). T-29 lo cargará también al arrancar el worker, desde el último día guardado, y todos los días con horario |

## Cómo comprobar que quedaron

- En la interfaz de Prefect, *Runs*: la ejecución de `load-published-revisions` al arrancar, con un mensaje por revisión.
- En la base: `SELECT id, flow, status, message FROM operacion.load_runs ORDER BY id DESC LIMIT 10;`
- En la app: el histórico de revisiones muestra las 5 revisiones de EE.

Si una revisión falló, el motivo está en `operacion.load_messages` (por ejemplo, `annex_download_failed` si no hubo conexión o `annex_hash_mismatch` si el archivo del sitio cambió). Se vuelve a intentar al reiniciar el worker o ejecutando el despliegue `revisiones-ee`.
