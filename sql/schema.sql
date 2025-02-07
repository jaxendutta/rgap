USE rgap;
-- Table User
CREATE TABLE User (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Table Recipient
-- note that (legal_name, research_organization_name, country, city) have to be a unique tuple
CREATE TABLE Recipient (
    recipient_id INT PRIMARY KEY AUTO_INCREMENT,
    legal_name VARCHAR(255) NOT NULL,
    research_organization_name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    recipient_type ENUM(
         'Indigenous recipients',                      
         'For-profit organizations', 
         'Government',
         'International (non-government)',
         'Not-for-profit organizations and charities', 
         'Other',
         'Individual or sole proprietorships', 
         'Academia'),
    country CHAR(2),
    province VARCHAR(50),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    riding_name_en VARCHAR(100),
    riding_name_fr VARCHAR(100),
    riding_number VARCHAR(10),
    UNIQUE (legal_name, research_organization_name, country, city)
);


-- Table Program
CREATE TABLE Program (
    prog_id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(255),
    name_fr VARCHAR(255),
    purpose_en TEXT,
    purpose_fr TEXT,
    naics_identifier VARCHAR(10),
    CHECK(name_en IS NOT NULL OR name_fr IS NOT NULL)
);


-- Table Organization
CREATE TABLE Organization (
    owner_org VARCHAR(20) PRIMARY KEY,
    org_title VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10)
);


-- Table Grant
CREATE TABLE ResearchGrant (
    grant_id INT AUTO_INCREMENT PRIMARY KEY,
    ref_number VARCHAR(50),
    amendment_number VARCHAR(10),
    UNIQUE (ref_number, amendment_number),
    amendment_date DATE,
    agreement_type VARCHAR(50),
    agreement_number VARCHAR(50),
    agreement_value DECIMAL(15,2),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value DECIMAL(15,2),
    agreement_start_date DATE,
    agreement_end_date DATE,
    agreement_title_en TEXT,
    agreement_title_fr TEXT,
    description_en TEXT,
    description_fr TEXT,
    expected_results_en TEXT,
    expected_results_fr TEXT,
    owner_org VARCHAR(20),
    recipient_id INT,
    prog_id VARCHAR(50),
    FOREIGN KEY (recipient_id) REFERENCES Recipient(recipient_id),
    FOREIGN KEY (owner_org) REFERENCES Organization(owner_org),
    FOREIGN KEY (prog_id) REFERENCES Program(prog_id)
);


-- Table FavouriteGrants
CREATE TABLE FavouriteGrants (
    favourite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    grant_id INT NOT NULL,
    UNIQUE (user_id, grant_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (grant_id) REFERENCES ResearchGrant(grant_id)
);


-- Table FavouriteRecipients
CREATE TABLE FavouriteRecipients (
    favourite_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipient_id INT NOT NULL,    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, recipient_id),
    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (recipient_id) REFERENCES Recipient(recipient_id)
);


-- Table SearchHistory
CREATE TABLE SearchHistory (
   history_id INT PRIMARY KEY AUTO_INCREMENT,
   user_id INT NOT NULL,
   quick_search VARCHAR(500),
   search_recipient VARCHAR(500),
   search_grant VARCHAR(500),
   search_institution VARCHAR(500),
   CHECK(search_recipient IS NOT NULL OR search_grant IS NOT NULL OR quick_search IS NOT NULL OR search_institution IS NOT NULL),
   -- year, org, agreement_value, recipient_city, recipient_province, recipient_country: CA/Other
   search_filters JSON,
   search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   result_count INT,
   saved BOOLEAN NOT NULL,
   FOREIGN KEY (user_id) REFERENCES User(user_id)
);







