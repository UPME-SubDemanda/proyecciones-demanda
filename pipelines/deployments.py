"""Registra los despliegues de los flujos en el servidor de Prefect (lo corre el contenedor prefect-worker).

Ninguno tiene horario todavía: se ejecutan a mano desde la interfaz (http://localhost:4200) o con
`prefect deployment run`. La programación de las cargas es de T-29 y T-31 (zona America/Bogota).
Las revisiones publicadas, además, se cargan solas al arrancar el contenedor (start.sh, issue #42).
Documentación: docs/tecnica/flujos.md.
"""
from prefect import serve

from flows.upme_revisions import load_published_revisions
from flows.xm_observed import ingest_observed_demand

if __name__ == "__main__":
    serve(
        ingest_observed_demand.to_deployment(
            name="xm-historico-diario",
            description="Carga histórica de las medidas diarias de XM SINERGOX: DemaSIN y DemaMaxPot (T-28). Solo guarda lo nuevo o "
                        "lo que cambió, así que se puede volver a correr cualquier rango.",
            tags=["xm", "datos-reales"],
        ),
        load_published_revisions.to_deployment(
            name="revisiones-ee",
            description="Descarga del sitio de la UPME los anexos de revisiones_ee.toml que falten, verifica su huella y "
                        "los carga (T-27, issue #42). También corre al arrancar el worker. Lo ya cargado se omite.",
            tags=["upme", "datos-reales"],
        ),
    )
