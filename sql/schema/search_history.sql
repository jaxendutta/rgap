-- File: sql/schema/search_history.sql
/*
USE rgap;

CREATE TABLE SearchHistory (
   history_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
   user_id INT UNSIGNED NULL,
   search_recipient VARCHAR(500),
   normalized_recipient VARCHAR(500),
   search_grant VARCHAR(500),
   normalized_grant VARCHAR(500),
   search_institution VARCHAR(500),
   normalized_institution VARCHAR(500),
   search_filters JSON,
   search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   result_count INT,
   bookmarked BOOLEAN NOT NULL,
   FOREIGN KEY (user_id) REFERENCES User(user_id)
);
*/

-- PostgreSQL version of search_history.sql
CREATE TABLE IF NOT EXISTS "SearchHistory" (
   history_id SERIAL PRIMARY KEY,
   user_id INTEGER REFERENCES "User"(user_id),
   search_recipient VARCHAR(500),
   normalized_recipient VARCHAR(500),
   search_grant VARCHAR(500),
   normalized_grant VARCHAR(500),
   search_institution VARCHAR(500),
   normalized_institution VARCHAR(500),
   search_filters JSONB,
   search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   result_count INTEGER,
   bookmarked BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create indexes for search performance
CREATE INDEX IF NOT EXISTS idx_search_time ON "SearchHistory" (search_time);
CREATE INDEX IF NOT EXISTS idx_search_user ON "SearchHistory" (user_id);
CREATE INDEX IF NOT EXISTS idx_search_terms ON "SearchHistory" (normalized_recipient, normalized_grant, normalized_institution);