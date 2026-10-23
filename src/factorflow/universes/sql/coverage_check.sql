-- Uncovered symbols of a request: component-design-universe-service.md section 2.5, DAC-E1-1, DEC-0057.
-- Coverage, not lifecycle, decides (AC-15): this never joins the instrument lifecycle.
SELECT s.symbol
  FROM unnest(%(symbols)s::text[]) AS s(symbol)
 WHERE NOT EXISTS (
       SELECT 1 FROM instrument i
         JOIN coverage_segment c USING (instrument_id)
        WHERE i.symbol = s.symbol);
