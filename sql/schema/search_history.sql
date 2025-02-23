-- File: sql/schema/search_history.sql
USE rgap;

CREATE TABLE SearchHistory (
   history_id INT PRIMARY KEY AUTO_INCREMENT,
   user_id INT NOT NULL,
   quick_search VARCHAR(500),
   search_recipient VARCHAR(500),
   search_grant VARCHAR(500),
   search_institution VARCHAR(500),
   CHECK(search_recipient IS NOT NULL OR search_grant IS NOT NULL OR quick_search IS NOT NULL OR search_institution IS NOT NULL),
   search_filters JSON,
   search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   result_count INT,
   saved BOOLEAN NOT NULL,
   FOREIGN KEY (user_id) REFERENCES User(user_id)
);