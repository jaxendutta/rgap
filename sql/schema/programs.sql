-- File: sql/schema/programs.sql
USE rgap;

DROP TABLE IF EXISTS Program;
CREATE TABLE Program (
    prog_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name_en VARCHAR(255),
    purpose_en TEXT,
    naics_identifier VARCHAR(10),
    CHECK(name_en IS NOT NULL)
);