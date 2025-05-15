-- File: sql/schema/programs.sql
/*
USE rgap;

DROP TABLE IF EXISTS Program;
CREATE TABLE Program (
    prog_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name_en VARCHAR(255),
    purpose_en TEXT,
    naics_identifier VARCHAR(10),
    CHECK(name_en IS NOT NULL)
);
*/

-- PostgreSQL version of programs.sql
CREATE TABLE IF NOT EXISTS "Program" (
    prog_id SERIAL PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    purpose_en TEXT,
    naics_identifier VARCHAR(10),
    CONSTRAINT check_name_not_null CHECK (name_en IS NOT NULL)
);