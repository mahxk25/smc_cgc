-- SMC Career Connect - MySQL Schema
-- Import this in MySQL Workbench

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET TIME_ZONE = '+00:00';

DROP DATABASE IF EXISTS smc_career_connect;
CREATE DATABASE smc_career_connect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smc_career_connect;

-- --------------------------------------------------------
-- Table: students
-- --------------------------------------------------------
CREATE TABLE students (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  deptNo VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  dob_hash VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  cgpa DECIMAL(4,2) DEFAULT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_dept (department),
  INDEX idx_cgpa (cgpa)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: admins
-- --------------------------------------------------------
CREATE TABLE admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'PLACEMENT_OFFICER') NOT NULL DEFAULT 'PLACEMENT_OFFICER',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: companies
-- --------------------------------------------------------
CREATE TABLE companies (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  industry VARCHAR(100) DEFAULT NULL,
  contactPerson VARCHAR(255) DEFAULT NULL,
  contactEmail VARCHAR(255) DEFAULT NULL,
  contactPhone VARCHAR(20) DEFAULT NULL,
  jobDescription TEXT DEFAULT NULL,
  salaryPackage VARCHAR(100) DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: drives
-- --------------------------------------------------------
CREATE TABLE drives (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  companyId INT UNSIGNED NOT NULL,
  role VARCHAR(255) NOT NULL,
  ctc VARCHAR(100) DEFAULT NULL,
  eligibility TEXT DEFAULT NULL,
  deadline DATETIME DEFAULT NULL,
  status ENUM('UPCOMING', 'ONGOING', 'COMPLETED') NOT NULL DEFAULT 'UPCOMING',
  timelineStart DATETIME DEFAULT NULL,
  timelineEnd DATETIME DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_deadline (deadline)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: applications
-- --------------------------------------------------------
CREATE TABLE applications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  studentId INT UNSIGNED NOT NULL,
  driveId INT UNSIGNED NOT NULL,
  status ENUM('APPLIED', 'APPROVED', 'REJECTED', 'SHORTLISTED', 'SELECTED') NOT NULL DEFAULT 'APPLIED',
  appliedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_student_drive (studentId, driveId),
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (driveId) REFERENCES drives(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_drive (driveId)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: offers
-- --------------------------------------------------------
CREATE TABLE offers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  applicationId INT UNSIGNED NOT NULL UNIQUE,
  offerPdfPath VARCHAR(500) NOT NULL,
  offerDeadline DATETIME NOT NULL,
  decision ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  decidedAt DATETIME DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (applicationId) REFERENCES applications(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: events
-- --------------------------------------------------------
CREATE TABLE events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  type ENUM('DRIVE', 'WORKSHOP', 'TRAINING', 'TALK', 'DEADLINE') NOT NULL,
  driveId INT UNSIGNED DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  location VARCHAR(255) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (driveId) REFERENCES drives(id) ON DELETE SET NULL,
  INDEX idx_start (startTime),
  INDEX idx_type (type)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: event_registrations
-- --------------------------------------------------------
CREATE TABLE event_registrations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  eventId INT UNSIGNED NOT NULL,
  studentId INT UNSIGNED NOT NULL,
  registeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_event_student (eventId, studentId),
  FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: notifications
-- --------------------------------------------------------
CREATE TABLE notifications (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userType ENUM('STUDENT', 'ADMIN') NOT NULL,
  userId INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT DEFAULT NULL,
  link VARCHAR(500) DEFAULT NULL,
  isRead TINYINT(1) NOT NULL DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (userType, userId),
  INDEX idx_read (isRead)
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Table: audit_logs
-- --------------------------------------------------------
CREATE TABLE audit_logs (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actorType ENUM('STUDENT', 'ADMIN') NOT NULL,
  actorId INT UNSIGNED NOT NULL,
  action VARCHAR(100) NOT NULL,
  metaJson JSON DEFAULT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_actor (actorType, actorId),
  INDEX idx_created (createdAt)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
