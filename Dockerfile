# Minimal application container image.
#
# Scoped to proving AC-16's "API never binds" property (component design
# section 2.1, section 6): the migrator runs and must exit 0 before the API
# process is ever exec'd. The `&&` below is what makes that true — a
# non-zero migrate_main exit short-circuits the chain with no supervision
# logic required. CAP-001-E1-S6 added the FastAPI app
# (`factorflow.app_main`) this CMD now execs; `factorflow.app_main.main()`
# reads the bind host and port from `ApiSettings` (defaulting to loopback
# only, CAP-001-E1-S3), so no host/port is hardcoded here.
#
# Full container image definition for the application and ingestion
# processes (tech stack C1's two-process topology) is out of this story's
# scope and is not built out further here.

FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY src ./src
COPY migrations ./migrations

RUN pip install --no-cache-dir .

CMD ["sh", "-c", "python -m factorflow.db.migrate_main && exec python -m factorflow.app_main"]
