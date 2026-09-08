"""The uvicorn entrypoint for the ingestion API (task plan T021).

Reads the bind host and port from `ApiSettings` (CAP-001-E1-S3) and runs the
application factory (`api/app.py`) under uvicorn. The factory itself never
binds a socket -- this module is the only place that does.
"""

import uvicorn

from factorflow.api.app import create_app
from factorflow.config.settings import ApiSettings

app = create_app()


def build_server(port: int | None = None) -> uvicorn.Server:
    """Build the `uvicorn.Server` this process would run, from `ApiSettings`.

    `port` overrides `ApiSettings.port` when given (IR-005: a test needs a
    free ephemeral port rather than the configured default, but must still
    exercise this same settings-to-config path -- particularly `host`,
    which `ApiSettings._reject_non_loopback_host` (CAP-001-E1-S3) already
    constrains at the config layer, and which this function is the one
    place that turns into a bound socket).
    """
    settings = ApiSettings()
    config = uvicorn.Config(
        app, host=settings.host, port=port if port is not None else settings.port
    )
    return uvicorn.Server(config)


def main() -> None:
    build_server().run()


if __name__ == "__main__":
    main()
