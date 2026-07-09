-- Precomputed per-entity funding stats for the /recipients and /institutes
-- list pages.
--
-- Those pages sort by derived aggregates (total_funding, grant_count,
-- recipient_count), so the previous inline queries had to join the entire
-- grants table, aggregate every entity, sort, and only THEN LIMIT 20 -- an
-- O(whole dataset) scan on every page view, sort, and page change. The data
-- only changes once a month (pipeline/01-load-data.sql), so these aggregates
-- are effectively static between loads. Precomputing them into indexed
-- materialized views turns each list query into an index scan + limit over a
-- few thousand pre-aggregated rows.
--
-- The aggregations below are byte-for-byte the same as the original inline
-- list-page queries (same joins, same COUNT(DISTINCT)/SUM/AVG/MIN/MAX), so
-- results are identical -- only precomputed. Refreshed after each monthly
-- load; see the post-commit refresh in pipeline/fetch_and_load.py.

-- ============================================================================
-- recipient_stats: one row per recipient
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS recipient_stats AS
SELECT
    r.recipient_id,
    COUNT(DISTINCT g.grant_id)  AS grant_count,
    SUM(g.agreement_value)      AS total_funding,
    AVG(g.agreement_value)      AS avg_funding,
    MIN(g.agreement_start_date) AS first_grant_date,
    MAX(g.agreement_start_date) AS latest_grant_date
FROM recipients r
LEFT JOIN grants g ON g.recipient_id = r.recipient_id
GROUP BY r.recipient_id;

-- Unique index is REQUIRED for REFRESH MATERIALIZED VIEW CONCURRENTLY.
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipient_stats_id
    ON recipient_stats(recipient_id);
-- Sort indexes: the list page orders by these, DESC NULLS LAST to match the
-- query's ORDER BY so the planner can read pre-sorted.
CREATE INDEX IF NOT EXISTS idx_recipient_stats_funding
    ON recipient_stats(total_funding DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_recipient_stats_grants
    ON recipient_stats(grant_count DESC NULLS LAST);

-- ============================================================================
-- institute_stats: one row per institute
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS institute_stats AS
SELECT
    i.institute_id,
    COUNT(DISTINCT r.recipient_id) AS recipient_count,
    COUNT(DISTINCT g.grant_id)     AS grant_count,
    SUM(g.agreement_value)         AS total_funding,
    AVG(g.agreement_value)         AS avg_funding,
    MIN(g.agreement_start_date)    AS first_grant_date,
    MAX(g.agreement_start_date)    AS latest_grant_date
FROM institutes i
LEFT JOIN recipients r ON r.institute_id = i.institute_id
LEFT JOIN grants g     ON g.recipient_id = r.recipient_id
GROUP BY i.institute_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_institute_stats_id
    ON institute_stats(institute_id);
CREATE INDEX IF NOT EXISTS idx_institute_stats_funding
    ON institute_stats(total_funding DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_institute_stats_grants
    ON institute_stats(grant_count DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_institute_stats_recipients
    ON institute_stats(recipient_count DESC NULLS LAST);
