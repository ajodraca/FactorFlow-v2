"""`scripts/run-e2e-server.sh` makes `component-design-runtime-config.md`
section 2.2c item 5's one edit (DEC-0037; CAP-001-E3-S7): a provider key
generated per run with no inherited fallback and no fixed key, and the
acquisition stack's ingestion process started through the test-only entry
point. Reads the script and runs nothing but `bash -n`.
"""

import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = REPO_ROOT / "scripts/run-e2e-server.sh"

_KEY_LINE = (
    "E2E_PROVIDER_KEY=\"TEST-ONLY-$(uv run python -c 'import secrets; "
    "print(secrets.token_hex(16))')\""
)
_INGESTION_LAUNCH = (
    'env "${ACQUISITION_ENV[@]}" uv run python tests/e2e/support/ingestion_e2e_main.py &'
)
_API_LAUNCH = 'env "${ACQUISITION_ENV[@]}" FACTORFLOW_API_PORT="$ACQ_PORT" \\'


def _acquisition_env(lines: list[str]) -> list[str]:
    start = lines.index("ACQUISITION_ENV=(")
    end = lines.index(")", start)
    return lines[start + 1 : end]


# Implements TC-COMP-380
def test_script_generates_a_per_run_key_and_launches_the_test_entry_point() -> None:
    subprocess.run(["bash", "-n", str(SCRIPT)], check=True)
    text = SCRIPT.read_text(encoding="utf-8")
    lines = [line.strip() for line in text.splitlines()]

    assert _KEY_LINE in lines
    key_at = lines.index(_KEY_LINE)
    migrate_at = next(i for i, line in enumerate(lines) if "factorflow.db.migrate_main" in line)
    export_at = next(
        i for i, line in enumerate(lines) if line.startswith("export FACTORFLOW_MASSIVE_API_KEY")
    )
    assert key_at < migrate_at
    assert key_at < export_at

    assert 'export FACTORFLOW_MASSIVE_API_KEY="$E2E_PROVIDER_KEY"' in lines
    assert "FACTORFLOW_MASSIVE_API_KEY:-" not in text
    assert '"FACTORFLOW_MASSIVE_API_KEY=$E2E_PROVIDER_KEY"' in _acquisition_env(lines)
    assert "e2e" + "-test-key" not in text

    assert _INGESTION_LAUNCH in lines
    assert "-m factorflow.ingestion_main" not in text
    api_at = lines.index(_API_LAUNCH)
    assert lines[api_at + 1] == "uv run python -m factorflow.app_main &"
