-- Whether a universe exists, retired or not: component-design-classification-reader.md section 2.5
-- (an unknown universe_id raises UniverseNotFound; a retired one is still a scope, DEC-0128).
SELECT EXISTS (SELECT 1 FROM universe WHERE universe_id = %(universe_id)s::uuid);
