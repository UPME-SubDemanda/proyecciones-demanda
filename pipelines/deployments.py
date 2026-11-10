"""Registra los despliegues de los flujos en el servidor de Prefect (lo corre el contenedor prefect-worker).

Ninguno tiene horario todavía: se ejecutan a mano desde la interfaz (http://localhost:4200) o con
`prefect deployment run`. La programación de las cargas es de T-29 y T-31 (zona America/Bogota).
Documentación: docs/tecnica/flujos.md.
"""
from prefect import serve

from flows.xm_observed import ingest_observed_demand

if __name__ == "__main__":
    serve(
        ingest_observed_demand.to_deployment(
            name="xm-historico-diario",
            description="Carga histórica de las medidas diarias de XM SINERGOX: DemaSIN y DemaMaxPot (T-28). Solo guarda lo nuevo o "
                        "lo que cambió, así que se puede volver a correr cualquier rango.",
            tags=["xm", "datos-reales"],
        ),
    )
