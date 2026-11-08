FROM prefecthq/prefect:3-python3.12
WORKDIR /opt/pipelines
COPY . .
RUN pip install -e .
CMD ["python", "deployments.py"]
