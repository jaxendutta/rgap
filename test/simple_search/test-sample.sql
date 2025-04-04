-- Sample query for sp_search_institutes
SELECT 
  i.institute_id,
  i.name,
  COUNT(DISTINCT r.recipient_id) AS recipients_count,
  COUNT(DISTINCT rg.grant_id) AS grant_count,
  COALESCE(SUM(rg.agreement_value), 0) AS total_funding,
  MAX(rg.agreement_start_date) AS latest_grant_date,
  TRUE AS is_bookmarked  -- For testing, we simply return TRUE
FROM Institute i
LEFT JOIN Recipient r ON i.institute_id = r.institute_id
LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
WHERE i.name LIKE '%Test%'
   OR i.city LIKE '%Test%'
   OR i.province LIKE '%Test%'
   OR i.country LIKE '%Test%'
GROUP BY i.institute_id
ORDER BY total_funding DESC
LIMIT 10 OFFSET 0;
