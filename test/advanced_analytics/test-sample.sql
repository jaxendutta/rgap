SELECT 
  YEAR(rg.agreement_start_date) AS year,
  o.org AS funding_agency,
  COUNT(*) AS total_grants,
  SUM(rg.agreement_value) AS total_funding,
  AVG(rg.agreement_value) AS avg_funding
FROM ResearchGrant rg
JOIN Organization o ON rg.org = o.org
GROUP BY YEAR(rg.agreement_start_date), o.org
ORDER BY year, total_funding DESC;
