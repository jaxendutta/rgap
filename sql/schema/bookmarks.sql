-- File: sql/schema/bookmarks.sql
USE rgap;

-- BookmarkedGrants
CREATE TABLE BookmarkedGrants (
    user_id INT UNSIGNED NOT NULL,
    ref_number VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, ref_number),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- BookmarkedRecipients
CREATE TABLE BookmarkedRecipients (
    user_id INT UNSIGNED NOT NULL,
    recipient_id INT UNSIGNED NOT NULL,    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipient_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES Recipient(recipient_id) ON DELETE CASCADE
);

-- BookmarkedInstitutes
CREATE TABLE BookmarkedInstitutes (
    user_id INT UNSIGNED NOT NULL,
    institute_id INT UNSIGNED NOT NULL,    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, institute_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (institute_id) REFERENCES Institute(institute_id) ON DELETE CASCADE
);