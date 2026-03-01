-- Rollback: 001_initial_schema.sql
-- Drop tables in reverse dependency order.

DROP TABLE IF EXISTS class_learning_path;
DROP TABLE IF EXISTS learning_path;
DROP TABLE IF EXISTS class_enrollment;
DROP TABLE IF EXISTS class;
DROP TABLE IF EXISTS module_progress;
DROP TABLE IF EXISTS refresh_token;
DROP TABLE IF EXISTS user_account;
