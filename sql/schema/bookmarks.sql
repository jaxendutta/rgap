-- File: sql/schema/bookmarks.sql
USE rgap;

CREATE TABLE BookmarkedGrants (
    bookmark_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    grant_id INT NOT NULL,
    UNIQUE (user_id, grant_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (grant_id) REFERENCES ResearchGrant(grant_id)
);

CREATE TABLE BookmarkedRecipients (
    bookmark_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipient_id INT NOT NULL,    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, recipient_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (recipient_id) REFERENCES Recipient(recipient_id)
);