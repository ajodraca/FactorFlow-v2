"""The classification statements' static contract (CAP-002-E2-S5). No database.

``peer_sets.sql`` and ``classify.sql`` read ``factor_input`` and never a universe table or the
``inputs`` temporary table (DEC-0119; the "no universe table is read" half of DAC-E2-S5-5),
take only the stage's named parameters, and do their arithmetic with PostgreSQL window
functions, with no numeric library anywhere in the package (DEC-0052). The input labels have
one table, ``constants.INPUT_LABELS``, which reaches ``classify.sql`` as a bound array
(DEC-0120, DEC-0130; STD-UI-1). Traces to AC-8, DEC-0052, DEC-0119 and DEC-0120.
"""

import ast
import re
from pathlib import Path

import pytest

from factorflow.classification import constants

PACKAGE = Path(constants.__file__).parent
SQL_DIR = PACKAGE / "sql"
STATEMENTS = ("peer_sets.sql", "classify.sql")
STAGE_PARAMETERS = {
    "set_id",
    "factor",
    "factors",
    "input_names",
    "input_labels",
    "input_counts",
    "min_peer_set_size",
    "active_ids",
    "retired_ids",
}
NUMERIC_LIBRARIES = {"numpy", "scipy", "pandas", "statistics"}
LABELS = {
    "book_to_price": "book-to-price",
    "earnings_yield": "earnings yield",
    "fcf_yield": "free-cash-flow yield",
    "revenue_growth": "revenue growth",
    "eps_growth": "earnings-per-share growth",
    "return_3m": "3-month total return",
    "return_6m": "6-month total return",
    "return_12m": "12-month total return",
}


def statement(name: str) -> str:
    return (SQL_DIR / name).read_text()


def numeric_imports(source: str) -> list[str]:
    found: list[str] = []
    for node in ast.walk(ast.parse(source)):
        if isinstance(node, ast.Import):
            found += [a.name for a in node.names if a.name.split(".")[0] in NUMERIC_LIBRARIES]
        elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            if node.module.split(".")[0] in NUMERIC_LIBRARIES:
                found.append(node.module)
    return found


def names_inputs_table(text: str) -> bool:
    return re.search(r"\b(?:FROM|JOIN)\s+inputs\b", text, re.IGNORECASE) is not None


def written_tables(text: str) -> set[str]:
    pattern = r"\b(?:INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+(\w+)"
    return {table.lower() for table in re.findall(pattern, text, re.IGNORECASE)}


def parameters(text: str) -> set[str]:
    return set(re.findall(r"%\((\w+)\)s", text))


# --- the rules can fail -----------------------------------------------------------------


@pytest.mark.parametrize(
    "source",
    [
        "import numpy",
        "import numpy as np",
        "import scipy.stats",
        "from pandas.core import frame",
        "from statistics import stdev",
    ],
)
def test_numeric_import_is_detected(source: str) -> None:
    """DEC-0052: the numeric-library check can fail."""
    assert numeric_imports(source)


def test_other_imports_are_allowed() -> None:
    """DEC-0052: the check does not flag other imports."""
    assert not numeric_imports("import decimal\nfrom . import statistics_like\nimport math")


@pytest.mark.parametrize("text", ["SELECT 1 FROM inputs i", "x JOIN inputs USING (a)"])
def test_inputs_table_is_detected(text: str) -> None:
    """DEC-0119: the ``inputs`` check can fail."""
    assert names_inputs_table(text)


def test_factor_input_and_a_cte_named_inp_are_not_the_inputs_table() -> None:
    """DEC-0119: ``factor_input`` and a CTE named ``inp`` are not the ``inputs`` table."""
    assert not names_inputs_table("SELECT 1 FROM factor_input fi CROSS JOIN inp i")


def test_written_tables_are_found() -> None:
    """DEC-0119: the written-table check sees INSERT, UPDATE and DELETE targets."""
    text = "INSERT INTO a (x) SELECT 1; update B SET x = 1; DELETE FROM c"
    assert written_tables(text) == {"a", "b", "c"}


# --- the statements obey them -----------------------------------------------------------


@pytest.mark.parametrize("name", STATEMENTS)
def test_statement_exists(name: str) -> None:
    """DEC-0121: the stage's two statements ship in ``classification/sql``."""
    assert (SQL_DIR / name).is_file()
    assert statement(name).strip()


@pytest.mark.parametrize("name", STATEMENTS)
def test_statement_never_names_a_universe_table(name: str) -> None:
    """AC-8, DAC-E2-S5-5: no universe table is read, so membership cannot move a score."""
    assert "universe" not in statement(name).lower()


@pytest.mark.parametrize("name", STATEMENTS)
def test_statement_reads_factor_input_and_not_the_inputs_table(name: str) -> None:
    """DEC-0119: the statements read ``factor_input``, never the ``inputs`` temporary table."""
    text = statement(name)
    assert re.search(r"\b(?:FROM|JOIN)\s+factor_input\b", text, re.IGNORECASE)
    assert not names_inputs_table(text)


@pytest.mark.parametrize("name", STATEMENTS)
def test_statement_takes_only_the_stage_parameters(name: str) -> None:
    """DEC-0119, DEC-0120: only the stage's ``%(name)s`` parameters, never interpolation."""
    text = statement(name)
    assert parameters(text) <= STAGE_PARAMETERS
    assert re.search(r"%(?!\(\w+\)s)", text) is None


def test_classify_does_its_arithmetic_with_window_functions() -> None:
    """DEC-0052, DEC-0053: PostgreSQL window functions do the arithmetic."""
    text = statement("classify.sql")
    for function in ("stddev_samp", "percent_rank", "avg"):
        assert re.search(rf"\b{function}\s*\(", text), function


def test_each_statement_writes_only_its_own_table() -> None:
    """DEC-0119: each statement inserts into its one table and changes no other."""
    assert written_tables(statement("peer_sets.sql")) == {"classification_set_factor"}
    assert written_tables(statement("classify.sql")) == {"factor_classification"}


def test_no_classification_module_imports_a_numeric_library() -> None:
    """DEC-0052: no numeric library anywhere in the package."""
    modules = sorted(PACKAGE.rglob("*.py"))
    assert modules
    assert {p.name: numeric_imports(p.read_text()) for p in modules} == {
        p.name: [] for p in modules
    }


def test_input_labels_cover_exactly_the_input_names() -> None:
    """DEC-0130: one label per input name, and no other key."""
    names = {name for names in constants.INPUT_NAMES.values() for name in names}
    assert set(constants.INPUT_LABELS) == names


def test_input_labels_are_the_product_vocabulary() -> None:
    """DEC-0120, DEC-0130, STD-UI-1: product vocabulary, never a payload key."""
    assert constants.INPUT_LABELS == LABELS
    for name, label in constants.INPUT_LABELS.items():
        assert label != name
        assert "_" not in label


def test_classify_holds_no_label_text() -> None:
    """DEC-0120: the labels have one table; ``classify.sql`` receives them bound."""
    text = statement("classify.sql")
    assert [label for label in LABELS.values() if label in text] == []
    assert "replace(" not in text.lower()
