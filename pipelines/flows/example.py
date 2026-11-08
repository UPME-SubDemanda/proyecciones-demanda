"""Flujo de ejemplo. Reemplazar por los flujos del proyecto y documentarlos en docs/tecnica/flujos.md."""
from prefect import flow, task


@task(retries=3, retry_delay_seconds=60)
def extract() -> list[dict]:
    return [{"value": 1}]


@task
def load(rows: list[dict]) -> int:
    return len(rows)


@flow(name="example-ingest")
def example_ingest() -> int:
    return load(extract())


if __name__ == "__main__":
    example_ingest()
