-- Add resume_path to students (for student-uploaded resume in profile).
-- Run in MySQL: USE smc_career_connect; then run below.

-- If you get "Duplicate column" error, the column already exists.
ALTER TABLE students ADD COLUMN resume_path VARCHAR(500) DEFAULT NULL;
