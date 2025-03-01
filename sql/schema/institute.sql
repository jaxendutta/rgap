-- File: sql/schema/institute.sql
USE rgap;

DROP TABLE IF EXISTS Institute;
CREATE TABLE Institute (
    institute_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    country VARCHAR(50),
    province VARCHAR(50),
    city VARCHAR(100),
    UNIQUE (name, country, province, city)
);