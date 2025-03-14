-- File: sql/schema/search_history.sql
USE rgap;

CREATE TABLE SearchHistory (
   history_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
   user_id INT UNSIGNED NULL,
   search_recipient VARCHAR(500),
   search_grant VARCHAR(500),
   search_institution VARCHAR(500),
   search_filters JSON,
   search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   result_count INT,
   saved BOOLEAN NOT NULL,
   FOREIGN KEY (user_id) REFERENCES User(user_id)
);