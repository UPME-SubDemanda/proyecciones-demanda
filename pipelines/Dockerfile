FROM prefecthq/prefect:3-python3.12
WORKDIR /opt/pipelines
COPY . .
RUN pip install -e .
# Carga las revisiones que falten y después sirve los despliegues (start.sh, issue #42).
CMD ["sh", "start.sh"]
