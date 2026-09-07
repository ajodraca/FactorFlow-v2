# Minimal application container image.
#
# Scoped only to proving AC-16's "API never binds" property (component
# design section 2.1, section 6): the migrator runs and must exit 0 before
# uvicorn is ever exec'd. The `&&` below is what makes that true — a
# non-zero migrate_main exit short-circuits the chain with no supervision
# logic required.
#
# NOT YET BUILDABLE AS A RUNNING SERVICE: no FastAPI app module
# (`factorflow.main:app`) and no `fastapi`/`uvicorn` dependency exist in this
# repository yet — both are later stories' concern. This file exists only so
# the entrypoint chaining required by this story (T022) has a concrete home;
# whichever story adds the FastAPI app must add `fastapi`/`uvicorn` to
# pyproject.toml's dependencies and can otherwise use the CMD below as-is.
#
# Full container image definition for the application and ingestion
# processes (tech stack C1's two-process topology) is out of this story's
# scope (CAP-001-E1-S2) and is not built out further here.

FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY src ./src
COPY migrations ./migrations

RUN pip install --no-cache-dir .

CMD ["sh", "-c", "python -m factorflow.db.migrate_main && exec uvicorn factorflow.main:app --host 0.0.0.0 --port 8000"]
