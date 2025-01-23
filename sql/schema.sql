CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('researcher', 'admin', 'public') NOT NULL
);

CREATE TABLE Grants (
    grant_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'completed', 'pending') NOT NULL,
    research_field VARCHAR(100),
    description TEXT
);

CREATE TABLE Institutions (
    inst_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    province VARCHAR(50),
    type ENUM('university', 'research_center', 'other')
);

CREATE TABLE Researchers (
    researcher_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    institution_id INT,
    email VARCHAR(100),
    FOREIGN KEY (institution_id) REFERENCES Institutions(inst_id)
);

CREATE TABLE Grant_Researchers (
    grant_id INT,
    researcher_id INT,
    role VARCHAR(50),
    PRIMARY KEY (grant_id, researcher_id),
    FOREIGN KEY (grant_id) REFERENCES Grants(grant_id),
    FOREIGN KEY (researcher_id) REFERENCES Researchers(researcher_id)
);