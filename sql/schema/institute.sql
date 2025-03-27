-- File: sql/schema/institute.sql
USE rgap;

DROP TABLE IF EXISTS Institute;
CREATE TABLE Institute (
    institute_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(50),
    province VARCHAR(50),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    riding_name_en VARCHAR(100),
    riding_number VARCHAR(10)
);