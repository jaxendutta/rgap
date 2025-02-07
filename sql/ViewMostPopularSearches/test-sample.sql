----Motivation: Aggregate the SearchHistory table 
----by the searched text, count the number of 
----occurrences, and return the five 
----most popular search strings that are 
----at least three characters long with
----additional criteria for tie-breaking

--Query Template 1.1:
----Most popular searches for the Recipient search bar
SELECT 
    search_recipient, 
    COUNT(*) AS frequency
FROM 
    SearchHistory
WHERE 
    LENGTH(search_recipient) >= 3
GROUP BY 
    search_recipient
ORDER BY 
    frequency DESC
LIMIT 5;

--Query Template 1.2:
----Most popular searches for the Institution search bar
SELECT 
    search_institution, 
    COUNT(*) AS frequency
FROM 
    SearchHistory
WHERE 
    LENGTH(search_institution) >= 3
GROUP BY 
    search_institution
ORDER BY 
    frequency DESC
LIMIT 5;

--Query Template 1.3:
----Most popular searches for the Grant search bar
SELECT 
    search_grant, 
    COUNT(*) AS frequency
FROM 
    SearchHistory
WHERE 
    LENGTH(search_grant) >= 3
GROUP BY 
    search_grant
ORDER BY 
    frequency DESC
LIMIT 5;

--Query Template 1.4:
----Most popular searches from the quick search bar
SELECT 
    quick_search, 
    COUNT(*) AS frequency
FROM 
    SearchHistory
WHERE 
    LENGTH(quick_search) >= 3
GROUP BY 
    quick_search
ORDER BY 
    frequency DESC
LIMIT 5;

--Query Template 2: Modified from 1 to handle ties
SELECT 
    search_recipient, 
    COUNT(*) AS frequency,
    MAX(search_recipient) AS last_search
FROM 
    SearchHistory
WHERE 
    LENGTH(search_recipient) >= 3
GROUP BY 
    search_recipient
ORDER BY 
    frequency DESC,         -- primary order: highest frequency first
    last_search DESC,       -- secondary order: most recent search time first (if tied)
    search_recipient ASC        -- tertiary order: alphabetical order (if still tied)
LIMIT 5;
