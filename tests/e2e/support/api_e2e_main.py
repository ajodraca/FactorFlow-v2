"""A test-only API entry point, for the e2e acquisition stack.

Started by `scripts/run-e2e-server.sh` (`uv run python tests/e2e/support/api_e2e_main.py`),
its only launcher. It installs the test payload keys of `e2e_line_items.py` into
`line_items.LINE_ITEMS`, which `classification.engine` reads at call time (factor-engine
design section 7: fixtures declare their own payload keys), then runs the product's own
entry point, so the stack's classification loop derives value and growth from the
statements the stub serves. No `src/` change; the release artifact never contains this
file (the wheel ships `src/` only). Not collected by pytest (no `test_` prefix).
"""

from __future__ import annotations

from e2e_line_items import E2E_LINE_ITEMS

from factorflow.app_main import main
from factorflow.classification import line_items


def install_test_line_items() -> None:
    """Replace every line item's unresolved key with its test key, keeping label and type."""
    for name, item in list(line_items.LINE_ITEMS.items()):
        statement_type, key = E2E_LINE_ITEMS[name]
        if item.statement_type != statement_type:
            raise RuntimeError(f"{name}: statement type {item.statement_type} != {statement_type}")
        line_items.LINE_ITEMS[name] = line_items.LineItem(item.label, statement_type, key, 1)


if __name__ == "__main__":
    install_test_line_items()
    main()
