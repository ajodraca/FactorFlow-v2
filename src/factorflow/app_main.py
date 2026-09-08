"""The uvicorn entrypoint for the ingestion API (task plan T021).

Reads the bind host and port from `ApiSettings` (CAP-001-E1-S3) and runs the
application factory (`api/app.py`) under uvicorn. The factory itself never
binds a socket -- this module is the only place that does.
"""

import uvicorn

from factorflow.api.app import create_app
from factorflow.config.settings import ApiSettings

app = create_app()


def main() -> None:
    settings = ApiSettings()
    uvicorn.run(app, host=settings.host, port=settings.port)


if __name__ == "__main__":
    main()
