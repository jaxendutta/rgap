-- We add a WHERE clause to help with performance with a production dataset
SELECT 
  YEAR(rg.agreement_start_date) AS year,
  o.org AS funding_agency,
  COUNT(*) AS total_grants,
  SUM(rg.agreement_value) AS total_funding,
  AVG(rg.agreement_value) AS avg_funding
FROM ResearchGrant rg
JOIN Organization o ON rg.org = o.org
WHERE YEAR(rg.agreement_start_date) BETWEEN YEAR(CURDATE()) - 10 AND YEAR(CURDATE())
GROUP BY YEAR(rg.agreement_start_date), o.org
ORDER BY year, total_funding DESC;
