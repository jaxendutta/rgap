-- File: sql/schema/organizations.sql
USE rgap;

CREATE TABLE Organization (
    owner_org VARCHAR(20) PRIMARY KEY,
    org_title VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10)
);