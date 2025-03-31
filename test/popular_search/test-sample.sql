-- Clean table (reset all search history)
TRUNCATE TABLE SearchHistory;

-- Insert sample recipient search data
-- Simulates user searches with normalized recipient names

-- 6 searches for "University of Waterloo"
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Waterloo', 'waterloo', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Waterloo', 'waterloo', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Waterloo', 'waterloo', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Waterloo', 'waterloo', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Waterloo', 'waterloo', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Waterloo', 'waterloo', FALSE);

-- 5 searches for "University of Toronto"
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Toronto', 'toronto', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Toronto', 'toronto', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Toronto', 'toronto', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Toronto', 'toronto', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Toronto', 'toronto', FALSE);

-- 4 searches for "McGill University"
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('McGill University', 'mcgill', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('McGill University', 'mcgill', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('McGill University', 'mcgill', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('McGill University', 'mcgill', FALSE);

-- 2 searches for "University of Guelph"
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Guelph', 'guelph', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Guelph', 'guelph', FALSE);

-- 2 searches for "York University"
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('York University', 'york', FALSE);
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('York University', 'york', FALSE);

-- 1 search for "University of Calgary"
INSERT INTO SearchHistory (search_recipient, normalized_recipient, saved) VALUES ('University of Calgary', 'calgary', FALSE);

-- Call stored procedure to test top 5 recipient searches
CALL sp_get_popular_search('2025-01-01', '2025-12-31', 1);
