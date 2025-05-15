-- File: sql/init/create_db.sql
/*
DROP DATABASE IF EXISTS rgap;
DROP USER IF EXISTS 'rgap_user'@'localhost';
DROP USER IF EXISTS 'rgap_user'@'%';

-- Create fresh database with proper encoding
CREATE DATABASE rgap
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

-- Create users
CREATE USER 'rgap_user'@'localhost' IDENTIFIED BY '12345';
CREATE USER 'rgap_user'@'%' IDENTIFIED BY '12345';

-- Grant permissions
GRANT ALL PRIVILEGES ON rgap.* TO 'rgap_user'@'localhost';
GRANT ALL PRIVILEGES ON rgap.* TO 'rgap_user'@'%';
GRANT FILE ON *.* TO 'rgap_user'@'localhost';
GRANT FILE ON *.* TO 'rgap_user'@'%';

FLUSH PRIVILEGES;

-- Enable loading local files
SET GLOBAL local_infile = 1;
*/

-- PostgreSQL schema setup
-- No need to create database as Supabase provides it

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;