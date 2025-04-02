DELIMITER $$

CREATE PROCEDURE sp_advanced_funding_comparisons()
BEGIN
    WITH grant_data AS (
      SELECT 
        rg.ref_number,
        rg.agreement_value,
        YEAR(rg.agreement_start_date) AS year,
        o.org AS funding_agency
      FROM ResearchGrant rg
      JOIN Organization o ON rg.org = o.org
    ),
    yearly_summary AS (
      SELECT 
        year,
        funding_agency,
        COUNT(*) AS total_grants,
        SUM(agreement_value) AS total_funding,
        AVG(agreement_value) AS avg_funding
      FROM grant_data
      GROUP BY year, funding_agency
    ),
    stats AS (
      SELECT 
        AVG(total_funding) AS overall_avg,
        STDDEV_POP(total_funding) AS overall_std
      FROM yearly_summary
    ),
    ranked_summary AS (
      SELECT 
        ys.year,
        ys.funding_agency,
        ys.total_grants,
        ys.total_funding,
        ys.avg_funding,
        s.overall_avg,
        s.overall_std,
        RANK() OVER (PARTITION BY ys.year ORDER BY ys.total_funding DESC) AS funding_rank,
        CASE 
          WHEN ys.total_funding > s.overall_avg + 2 * s.overall_std 
               OR ys.total_funding < s.overall_avg - 2 * s.overall_std
          THEN 1 ELSE 0 END AS is_outlier
      FROM yearly_summary ys, stats s
    )
    SELECT * FROM ranked_summary ORDER BY year, funding_rank;
END $$
DELIMITER ;
