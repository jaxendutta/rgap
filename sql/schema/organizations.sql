-- File: sql/schema/organizations.sql
/*
USE rgap;

CREATE TABLE Organization (
    org VARCHAR(5) PRIMARY KEY,
    org_title VARCHAR(100) NOT NULL
);
*/

-- PostgreSQL version of organizations.sql
CREATE TABLE IF NOT EXISTS "Organization" (
    org VARCHAR(5) PRIMARY KEY,
    org_title VARCHAR(100) NOT NULL
);