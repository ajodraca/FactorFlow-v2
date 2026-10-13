"""Every registered route declares no auth dependency (task plan T012).

Broader than `test_api_binding.py`'s OpenAPI-schema check: this inspects
each route's dependency list directly, guarding against a future route
accidentally adding a `Security`/`Depends`-based auth requirement.
"""

import pytest

from factorflow.api.app import create_app


@pytest.fixture(autouse=True)
def _database_url(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("FACTORFLOW_DATABASE_URL", "postgresql://unused@127.0.0.1/unused")


def test_no_route_dependency_requires_a_credential() -> None:
    app = create_app()

    assert list(app.router.dependencies) == [], "the app itself declares no default dependencies"

    for route in app.routes:
        dependant = getattr(route, "dependant", None)
        if dependant is None:
            continue
        assert dependant.dependencies == [], (
            f"route {getattr(route, 'path', route)!r} declares a dependency; "
            "no route in this component may require one (DAC-E1-S6-6)"
        )
