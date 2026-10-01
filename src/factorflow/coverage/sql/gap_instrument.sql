-- One instrument's id and whether it holds any prices coverage, for gap-date expansion.
-- At most one row: idx_instrument_symbol is unique. Read-only.
SELECT i.instrument_id, EXISTS (SELECT 1 FROM coverage_segment cs WHERE cs.instrument_id = i.instrument_id AND cs.data_type = 'prices') AS has_prices FROM instrument i WHERE i.symbol = %(symbol)s;
