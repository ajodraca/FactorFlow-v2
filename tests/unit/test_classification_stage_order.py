"""The classification stage runs after every input stage (CAP-002-E2-S5). No database.

Design 2.2 and 2.6 order a build as inputs, peer sets, classification. The classification
stage registers last, and a stage producing inputs is inserted above it (DEC-0121). Until
CAP-002-E2-S3 and CAP-002-E2-S4 land no input stage exists and the order check holds
vacuously; afterwards it is strict. Traces to DAC-E2-2.
"""

from collections.abc import Callable, Sequence

from factorflow.classification import engine

INPUT_STAGES = ("_fundamental_inputs_stage", "_momentum_inputs_stage")


def input_stages_after_classification(stages: Sequence[Callable[..., object]]) -> list[str]:
    names = [getattr(stage, "__name__", "") for stage in stages]
    position = names.index("_classification_stage")
    return [name for name in names[position + 1 :] if name in INPUT_STAGES]


def test_the_rule_detects_an_input_stage_after_classification() -> None:
    """DEC-0121: the order check can fail."""

    def _classification_stage() -> None: ...

    def _momentum_inputs_stage() -> None: ...

    def _other_stage() -> None: ...

    late = [_classification_stage, _other_stage, _momentum_inputs_stage]
    assert input_stages_after_classification(late) == ["_momentum_inputs_stage"]
    assert input_stages_after_classification([_momentum_inputs_stage, _classification_stage]) == []


def test_the_classification_stage_is_registered() -> None:
    """DEC-0121: ``build`` runs the classification stage."""
    assert engine._classification_stage in engine._STAGES


def test_no_input_stage_is_registered_after_the_classification_stage() -> None:
    """DEC-0121, DAC-E2-2: inputs are written before peer sets are formed from them."""
    late = input_stages_after_classification(engine._STAGES)
    assert late == [], (
        f"{late} run after _classification_stage: register an input stage above "
        "`_STAGES.append(_classification_stage)` in engine.py, never after it (DEC-0121)"
    )
