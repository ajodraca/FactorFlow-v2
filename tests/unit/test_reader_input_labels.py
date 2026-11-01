"""The reader re-exports the one input-label table (CAP-002-E3-S3).

Reader design 2.6 and DEC-0130: ``label`` of an evidence input is the product-vocabulary name,
from the one table ``classify.sql`` writes ``reason_detail`` from, never a payload key
(STD-UI-1).
"""

from factorflow.classification import constants, reader


def test_the_reader_re_exports_the_one_label_table() -> None:
    assert reader.INPUT_LABELS is constants.INPUT_LABELS


def test_the_labels_cover_exactly_the_eight_inputs() -> None:
    names = {name for factor in constants.FACTORS for name in constants.INPUT_NAMES[factor]}
    assert set(reader.INPUT_LABELS) == names
    assert len(names) == 8


def test_the_labels_are_the_product_vocabulary() -> None:
    assert reader.INPUT_LABELS == {
        "book_to_price": "book-to-price",
        "earnings_yield": "earnings yield",
        "fcf_yield": "free-cash-flow yield",
        "revenue_growth": "revenue growth",
        "eps_growth": "earnings-per-share growth",
        "return_3m": "3-month total return",
        "return_6m": "6-month total return",
        "return_12m": "12-month total return",
    }
    assert all(label != key for key, label in reader.INPUT_LABELS.items())
