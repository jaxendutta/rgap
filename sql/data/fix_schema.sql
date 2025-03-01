-- File: sql/data/fix_schema.sql
USE rgap;

-- Check and fix character sets and collations
ALTER TABLE Program CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE ResearchGrant CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Make sure prog_id has the same exact type in both tables
ALTER TABLE Program MODIFY prog_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE ResearchGrant MODIFY prog_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;