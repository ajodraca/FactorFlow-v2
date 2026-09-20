"""Run lifecycle transition tests."""

import pytest

from factorflow.runs.states import RUN_STATES, IllegalRunTransition, validate_transition


# Implements TC-COMP-236, TC-COMP-253
def test_state_set_and_approved_transitions() -> None:
    assert RUN_STATES == {
        "requested",
        "running",
        "cancelling",
        "succeeded",
        "partial",
        "failed",
        "cancelled",
        "abandoned",
    }
    for source, target in (
        ("requested", "running"),
        ("requested", "cancelled"),
        ("running", "cancelling"),
        ("running", "succeeded"),
        ("running", "partial"),
        ("running", "failed"),
        ("running", "abandoned"),
        ("cancelling", "cancelled"),
        ("cancelling", "abandoned"),
    ):
        validate_transition(source, target)


# Implements TC-COMP-236, TC-COMP-253
@pytest.mark.parametrize(
    ("source", "target"),
    [("unknown", "running"), ("requested", "succeeded"), ("succeeded", "running")],
)
def test_illegal_transition_raises_before_a_write(source: str, target: str) -> None:
    with pytest.raises(IllegalRunTransition):
        validate_transition(source, target)
