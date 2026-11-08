"""Registra los flujos y sus horarios (zona America/Bogota)."""
from prefect import serve
from prefect.client.schemas.schedules import CronSchedule

from flows.example import example_ingest

if __name__ == "__main__":
    serve(
        example_ingest.to_deployment(
            name="example-ingest", schedules=[CronSchedule(cron="0 6 * * *", timezone="America/Bogota")]
        )
    )
