-- File: sql/schema/bookmarks.sql
/*
USE rgap;

-- BookmarkedGrants
CREATE TABLE BookmarkedGrants (
    user_id INT UNSIGNED NOT NULL,
    grant_id INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, grant_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (grant_id) REFERENCES ResearchGrant(grant_id) ON DELETE CASCADE
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
*/

-- PostgreSQL version of bookmarks.sql

-- BookmarkedGrants
CREATE TABLE IF NOT EXISTS "BookmarkedGrants" (
    user_id INTEGER NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
    grant_id INTEGER NOT NULL REFERENCES "ResearchGrant"(grant_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, grant_id)
);

-- BookmarkedRecipients
CREATE TABLE IF NOT EXISTS "BookmarkedRecipients" (
    user_id INTEGER NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES "Recipient"(recipient_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, recipient_id)
);

-- BookmarkedInstitutes
CREATE TABLE IF NOT EXISTS "BookmarkedInstitutes" (
    user_id INTEGER NOT NULL REFERENCES "User"(user_id) ON DELETE CASCADE, 
    institute_id INTEGER NOT NULL REFERENCES "Institute"(institute_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, institute_id)
);