"""Massive package-boundary regressions (CAP-001-E3-S2, DAC-E3-12/T009)."""

from typing import Any

import factorflow.ingestion.massive as massive_boundary
from factorflow.ingestion.massive import models

MODEL_EXPORTS = {
    "CorporateAction": models.CorporateAction,
    "DailyBar": models.DailyBar,
    "FinancialStatement": models.FinancialStatement,
    "TickerReference": models.TickerReference,
}


def _export_origin(value: Any) -> str:
    """Return code provenance, treating builtin constants as package bindings."""
    direct_origin = getattr(value, "__module__", None)
    if direct_origin is not None:
        return direct_origin
    type_origin = type(value).__module__
    if type_origin != "builtins":
        return type_origin
    return massive_boundary.__name__


def test_s2_product_models_are_identity_reexported_from_package() -> None:
    """T009: all four S2 models cross the boundary as their definitions."""
    for name, model_type in MODEL_EXPORTS.items():
        assert name in massive_boundary.__all__
        assert getattr(massive_boundary, name) is model_type


def test_every_public_export_is_product_owned() -> None:
    """DAC-E3-12: exported code/types originate below `factorflow.*`.

    Immutable builtin constants have no `__module__`; their owning package is
    therefore the boundary where the public binding is defined.
    """
    for name in massive_boundary.__all__:
        assert _export_origin(getattr(massive_boundary, name)).startswith("factorflow."), name


def test_public_surface_contains_no_raw_dictionary_or_massive_sdk_value() -> None:
    """DAC-E3-12: raw wire dictionaries and Massive SDK values stay inside."""
    for name in massive_boundary.__all__:
        value = getattr(massive_boundary, name)
        assert not isinstance(value, dict), name
        assert not _export_origin(value).startswith("massive"), name
