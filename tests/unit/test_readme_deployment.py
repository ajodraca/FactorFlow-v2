"""README deployment, upgrade, backup, rollback, and rehearsal procedures
(CAP-001-E1-S9).

Component design: `component-design-runtime-config.md` sections 2.8.3, 2.8.4,
2.8.5, and 9; DAC-E1-24, DAC-E1-S9-7, DAC-E1-S9-8, DAC-E1-S9-9, AC-14.
"""

import re
import shlex
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
README_PATH = REPO_ROOT / "README.md"


def _read_readme() -> str:
    return README_PATH.read_text(encoding="utf-8")


# Implements TC-COMP-432
def test_readme_first_deployment_runs_smoke_check_before_interface_or_ingestion() -> None:
    """DAC-E1-S9-7, TC-COMP-432: the README's first-deployment procedure names
    host networking as a precondition, generates `FACTORFLOW_POSTGRES_PASSWORD`
    with `openssl rand -hex 24`, names all four variables and the immutable
    `<version>-<shortsha>` image tag rule, runs `docker compose up -d`, then
    `scripts/deploy-smoke.sh`, and only then opens `http://127.0.0.1:8000` and
    starts ingestion with `docker compose --profile ingestion up -d`; and
    states that `scripts/deploy-smoke.sh` is re-run after any change to the
    host's network configuration."""
    text = _read_readme()

    assert "## Deploying and operating FactorFlow" in text
    section = text.split("## Deploying and operating FactorFlow", 1)[1].split(
        "### Upgrade, backup and rollback", 1
    )[0]

    assert "host networking" in section.lower()
    assert "openssl rand -hex 24" in section
    assert "128 bits" in section
    for var in (
        "FACTORFLOW_POSTGRES_PASSWORD",
        "FACTORFLOW_MASSIVE_API_KEY",
        "FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE",
        "FACTORFLOW_IMAGE_TAG",
    ):
        assert var in section, f"missing {var} in first-deployment section"
    assert "never reused" in section or "immutable" in section

    idx_up = section.find("docker compose up -d")
    idx_smoke = section.find("scripts/deploy-smoke.sh")
    idx_url = section.find("http://127.0.0.1:8000")
    idx_ing = section.find("docker compose --profile ingestion up -d")
    assert idx_up != -1, "missing `docker compose up -d`"
    assert idx_smoke != -1, "missing `scripts/deploy-smoke.sh`"
    assert idx_url != -1, "missing `http://127.0.0.1:8000`"
    assert idx_ing != -1, "missing `docker compose --profile ingestion up -d`"
    assert idx_up < idx_smoke < idx_url
    assert idx_smoke < idx_ing

    assert "network configuration" in section


# Implements TC-COMP-399
# Implements TC-COMP-400
def test_readme_upgrade_takes_dump_first_and_rollback_restores_before_old_image() -> None:
    """DAC-E1-24, TC-COMP-399, TC-COMP-400: step 1 of the upgrade takes a
    `pg_dump -U factorflow -d factorflow -Fc` into `$FACTORFLOW_BACKUP_DIR`
    before `docker compose build app`, `docker compose stop ingestion`, and
    `docker compose up -d`, and states that a non-zero exit or an empty file
    stops the upgrade; both rollback branches are documented, and rollback
    after a migration restores the step 1 dump into an emptied database before
    starting `FACTORFLOW_IMAGE_TAG=<old> docker compose up -d`, running the
    smoke check, and starting ingestion."""
    text = _read_readme()
    assert "### Upgrade, backup and rollback" in text
    section = text.split("### Upgrade, backup and rollback", 1)[1].split(
        "### Pre-release backup and restore drill", 1
    )[0]

    assert "**Rollback when `<new>` applied no migration" in section
    assert "**Rollback when `<new>` applied a migration" in section

    upgrade_part = section.split("**Rollback when `<new>` applied no migration", 1)[0]
    idx_dump = upgrade_part.find("pg_dump -U factorflow -d factorflow -Fc")
    idx_backup_dir = upgrade_part.find("$FACTORFLOW_BACKUP_DIR")
    idx_stop_rule = upgrade_part.lower().find("non-zero exit or an empty")
    idx_build = upgrade_part.find("FACTORFLOW_IMAGE_TAG=<new> docker compose build app")
    idx_stop_ing = upgrade_part.find("FACTORFLOW_IMAGE_TAG=<new> docker compose stop ingestion")
    idx_up_new = upgrade_part.find("FACTORFLOW_IMAGE_TAG=<new> docker compose up -d")
    idx_smoke = upgrade_part.find("scripts/deploy-smoke.sh")
    idx_resume = upgrade_part.find(
        "FACTORFLOW_IMAGE_TAG=<new> docker compose --profile ingestion up -d"
    )

    for name, idx in (
        ("pg_dump", idx_dump),
        ("$FACTORFLOW_BACKUP_DIR", idx_backup_dir),
        ("non-zero exit or empty dump rule", idx_stop_rule),
        ("build app", idx_build),
        ("stop ingestion", idx_stop_ing),
        ("up -d", idx_up_new),
        ("deploy-smoke.sh", idx_smoke),
        ("resume ingestion", idx_resume),
    ):
        assert idx != -1, f"missing {name} in upgrade procedure"
    assert idx_dump < idx_stop_rule < idx_build < idx_stop_ing < idx_up_new < idx_smoke < idx_resume

    rollback_mig = section.split("**Rollback when `<new>` applied a migration", 1)[1]
    r_stop = rollback_mig.find("docker compose stop ingestion app")
    r_drop = rollback_mig.find("dropdb -U factorflow factorflow")
    r_create = rollback_mig.find("createdb -U factorflow factorflow")
    r_restore = rollback_mig.find("pg_restore -U factorflow -d factorflow --no-owner")
    r_up_old = rollback_mig.find("FACTORFLOW_IMAGE_TAG=<old> docker compose up -d")
    r_smoke = rollback_mig.find("scripts/deploy-smoke.sh")
    r_ing_old = rollback_mig.find(
        "FACTORFLOW_IMAGE_TAG=<old> docker compose --profile ingestion up -d"
    )
    for name, idx in (
        ("stop ingestion app", r_stop),
        ("dropdb", r_drop),
        ("createdb", r_create),
        ("pg_restore", r_restore),
        ("up -d <old>", r_up_old),
        ("deploy-smoke.sh", r_smoke),
        ("profile ingestion up -d <old>", r_ing_old),
    ):
        assert idx != -1, f"missing {name} in rollback-after-migration procedure"
    assert r_stop < r_drop < r_create < r_restore < r_up_old < r_smoke < r_ing_old


# Implements TC-COMP-433
def test_readme_rollback_guards_destructive_steps_and_passes_pgpassword_to_exec() -> None:
    """DAC-E1-S9-8, TC-COMP-433: `dropdb` is preceded by the owner confirming
    the dump to restore; every `docker compose exec` that connects to
    PostgreSQL passes `-e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD"`; and
    `docker compose -p factorflow-drill down -v` is preceded by the owner
    confirming the project name."""
    text = _read_readme()
    assert "**Rollback when `<new>` applied a migration" in text
    rollback_mig = text.split("**Rollback when `<new>` applied a migration", 1)[1].split(
        "### Pre-release backup and restore drill", 1
    )[0]

    idx_confirm_dump = rollback_mig.lower().find("confirming the dump")
    idx_dropdb = rollback_mig.find("dropdb -U factorflow factorflow")
    assert idx_confirm_dump != -1, "missing confirmation of dump before dropdb"
    assert idx_dropdb != -1
    assert idx_confirm_dump < idx_dropdb

    assert "### Pre-release backup and restore drill" in text
    after_drill_heading = text.split("### Pre-release backup and restore drill", 1)[1]
    drill_section = after_drill_heading.split("\n## ", 1)[0]
    idx_confirm_proj = drill_section.lower().find("confirming the project name")
    idx_down_v = drill_section.find("docker compose -p factorflow-drill down -v")
    assert idx_confirm_proj != -1, "missing confirmation of project name before down -v"
    assert idx_down_v != -1, "missing `docker compose -p factorflow-drill down -v`"
    assert idx_confirm_proj < idx_down_v

    # Every `docker compose ... exec` that invokes psql, pg_dump, dropdb,
    # createdb, or pg_restore must pass `-e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD"`.
    joined_lines: list[str] = []
    current = ""
    for raw_line in text.splitlines():
        if raw_line.rstrip().endswith("\\"):
            current += raw_line.rstrip()[:-1] + " "
        else:
            joined_lines.append(current + raw_line)
            current = ""
    if current:
        joined_lines.append(current)

    pg_tools = ("psql", "pg_dump", "dropdb", "createdb", "pg_restore")
    exec_commands = [
        line.strip()
        for line in joined_lines
        if re.search(r"docker compose(?:\s+-p\s+\S+)?\s+exec\b", line)
        and any(re.search(rf"\b{tool}\b", line) for tool in pg_tools)
    ]
    assert len(exec_commands) >= 5, (
        f"expected at least 5 connecting exec commands, got {exec_commands}"
    )
    for cmd in exec_commands:
        assert '-e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD"' in cmd, (
            f"connecting docker compose exec missing PGPASSWORD: {cmd}"
        )
        words = shlex.split(cmd)
        assert "PGPASSWORD=$FACTORFLOW_POSTGRES_PASSWORD" in words
