-- Precomputed global funding-trend series for the TrendVisualizer on the
-- /institutes and /recipients list pages (getAggregatedTrends in "global"
-- mode, i.e. ids = []).
--
-- Global mode ignores the entity id filter, so the data is identical for the
-- recipients and institutes pages and only changes with the monthly load --
-- yet each chart render ran two full scans of the grants table (a top-50 CTE
-- plus the year x category aggregation). This view precomputes the *already
-- bucketed* output (top 50 categories by funding per dimension, everything
-- else folded into 'Other'), one small row set per grouping dimension, so the
-- read becomes an indexed lookup.
--
-- The bucketing reproduces getAggregatedTrends' global query exactly:
--   category = top-50-by-total-funding ? the value : 'Other'
-- NULL group values fall through to 'Other' (the original `col IN (subquery)`
-- test is never true for NULL), so no 'Unknown' bucket appears here -- same as
-- today. Refreshed after each monthly load; see pipeline/fetch_and_load.py.

CREATE MATERIALIZED VIEW IF NOT EXISTS global_trend_stats AS
WITH base AS (
    SELECT
        EXTRACT(YEAR FROM g.agreement_start_date)::int AS year,
        g.agreement_value AS value,
        g.org::text           AS org,
        i.city::text          AS city,
        i.province::text      AS province,
        i.country::text       AS country,
        r.legal_name::text    AS recipient,
        i.name::text          AS institute,
        p.prog_title_en::text AS program
    FROM grants g
    JOIN recipients r ON g.recipient_id = r.recipient_id
    LEFT JOIN institutes i ON r.institute_id = i.institute_id
    LEFT JOIN programs p ON g.prog_id = p.prog_id
    WHERE g.agreement_start_date IS NOT NULL
),
-- Unpivot the seven category dimensions into (dimension, raw_category) rows so
-- the top-50 + bucketing logic can be expressed once instead of seven times.
long AS (
    SELECT b.year, b.value, d.dim AS group_dimension, d.cat AS raw_category
    FROM base b
    CROSS JOIN LATERAL (VALUES
        ('org', b.org),
        ('city', b.city),
        ('province', b.province),
        ('country', b.country),
        ('recipient', b.recipient),
        ('institute', b.institute),
        ('program', b.program)
    ) AS d(dim, cat)
),
top_cats AS (
    SELECT group_dimension, raw_category
    FROM (
        SELECT group_dimension, raw_category,
               ROW_NUMBER() OVER (
                   PARTITION BY group_dimension
                   ORDER BY SUM(value) DESC NULLS LAST
               ) AS rn
        FROM long
        GROUP BY group_dimension, raw_category
    ) ranked
    WHERE rn <= 50
),
categorized AS (
    SELECT
        l.group_dimension,
        l.year,
        -- Equality join never matches NULL raw_category, so NULLs land in
        -- 'Other' -- matching the original `IN (subquery)` semantics.
        CASE WHEN tc.raw_category IS NOT NULL THEN l.raw_category ELSE 'Other' END AS category,
        l.value
    FROM long l
    LEFT JOIN top_cats tc
        ON tc.group_dimension = l.group_dimension
       AND tc.raw_category = l.raw_category
)
SELECT group_dimension, year, category,
       SUM(value) AS funding,
       COUNT(*)   AS count
FROM categorized
GROUP BY group_dimension, year, category
UNION ALL
-- The 'year' dimension has no categories: a single 'Total' series per year.
SELECT 'year' AS group_dimension, year, 'Total' AS category,
       SUM(value) AS funding, COUNT(*) AS count
FROM base
GROUP BY year;

-- Unique index: required for REFRESH ... CONCURRENTLY, and its leading
-- group_dimension column also serves the WHERE group_dimension = $1 read.
CREATE UNIQUE INDEX IF NOT EXISTS idx_global_trend_stats_key
    ON global_trend_stats(group_dimension, year, category);
