-- File: sql/schema/programs.sql
USE rgap;

DROP TABLE IF EXISTS Program;
CREATE TABLE Program (
    prog_id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(255),
    name_fr VARCHAR(255),
    purpose_en TEXT,
    purpose_fr TEXT,
    naics_identifier VARCHAR(10),
    CHECK(name_en IS NOT NULL OR name_fr IS NOT NULL)
);