-- Sample query for sp_search_recipients (user id = 42)
SELECT 
  r.recipient_id,
  r.legal_name,
  i.name AS research_organization_name,
  i.city,
  i.province,
  i.country,
  COUNT(DISTINCT rg.grant_id) AS grant_count,
  COALESCE(SUM(rg.agreement_value), 0) AS total_funding,
  MAX(rg.agreement_start_date) AS latest_grant_date,
  IF(
    1 IS NOT NULL,
    EXISTS(
      SELECT 1 
      FROM BookmarkedRecipients br 
      WHERE br.user_id = 1 AND br.recipient_id = r.recipient_id
    ),
    FALSE
  ) AS is_bookmarked
FROM Recipient r
JOIN Institute i ON r.institute_id = i.institute_id
LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
WHERE r.legal_name LIKE CONCAT('%', 'university', '%')
   OR i.name LIKE CONCAT('%', 'university', '%')
GROUP BY r.recipient_id
ORDER BY total_funding DESC
LIMIT 10 OFFSET 0;
