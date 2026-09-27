"""Pure validation for acquisition-run lifecycle transitions."""

from collections.abc import Mapping
from types import MappingProxyType

RUN_STATES = frozenset(
    {
        "requested",
        "running",
        "cancelling",
        "succeeded",
        "partial",
        "failed",
        "cancelled",
        "abandoned",
    }
)
LEGAL_TRANSITIONS: Mapping[str, frozenset[str]] = MappingProxyType(
    {
        "requested": frozenset({"running", "cancelled"}),
        "running": frozenset({"cancelling", "succeeded", "partial", "failed", "abandoned"}),
        "cancelling": frozenset({"cancelled", "abandoned"}),
        "succeeded": frozenset(),
        "partial": frozenset(),
        "failed": frozenset(),
        "cancelled": frozenset(),
        "abandoned": frozenset(),
    }
)


class IllegalRunTransition(ValueError):
    """Raised when an acquisition run cannot move to the requested state."""


def validate_transition(source: str, target: str) -> None:
    """Raise unless ``source`` may transition to ``target``."""
    if source not in RUN_STATES or target not in LEGAL_TRANSITIONS[source]:
        raise IllegalRunTransition(f"illegal acquisition-run transition: {source!r} -> {target!r}")
