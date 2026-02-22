-- Company notes and drive min_cgpa for eligibility
-- Run in MySQL: USE smc_career_connect; then run below.

CREATE TABLE IF NOT EXISTS company_notes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  companyId INT UNSIGNED NOT NULL,
  adminId INT UNSIGNED NOT NULL,
  note TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (adminId) REFERENCES admins(id) ON DELETE CASCADE,
  INDEX idx_company (companyId)
) ENGINE=InnoDB;

-- If duplicate column error, column already exists
ALTER TABLE drives ADD COLUMN minCgpa DECIMAL(3,2) DEFAULT NULL;
