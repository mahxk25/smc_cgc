-- SMC Career Connect - Seed Data
-- Run after schema.sql in MySQL Workbench. Then run: npm run seed (from server folder) to create admin + student with hashed passwords.

USE smc_career_connect;

INSERT INTO companies (name, industry, contactPerson, contactEmail, jobDescription, salaryPackage) VALUES
('TechCorp Solutions', 'IT', 'John Doe', 'john@techcorp.com', 'Software Engineer role', '8 LPA'),
('DataFlow Inc', 'Data Analytics', 'Jane Smith', 'jane@dataflow.com', 'Data Analyst position', '6 LPA'),
('CloudNine Systems', 'Cloud', 'Bob Wilson', 'bob@cloudnine.com', 'Cloud Engineer', '10 LPA');

INSERT INTO drives (companyId, role, ctc, eligibility, deadline, status, timelineStart, timelineEnd) VALUES
(1, 'Software Engineer', '8 LPA', 'CGPA >= 7.5, CSE/IT', DATE_ADD(NOW(), INTERVAL 30 DAY), 'UPCOMING', DATE_ADD(NOW(), INTERVAL 25 DAY), DATE_ADD(NOW(), INTERVAL 35 DAY)),
(2, 'Data Analyst', '6 LPA', 'CGPA >= 7.0', DATE_ADD(NOW(), INTERVAL 45 DAY), 'UPCOMING', DATE_ADD(NOW(), INTERVAL 40 DAY), DATE_ADD(NOW(), INTERVAL 50 DAY));

INSERT INTO events (type, title, startTime, endTime, location, description) VALUES
('WORKSHOP', 'Resume Building Workshop', DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY) + INTERVAL 2 HOUR, 'Room 101', 'Learn to build a professional resume');

SET FOREIGN_KEY_CHECKS = 1;
