"""Read SQL blocks out of the component design document.

The drift guards in this directory exist to catch divergence between the
design and what ships. Comparing against a copy of the design pasted into the
test would not do that: editing the design would leave the test green, which
is the exact case the guard is for. These helpers read the design itself, so
a change on either side fails the test.
"""

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
COMPONENT_DESIGN_PATH = (
    REPO_ROOT
    / "docs"
    / "capabilities"
    / "CAP-001-market-data-acquisition-foundation"
    / "design"
    / "component-design-market-data-store.md"
)


def sql_block_under_heading(heading: str, path: Path = COMPONENT_DESIGN_PATH) -> str:
    """Return the first ```sql fenced block below `heading`.

    `heading` is matched against the start of a markdown heading line, so
    "### 2.2" selects section 2.2 without depending on its title text. Plain
    fences that are not marked `sql` (such as the migrations directory tree in
    section 2.2) are skipped. The search stops at the next heading of the same
    or higher level so a missing block fails loudly here rather than silently
    matching SQL from a later section.
    """
    if not path.exists():
        raise AssertionError(f"component design not found at {path}")

    lines = path.read_text(encoding="utf-8").splitlines()

    start = next(
        (i for i, line in enumerate(lines) if line.startswith(heading)),
        None,
    )
    if start is None:
        raise AssertionError(f"heading {heading!r} not found in {path.name}")

    level = len(heading) - len(heading.lstrip("#"))

    for i in range(start + 1, len(lines)):
        line = lines[i]

        if line.startswith("#"):
            if len(line) - len(line.lstrip("#")) <= level:
                break
            continue

        if line.strip() == "```sql":
            closing = next(
                (j for j in range(i + 1, len(lines)) if lines[j].strip() == "```"),
                None,
            )
            if closing is None:
                raise AssertionError(f"unclosed ```sql block under {heading!r} in {path.name}")
            return "\n".join(lines[i + 1 : closing]) + "\n"

    raise AssertionError(f"no ```sql block found under {heading!r} in {path.name}")


def sql_block_after_migration_filename(filename: str, path: Path = COMPONENT_DESIGN_PATH) -> str:
    """Return the SQL fence immediately following a bold migration filename."""
    if not path.exists():
        raise AssertionError(f"component design not found at {path}")

    lines = path.read_text(encoding="utf-8").splitlines()
    marker = f"**{filename}**"
    try:
        marker_index = next(index for index, line in enumerate(lines) if marker in line)
    except StopIteration as error:
        raise AssertionError(f"migration filename {filename!r} not found in {path.name}") from error

    try:
        fence_start = next(
            index
            for index in range(marker_index + 1, len(lines))
            if lines[index].strip() == "```sql"
        )
        fence_end = next(
            index for index in range(fence_start + 1, len(lines)) if lines[index].strip() == "```"
        )
    except StopIteration as error:
        message = f"missing or unclosed SQL fence after {filename!r} in {path.name}"
        raise AssertionError(message) from error

    return "\n".join(lines[fence_start + 1 : fence_end]) + "\n"
