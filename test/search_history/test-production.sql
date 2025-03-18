SELECT * FROM SearchHistory WHERE user_id = 5 ORDER BY search_time DESC LIMIT 1;

DELETE FROM SearchHistory WHERE history_id = 240;

SELECT * FROM SearchHistory WHERE history_id = 240;
