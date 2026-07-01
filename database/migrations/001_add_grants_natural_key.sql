-- database/migrations/001_add_grants_natural_key.sql
--
-- Adds a natural-key unique index to `grants` so the monthly data refresh can
-- upsert (INSERT ... ON CONFLICT DO UPDATE) instead of blindly re-inserting or
-- truncating. A bare unique constraint on ref_number is NOT correct here:
-- the source data legitimately reuses one ref_number across several distinct
-- grants (e.g. a batch of scholarships filed under one umbrella number), so
-- the real natural key is ref_number + recipient + program + title.
--
-- agreement_title_en is hashed (md5) because it's unbounded TEXT and a raw
-- text column can exceed Postgres's btree index row-size limit.
--
-- Safe to run repeatedly (IF NOT EXISTS) and safe to run against the existing
-- production dataset (verified zero collisions on this key across all rows).
CREATE UNIQUE INDEX IF NOT EXISTS uq_grants_natural_key
ON grants (
    ref_number,
    recipient_id,
    (COALESCE(prog_id, -1)),
    (md5(COALESCE(agreement_title_en, '')))
);
