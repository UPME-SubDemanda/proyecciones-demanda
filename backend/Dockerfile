FROM python:3.12-slim
RUN pip install uv
WORKDIR /app
COPY pyproject.toml ./
RUN uv sync --no-dev || true
COPY . .
RUN uv sync --no-dev
CMD ["uv", "run", "fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]
